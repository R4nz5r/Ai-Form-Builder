import bcrypt from "bcryptjs";
import { connectDB, pool, query } from "../config/db.js";
import * as userRepo from "../repositories/user.repo.js";
import * as formRepo from "../repositories/form.repo.js";
import * as responseRepo from "../repositories/response.repo.js";
import { nanoid } from "../utils/nanoid.js";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (p) => Math.random() < p;
const weighted = (pairs) => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) {
    r -= w;
    if (r <= 0) return v;
  }
  return pairs[0][0];
};

const daysAgoDate = (days) =>
  new Date(Date.now() - days * 86_400_000 - rand(0, 86_399_000));

const opt = (label) => ({ id: nanoid(8), label, value: "" });
const q = (type, label, extra = {}) => ({
  id: nanoid(10),
  type,
  label,
  placeholder: extra.placeholder || "",
  description: extra.description || "",
  helpText: extra.helpText || "",
  required: extra.required || false,
  defaultValue: "",
  content: extra.content || "",
  options: (extra.options || []).map(opt),
  validation: extra.validation || {},
});

const FIRST = [
  "Alex",
  "Maya",
  "Liam",
  "Sofia",
  "Noah",
  "Emma",
  "Ravi",
  "Chloe",
  "Omar",
  "Ava",
  "Ben",
  "Zoe",
  "Ivan",
  "Lena",
  "Theo",
  "Nora",
  "Kai",
  "Mia",
  "Sam",
  "Aria",
  "Leo",
];

const LAST = [
  "Carter",
  "Singh",
  "Nguyen",
  "Garcia",
  "Brooks",
  "Khan",
  "Rossi",
  "Miller",
  "Silva",
  "Patel",
  "Cohen",
  "Lopez",
  "Yamada",
  "Novak",
  "Owens",
  "Reed",
];

const COMMENTS = [
  "Loved the experience, super smooth!",
  "Checkout was a little confusing but overall good.",
  "Fast support, really impressed.",
  "Would be great to have a dark mode.",
  "Pricing feels a bit high for small teams.",
  "The onboarding was excellent.",
  "Had a small bug but your team fixed it quickly.",
  "Best tool I've used this year.",
  "Could use more integrations.",
  "Clean UI, very intuitive.",
  "Shipping took longer than expected.",
  "Everything worked exactly as described.",
];

const CITIES = [
  "123 Market St, San Francisco, CA",
  "44 King St W, Toronto, ON",
  "10 Downing St, London",
  "5 MG Road, Bangalore",
  "22 Rue Cler, Paris",
  "8 Bondi Rd, Sydney",
];

const UAS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/17.4 Safari/605.1",
  "Mozilla/5.0 (Linux; Android 14) Chrome/124.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17.4) Version/17.4 Mobile Safari/604.1",
  "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Firefox/125.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/124.0",
];

function respondent() {
  const first = pick(FIRST);
  const last = pick(LAST);
  const name = `${first} ${last}`;
  const email = `${first}.${last}@example.com`.toLowerCase();
  return { name, email, first };
}

// Generate a plausible answer for one question, given a respondent.
function answerFor(qq, who) {
  const label = qq.label.toLowerCase();
  switch (qq.type) {
    case "short_text":
      if (label.includes("name")) return who.name;
      if (label.includes("company"))
        return pick([
          "Acme Inc",
          "Globex",
          "Initech",
          "Umbrella",
          "Hooli",
          "Stark Labs",
        ]);
      return pick(["Great", "All good", "Worked well", "Nice", "Solid"]);
    case "email":
      return who.email;
    case "phone":
      return `+1 (${rand(200, 989)}) ${rand(200, 989)}-${rand(1000, 9999)}`;
    case "url":
      return `https://${who.first.toLowerCase()}.example.com`;
    case "address":
      return pick(CITIES);
    case "number":
      return rand(1, 10);
    case "date":
      return daysAgoDate(rand(0, 60)).toISOString().slice(0, 10);
    case "long_text":
      return pick(COMMENTS);
    case "rating":
      return weighted([
        [5, 5],
        [4, 4],
        [3, 2],
        [2, 1],
        [1, 1],
      ]);
    case "yes_no":
      return weighted([
        ["Yes", 7],
        ["No", 3],
      ]);
    case "dropdown":
    case "radio":
      return qq.options.length ? pick(qq.options).label : "";
    case "checkbox":
      return qq.options.length
        ? sample(qq.options, rand(1, Math.min(3, qq.options.length))).map(
            (o) => o.label,
          )
        : [];
    case "file":
      return chance(0.6)
        ? pick(["resume.pdf", "portfolio.pdf", "photo.jpg", "report.docx"])
        : "";
    case "password":
      return "**********";
    default:
      return "";
  }
}

const STATIC = new Set(["section", "heading", "paragraph", "image"]);

/** Build a single response document for a form. */
function buildResponse(form, dayOffset) {
  const who = respondent();
  const answers = [];
  for (const qq of form.questions) {
    if (STATIC.has(qq.type)) continue;
    if (!qq.required && chance(0.18)) continue;
    const value = answerFor(qq, who);
    if (value === "" || (Array.isArray(value) && value.length === 0)) continue;
    answers.push({ questionId: qq.id, label: qq.label, type: qq.type, value });
  }
  return {
    form: form._id,
    answers,
    completionTime: rand(18, 210),
    meta: {
      userAgent: pick(UAS),
      ip: `${rand(1, 255)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 255)}`,
    },
    submittedAt: daysAgoDate(dayOffset),
  };
}

const FORMS = [
  {
    title: "Customer Feedback Survey",
    description: "Help us improve by sharing your experience.",
    theme: "modern",
    color: "#0c8b7c",
    status: "published",
    favorite: true,
    responses: 142,
    conversion: 0.42,
    questions: [
      q("heading", "We'd love your feedback", {
        content: "It only takes a minute.",
      }),
      q("short_text", "Your name", { required: true }),
      q("email", "Email address", { required: true }),
      q("rating", "How satisfied are you overall?", { required: true }),
      q("radio", "How did you hear about us?", {
        options: ["Search", "Social media", "Friend", "Ad", "Other"],
      }),
      q("checkbox", "Which features do you use most?", {
        options: ["Dashboard", "Builder", "Analytics", "Exports", "AI"],
      }),
      q("yes_no", "Would you recommend us?", { required: true }),
      q("long_text", "Any suggestions for us?"),
    ],
  },
  {
    title: "Employee Satisfaction 2026",
    description: "Your honest feedback shapes our workplace.",
    theme: "corporate",
    color: "#1e3a8a",
    status: "published",
    responses: 88,
    conversion: 0.61,
    questions: [
      q("rating", "How happy are you at work?", { required: true }),
      q("radio", "Do you feel valued?", {
        options: ["Always", "Often", "Sometimes", "Rarely"],
      }),
      q("checkbox", "What would improve your experience?", {
        options: [
          "Compensation",
          "Flexibility",
          "Growth",
          "Recognition",
          "Tools",
          "Management",
        ],
      }),
      q("number", "Years at the company"),
      q("long_text", "Additional comments"),
    ],
  },
  {
    title: "Restaurant Feedback",
    description: "Thanks for dining with us!",
    theme: "gradient",
    color: "#7c3aed",
    status: "published",
    responses: 203,
    conversion: 0.55,
    questions: [
      q("short_text", "Your name"),
      q("rating", "Rate the food", { required: true }),
      q("rating", "Rate the service", { required: true }),
      q("radio", "How was the ambience?", {
        options: ["Excellent", "Good", "Average", "Poor"],
      }),
      q("yes_no", "Would you visit again?", { required: true }),
      q("date", "Date of visit"),
      q("long_text", "Tell us more"),
    ],
  },
  {
    title: "DevConf 2026 Registration",
    description: "Secure your spot at our annual developer conference.",
    theme: "glassmorphism",
    color: "#0891b2",
    status: "published",
    favorite: true,
    responses: 64,
    conversion: 0.48,
    questions: [
      q("short_text", "Full name", { required: true }),
      q("email", "Email", { required: true }),
      q("phone", "Phone number"),
      q("dropdown", "Ticket type", {
        required: true,
        options: ["General", "VIP", "Student", "Team"],
      }),
      q("checkbox", "Which tracks interest you?", {
        options: ["Frontend", "Backend", "AI/ML", "DevOps", "Design"],
      }),
      q("yes_no", "Any dietary restrictions?"),
      q("url", "LinkedIn / portfolio"),
    ],
  },
  {
    title: "Product Market Research",
    description: "Help shape what we build next.",
    theme: "dark",
    color: "#b45309",
    status: "published",
    responses: 117,
    conversion: 0.37,
    questions: [
      q("short_text", "Company"),
      q("dropdown", "Company size", {
        options: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
      }),
      q("radio", "How often would you use this?", {
        options: ["Daily", "Weekly", "Monthly", "Rarely"],
      }),
      q("rating", "How valuable is this to you?", { required: true }),
      q("number", "Budget per month (USD)"),
      q("checkbox", "Must-have integrations", {
        options: ["Slack", "Notion", "Zapier", "Salesforce", "GitHub"],
      }),
      q("long_text", "What problem should we solve?"),
    ],
  },
  {
    title: "Newsletter Signup",
    description: "Get the best of Formly in your inbox.",
    theme: "glassmorphism",
    color: "#db2777",
    status: "published",
    responses: 326,
    conversion: 0.7,
    questions: [
      q("short_text", "First name"),
      q("email", "Email address", { required: true }),
      q("checkbox", "Topics you care about", {
        options: ["Product", "Design", "Engineering", "Growth"],
      }),
    ],
  },
  {
    title: "Frontend Engineer Application",
    description: "We're excited to learn more about you.",
    theme: "minimal",
    color: "#334155",
    status: "draft",
    responses: 0,
    questions: [
      q("section", "Personal details"),
      q("short_text", "Full name", { required: true }),
      q("email", "Email", { required: true }),
      q("phone", "Phone", { required: true }),
      q("url", "Portfolio / GitHub"),
      q("section", "Experience"),
      q("dropdown", "Years of experience", {
        options: ["0-1", "2-3", "4-6", "7+"],
      }),
      q("file", "Upload your résumé"),
      q("long_text", "Why do you want to join us?"),
      q("password", "Create a portal password"),
    ],
  },
  {
    title: "Course Evaluation - Intro to React",
    description: "Help us improve this course.",
    theme: "minimal",
    color: "#2563eb",
    status: "draft",
    favorite: true,
    responses: 0,
    questions: [
      q("short_text", "Course cohort"),
      q("rating", "Rate the overall course", { required: true }),
      q("rating", "Rate the instructor"),
      q("radio", "Was the pace right?", {
        options: ["Too slow", "Just right", "Too fast"],
      }),
      q("long_text", "Suggestions for improvement"),
    ],
  },
  {
    title: "Q3 Beta Feedback (archived)",
    description: "Closed beta - no longer accepting responses.",
    theme: "modern",
    color: "#059669",
    status: "published",
    archived: true,
    responses: 41,
    conversion: 0.5,
    questions: [
      q("rating", "How was the beta?", { required: true }),
      q("yes_no", "Did you hit any bugs?"),
      q("long_text", "What should we fix first?"),
    ],
  },
];

async function seed() {
  await connectDB();
  const email = "alex@timetoprogram.dev";

  // Clear any prior demo data (forms + responses cascade via FK)
  await query("DELETE FROM users WHERE email = $1", [email]);

  const user = await userRepo.createUser({
    name: "Alex Carter",
    email,
    password: await bcrypt.hash("Test@1234", 10),
    avatarColor: "#0c8b7c",
  });

  const SPREAD_DAYS = 24;
  let totalResponses = 0;

  for (const def of FORMS) {
    const form = await formRepo.createForm(user._id, {
      title: def.title,
      description: def.description,
      theme: def.theme,
      status: def.status,
      questions: def.questions,
      settings: { primaryColor: def.color, submitButtonText: "Submit" },
    });

    const updates = {};
    if (def.favorite) updates.isFavorite = true;
    if (def.archived) updates.isArchived = true;
    if (def.status === "published") {
      updates.publishedAt = daysAgoDate(SPREAD_DAYS + 3);
    }

    if (Object.keys(updates).length) {
      await formRepo.updateForm(form._id, updates);
    }

    const n = def.responses || 0;
    if (n > 0) {
      const docs = [];
      for (let i = 0; i < n; i++) {
        // Skew submissions toward recent days for an interesting timeline
        const dayOffset = Math.floor(
          Math.pow(Math.random(), 1.7) * SPREAD_DAYS,
        );
        docs.push(buildResponse(form, dayOffset));
      }
      await responseRepo.insertManyResponses(docs);
      totalResponses += n;
    }

    const views = n
      ? Math.round(n / (def.conversion || 0.5)) + rand(0, 25)
      : rand(0, 12);
    await formRepo.setCounters(form._id, { views, responseCount: n });

    console.log(
      `${def.title.padEnd(34)} ${def.status.padEnd(9)} ${String(n).padStart(4)} responses · ${views} views`,
    );
  }

  console.log("\n✅ Seed complete");
  console.log(`📊 ${FORMS.length} forms, ${totalResponses} responses`);
  console.log(`🔑 Login → alex@timetoprogram.dev / Test@1234`);

  await pool.end();
  process.exit(0);
}

// Run the seed function
// Run the seed function
seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  pool.end();
  process.exit(1);
});

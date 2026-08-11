/**
 * ============================================================================
 *  MOCK BACKEND  —  THROWAWAY FILE (delete at go-live)
 * ============================================================================
 * All the fake data + behaviour that lets the UI run with ZERO backend.
 * An in-memory store is built once on load and mutated for the session, so
 * created/updated/deleted records persist until a page refresh.
 *
 * Every builder here returns data in the EXACT shape the real REST endpoints
 * return, so `services/index.js` can swap real ⇄ mock without any component
 * knowing. When the backend is ready this whole file is deleted.
 * ============================================================================
 */

// ---------- tiny helpers ----------
let _seq = 0;
const uid = (p = "id") => `${p}_${(Date.now().toString(36) + (_seq++).toString(36)).slice(-10)}`;
const clone = (v) => (typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (p) => Math.random() < p;
const weighted = (pairs) => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) if ((r -= w) <= 0) return v;
  return pairs[0][0];
};
const daysAgoDate = (days) => new Date(Date.now() - days * 86_400_000 - rand(0, 86_399_000)).toISOString();

const STATIC = new Set(["section", "heading", "paragraph", "image"]);
const OPTION_TYPES = new Set(["dropdown", "radio", "checkbox"]);

// ---------- field / form builders ----------
const opt = (label) => ({ id: uid("opt"), label, value: "" });
const q = (type, label, extra = {}) => ({
  id: uid("q"),
  type,
  label,
  placeholder: extra.placeholder || "",
  description: extra.description || "",
  helpText: extra.helpText || "",
  required: extra.required || false,
  defaultValue: "",
  content: extra.content || "",
  options: (extra.options || []).map(opt),
  validation: extra.validation || { minLength: null, maxLength: null, min: null, max: null, pattern: "", message: "" },
});

function defaultSettings(overrides = {}) {
  return {
    logo: "",
    primaryColor: "#0c8b7c",
    background: "#f8fafc",
    borderRadius: 12,
    thankYouMessage: "Thanks for your submission! 🎉",
    submitButtonText: "Submit",
    seoTitle: "",
    seoDescription: "",
    showProgressBar: true,
    ...overrides,
  };
}

// ---------- value pools ----------
const FIRST = ["Alex", "Maya", "Liam", "Sofia", "Noah", "Emma", "Ravi", "Chloe", "Omar", "Ava", "Ben", "Zoe", "Ivan", "Lena", "Theo", "Nora", "Kai", "Mia", "Sam", "Aria"];
const LAST = ["Carter", "Singh", "Nguyen", "Garcia", "Brooks", "Khan", "Rossi", "Silva", "Patel", "Cohen", "Lopez", "Yamada", "Novak", "Owens", "Reed"];
const COMMENTS = [
  "Loved the experience, super smooth!",
  "Checkout was a little confusing but overall good.",
  "Fast support, really impressed.",
  "Would be great to have a dark mode.",
  "The onboarding was excellent.",
  "Best tool I've used this year.",
  "Could use more integrations.",
  "Clean UI, very intuitive.",
  "Everything worked exactly as described.",
];
const CITIES = ["123 Market St, San Francisco, CA", "44 King St W, Toronto, ON", "10 Downing St, London", "5 MG Road, Bangalore", "22 Rue Cler, Paris"];
const UAS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/17.4 Safari/605.1",
  "Mozilla/5.0 (Linux; Android 14) Chrome/124.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Version/17.4 Mobile Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_4) Version/17.4 Safari/604.1",
  "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Firefox/125.0",
];

function respondent() {
  const first = pick(FIRST);
  const last = pick(LAST);
  return { name: `${first} ${last}`, email: `${first}.${last}@example.com`.toLowerCase(), first };
}

function answerFor(qq, who) {
  const label = qq.label.toLowerCase();
  switch (qq.type) {
    case "short_text":
      if (label.includes("name")) return who.name;
      if (label.includes("company")) return pick(["Acme Inc", "Globex", "Initech", "Umbrella", "Hooli"]);
      if (label.includes("role") || label.includes("title")) return pick(["Engineer", "Designer", "PM", "Founder"]);
      return pick(["Great", "All good", "Worked well", "Nice", "Solid"]);
    case "email": return who.email;
    case "phone": return `+1 (${rand(200, 989)}) ${rand(200, 989)}-${rand(1000, 9999)}`;
    case "url": return `https://${who.first.toLowerCase()}.example.com`;
    case "address": return pick(CITIES);
    case "number": return rand(1, 10);
    case "date": return daysAgoDate(rand(0, 60)).slice(0, 10);
    case "long_text": return pick(COMMENTS);
    case "rating": return weighted([[5, 5], [4, 4], [3, 2], [2, 1], [1, 1]]);
    case "yes_no": return weighted([["Yes", 7], ["No", 3]]);
    case "dropdown":
    case "radio": return qq.options.length ? pick(qq.options).label : "";
    case "checkbox": return qq.options.length ? sample(qq.options, rand(1, Math.min(3, qq.options.length))).map((o) => o.label) : [];
    case "file": return chance(0.6) ? pick(["resume.pdf", "portfolio.pdf", "photo.jpg"]) : "";
    case "password": return "••••••••";
    default: return "";
  }
}

// ---------- form definitions ----------
const FORM_DEFS = [
  {
    title: "Customer Feedback Survey", description: "Help us improve by sharing your experience.",
    theme: "modern", color: "#0c8b7c", status: "published", favorite: true, responses: 142, conversion: 0.42,
    questions: [
      q("heading", "We'd love your feedback", { content: "It only takes a minute." }),
      q("short_text", "Your name", { required: true }),
      q("email", "Email address", { required: true }),
      q("rating", "How satisfied are you overall?", { required: true }),
      q("radio", "How did you hear about us?", { options: ["Search", "Social media", "Friend", "Ad", "Other"] }),
      q("checkbox", "Which features do you use most?", { options: ["Dashboard", "Builder", "Analytics", "Exports", "AI"] }),
      q("yes_no", "Would you recommend us?", { required: true }),
      q("long_text", "Any suggestions for us?"),
    ],
  },
  {
    title: "Employee Satisfaction 2026", description: "Your honest feedback shapes our workplace.",
    theme: "corporate", color: "#1e3a8a", status: "published", responses: 88, conversion: 0.61,
    questions: [
      q("rating", "How happy are you at work?", { required: true }),
      q("radio", "Do you feel valued?", { options: ["Always", "Often", "Sometimes", "Rarely"] }),
      q("checkbox", "What would improve your experience?", { options: ["Compensation", "Flexibility", "Growth", "Recognition", "Tools"] }),
      q("number", "Years at the company"),
      q("long_text", "Additional comments"),
    ],
  },
  {
    title: "Restaurant Feedback", description: "Thanks for dining with us!",
    theme: "gradient", color: "#7c3aed", status: "published", responses: 203, conversion: 0.55,
    questions: [
      q("short_text", "Your name"),
      q("rating", "Rate the food", { required: true }),
      q("rating", "Rate the service", { required: true }),
      q("radio", "How was the ambience?", { options: ["Excellent", "Good", "Average", "Poor"] }),
      q("yes_no", "Would you visit again?", { required: true }),
      q("date", "Date of visit"),
      q("long_text", "Tell us more"),
    ],
  },
  {
    title: "DevConf 2026 Registration", description: "Secure your spot at our annual developer conference.",
    theme: "glassmorphism", color: "#0891b2", status: "published", favorite: true, responses: 64, conversion: 0.48,
    questions: [
      q("short_text", "Full name", { required: true }),
      q("email", "Email", { required: true }),
      q("phone", "Phone number"),
      q("dropdown", "Ticket type", { required: true, options: ["General", "VIP", "Student", "Team"] }),
      q("checkbox", "Which tracks interest you?", { options: ["Frontend", "Backend", "AI/ML", "DevOps", "Design"] }),
      q("yes_no", "Any dietary restrictions?"),
      q("url", "LinkedIn / portfolio"),
    ],
  },
  {
    title: "Product Market Research", description: "Help shape what we build next.",
    theme: "dark", color: "#b45309", status: "published", responses: 117, conversion: 0.37,
    questions: [
      q("short_text", "Company"),
      q("dropdown", "Company size", { options: ["1-10", "11-50", "51-200", "201-1000", "1000+"] }),
      q("radio", "How often would you use this?", { options: ["Daily", "Weekly", "Monthly", "Rarely"] }),
      q("rating", "How valuable is this to you?", { required: true }),
      q("checkbox", "Must-have integrations", { options: ["Slack", "Notion", "Zapier", "Salesforce", "GitHub"] }),
      q("long_text", "What problem should we solve?"),
    ],
  },
  {
    title: "Newsletter Signup", description: "Get the best of Timely Forms AI in your inbox.",
    theme: "glassmorphism", color: "#db2777", status: "published", responses: 326, conversion: 0.7,
    questions: [
      q("short_text", "First name"),
      q("email", "Email address", { required: true }),
      q("checkbox", "Topics you care about", { options: ["Product", "Design", "Engineering", "Growth"] }),
    ],
  },
  {
    title: "Frontend Engineer Application", description: "We're excited to learn more about you.",
    theme: "minimal", color: "#334155", status: "draft", responses: 0,
    questions: [
      q("section", "Personal details"),
      q("short_text", "Full name", { required: true }),
      q("email", "Email", { required: true }),
      q("url", "Portfolio / GitHub"),
      q("dropdown", "Years of experience", { options: ["0-1", "2-3", "4-6", "7+"] }),
      q("file", "Upload your résumé"),
      q("long_text", "Why do you want to join us?"),
    ],
  },
  {
    title: "Course Evaluation — Intro to React", description: "Help us improve this course.",
    theme: "minimal", color: "#2563eb", status: "draft", favorite: true, responses: 0,
    questions: [
      q("short_text", "Course cohort"),
      q("rating", "Rate the overall course", { required: true }),
      q("rating", "Rate the instructor"),
      q("radio", "Was the pace right?", { options: ["Too slow", "Just right", "Too fast"] }),
      q("long_text", "Suggestions for improvement"),
    ],
  },
];

// ---------- build the in-memory store ----------
const SPREAD_DAYS = 24;

function makeForm(def) {
  return {
    _id: uid("form"),
    owner: "u_demo",
    title: def.title,
    description: def.description,
    theme: def.theme,
    status: def.status,
    slug: uid("s").replace("s_", ""),
    questions: def.questions,
    settings: defaultSettings({ primaryColor: def.color, submitButtonText: "Submit" }),
    views: 0,
    responseCount: 0,
    isFavorite: !!def.favorite,
    isArchived: !!def.archived,
    publishedAt: def.status === "published" ? daysAgoDate(SPREAD_DAYS + 3) : null,
    createdAt: daysAgoDate(SPREAD_DAYS + 5),
    updatedAt: daysAgoDate(rand(0, 3)),
  };
}

function makeResponse(form, dayOffset) {
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
    _id: uid("resp"),
    form: form._id,
    answers,
    completionTime: rand(18, 210),
    meta: { userAgent: pick(UAS), ip: `${rand(1, 255)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 255)}` },
    submittedAt: daysAgoDate(dayOffset),
  };
}

const store = {
  user: {
    id: "u_demo",
    name: "Alex Carter",
    email: "alex@timetoprogram.dev",
    avatarColor: "#0c8b7c",
    createdAt: daysAgoDate(60),
  },
  forms: [],
  responses: [],
};

(function build() {
  for (const def of FORM_DEFS) {
    const form = makeForm(def);
    const n = def.responses || 0;
    for (let i = 0; i < n; i++) {
      const dayOffset = Math.floor(Math.pow(Math.random(), 1.7) * SPREAD_DAYS);
      store.responses.push(makeResponse(form, dayOffset));
    }
    form.responseCount = n;
    form.views = n ? Math.round(n / (def.conversion || 0.5)) + rand(0, 25) : rand(0, 12);
    store.forms.push(form);
  }
})();

const responsesFor = (formId) => store.responses.filter((r) => r.form === formId);

// ---------- analytics (mirrors backend analytics.service) ----------
function computeAnalytics(formId) {
  const form = store.forms.find((f) => f._id === formId);
  const responses = responsesFor(formId).sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  const totalResponses = responses.length;
  const views = form?.views || 0;
  const conversionRate = views ? Math.round((totalResponses / views) * 100) : 0;
  const answerableCount = (form?.questions || []).filter((x) => !STATIC.has(x.type)).length;

  const completionRate = (() => {
    if (!responses.length || !answerableCount) return 0;
    const total = responses.reduce((s, r) => s + Math.min(r.answers.length, answerableCount) / answerableCount, 0);
    return Math.round((total / responses.length) * 100);
  })();

  const avgCompletionTime = totalResponses
    ? Math.round(responses.reduce((s, r) => s + (r.completionTime || 0), 0) / totalResponses)
    : 0;

  const counts = new Map();
  for (const r of responses) {
    const key = new Date(r.submittedAt).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const timeline = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));

  const questions = (form?.questions || [])
    .filter((qq) => !STATIC.has(qq.type))
    .map((qq) => {
      const values = responses.map((r) => r.answers.find((a) => a.questionId === qq.id)?.value).filter((v) => v !== undefined && v !== null && v !== "");
      const base = { id: qq.id, label: qq.label, type: qq.type, total: values.length };
      if (OPTION_TYPES.has(qq.type)) {
        const tally = new Map(qq.options.map((o) => [o.label, 0]));
        for (const v of values) for (const sel of Array.isArray(v) ? v : [v]) tally.set(sel, (tally.get(sel) || 0) + 1);
        return { ...base, breakdown: [...tally.entries()].map(([label, count]) => ({ label, count })) };
      }
      if (qq.type === "rating" || qq.type === "number") {
        const nums = values.map(Number).filter((n) => !Number.isNaN(n));
        const average = nums.length ? Number((nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2)) : 0;
        const dist = new Map();
        for (const n of nums) dist.set(n, (dist.get(n) || 0) + 1);
        return { ...base, average, breakdown: [...dist.entries()].sort(([a], [b]) => a - b).map(([label, count]) => ({ label: String(label), count })) };
      }
      if (qq.type === "yes_no") {
        const yes = values.filter((v) => v === true || v === "Yes" || v === "yes").length;
        return { ...base, breakdown: [{ label: "Yes", count: yes }, { label: "No", count: values.length - yes }] };
      }
      return { ...base, samples: values.slice(-5).reverse().map(String) };
    });

  return { stats: { totalResponses, views, conversionRate, completionRate, avgCompletionTime }, timeline, questions };
}

// ---------- insights (mirrors backend insights.service) ----------
function computeInsights() {
  const forms = store.forms.filter((f) => !f.isArchived);
  const totalViews = forms.reduce((s, f) => s + (f.views || 0), 0);
  const totalResponses = forms.reduce((s, f) => s + (f.responseCount || 0), 0);
  const published = forms.filter((f) => f.status === "published").length;
  const conversion = totalViews ? Math.round((totalResponses / totalViews) * 100) : 0;
  const ids = new Set(forms.map((f) => f._id));
  const responses = store.responses.filter((r) => ids.has(r.form));

  const counts = new Map();
  for (const r of responses) {
    const key = new Date(r.submittedAt).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const timeline = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));

  const avgCompletionTime = responses.length
    ? Math.round(responses.reduce((s, r) => s + (r.completionTime || 0), 0) / responses.length)
    : 0;

  const heatmap = [];
  const heat = new Map();
  for (const r of responses) {
    const d = new Date(r.submittedAt);
    const key = `${d.getDay()}-${d.getHours()}`;
    heat.set(key, (heat.get(key) || 0) + 1);
  }
  for (const [key, count] of heat) {
    const [day, hour] = key.split("-").map(Number);
    heatmap.push({ day, hour, count });
  }

  const dev = { Desktop: 0, Mobile: 0, Tablet: 0 };
  for (const r of responses) {
    const ua = r.meta?.userAgent || "";
    if (/iPad|Tablet/.test(ua)) dev.Tablet++;
    else if (/Android|iPhone|Mobile/.test(ua)) dev.Mobile++;
    else dev.Desktop++;
  }
  const devices = Object.entries(dev).filter(([, v]) => v > 0).map(([label, value]) => ({ label, value }));

  const topForms = [...forms]
    .sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0))
    .slice(0, 6)
    .map((f) => ({
      id: f._id, title: f.title, theme: f.theme, status: f.status,
      responses: f.responseCount || 0, views: f.views || 0,
      conversion: f.views ? Math.round(((f.responseCount || 0) / f.views) * 100) : 0,
      color: f.settings?.primaryColor || "#0c8b7c",
    }));

  return { stats: { totalForms: forms.length, published, totalResponses, totalViews, conversion, avgCompletionTime }, timeline, heatmap, devices, topForms };
}

function computeInbox(search = "") {
  const formMap = new Map(store.forms.map((f) => [f._id, f]));
  let responses = [...store.responses].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 300);
  if (search.trim()) {
    const needle = search.trim().toLowerCase();
    responses = responses.filter((r) => r.answers.some((a) => {
      const val = Array.isArray(a.value) ? a.value.join(" ") : String(a.value ?? "");
      return val.toLowerCase().includes(needle);
    }));
  }
  return responses.map((r) => {
    const form = formMap.get(r.form);
    return { ...r, formId: r.form, formTitle: form?.title || "Untitled form", formColor: form?.settings?.primaryColor || "#0c8b7c" };
  });
}

// ---------- CSV export (mirrors backend utils/csv) ----------
function toCsv(form, responses) {
  const cols = form.questions.filter((x) => !STATIC.has(x.type));
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    let s = Array.isArray(v) ? v.join("; ") : String(v);
    if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const headers = ["Submitted At", "Completion Time (s)", ...cols.map((c) => c.label || "Untitled")];
  const rows = responses.map((r) => {
    const byId = new Map(r.answers.map((a) => [a.questionId, a.value]));
    return [new Date(r.submittedAt).toISOString(), r.completionTime || 0, ...cols.map((c) => esc(byId.get(c.id)))];
  });
  return [headers.map(esc).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

// ============================================================================
//  PUBLIC MOCK API  (consumed by services/index.js)
// ============================================================================
export const mock = {
  // ----- auth -----
  currentUser: () => clone(store.user),
  login: () => ({ user: clone(store.user), token: `mock.${uid("tok")}` }),
  register: (payload) => {
    if (payload?.name) store.user.name = payload.name;
    if (payload?.email) store.user.email = payload.email;
    return { user: clone(store.user), token: `mock.${uid("tok")}` };
  },
  me: () => ({ user: clone(store.user) }),
  updateProfile: (patch) => {
    Object.assign(store.user, {
      name: patch.name ?? store.user.name,
      avatarColor: patch.avatarColor ?? store.user.avatarColor,
    });
    return clone(store.user);
  },

  // ----- forms -----
  listForms: ({ search = "", filter = "all" } = {}) => {
    let forms = store.forms.filter((f) => (filter === "archived" ? f.isArchived : !f.isArchived));
    if (filter === "favorites") forms = forms.filter((f) => f.isFavorite);
    if (filter === "published") forms = forms.filter((f) => f.status === "published");
    if (filter === "draft") forms = forms.filter((f) => f.status === "draft");
    if (search.trim()) forms = forms.filter((f) => f.title.toLowerCase().includes(search.trim().toLowerCase()));
    return clone(forms.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || new Date(b.updatedAt) - new Date(a.updatedAt)));
  },
  getForm: (id) => {
    let form = store.forms.find((f) => f._id === id);
    if (!form) {
      // synthesize a sensible blank form for unknown ids
      form = makeForm({ title: "Untitled form", description: "", theme: "modern", color: "#0c8b7c", status: "draft", questions: [] });
      form._id = id;
      store.forms.unshift(form);
    }
    return clone(form);
  },
  getPublicForm: (slug) => {
    const form = store.forms.find((f) => f.slug === slug && f.status === "published");
    if (!form) throw Object.assign(new Error("This form is not available"), { message: "This form is not available" });
    form.views += 1;
    return clone(form);
  },
  createForm: (payload = {}) => {
    const form = makeForm({
      title: payload.title || "Untitled form",
      description: payload.description || "",
      theme: payload.theme || "modern",
      color: payload.settings?.primaryColor || "#0c8b7c",
      status: payload.status || "draft",
      questions: payload.questions || [],
    });
    if (payload.settings) form.settings = defaultSettings(payload.settings);
    form.responseCount = 0;
    form.views = 0;
    form.publishedAt = null;
    form.createdAt = new Date().toISOString();
    form.updatedAt = form.createdAt;
    store.forms.unshift(form);
    return clone(form);
  },
  updateForm: (id, updates) => {
    let form = store.forms.find((f) => f._id === id);
    if (!form) {
      mock.getForm(id); // synthesize + insert for unknown ids
      form = store.forms.find((f) => f._id === id);
    }
    const allowed = ["title", "description", "theme", "questions", "settings", "isFavorite", "isArchived"];
    for (const key of allowed) if (key in updates) form[key] = updates[key];
    form.updatedAt = new Date().toISOString();
    return clone(form);
  },
  publishForm: (id, publish) => {
    const form = store.forms.find((f) => f._id === id);
    form.status = publish ? "published" : "draft";
    form.publishedAt = publish ? new Date().toISOString() : null;
    form.updatedAt = new Date().toISOString();
    return clone(form);
  },
  duplicateForm: (id) => {
    const src = store.forms.find((f) => f._id === id);
    const copy = clone(src);
    copy._id = uid("form");
    copy.slug = uid("s").replace("s_", "");
    copy.title = `${src.title} (Copy)`;
    copy.status = "draft";
    copy.publishedAt = null;
    copy.responseCount = 0;
    copy.views = 0;
    copy.isFavorite = false;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    store.forms.unshift(copy);
    return clone(copy);
  },
  removeForm: (id) => {
    store.forms = store.forms.filter((f) => f._id !== id);
    store.responses = store.responses.filter((r) => r.form !== id);
    return { success: true, message: "Form deleted" };
  },

  // ----- responses & analytics -----
  submitResponse: (slug, payload) => {
    const form = store.forms.find((f) => f.slug === slug);
    if (form) {
      store.responses.push({
        _id: uid("resp"),
        form: form._id,
        answers: (payload.answers || []).map((a) => {
          const qq = form.questions.find((x) => x.id === a.questionId) || {};
          return { questionId: a.questionId, label: qq.label || "", type: qq.type || "", value: a.value };
        }),
        completionTime: payload.completionTime || 0,
        meta: { userAgent: navigator.userAgent, ip: "127.0.0.1" },
        submittedAt: new Date().toISOString(),
      });
      form.responseCount += 1;
    }
    return { id: uid("resp") };
  },
  listResponses: (formId, { search = "" } = {}) => {
    let responses = responsesFor(formId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      responses = responses.filter((r) => r.answers.some((a) => {
        const val = Array.isArray(a.value) ? a.value.join(" ") : String(a.value ?? "");
        return val.toLowerCase().includes(needle);
      }));
    }
    return { responses: clone(responses), count: responses.length };
  },
  analytics: (formId) => clone(computeAnalytics(formId)),
  removeResponse: (id) => {
    const r = store.responses.find((x) => x._id === id);
    if (r) {
      const form = store.forms.find((f) => f._id === r.form);
      if (form) form.responseCount = Math.max(0, form.responseCount - 1);
    }
    store.responses = store.responses.filter((x) => x._id !== id);
    return { success: true, message: "Response deleted" };
  },
  exportCsv: (formId) => {
    const form = store.forms.find((f) => f._id === formId);
    return toCsv(form, responsesFor(formId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
  },

  // ----- workspace-wide -----
  insights: () => clone(computeInsights()),
  inbox: ({ search = "" } = {}) => {
    const responses = computeInbox(search);
    return { responses: clone(responses), count: responses.length };
  },

  // ----- AI (believable structured data) -----
  aiGenerateForm: (prompt = "") => {
    const topic = String(prompt).split(/\s+/).slice(0, 4).join(" ") || "feedback";
    return {
      title: prompt ? `${prompt.slice(0, 40)} form`.replace(/\s+form form$/, " form") : "Customer Feedback Form",
      description: `An AI-drafted form based on: “${topic}”.`,
      theme: "modern",
      questions: [
        q("heading", "Tell us what you think", { content: "This should only take a minute." }),
        q("short_text", "Your name", { required: true }),
        q("email", "Email address", { required: true }),
        q("rating", "How would you rate your overall experience?", { required: true }),
        q("radio", "How did you hear about us?", { options: ["Search", "Social media", "A friend", "Other"] }),
        q("checkbox", "Which areas can we improve?", { options: ["Speed", "Pricing", "Support", "Features"] }),
        q("long_text", "Anything else you'd like to share?"),
      ],
    };
  },
  aiGenerateValidation: ({ type } = {}) => {
    if (type === "email") return { minLength: null, maxLength: null, min: null, max: null, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message: "Please enter a valid email address" };
    if (type === "phone") return { minLength: 7, maxLength: 20, min: null, max: null, pattern: "^[+()\\d\\s-]{7,20}$", message: "Please enter a valid phone number" };
    if (type === "number") return { minLength: null, maxLength: null, min: 0, max: 100, pattern: "", message: "Enter a number between 0 and 100" };
    return { minLength: 2, maxLength: 120, min: null, max: null, pattern: "", message: "Please keep this between 2 and 120 characters" };
  },
  aiImproveQuestion: ({ label = "" } = {}) => ({
    improved: label ? label.replace(/\?*$/, "").replace(/^how /i, "How exactly ") + "?" : "How would you describe your experience?",
    clarity: "Made the wording more specific and neutral to reduce ambiguity.",
    followUps: ["What was the main reason for your rating?", "Is there anything we could have done better?", "Would you use this again?"],
  }),
  aiFormSummary: (form = {}) => {
    const n = (form.questions || []).filter((x) => !STATIC.has(x.type)).length;
    return {
      purpose: `Collect structured feedback across ${n} questions to understand respondent sentiment.`,
      audience: "Existing customers and recent sign-ups.",
      completionTime: `${Math.max(1, Math.round(n * 0.4))}-${Math.max(2, Math.round(n * 0.6))} minutes`,
      suggestions: [
        "Move the required fields to the top to lift completion rate.",
        "Add a short intro so respondents know why you're asking.",
        "Consider making the long-text question optional.",
      ],
    };
  },
};

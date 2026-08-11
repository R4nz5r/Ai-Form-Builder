import { createField } from "./fieldTypes.js";

/** Apply field overrides onto a fresh field of the given type. */
function field(type, overrides = {}) {
  const base = createField(type);
  if (overrides.options) {
    overrides = {
      ...overrides,
      options: overrides.options.map((label) => ({
        ...createField("radio").options[0],
        id: `${base.id}_${label}`.replace(/\s+/g, "_"),
        label,
      })),
    };
  }
  return { ...base, ...overrides };
}

/**
 * Curated starter templates. Each builds a complete form definition ready to
 * drop into the builder.
 */
export const TEMPLATES = [
  {
    id: "feedback",
    name: "Customer Feedback",
    category: "Feedback",
    emoji: "💬",
    gradient: "from-brand-500 to-violet-600",
    description: "Collect satisfaction ratings and open feedback.",
    build: () => ({
      title: "Customer Feedback Survey",
      description: "We'd love to hear about your experience.",
      theme: "modern",
      questions: [
        field("heading", { content: "Tell us how we did" }),
        field("short_text", { label: "Your name", required: true }),
        field("email", { label: "Email address", required: true }),
        field("rating", { label: "Overall, how satisfied are you?", required: true }),
        field("radio", { label: "How likely are you to recommend us?", options: ["Very likely", "Likely", "Neutral", "Unlikely"] }),
        field("long_text", { label: "What can we improve?" }),
      ],
    }),
  },
  {
    id: "employee",
    name: "Employee Satisfaction",
    category: "HR",
    emoji: "🧑‍💼",
    gradient: "from-emerald-500 to-teal-600",
    description: "Measure team morale and engagement.",
    build: () => ({
      title: "Employee Satisfaction Survey",
      description: "Your honest feedback helps us build a better workplace.",
      theme: "corporate",
      questions: [
        field("rating", { label: "How happy are you at work?", required: true }),
        field("radio", { label: "Do you feel valued?", options: ["Always", "Often", "Sometimes", "Rarely"] }),
        field("checkbox", { label: "What would improve your experience?", options: ["Compensation", "Flexibility", "Growth", "Recognition", "Tools"] }),
        field("long_text", { label: "Any additional comments?" }),
      ],
    }),
  },
  {
    id: "restaurant",
    name: "Restaurant Feedback",
    category: "Feedback",
    emoji: "🍽️",
    gradient: "from-amber-500 to-orange-600",
    description: "Rate food, service and ambience.",
    build: () => ({
      title: "Restaurant Feedback",
      description: "Thanks for dining with us!",
      theme: "gradient",
      questions: [
        field("rating", { label: "Rate the food", required: true }),
        field("rating", { label: "Rate the service", required: true }),
        field("radio", { label: "How was the ambience?", options: ["Excellent", "Good", "Average", "Poor"] }),
        field("yes_no", { label: "Would you visit again?" }),
        field("long_text", { label: "Tell us more" }),
      ],
    }),
  },
  {
    id: "course",
    name: "Course Evaluation",
    category: "Education",
    emoji: "🎓",
    gradient: "from-sky-500 to-blue-600",
    description: "Gather feedback on a course or instructor.",
    build: () => ({
      title: "Course Evaluation",
      description: "Help us improve this course.",
      theme: "minimal",
      questions: [
        field("short_text", { label: "Course name", required: true }),
        field("rating", { label: "Rate the overall course", required: true }),
        field("rating", { label: "Rate the instructor" }),
        field("radio", { label: "Was the pace right?", options: ["Too slow", "Just right", "Too fast"] }),
        field("long_text", { label: "Suggestions for improvement" }),
      ],
    }),
  },
  {
    id: "conference",
    name: "Conference Registration",
    category: "Events",
    emoji: "🎟️",
    gradient: "from-pink-500 to-rose-600",
    description: "Register attendees for an event.",
    build: () => ({
      title: "Conference Registration",
      description: "Secure your spot at our annual conference.",
      theme: "modern",
      questions: [
        field("short_text", { label: "Full name", required: true }),
        field("email", { label: "Email", required: true }),
        field("phone", { label: "Phone number" }),
        field("dropdown", { label: "Ticket type", required: true, options: ["General", "VIP", "Student"] }),
        field("checkbox", { label: "Which sessions interest you?", options: ["Keynote", "Workshops", "Networking", "Panels"] }),
        field("yes_no", { label: "Do you have dietary restrictions?" }),
      ],
    }),
  },
  {
    id: "job",
    name: "Job Application",
    category: "HR",
    emoji: "📄",
    gradient: "from-indigo-500 to-purple-600",
    description: "Collect candidate applications.",
    build: () => ({
      title: "Job Application",
      description: "We're excited to learn more about you.",
      theme: "corporate",
      questions: [
        field("short_text", { label: "Full name", required: true }),
        field("email", { label: "Email", required: true }),
        field("phone", { label: "Phone", required: true }),
        field("url", { label: "Portfolio / LinkedIn" }),
        field("dropdown", { label: "Role applying for", required: true, options: ["Engineering", "Design", "Product", "Marketing", "Sales"] }),
        field("file", { label: "Upload your résumé" }),
        field("long_text", { label: "Why do you want to join us?" }),
      ],
    }),
  },
  {
    id: "support",
    name: "Customer Support Survey",
    category: "Feedback",
    emoji: "🎧",
    gradient: "from-cyan-500 to-sky-600",
    description: "Measure support quality after a ticket.",
    build: () => ({
      title: "Customer Support Survey",
      description: "How did we do resolving your issue?",
      theme: "modern",
      questions: [
        field("rating", { label: "How would you rate the support you received?", required: true }),
        field("radio", { label: "Was your issue resolved?", options: ["Fully", "Partially", "Not at all"] }),
        field("number", { label: "How many contacts did it take?" }),
        field("long_text", { label: "Anything else you'd like to share?" }),
      ],
    }),
  },
  {
    id: "lead",
    name: "Lead Generation",
    category: "Marketing",
    emoji: "🚀",
    gradient: "from-fuchsia-500 to-pink-600",
    description: "Capture qualified leads.",
    build: () => ({
      title: "Get in Touch",
      description: "Tell us about your needs and we'll be in touch.",
      theme: "glassmorphism",
      questions: [
        field("short_text", { label: "Name", required: true }),
        field("email", { label: "Work email", required: true }),
        field("short_text", { label: "Company" }),
        field("dropdown", { label: "Company size", options: ["1-10", "11-50", "51-200", "200+"] }),
        field("long_text", { label: "How can we help?" }),
      ],
    }),
  },
];

export const TEMPLATE_CATEGORIES = ["All", ...new Set(TEMPLATES.map((t) => t.category))];

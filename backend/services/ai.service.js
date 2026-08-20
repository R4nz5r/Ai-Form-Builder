import { generateJson, generateText } from "./gemini.service.js";
import { ApiError } from "../utils/apiError.js";
import { nanoid } from "../utils/nanoid.js";
import { FIELD_TYPES, OPTION_FIELD_TYPES } from "../utils/constants.js";

const FIELD_TYPE_LIST = FIELD_TYPES.join(" ");

export async function generateForm(props) {
  if (!props?.trim())
    throw ApiError.badRequest("Describe the form you want to create");

  const schemaHint = `{
        "title": "string",
        "description": "string",
        "theme": "one of [\"minimal\", \"modern\", \"corporate\", \"gradient\", \"dark\", \"glassmorphism\"]",
        "questions": {
            "type": "one of [${FIELD_TYPE_LIST}]",
            "label": "string",
            "placeholder": "string",
            "description": "string",
            "required": "boolean",
            "options": "string[] (only for dropdown/radio/checkbox)",
            "content": "string (only for heading/paragraph/section/image)"
        }
    }`;

  const data = await generateJson(
    `You are an expert form designer. Create a thoughtful, well-structured form based on this request: "${props}"
Use a logical order, group related questions, add a "section" or "heading" block where helpful, choose the most appropriate field type for each question, and mark essential questions as required.`,
    { schemaHint },
  );

  return normalizeForm(data);
}

export async function generateValidation({ label, type, description = "" }) {
  if (!label || !type)
    throw ApiError.badRequest("Field label and type are required");

  const schemaHint = `{
    "minLength": "number | null",
    "maxLength": "number | null",
    "min": "number | null",
    "max": "number | null",
    "pattern": "string",
    "message": "string"
  }`;

  const data = await generateJson(
    `Suggest sensible validation rules for a form field.
Field label: "${label}". Field type: "${type}". ${description ? `Context: ${description}.` : ""}
Provide a regex pattern when it improves data quality (e.g. phone, postal code), reasonable length/number bounds, and more.`,
    { schemaHint },
  );

  return {
    minLength: numberOrNull(data.minLength),
    maxLength: numberOrNull(data.maxLength),
    min: numberOrNull(data.min),
    max: numberOrNull(data.max),
    pattern: typeof data.pattern === "string" ? data.pattern : "",
    message: typeof data.message === "string" ? data.message : "",
  };
}

export async function improveQuestion({ label, type = "short_text" }) {
  if (!label?.trim())
    throw ApiError.badRequest("Provide the question to improve");

  const schemaHint = `{
    "improved": "string",
    "clarity": "string",
    "followUps": "string[]"
  }`;

  const data = await generateJson(
    `Improve this ${type} survey/form question for clarity, neutrality and engagement: "${label}".
Return the rewritten question as "improved", a one-sentence note on what you improved as "clarity", and 2-3 relevant follow-up questions as "followUps".`,
    { schemaHint },
  );

  return {
    improved: data.improved || label,
    clarity: data.clarity || "",
    followUps: Array.isArray(data.followUps) ? data.followUps.slice(0, 3) : [],
  };
}

export async function summarizeForm(form) {
  if (!form?.questions?.length) {
    throw ApiError.badRequest("Add some questions before generating a summary");
  }

  const outline = form.questions
    .map((q, i) => `${i + 1}. (${q.type})${q.required ? " *" : ""} ${q.label}`)
    .join("\n");

  const schemaHint = `{
    "purpose": "string",
    "audience": "string",
    "completionTime": "string",
    "suggestions": "string[]"
  }`;

  const data = await generateJson(
    `Analyse this form title: "${form.title}"

Questions:
${outline}

Return its likely "purpose", the target "audience", an estimated "completionTime" (e.g. "2-3 minutes"), and 3-4 concrete "suggestions" to improve completion rate and data quality.`,
    { schemaHint },
  );

  return {
    purpose: data.purpose || "",
    audience: data.audience || "",
    completionTime: data.completionTime || "",
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
  };
}

function numberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function normalizeForm(data) {
  const validThemes = [
    "minimal",
    "modern",
    "corporate",
    "gradient",
    "dark",
    "glassmorphism",
  ];
  const questions = Array.isArray(data.questions) ? data.questions : [];

  return {
    title: typeof data.title === "string" ? data.title : "Untitled form",
    description: typeof data.description === "string" ? data.description : "",
    theme: validThemes.includes(data.theme) ? data.theme : "modern",
    questions: questions.map((q, index) => normalizeQuestion(q, index)),
  };
}

function normalizeQuestion(q, index) {
  const type = FIELD_TYPES.includes(q.type) ? q.type : "short_text";

  const options =
    OPTION_FIELD_TYPES.includes(type) && Array.isArray(q.options)
      ? q.options.map((label) => ({
          id: nanoid(8),
          label: String(typeof label === "object" ? label.label : label),
          value: "",
        }))
      : [];

  return {
    id: nanoid(10),
    type,
    label: typeof q.label === "string" ? q.label : `Question ${index + 1}`,
    placeholder: typeof q.placeholder === "string" ? q.placeholder : "",
    description: typeof q.description === "string" ? q.description : "",
    helpText: "",
    required: Boolean(q.required),
    defaultValue: "",
    options,
    content: typeof q.content === "string" ? q.content : "",
    validation: {},
    order: index,
  };
}

export { generateText };



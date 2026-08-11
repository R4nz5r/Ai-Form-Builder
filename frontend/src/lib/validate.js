import { isStatic } from "./fieldTypes.js";

/** Validate a single answer; returns an error string or null. */
export function validateField(field, value) {
  const v = field.validation || {};
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) return `${field.label} is required`;
  if (isEmpty) return null;

  const str = Array.isArray(value) ? value.join(",") : String(value);

  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str))
    return v.message || "Please enter a valid email address";
  if (field.type === "url" && !/^https?:\/\/.+/.test(str))
    return v.message || "Please enter a valid URL (https://…)";
  if (v.minLength != null && str.length < v.minLength)
    return v.message || `Must be at least ${v.minLength} characters`;
  if (v.maxLength != null && str.length > v.maxLength)
    return v.message || `Must be at most ${v.maxLength} characters`;

  if (field.type === "number") {
    const num = Number(value);
    if (Number.isNaN(num)) return v.message || "Please enter a number";
    if (v.min != null && num < v.min) return v.message || `Must be ≥ ${v.min}`;
    if (v.max != null && num > v.max) return v.message || `Must be ≤ ${v.max}`;
  }

  if (v.pattern) {
    try {
      if (!new RegExp(v.pattern).test(str)) return v.message || "Invalid format";
    } catch {
      /* ignore malformed regex */
    }
  }
  return null;
}

/** Validate the whole form; returns a map of fieldId → error. */
export function validateForm(questions, answers) {
  const errors = {};
  for (const q of questions) {
    if (isStatic(q.type)) continue;
    const err = validateField(q, answers[q.id]);
    if (err) errors[q.id] = err;
  }
  return errors;
}

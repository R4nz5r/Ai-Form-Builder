import { ApiError } from "../utils/ApiError.js";
import { getOwnedForm } from "./form.service.js";
import * as formRepo from "../repositories/form.repo.js";
import * as responseRepo from "../repositories/response.repo.js";
import { OPTION_FIELD_TYPES, STATIC_FIELD_TYPES } from "../utils/constants.js";

export async function submitResponse(
  slug,
  { answers = [], completionTime = 0, meta = {} },
) {
  const form = await formRepo.findPublishedBySlug(slug);
  if (!form) throw ApiError.notFound("This form is not accepting responses");

  const answerById = new Map(answers.map((a) => [a.questionId, a.value]));
  const normalized = [];

  for (const q of form.questions) {
    if (STATIC_FIELD_TYPES.includes(q.type)) continue;

    const value = answerById.get(q.id);
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (q.required && isEmpty) {
      throw ApiError.badRequest(`"${q.label}" is required`);
    }
    if (isEmpty) continue;

    validateAnswer(q, value);
    normalized.push({ questionId: q.id, label: q.label, type: q.type, value });
  }

  const response = await responseRepo.createResponse({
    form: form._id,
    answers: normalized,
    completionTime,
    meta,
  });

  await formRepo.incrementResponseCount(form._id, 1);
  return response;
}

function validateAnswer(q, value) {
  const v = q.validation || {};
  const asString = Array.isArray(value) ? value.join(",") : String(value);

  if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(asString)) {
    throw ApiError.badRequest(
      v.message || `"${q.label}" must be a valid email`,
    );
  }
  if (q.type === "url" && !/^https?:\/\/.+/.test(asString)) {
    throw ApiError.badRequest(v.message || `"${q.label}" must be a valid URL`);
  }
  if (v.minLength != null && asString.length < v.minLength) {
    throw ApiError.badRequest(v.message || `"${q.label}" is too short`);
  }
  if (v.maxLength != null && asString.length > v.maxLength) {
    throw ApiError.badRequest(v.message || `"${q.label}" is too long`);
  }
  if (q.type === "number") {
    const num = Number(value);
    if (Number.isNaN(num))
      throw ApiError.badRequest(`"${q.label}" must be a number`);
    if (v.min != null && num < v.min)
      throw ApiError.badRequest(v.message || `"${q.label}" is too small`);
    if (v.max != null && num > v.max)
      throw ApiError.badRequest(v.message || `"${q.label}" is too large`);
  }
  if (v.pattern) {
    try {
      if (!new RegExp(v.pattern).test(asString)) {
        throw ApiError.badRequest(v.message || `"${q.label}" is invalid`);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
    }
  }
  if (OPTION_FIELD_TYPES.includes(q.type) && q.options.length) {
    const allowed = new Set(q.options.map((o) => o.label));
    const selected = Array.isArray(value) ? value : [value];
    for (const sel of selected) {
      if (!allowed.has(sel)) {
        throw ApiError.badRequest(
          `"${sel}" is not a valid choice for "${q.label}"`,
        );
      }
    }
  }
}
export async function listResponses(formId, userId, { search = "" } = {}) {
  await getOwnedForm(formId, userId);
  const responses = await responseRepo.listResponsesByForm(formId);

  if (!search.trim()) return responses;

  const needle = search.trim().toLowerCase();
  return responses.filter((r) =>
    r.answers.some((a) => {
      const val = Array.isArray(a.value)
        ? a.value.join(" ")
        : String(a.value ?? "");
      return val.toLowerCase().includes(needle);
    }),
  );
}

export async function deleteResponse(responseId, userId) {
  const response = await responseRepo.findResponseById(responseId);
  if (!response) throw ApiError.notFound("Response not found");

  await getOwnedForm(response.form, userId);
  await responseRepo.deleteResponse(responseId);
  await formRepo.incrementResponseCount(response.form, -1);
}

export async function exportResponses(formId, userId) {
  const form = await getOwnedForm(formId, userId);
  const responses = await responseRepo.listResponsesByForm(formId);
  return { form, responses };
}

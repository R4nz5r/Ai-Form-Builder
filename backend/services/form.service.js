import { ApiError } from "../utils/apiError.js";
import * as formRepo from "../repositories/form.repo.js";

async function getOwnedForm(formId, userId) {
  const form = await formRepo.findFormById(formId);
  if (!form) throw ApiError.notFound("Form not found");
  if (form.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden("You do not have access to this form");
  }
  return form;
}

export async function listForms(userId, opts = {}) {
  return formRepo.listFormsByOwner(userId, opts);
}

export async function getFormById(formId, userId) {
  return getOwnedForm(formId, userId);
}

export async function getPublicForm(slug) {
  const form = await formRepo.findPublishedBySlug(slug);
  if (!form) throw ApiError.notFound("This form is not available");
  return form;
}

export async function registerView(slug) {
  await formRepo.incrementViews(slug);
}

export async function createForm(userId, payload = {}) {
  return formRepo.createForm(userId, payload);
}

export async function updateForm(formId, userId, updates) {
  await getOwnedForm(formId, userId);

  const allowed = [
    "title",
    "description",
    "theme",
    "questions",
    "settings",
    "isFavorite",
    "isArchived",
  ];
  const patch = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }
  return formRepo.updateForm(formId, patch);
}

export async function setPublishState(formId, userId, shouldPublish) {
  const form = await getOwnedForm(formId, userId);

  if (shouldPublish && form.questions.length === 0) {
    throw ApiError.badRequest("Add at least one question before publishing");
  }

  return formRepo.updateForm(formId, {
    status: shouldPublish ? "published" : "draft",
    publishedAt: shouldPublish ? new Date() : null,
  });
}

export async function duplicateForm(formId, userId) {
  const form = await getOwnedForm(formId, userId);
  return formRepo.createForm(userId, {
    title: `${form.title} (Copy)`,
    description: form.description,
    theme: form.theme,
    questions: form.questions,
    settings: form.settings,
    status: "draft",
  });
}
export async function deleteForm(formId, userId) {
  await getOwnedForm(formId, userId);
  await formRepo.deleteForm(formId);
}

export { getOwnedForm };



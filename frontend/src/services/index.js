// ============================================================================
//  API ENDPOINT GROUPS  —  MOCK-MODE BOILERPLATE
// ----------------------------------------------------------------------------
//  👉 WHEN THE BACKEND IS READY:
//     1. Uncomment the "REAL API" block below.
//     2. Delete (or comment out) the "MOCK API" block.
//     3. Remove the `./mockData` import.
//     4. In `lib/api.js`, uncomment the REAL client (see its header).
//
//  Components never change — they only import authApi / formApi / responseApi /
//  aiApi / insightsApi from here, and every method keeps the same name,
//  signature and return shape in both modes.
// ============================================================================

/* ══════════════════════════════════════════════════════════════════════════
 *  REAL API  —  UNCOMMENT TO GO LIVE  (verbatim, hits the Express/Neon backend)
 * ══════════════════════════════════════════════════════════════════════════

import api from "../lib/api.js";

// ---- Auth ----
export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data.data),
  me: () => api.get("/auth/me").then((r) => r.data.data),
  updateProfile: (payload) => api.put("/auth/profile", payload).then((r) => r.data.data.user),
  changePassword: (payload) => api.put("/auth/password", payload).then((r) => r.data),
  deleteAccount: () => api.delete("/auth/me").then((r) => r.data),
};

// ---- Workspace-wide ----
export const insightsApi = {
  overview: () => api.get("/insights").then((r) => r.data.data.insights),
  inbox: (params) => api.get("/inbox", { params }).then((r) => r.data.data),
};

// ---- Forms ----
export const formApi = {
  list: (params) => api.get("/forms", { params }).then((r) => r.data.data.forms),
  get: (id) => api.get(`/forms/${id}`).then((r) => r.data.data.form),
  getPublic: (slug) => api.get(`/public/forms/${slug}`).then((r) => r.data.data.form),
  create: (payload) => api.post("/forms", payload).then((r) => r.data.data.form),
  update: (id, payload) => api.put(`/forms/${id}`, payload).then((r) => r.data.data.form),
  publish: (id, publish = true) =>
    api.post(`/forms/${id}/publish`, { publish }).then((r) => r.data.data.form),
  duplicate: (id) => api.post(`/forms/${id}/duplicate`).then((r) => r.data.data.form),
  remove: (id) => api.delete(`/forms/${id}`).then((r) => r.data),
};

// ---- Responses & analytics ----
export const responseApi = {
  submit: (slug, payload) =>
    api.post(`/public/forms/${slug}/respond`, payload).then((r) => r.data.data),
  list: (formId, params) =>
    api.get(`/forms/${formId}/responses`, { params }).then((r) => r.data.data),
  analytics: (formId) =>
    api.get(`/forms/${formId}/analytics`).then((r) => r.data.data.analytics),
  remove: (id) => api.delete(`/responses/${id}`).then((r) => r.data),
  exportCsv: (formId) =>
    api.get(`/forms/${formId}/responses/export`, { responseType: "text" }).then((r) => r.data),
};

// ---- AI ----
export const aiApi = {
  generateForm: (prompt) =>
    api.post("/ai/generate-form", { prompt }).then((r) => r.data.data.form),
  generateValidation: (payload) =>
    api.post("/ai/generate-validation", payload).then((r) => r.data.data.validation),
  improveQuestion: (payload) =>
    api.post("/ai/improve-question", payload).then((r) => r.data.data.result),
  formSummary: (form) =>
    api.post("/ai/form-summary", { form }).then((r) => r.data.data.summary),
};

 * ════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
 *  MOCK API  —  ACTIVE  (delete this whole block when going live)
 *  Same export names, signatures and return shapes as the REAL API above,
 *  wrapped in async fns with a small artificial delay so loading UI still shows.
 * ══════════════════════════════════════════════════════════════════════════ */
import { mock } from "./mockData.js";

// Artificial latency so spinners / skeletons are demonstrable.
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const net = async (fn, ms = 300 + Math.random() * 350) => {
  await wait(ms);
  return fn();
};
const slow = (fn) => net(fn, 900 + Math.random() * 600); // "AI" / heavy calls

// ---- Auth ----
export const authApi = {
  register: (payload) => net(() => mock.register(payload)),
  login: (payload) => net(() => mock.login(payload)),
  me: () => net(() => mock.me()),
  updateProfile: (payload) => net(() => mock.updateProfile(payload)),
  changePassword: () => net(() => ({ success: true, message: "Password changed" })),
  deleteAccount: () => net(() => ({ success: true, message: "Account deleted" })),
};

// ---- Workspace-wide ----
export const insightsApi = {
  overview: () => net(() => mock.insights(), 500 + Math.random() * 400),
  inbox: (params) => net(() => mock.inbox(params || {})),
};

// ---- Forms ----
export const formApi = {
  list: (params) => net(() => mock.listForms(params || {})),
  get: (id) => net(() => mock.getForm(id)),
  getPublic: (slug) => net(() => mock.getPublicForm(slug)),
  create: (payload) => net(() => mock.createForm(payload)),
  update: (id, payload) => net(() => mock.updateForm(id, payload)),
  publish: (id, publish = true) => net(() => mock.publishForm(id, publish)),
  duplicate: (id) => net(() => mock.duplicateForm(id)),
  remove: (id) => net(() => mock.removeForm(id)),
};

// ---- Responses & analytics ----
export const responseApi = {
  submit: (slug, payload) => net(() => mock.submitResponse(slug, payload), 600 + Math.random() * 500),
  list: (formId, params) => net(() => mock.listResponses(formId, params || {})),
  analytics: (formId) => net(() => mock.analytics(formId), 500 + Math.random() * 400),
  remove: (id) => net(() => mock.removeResponse(id)),
  exportCsv: (formId) => net(() => mock.exportCsv(formId)),
};

// ---- AI (deliberately slower to show the "generating…" states) ----
export const aiApi = {
  generateForm: (prompt) => slow(() => mock.aiGenerateForm(prompt)),
  generateValidation: (payload) => slow(() => mock.aiGenerateValidation(payload)),
  improveQuestion: (payload) => slow(() => mock.aiImproveQuestion(payload)),
  formSummary: (form) => slow(() => mock.aiFormSummary(form)),
};

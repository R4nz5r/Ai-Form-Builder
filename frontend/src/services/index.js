import api from "../lib/api.js";

// ---- Auth ----
export const authApi = {
  register: (payload) =>
    api.post("/auth/register", payload).then((r) => r.data.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data.data),
  me: () => api.get("/auth/me").then((r) => r.data.data),
  updateProfile: (payload) =>
    api.put("/auth/profile", payload).then((r) => r.data.data.user),
  changePassword: (payload) =>
    api.put("/auth/password", payload).then((r) => r.data),
  deleteAccount: () => api.delete("/auth/me").then((r) => r.data),
};

// ---- Workspace-wide ----
export const insightsApi = {
  overview: () => api.get("/insights").then((r) => r.data.data.insights),
  inbox: (params) => api.get("/inbox", { params }).then((r) => r.data.data),
};

// ---- Forms ----
export const formApi = {
  list: (params) =>
    api.get("/forms", { params }).then((r) => r.data.data.forms),
  get: (id) => api.get(`/forms/${id}`).then((r) => r.data.data.form),
  getPublic: (slug) =>
    api.get(`/public/forms/${slug}`).then((r) => r.data.data.form),
  create: (payload) =>
    api.post("/forms", payload).then((r) => r.data.data.form),
  update: (id, payload) =>
    api.put(`/forms/${id}`, payload).then((r) => r.data.data.form),
  publish: (id, publish = true) =>
    api.post(`/forms/${id}/publish`, { publish }).then((r) => r.data.data.form),
  duplicate: (id) =>
    api.post(`/forms/${id}/duplicate`).then((r) => r.data.data.form),
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
    api
      .get(`/forms/${formId}/responses/export`, { responseType: "text" })
      .then((r) => r.data),
};

// ---- AI ----
export const aiApi = {
  generateForm: (prompt) =>
    api.post("/ai/generate-form", { prompt }).then((r) => r.data.data.form),
  generateValidation: (payload) =>
    api
      .post("/ai/generate-validation", payload)
      .then((r) => r.data.data.validation),
  improveQuestion: (payload) =>
    api.post("/ai/improve-question", payload).then((r) => r.data.data.result),
  formSummary: (form) =>
    api.post("/ai/form-summary", { form }).then((r) => r.data.data.summary),
};

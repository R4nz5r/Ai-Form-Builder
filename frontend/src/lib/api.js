// ============================================================================
//  API CLIENT  —  MOCK-MODE BOILERPLATE
// ----------------------------------------------------------------------------
//  👉 WHEN THE BACKEND IS READY:
//     1. Uncomment the "REAL API CLIENT" block below.
//     2. Delete (or comment out) the "MOCK CLIENT" line at the bottom.
//     Nothing else in this file changes — `TOKEN_KEY` and the token helpers
//     stay exactly as-is, and `services/index.js` keeps importing them.
// ============================================================================

/* ────────────────────────────────────────────────────────────────────────
 *  TOKEN / SESSION HELPERS  —  ACTIVE IN BOTH MODES
 *  These are pure localStorage; they work fine with no server.
 * ──────────────────────────────────────────────────────────────────────── */
export const TOKEN_KEY = "formly_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/* ══════════════════════════════════════════════════════════════════════════
 *  REAL API CLIENT  —  UNCOMMENT TO GO LIVE
 *  (Verbatim axios client + interceptors, exactly as it runs against the
 *  real backend. `services/index.js` imports the default export `api`.)
 * ══════════════════════════════════════════════════════════════════════════

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors and auto-logout on 401.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network error — is the backend running?";

    if (status === 401 && getToken()) {
      clearToken();
      // Avoid redirect loops on the auth pages.
      if (!["/login", "/register"].includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ ...error, message, details: error.response?.data?.details });
  }
);

export default api;

 * ════════════════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────────────────
 *  MOCK CLIENT  —  DELETE WHEN GOING LIVE
 *  No network client is needed in mock mode; the endpoint groups in
 *  `services/index.js` return data from `./mockData` directly.
 * ──────────────────────────────────────────────────────────────────────── */
export default null;

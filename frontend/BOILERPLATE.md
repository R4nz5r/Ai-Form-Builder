# Timely Forms AI — UI Boilerplate (mock data, zero backend)

This is the **frontend, fully clickable with no backend**. Every screen, list, form,
builder, chart and dashboard works on **in-memory mock data** with realistic loading
delays — so you can build/record the whole UI before the API exists, then flip to the
real backend with a **2–3 line change** and **no component edits**.

It is the real app's `src` copied **verbatim**; only the network/integration layer was
changed. The config files (`package.json`, `index.html`, `vite.config.js`, etc.) are the
**unchanged originals**, copied alongside so this folder runs on its own.

## Run it (mock mode)

```bash
cd frontend/boilerplate
npm install
npm run dev            # http://localhost:5173
```

- On the **login** screen, click **“Fill demo credentials”** (or type anything) and log in —
  mock auth always succeeds.
- You land in a **populated** app: 8 sample forms (published + drafts + a favorite),
  ~940 responses, full analytics (timeline, funnel, heatmap, device donut, per-question
  charts), a global Insights dashboard, an Inbox, Templates, and the drag-and-drop builder.
- **AI** buttons (generate form, suggest validation, improve question, summarize) return
  believable mock data after a short "thinking" delay.
- Create / edit / duplicate / delete / publish all **persist for the session** (until refresh).

Data resets on every page refresh — it lives only in memory.

## What was changed vs. the real frontend

Only **three files** in `src/` differ from the real app; nothing else was touched
(no component, page, hook, context, style, route, or config file):

| File | Change |
| --- | --- |
| `src/lib/api.js` | Token helpers (`TOKEN_KEY`, `getToken/setToken/clearToken`) kept **active**. The real axios client + interceptors are preserved **verbatim inside a commented `REAL API CLIENT` block**. Mock mode exports `default null`. |
| `src/services/index.js` | The real endpoint groups are preserved **verbatim inside a commented `REAL API` block**. The **active `MOCK API` block** re-implements `authApi` / `formApi` / `responseApi` / `aiApi` / `insightsApi` with the **same names, signatures and return shapes**, wrapped in `async` + artificial delay. |
| `src/services/mockData.js` | **New, throwaway** file: the in-memory store (current user, forms, responses), analytics/insights/CSV computed exactly like the backend, session-persistent mutations, always-succeeds auth, and mock AI responses. |

There is **no realtime/socket** layer in this app, so nothing else to stub.

## 👉 Swap to the real backend (the only edits you make)

1. **`src/services/index.js`**
   - Uncomment the **`REAL API`** block (the `import api from "../lib/api.js"` + endpoint groups).
   - Delete (or comment out) the **`MOCK API`** block.
   - Remove the `import { mock } from "./mockData.js";` line.
2. **`src/lib/api.js`**
   - Uncomment the **`REAL API CLIENT`** block (axios instance + interceptors + `export default api`).
   - Delete the `export default null;` **MOCK CLIENT** line.
3. **(optional)** delete `src/services/mockData.js` — it's no longer imported.
4. Point the frontend at your API via `.env`:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

That's it. **No component, page, hook, context, style or route changes** — every file
still imports `authApi` / `formApi` / `responseApi` / `aiApi` / `insightsApi` from
`src/services/index.js` and `TOKEN_KEY` from `src/lib/api.js`, exactly as before.

> Tip: each block is wrapped in big `REAL …` / `MOCK …` banner comments, so they're easy
> to find on screen while recording.

## Notes

- `axios` is still listed in `package.json` but is unused in mock mode (it only runs
  from the commented REAL block). No need to remove it.
- The config files here (`package.json`, `index.html`, `vite.config.js`, `.oxlintrc.json`,
  `public/`) are the **unchanged** originals from the real frontend and are meant to be
  paired with this `src`.
- Mock latency is real (~300–600ms for normal calls, ~0.9–1.5s for "AI") so spinners,
  skeletons and "generating…" states are all demonstrable.

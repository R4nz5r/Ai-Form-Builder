import { listResponsesByForm } from "../repositories/response.repo.js";
import { getOwnedForm } from "./form.service.js";
import { OPTION_FIELD_TYPES, STATIC_FIELD_TYPES } from "../utils/constants.js";

export async function getFormAnalytics(formId, userId) {
  const form = await getOwnedForm(formId, userId);
  const responses = await listResponsesByForm(formId);

  const totalResponses = responses.length;
  const views = form.views || 0;
  const conversionRate = views ? Math.round((totalResponses / views) * 100) : 0;

  const answerableCount = form.questions.filter(
    (q) => !STATIC_FIELD_TYPES.includes(q.type),
  ).length;

  const completionRate = computeCompletionRate(responses, answerableCount);

  const avgCompletionTime = totalResponses
    ? Math.round(
        responses.reduce((sum, r) => sum + (r.completionTime || 0), 0) /
          totalResponses,
      )
    : 0;

  return {
    stats: {
      totalResponses,
      views,
      conversionRate,
      completionRate,
      avgCompletionTime,
    },
    timeline: buildTimeline(responses),
    questions: buildQuestionAnalytics(form, responses),
  };
}

function computeCompletionRate(responses, answerableCount) {
  if (!responses.length || !answerableCount) return 0;
  const total = responses.reduce(
    (sum, r) =>
      sum + Math.min(r.answers.length, answerableCount) / answerableCount,
    0,
  );
  return Math.round((total / responses.length) * 100);
}

function buildTimeline(responses) {
  const counts = new Map();
  for (const r of responses) {
    const key = new Date(r.submittedAt).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function buildQuestionAnalytics(form, responses) {
  return form.questions
    .filter((q) => !STATIC_FIELD_TYPES.includes(q.type))
    .map((q) => {
      const values = responses
        .map((r) => r.answers.find((a) => a.questionId === q.id)?.value)
        .filter((v) => v !== undefined && v !== null && v !== "");

      const base = {
        id: q.id,
        label: q.label,
        type: q.type,
        total: values.length,
      };

      if (OPTION_FIELD_TYPES.includes(q.type)) {
        const tally = new Map(q.options.map((o) => [o.label, 0]));
        for (const v of values) {
          const selected = Array.isArray(v) ? v : [v];
          for (const sel of selected) tally.set(sel, (tally.get(sel) || 0) + 1);
        }
        return {
          ...base,
          breakdown: [...tally.entries()].map(([label, count]) => ({
            label,
            count,
          })),
        };
      }

      if (q.type === "rating" || q.type === "number") {
        const nums = values.map(Number).filter((n) => !Number.isNaN(n));
        const average = nums.length
          ? Number((nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2))
          : 0;
        const distribution = new Map();
        for (const n of nums)
          distribution.set(n, (distribution.get(n) || 0) + 1);
        return {
          ...base,
          average,
          breakdown: [...distribution.entries()]
            .sort(([a], [b]) => a - b)
            .map(([label, count]) => ({ label: String(label), count })),
        };
      }

      if (q.type === "yes_no") {
        const yes = values.filter(
          (v) => v === true || v === "Yes" || v === "yes",
        ).length;
        return {
          ...base,
          breakdown: [
            { label: "Yes", count: yes },
            { label: "No", count: values.length - yes },
          ],
        };
      }

      return { ...base, samples: values.slice(-5).reverse().map(String) };
    });
}

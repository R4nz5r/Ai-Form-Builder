import * as formRepo from "../repositories/form.repo.js";
import * as responseRepo from "../repositories/response.repo.js";

export async function getInsights(userId) {
  const forms = await formRepo.listFormsByOwner(userId, { filter: "all" });
  const formIds = forms.map((f) => f._id);

  const totalViews = forms.reduce((s, f) => s + (f.views || 0), 0);
  const totalResponses = forms.reduce((s, f) => s + (f.responseCount || 0), 0);
  const published = forms.filter((f) => f.status === "published").length;
  const conversion = totalViews
    ? Math.round((totalResponses / totalViews) * 100)
    : 0;

  const [timeline, avgCompletionTime, heatmap, devices] = await Promise.all([
    responseRepo.timelineByForms(formIds),
    responseRepo.avgCompletionByForms(formIds),
    responseRepo.heatmapByForms(formIds),
    responseRepo.devicesByForms(formIds),
  ]);

  const topForms = [...forms]
    .sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0))
    .slice(0, 6)
    .map((f) => ({
      id: f._id,
      title: f.title,
      theme: f.theme,
      status: f.status,
      responses: f.responseCount || 0,
      views: f.views || 0,
      conversion: f.views
        ? Math.round(((f.responseCount || 0) / f.views) * 100)
        : 0,
      color: f.settings?.primaryColor || "#0c8b7c",
    }));

  return {
    stats: {
      totalForms: forms.length,
      published,
      totalResponses,
      totalViews,
      conversion,
      avgCompletionTime,
    },
    timeline,
    heatmap,
    devices,
    topForms,
  };
}

export async function getInbox(userId, { search = "" } = {}) {
  const [active, archived] = await Promise.all([
    formRepo.listFormsByOwner(userId, { filter: "all" }),
    formRepo.listFormsByOwner(userId, { filter: "archived" }),
  ]);

  const forms = [...active, ...archived];
  const formMap = new Map(forms.map((f) => [f._id, f]));

  let responses = await responseRepo.recentByForms(
    forms.map((f) => f._id),
    300,
  );

  if (search.trim()) {
    const needle = search.trim().toLowerCase();

    responses = responses.filter((r) =>
      r.answers.some((a) => {
        const val = Array.isArray(a.value)
          ? a.value.join(" ")
          : String(a.value ?? "");

        return val.toLowerCase().includes(needle);
      }),
    );
  }

  return responses.map((r) => {
    const form = formMap.get(r.form);

    return {
      ...r,
      formId: r.form,
      formTitle: form?.title || "Untitled form",
      formColor: form?.settings?.primaryColor || "#0c8b7c",
    };
  });
}

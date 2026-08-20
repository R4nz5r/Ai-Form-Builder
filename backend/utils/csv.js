function escapeCell(value) {
  if (value === null || value === undefined) return "";
  let str = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function responsesToCsv(form, responses) {
  const answerableQuestions = form.questions.filter(
    (q) => !["section", "heading", "paragraph", "image"].includes(q.type)
  );

  const headers = [
    "Submitted At",
    "Completion Time (s)",
    ...answerableQuestions.map((q) => q.label || "Untitled"),
  ];

  const rows = responses.map((resp) => {
    const byId = new Map(resp.answers.map((a) => [a.questionId, a.value]));
    return [
      new Date(resp.submittedAt).toISOString(),
      resp.completionTime || 0,
      ...answerableQuestions.map((q) => escapeCell(byId.get(q.id))),
    ];
  });

  const lines = [headers.map(escapeCell).join(","), ...rows.map((r) => r.join(","))];
  return lines.join("\r\n");
}


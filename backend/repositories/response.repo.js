import { query } from "../config/db.js";

export function mapResponse(row) {
  if (!row) {
    return null;
  }
  return {
    _id: row.id,
    form: row.form,
    answers: row.answers || [],
    completionTime: row.completion_time,
    meta: row.meta || {},
    submittedAt: row.submitted_at,
  };
}
export async function createResponse({ form, answers, completionTime, meta }) {
  const { rows } = await query(
    `INSERT INTO responses (form, answers, completion_time, meta)
     VALUES ($1, $2::jsonb, $3, $4::jsonb) RETURNING *`,
    [
      form,
      JSON.stringify(answers || []),
      completionTime || 0,
      JSON.stringify(meta || {}),
    ],
  );
  return mapResponse(rows[0]);
}

export async function insertManyResponses(docs) {
  if (!docs.length) return;
  const forms = docs.map((d) => d.form);
  const answers = docs.map((d) => JSON.stringify(d.answers || []));
  const times = docs.map((d) => d.completionTime || 0);
  const metas = docs.map((d) => JSON.stringify(d.meta || {}));
  const submitted = docs.map((d) =>
    d.submittedAt
      ? new Date(d.submittedAt).toISOString()
      : new Date().toISOString(),
  );

  await query(
    `INSERT INTO responses (form, answers, completion_time, meta, submitted_at)
     SELECT * FROM UNNEST(
       $1::uuid[], $2::jsonb[], $3::int[], $4::jsonb[], $5::timestamptz[]
     )`,
    [forms, answers, times, metas, submitted],
  );
}
export async function recentByForms(formIds, limit = 300) {
  if (!formIds.length) return [];
  const { rows } = await query(
    `SELECT * FROM responses WHERE form = ANY($1::uuid[])
     ORDER BY submitted_at DESC LIMIT $2`,
    [formIds, limit],
  );
  return rows.map(mapResponse);
}

export async function listResponsesByForm(formId) {
  const { rows } = await query(
    `SELECT * FROM responses WHERE form = $1 ORDER BY submitted_at DESC`,
    [formId],
  );
  return rows.map(mapResponse);
}

export async function findResponseById(id) {
  const { rows } = await query(`SELECT * FROM responses WHERE id = $1`, [id]);
  return mapResponse(rows[0]);
}

export async function deleteResponse(id) {
  await query(`DELETE FROM responses WHERE id = $1`, [id]);
}

export async function timelineByForms(formIds) {
  if (!formIds.length) return [];
  const { rows } = await query(
    `SELECT to_char(submitted_at, 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
       FROM responses WHERE form = ANY($1::uuid[])
       GROUP BY date ORDER BY date`,
    [formIds],
  );
  return rows;
}

export async function avgCompletionByForms(formIds) {
  if (!formIds.length) return 0;
  const { rows } = await query(
    `SELECT COALESCE(AVG(completion_time), 0)::float AS avg
       FROM responses WHERE form = ANY($1::uuid[])`,
    [formIds],
  );
  return Math.round(rows[0].avg || 0);
}

export async function heatmapByForms(formIds) {
  if (!formIds.length) return [];
  const { rows } = await query(
    `SELECT EXTRACT(DOW FROM submitted_at)::int AS day,
            EXTRACT(HOUR FROM submitted_at)::int AS hour,
            COUNT(*)::int AS count
       FROM responses WHERE form = ANY($1::uuid[])
       GROUP BY day, hour`,
    [formIds],
  );
  return rows;
}
export async function devicesByForms(formIds) {
  if (!formIds.length) return [];
  const { rows } = await query(
    `SELECT CASE
           WHEN meta->>'userAgent' ~ 'iPad|Tablet' THEN 'Tablet'
           WHEN meta->>'userAgent' ~ 'Android|iPhone|Mobile' THEN 'Mobile'
           ELSE 'Desktop'
         END AS label,
         COUNT(*)::int AS value
       FROM responses WHERE form = ANY($1::uuid[])
       GROUP BY label`,
    [formIds],
  );
  const order = { Desktop: 0, Mobile: 1, Tablet: 2 };
  return rows.sort((a, b) => (order[a.label] ?? 9) - (order[b.label] ?? 9));
}



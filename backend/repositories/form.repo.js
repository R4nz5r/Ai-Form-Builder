import { query } from "../config/db.js";
import { nanoid } from "../utils/nanoid.js";

export function defaultSettings() {
  return {
    logo: "",
    primaryColor: "#0c8b7c",
    background: "#f8fafc",
    borderRadius: 12,
    thankYouMessage: "Thank you for submitting the form.👌",
    submitButtonText: "Submit",
    seoTitle: "",
    seoDescription: "",
    showProgressBar: true,
  };
}

export function mapForm(row) {
  if (!row) return null;
  return {
    _id: row.id,
    owner: row.owner,
    title: row.title,
    description: row.description,
    theme: row.theme,
    status: row.status,
    slug: row.slug,
    questions: row.questions || [],
    settings: row.settings || {},
    views: row.views,
    responseCount: row.response_count,
    isFavorite: row.is_favorite,
    isArchived: row.is_archived,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createForm(owner, payload = {}) {
  const settings = { ...defaultSettings(), ...(payload.settings || {}) };
  const { rows } = await query(
    `INSERT INTO forms (owner, title, description, theme, status, slug, questions, settings)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      owner,
      payload.title || "Untitled form",
      payload.description || "",
      payload.theme || "modern",
      payload.status || "draft",
      nanoid(12),
      JSON.stringify(payload.questions || []),
      JSON.stringify(settings),
    ],
  );
  return mapForm(rows[0]);
}

export async function findFormById(id) {
  const { rows } = await query(`SELECT * FROM forms where id=$1`, [id]);
  return mapForm(rows[0]);
}

export async function findPublishedBySlug(slug) {
  const { rows } = await query(
    `SELECT * FROM forms where slug=$1 AND status='published'`,
    [slug],
  );
  return mapForm(rows[0]);
}

export async function listFormsByOwner(
  owner,
  { search = "", filter = "all" } = {},
) {
  const where = ["owner = $1"];
  const params = [owner];

  if (filter === "archived") where.push("is_archived = true");
  else where.push("is_archived = false");

  if (filter === "favorites") where.push("is_favorite = true");
  if (filter === "published") where.push("status = 'published'");
  if (filter === "draft") where.push("status = 'draft'");

  if (search.trim()) {
    params.push(`%${search.trim()}%`);
    where.push(`title ILIKE $${params.length}`);
  }

  const { rows } = await query(
    `SELECT * FROM forms WHERE ${where.join(" AND ")}
    ORDER BY is_favorite DESC, updated_at DESC`,
    params,
  );
  return rows.map(mapForm);
}

export async function updateForm(id, updates) {
  const sets = [];
  const params = [id];
  const map = {
    title: "title",
    description: "description",
    theme: "theme",
    status: "status",
    isFavorite: "is_favorite",
    isArchived: "is_archived",
    publishedAt: "published_at",
  };
  const jsonMap = { questions: "questions", settings: "settings" };

  for (const [key, col] of Object.entries(map)) {
    if (key in updates) {
      params.push(updates[key]);
      sets.push(`${col} = $${params.length}`);
    }
  }

  for (const [key, col] of Object.entries(jsonMap)) {
    if (key in updates) {
      params.push(JSON.stringify(updates[key]));
      sets.push(`${col} = $${params.length}::jsonb`);
    }
  }

  if (!sets.length) return findFormById(id);
  sets.push("updated_at = now()");

  const { rows } = await query(
    `UPDATE forms SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    params,
  );
  return mapForm(rows[0]);
}

export async function incrementViews(slug) {
  await query(
    `UPDATE forms SET views = views + 1 WHERE slug = $1 AND status = 'published'`,
    [slug],
  );
}

export async function incrementResponseCount(id, delta = 1) {
  await query(
    `UPDATE forms SET response_count = GREATEST(response_count + $2, 0) WHERE id = $1`,
    [id, delta],
  );
}

export async function setCounters(id, { views, responseCount }) {
  await query(
    `UPDATE forms SET views = $2, response_count = $3 WHERE id = $1`,
    [id, views, responseCount],
  );
}

export async function deleteForm(id) {
  await query(`DELETE FROM forms WHERE id = $1`, [id]);
}

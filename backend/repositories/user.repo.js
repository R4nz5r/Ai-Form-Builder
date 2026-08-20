import { query } from "../config/db.js";

function mapUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
  };
}

export async function createUser({ name, email, password, avatarColor }) {
  const { rows } = await query(
    `INSERT INTO users (name, email, password, avatar_color) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email.toLowerCase(), password, avatarColor || "#0c8b7c"],
  );
  return mapUser(rows[0]);
}

export async function findUserByEmail(email, { withPassword = false }={}) {
  const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);
  if (!rows[0]) return null;
  const user = mapUser(rows[0]);
  if (user && !withPassword) {
    delete user.password;
  }
  return user;
}

export async function findUserById(id, { withPassword = false }={}) {
  const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [id]);
  if (!rows[0]) return null;
  const user = mapUser(rows[0]);
  if (user && !withPassword) {
    delete user.password;
  }
  return user;
}

export async function updateUserProfile(id, { name, avatarColor }) {
  const { rows } = await query(
    `UPDATE users SET name = COALESCE($2, name), avatar_color = COALESCE($3, avatar_color) WHERE id = $1 RETURNING *`,
    [id, name ?? null, avatarColor ?? null],
  );
  const user = mapUser(rows[0]);
  if (user) delete user.password;
  return user;
}

export async function updateUserPassword(id, passwordHash) {
    await query(`UPDATE users SET password = $2 WHERE id = $1`, [id, passwordHash]);
}

export async function deleteUser(id) {
  await query(`DELETE FROM users WHERE id = $1`, [id]);
}



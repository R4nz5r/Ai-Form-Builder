import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;
if (!env.databaseUrl) {
  console.error(
    "❌ DATABASE_URL is not set. Add your Neon database connection string to the .env file.",
  );
}
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // maximum number of clients in the pool
});

export function query(text, params) {
  return pool.query(text, params);
}

pool.on("error", (err) => {
  console.error("❌ Postgres pool error:", err.message);
});

async function migrate() {
  await query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  await query(`
  CREATE TABLE IF NOT EXISTS users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         text NOT NULL,
    email        text UNIQUE NOT NULL,
    password     text NOT NULL,
    avatar_color text NULL DEFAULT '#0c8b7c',
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
  );`);
  await query(`
  CREATE TABLE IF NOT EXISTS forms (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           text NOT NULL DEFAULT 'Untitled form',
    description     text NOT NULL DEFAULT '',
    theme           text NOT NULL DEFAULT 'modern',
    status          text NOT NULL DEFAULT 'draft',
    slug            text UNIQUE NOT NULL,
    questions       jsonb NOT NULL DEFAULT '[]'::jsonb,
    settings        jsonb NOT NULL DEFAULT '{}'::jsonb,
    views           integer NOT NULL DEFAULT 0,
    response_count  integer NOT NULL DEFAULT 0,
    is_favorite     boolean NOT NULL DEFAULT false,
    is_archived     boolean NOT NULL DEFAULT false,
    published_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
  );`);
  await query(`
  CREATE TABLE IF NOT EXISTS responses (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    form            uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    answers         jsonb NOT NULL DEFAULT '[]'::jsonb,
    completion_time integer NOT NULL DEFAULT 0,
    meta            jsonb NOT NULL DEFAULT '{}'::jsonb,
    submitted_at    timestamptz NOT NULL DEFAULT now()
  );`);

  await query(
    `CREATE INDEX IF NOT EXISTS idx_forms_owner ON forms(owner, is_archived, updated_at DESC);`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS idx_responses_form ON responses(form, submitted_at DESC);`,
  );
}

export async function connectDB() {
  try {
    const { rows } = await query("SELECT current_database() AS db");
    console.log(`✅ Connected to database: ${rows[0].db}`);
    if (process.env.NODE_ENV !== "production") {
      await migrate();
      console.log("✅ Database migration completed");
    }
  } catch (err) {
    console.error("❌ Postgres connection error:", err.message);
  }
}



// Direct Postgres access via `pg` — no ORM, no codegen step. Connects to
// the same Neon database, but with plain SQL instead of Prisma.
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { __pool?: Pool };

export const pool =
  globalForDb.__pool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pool = pool;
}

export interface PublicUser {
  id: string;
  name: string;
  username: string;
  image: string;
  bio: string;
  skills: string[];
  projectTitle: string;
  projectDescription: string;
  lastActiveAt: string;
  createdAt: string;
}

interface UserRow {
  id: string;
  username: string;
  password: string;
  name: string;
  image: string;
  bio: string;
  skills: string[];
  project_title: string;
  project_description: string;
  last_active_at: Date;
  created_at: Date;
}

export function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    image: row.image,
    bio: row.bio,
    skills: row.skills,
    projectTitle: row.project_title,
    projectDescription: row.project_description,
    lastActiveAt: row.last_active_at.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        image TEXT NOT NULL DEFAULT '',
        bio TEXT NOT NULL DEFAULT '',
        skills TEXT[] NOT NULL DEFAULT '{}',
        project_title TEXT NOT NULL DEFAULT '',
        project_description TEXT NOT NULL DEFAULT '',
        last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS app_posts (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        skill TEXT NOT NULL DEFAULT 'Frontend',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS app_likes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES app_posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        UNIQUE (post_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS app_saves (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES app_posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        UNIQUE (post_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS app_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES app_posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS app_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS app_group_members (
        group_id TEXT NOT NULL REFERENCES app_groups(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        PRIMARY KEY (group_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS app_messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        receiver_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
        channel TEXT,
        content TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE app_messages
        ADD COLUMN IF NOT EXISTS group_id TEXT REFERENCES app_groups(id) ON DELETE CASCADE;
      CREATE TABLE IF NOT EXISTS app_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        actor_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        post_id TEXT REFERENCES app_posts(id) ON DELETE CASCADE,
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `).then(() => undefined);
  }
  return schemaReady;
}

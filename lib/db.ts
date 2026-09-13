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
  role: "admin" | "moderator" | "user";
  openToProjects: boolean;
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
  role?: string;
  open_to_projects?: boolean;
  last_active_at: Date;
  created_at: Date;
}

export interface IncubatorProject {
  id: string;
  title: string;
  pitch: string;
  description: string;
  stage: "idea" | "prototype" | "mvp" | "testing" | "launched";
  requiredSkills: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncubatorMember {
  projectId: string;
  userId: string;
  role: "owner" | "member";
  status: "accepted" | "invited" | "declined";
  createdAt: string;
  user?: PublicUser;
}

export interface IncubatorSubmission {
  id: string;
  projectId: string;
  moduleId: string;
  answers: Record<string, string>;
  status: "draft" | "submitted";
  version: number;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncubatorFeedback {
  id: string;
  projectId: string;
  moduleId: string;
  authorId: string;
  feedback: string;
  createdAt: string;
  author?: PublicUser;
}

export interface IncubatorOnePager {
  id: string;
  projectId: string;
  title: string;
  snapshotData: Record<string, unknown>;
  versionName: string;
  createdBy: string;
  createdAt: string;
}

export function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

export function toPublicUser(row: UserRow): PublicUser {
  const role = (row.role as "admin" | "moderator" | "user") || (row.username === "shahzod" ? "admin" : "user");
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    image: row.image,
    bio: row.bio,
    skills: row.skills,
    projectTitle: row.project_title,
    projectDescription: row.project_description,
    role,
    openToProjects: row.open_to_projects ?? true,
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
      CREATE TABLE IF NOT EXISTS app_reactions (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES app_posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        emoji TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
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
      ALTER TABLE app_users
        ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS open_to_projects BOOLEAN NOT NULL DEFAULT true;

      CREATE TABLE IF NOT EXISTS incubator_projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        pitch TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        stage TEXT NOT NULL DEFAULT 'idea',
        required_skills TEXT[] NOT NULL DEFAULT '{}',
        owner_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS incubator_project_members (
        project_id TEXT NOT NULL REFERENCES incubator_projects(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'member',
        status TEXT NOT NULL DEFAULT 'accepted',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (project_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS incubator_module_submissions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES incubator_projects(id) ON DELETE CASCADE,
        module_id TEXT NOT NULL,
        answers JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'draft',
        version INTEGER NOT NULL DEFAULT 1,
        submitted_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (project_id, module_id)
      );
      CREATE TABLE IF NOT EXISTS incubator_module_feedback (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES incubator_projects(id) ON DELETE CASCADE,
        module_id TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        feedback TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS incubator_one_pagers (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES incubator_projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        snapshot_data JSONB NOT NULL,
        version_name TEXT NOT NULL DEFAULT 'v1.0',
        created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `).then(() => undefined);
  }
  return schemaReady;
}

-- Migration 001: Launch Lab 21 Incubator tables & Role-Based Access Control
-- Safe & idempotent migration for School 21 platform

-- 1. Upgrade app_users with role and open_to_projects
ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS open_to_projects BOOLEAN NOT NULL DEFAULT true;

-- Ensure default admin user gets admin role
UPDATE app_users
SET role = 'admin'
WHERE username = 'shahzod' AND role <> 'admin';

-- 2. Incubator Projects table
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

CREATE INDEX IF NOT EXISTS idx_incubator_projects_owner ON incubator_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_incubator_projects_stage ON incubator_projects(stage);

-- 3. Project Members table
CREATE TABLE IF NOT EXISTS incubator_project_members (
  project_id TEXT NOT NULL REFERENCES incubator_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'member'
  status TEXT NOT NULL DEFAULT 'accepted', -- 'accepted', 'invited', 'declined'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_incubator_project_members_user ON incubator_project_members(user_id);

-- 4. Module Submissions table
CREATE TABLE IF NOT EXISTS incubator_module_submissions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES incubator_projects(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL, -- 'problem', 'customer', 'solution', 'mvp', 'gtm', 'team'
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted'
  version INTEGER NOT NULL DEFAULT 1,
  submitted_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_incubator_submissions_project ON incubator_module_submissions(project_id);

-- 5. Module Feedback table (comments left by mentors/moderators)
CREATE TABLE IF NOT EXISTS incubator_module_feedback (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES incubator_projects(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  author_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incubator_feedback_module ON incubator_module_feedback(project_id, module_id);

-- 6. One-Pager Snapshots table (frozen historical versions)
CREATE TABLE IF NOT EXISTS incubator_one_pagers (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES incubator_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  version_name TEXT NOT NULL DEFAULT 'v1.0',
  created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incubator_one_pagers_project ON incubator_one_pagers(project_id);

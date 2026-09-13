// Centralized Role-Based Access Control (RBAC) and permissions helper
import { pool, ensureSchema } from "@/lib/db";

export interface AuthContextUser {
  id: string;
  username?: string;
  role?: string;
}

export function isUserAdmin(user: AuthContextUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === "admin" || user.username?.toLowerCase() === "shahzod";
}

export function isUserModerator(user: AuthContextUser | null | undefined): boolean {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  return user.role === "moderator";
}

export async function getUserRoleAndMembership(
  userId: string,
  projectId?: string
): Promise<{
  role: "admin" | "moderator" | "user";
  isMember: boolean;
  memberRole?: "owner" | "member";
}> {
  await ensureSchema();
  const { rows: userRows } = await pool.query(
    `SELECT id, username, role FROM app_users WHERE id = $1`,
    [userId]
  );
  const u = userRows[0];
  const role: "admin" | "moderator" | "user" =
    u?.role || (u?.username?.toLowerCase() === "shahzod" ? "admin" : "user");

  if (!projectId) {
    return { role, isMember: false };
  }

  const { rows: memberRows } = await pool.query(
    `SELECT role, status FROM incubator_project_members WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );

  const m = memberRows[0];
  const isMember = !!m && m.status === "accepted";
  return {
    role,
    isMember,
    memberRole: m?.role as "owner" | "member" | undefined,
  };
}

export async function canViewProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const { role, isMember } = await getUserRoleAndMembership(userId, projectId);
  if (role === "admin" || role === "moderator") return true;
  return isMember;
}

export async function canEditProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const { role, isMember, memberRole } = await getUserRoleAndMembership(
    userId,
    projectId
  );
  if (role === "admin") return true;
  return isMember && memberRole === "owner";
}

export async function canSubmitModule(
  userId: string,
  projectId: string
): Promise<boolean> {
  const { role, isMember } = await getUserRoleAndMembership(userId, projectId);
  if (role === "admin") return true;
  return isMember;
}

export async function canLeaveFeedback(userId: string): Promise<boolean> {
  const { role } = await getUserRoleAndMembership(userId);
  return role === "admin" || role === "moderator";
}

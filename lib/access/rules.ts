import { IProject } from "@/lib/db/models/Project";
import { SessionUser } from "@/types";

/**
 * ACCESS LAYER — Pure functions only. No DB calls, no side effects.
 * These functions take already-fetched data and return boolean decisions.
 */

/** Check if a user is a member of a project (any role) */
export function isMember(project: IProject, userId: string): boolean {
  return project.members.some((m) => m.userId.toString() === userId);
}

/** Check if a user is an admin of a project */
export function isAdmin(project: IProject, userId: string): boolean {
  return project.members.some(
    (m) => m.userId.toString() === userId && m.role === "admin"
  );
}

/** Check if a user can read project data */
export function canReadProject(project: IProject, user: SessionUser): boolean {
  return isMember(project, user.id);
}

/** Check if a user can access the admin dashboard */
export function canAccessAdminDashboard(
  project: IProject,
  user: SessionUser
): boolean {
  return isAdmin(project, user.id);
}

/** Check if a user can create conversations in a project */
export function canCreateConversation(
  project: IProject,
  user: SessionUser
): boolean {
  return isMember(project, user.id);
}

/** Check if a user can send messages (must be a member) */
export function canSendMessage(project: IProject, user: SessionUser): boolean {
  return isMember(project, user.id);
}

/** Check if a user can modify integrations (admin only) */
export function canModifyIntegrations(
  project: IProject,
  user: SessionUser
): boolean {
  return isAdmin(project, user.id);
}

/** Get the role of a user in a project, or null if not a member */
export function getUserRole(
  project: IProject,
  userId: string
): "admin" | "member" | null {
  const member = project.members.find((m) => m.userId.toString() === userId);
  return member?.role ?? null;
}

/**
 * The backend masks a site admin's role to "user" until the session passes
 * two-factor, and reports why on the profile as admin_locked. These helpers
 * let the UI prompt instead of silently hiding admin features.
 */
export type AdminLock = "custom_origin" | "mfa_enrollment" | "mfa_required"

/** A site admin held back only by two-factor (setup or verification). */
export function isMfaLockedAdmin(
  profile: { admin_locked?: AdminLock | string | null } | null | undefined,
): boolean {
  return profile?.admin_locked === "mfa_enrollment" || profile?.admin_locked === "mfa_required"
}

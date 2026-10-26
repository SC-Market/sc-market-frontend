/**
 * Site-wide account role, as returned on the profile (`accounts.role`).
 *
 * The only place the role strings are spelled out: UI checks go through
 * isSiteAdmin(). The backend is the authority (it may also refuse admin power
 * on a given request, e.g. from a custom domain or without 2FA); this only
 * decides what to show.
 */
export const SiteRole = {
  User: "user",
  Admin: "admin",
} as const

export type SiteRole = (typeof SiteRole)[keyof typeof SiteRole]

export function isSiteAdmin(
  profile: { role?: string | null } | null | undefined,
): boolean {
  return profile?.role === SiteRole.Admin
}

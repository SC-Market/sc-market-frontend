/**
 * Settings tabs addressable by URL: /settings?tab=<key>. Links in emails
 * (e.g. "Manage preferences" -> /settings?tab=email) and in the app open the
 * matching tab; switching tabs writes the key back to the URL.
 */
export const SETTINGS_TABS = {
  profile: 0,
  privacy: 1,
  discord: 2,
  market: 3,
  contractors: 4,
  blocklist: 5,
  "api-tokens": 6,
  notifications: 7,
  scmdb: 9,
  "mobile-nav": 10,
  mfa: 11,
  "price-alerts": 12,
} as const

export type SettingsTabKey = keyof typeof SETTINGS_TABS

/**
 * Older names still used by links in sent emails: Push and Email were merged
 * into Notifications.
 */
const TAB_ALIASES: Record<string, SettingsTabKey> = {
  push: "notifications",
  email: "notifications",
}

/** Tab index for the page's query string; null when it names no tab. */
export function settingsTabFromQuery(params: URLSearchParams): number | null {
  const raw = params.get("tab")
  const tab =
    raw && Object.prototype.hasOwnProperty.call(TAB_ALIASES, raw)
      ? TAB_ALIASES[raw]
      : raw
  if (tab && Object.prototype.hasOwnProperty.call(SETTINGS_TABS, tab))
    return SETTINGS_TABS[tab as SettingsTabKey]
  // /settings?mfa=setup (admin MFA enrolment links)
  if (params.get("mfa")) return SETTINGS_TABS.mfa
  return null
}

export function settingsTabKey(index: number): SettingsTabKey | null {
  const entry = Object.entries(SETTINGS_TABS).find(([, i]) => i === index)
  return entry ? (entry[0] as SettingsTabKey) : null
}

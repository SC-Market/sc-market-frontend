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
  push: 7,
  email: 8,
  scmdb: 9,
  "mobile-nav": 10,
  mfa: 11,
  "price-alerts": 12,
} as const

export type SettingsTabKey = keyof typeof SETTINGS_TABS

/** Tab index for the page's query string; null when it names no tab. */
export function settingsTabFromQuery(params: URLSearchParams): number | null {
  const tab = params.get("tab")
  if (tab && tab in SETTINGS_TABS) return SETTINGS_TABS[tab as SettingsTabKey]
  // /settings?mfa=setup (admin MFA enrolment links)
  if (params.get("mfa")) return SETTINGS_TABS.mfa
  return null
}

export function settingsTabKey(index: number): SettingsTabKey | null {
  const entry = Object.entries(SETTINGS_TABS).find(([, i]) => i === index)
  return entry ? (entry[0] as SettingsTabKey) : null
}

/**
 * The standard tabs a white-label org can turn on and off (Theme & White
 * Label › Sidebar Tabs). A stored sidebar row for a tab is the org's own
 * choice; without one the tab has its default. Organizations and Recruiting
 * (SC Market's org directory and every org's recruiting posts) are off
 * unless the org turns them on (owner decision 2026-11-09). Framework-free.
 */

export const TOGGLEABLE_TABS = [
  { key: "market", label: "Player Market", defaultOn: true },
  { key: "services", label: "Services", defaultOn: true },
  { key: "contracts", label: "Contracts", defaultOn: true },
  { key: "recruiting", label: "Recruiting", defaultOn: false },
  { key: "contractors", label: "Organizations", defaultOn: false },
] as const

export type ToggleableTabKey = (typeof TOGGLEABLE_TABS)[number]["key"]

type TabRow = { standard_tab_key?: string | null; enabled: boolean }

/** The toggleable tabs that are off: turned off by the org, or off by default and not turned on. */
export function hiddenStandardTabs(rows: readonly TabRow[]): Set<string> {
  const stored = new Map<string, boolean>()
  for (const row of rows) {
    if (row.standard_tab_key) stored.set(row.standard_tab_key, row.enabled)
  }
  return new Set(
    TOGGLEABLE_TABS.filter(
      (tab) => !(stored.get(tab.key) ?? tab.defaultOn),
    ).map((tab) => tab.key),
  )
}

/**
 * The toggleable tabs to store when the org saves: only those that differ
 * from their default, so a stored row is always a choice.
 */
export function toggleableTabChoices(
  hidden: ReadonlySet<string>,
): { key: ToggleableTabKey; enabled: boolean }[] {
  return TOGGLEABLE_TABS.filter(
    (tab) => hidden.has(tab.key) === tab.defaultOn,
  ).map((tab) => ({ key: tab.key, enabled: !hidden.has(tab.key) }))
}

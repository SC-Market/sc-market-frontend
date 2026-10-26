// Sidebar config cache — populated by HookProvider after fetching from API
let sidebarConfigCache: Array<{
  standard_tab_key: string | null
  custom_label: string | null
  custom_path: string | null
  custom_icon: string | null
  is_external: boolean
  enabled: boolean
  sort_order: number
}> = []

export function setSidebarConfig(config: typeof sidebarConfigCache) {
  sidebarConfigCache = config
}

/**
 * Get the set of standard tab keys that are disabled in the sidebar config.
 * Used by MobileBottomNav to hide disabled tabs.
 */
export function getDisabledTabs(): Set<string> {
  const disabled = new Set<string>()
  for (const item of sidebarConfigCache) {
    if (item.standard_tab_key && !item.enabled) {
      disabled.add(item.standard_tab_key)
    }
  }
  return disabled
}

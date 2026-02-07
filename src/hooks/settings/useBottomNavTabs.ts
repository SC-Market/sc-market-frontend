import { useState, useEffect } from "react"

export type BottomNavTab = 
  | "market"
  | "services"
  | "contracts"
  | "recruiting"
  | "messages"
  | "orders"
  | "dashboard"
  | "contractors"
  | "manage_listings"
  | "manage_stock"
  | "org_orders"
  | "org_manage"
  | "org_public"

export interface BottomNavTabConfig {
  id: BottomNavTab
  labelKey: string
  shortLabelKey?: string
  requiresAuth: boolean
  requiresOrg?: boolean
}

export const AVAILABLE_TABS: BottomNavTabConfig[] = [
  { id: "market", labelKey: "sidebar.player_market", requiresAuth: false },
  { id: "services", labelKey: "sidebar.contractor_services", requiresAuth: false },
  { id: "contracts", labelKey: "sidebar.open_contracts", requiresAuth: false },
  { id: "recruiting", labelKey: "sidebar.recruiting", requiresAuth: false },
  { id: "contractors", labelKey: "sidebar.contractors", requiresAuth: false },
  { id: "messages", labelKey: "sidebar.messaging", requiresAuth: true },
  { id: "orders", labelKey: "sidebar.orders_ive_placed", requiresAuth: true },
  { id: "dashboard", labelKey: "sidebar.orders_assigned_to_me", shortLabelKey: "sidebar.dashboard.title", requiresAuth: true },
  { id: "manage_listings", labelKey: "sidebar.manage_listings", requiresAuth: true },
  { id: "manage_stock", labelKey: "sidebar.manage_stock", requiresAuth: true },
  { id: "org_orders", labelKey: "sidebar.org_orders", requiresAuth: true, requiresOrg: true },
  { id: "org_manage", labelKey: "sidebar.settings", requiresAuth: true, requiresOrg: true },
  { id: "org_public", labelKey: "sidebar.org_public_page", requiresAuth: true, requiresOrg: true },
]

const DEFAULT_LOGGED_OUT_TABS: BottomNavTab[] = ["market", "services", "contracts", "recruiting"]
const DEFAULT_LOGGED_IN_TABS: BottomNavTab[] = ["market", "services", "messages", "orders", "dashboard"]
const MAX_TABS = 5

export function useBottomNavTabs(isLoggedIn: boolean, hasOrg: boolean = false) {
  const defaultTabs = isLoggedIn ? DEFAULT_LOGGED_IN_TABS : DEFAULT_LOGGED_OUT_TABS
  
  const [tabs, setTabsState] = useState<BottomNavTab[]>(() => {
    const stored = localStorage.getItem("bottomNavTabs")
    return stored ? JSON.parse(stored) : defaultTabs
  })

  useEffect(() => {
    localStorage.setItem("bottomNavTabs", JSON.stringify(tabs))
    // Trigger storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'bottomNavTabs',
      newValue: JSON.stringify(tabs),
    }))
  }, [tabs])

  // Listen for storage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent | Event) => {
      if ('key' in e && e.key === 'bottomNavTabs' && 'newValue' in e && e.newValue) {
        setTabsState(JSON.parse(e.newValue))
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const availableTabs = AVAILABLE_TABS.filter(
    tab => !tab.requiresAuth || isLoggedIn
  )

  const enabledTabs = tabs
    .filter((tabId: BottomNavTab) => {
      const tab = AVAILABLE_TABS.find(t => t.id === tabId)
      if (!tab) return false
      if (tab.requiresOrg && !hasOrg) return false
      return availableTabs.some(t => t.id === tabId)
    })
    .slice(0, MAX_TABS)

  return {
    enabledTabs,
    availableTabs,
    setTabs: setTabsState,
    maxTabs: MAX_TABS,
  }
}

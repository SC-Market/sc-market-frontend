import { useState, useEffect } from "react"

export type BottomNavTab = 
  | "market"
  | "services"
  | "contracts"
  | "recruiting"
  | "messages"
  | "orders"
  | "dashboard"

export interface BottomNavTabConfig {
  id: BottomNavTab
  labelKey: string
  requiresAuth: boolean
}

export const AVAILABLE_TABS: BottomNavTabConfig[] = [
  { id: "market", labelKey: "sidebar.market_short", requiresAuth: false },
  { id: "services", labelKey: "sidebar.services_short", requiresAuth: false },
  { id: "contracts", labelKey: "sidebar.contracts_short", requiresAuth: false },
  { id: "recruiting", labelKey: "sidebar.recruiting_short", requiresAuth: false },
  { id: "messages", labelKey: "sidebar.messaging", requiresAuth: true },
  { id: "orders", labelKey: "sidebar.orders.text", requiresAuth: true },
  { id: "dashboard", labelKey: "sidebar.dashboard.text", requiresAuth: true },
]

const DEFAULT_LOGGED_OUT_TABS: BottomNavTab[] = ["market", "services", "contracts", "recruiting"]
const DEFAULT_LOGGED_IN_TABS: BottomNavTab[] = ["market", "services", "messages", "orders", "dashboard"]
const MAX_TABS = 5

export function useBottomNavTabs(isLoggedIn: boolean) {
  const defaultTabs = isLoggedIn ? DEFAULT_LOGGED_IN_TABS : DEFAULT_LOGGED_OUT_TABS
  
  const [tabs, setTabsState] = useState<BottomNavTab[]>(() => {
    const stored = localStorage.getItem("bottomNavTabs")
    return stored ? JSON.parse(stored) : defaultTabs
  })

  useEffect(() => {
    localStorage.setItem("bottomNavTabs", JSON.stringify(tabs))
  }, [tabs])

  const availableTabs = AVAILABLE_TABS.filter(
    tab => !tab.requiresAuth || isLoggedIn
  )

  const enabledTabs = tabs
    .filter((tabId: BottomNavTab) => availableTabs.some(t => t.id === tabId))
    .slice(0, MAX_TABS)

  return {
    enabledTabs,
    availableTabs,
    setTabs: setTabsState,
    maxTabs: MAX_TABS,
  }
}

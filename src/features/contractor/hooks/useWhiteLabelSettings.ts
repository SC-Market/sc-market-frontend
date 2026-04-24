import { useCallback, useEffect, useState } from "react"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import {
  useGetWhitelabelConfigQuery,
  useGetWhitelabelSidebarQuery,
  useUpdateWhitelabelConfigMutation,
  useUpdateWhitelabelSidebarMutation,
} from "../../../store/api/contractors"

interface SidebarConfigItem {
  standard_tab_key: string | null
  custom_label: string | null
  custom_path: string | null
  custom_icon: string | null
  is_external: boolean
  enabled: boolean
  sort_order: number
}

interface CustomTab {
  label: string
  path: string
  icon: string
}

const DEFAULT_ICON = "DashboardRounded"

const ALWAYS_ON_KEYS = ["overview", "store", "services"]

const TOGGLEABLE_TABS = [
  { key: "orders" }, { key: "offers" }, { key: "contracts" },
  { key: "recruiting" }, { key: "fleet" }, { key: "members" },
  { key: "roles" }, { key: "settings" }, { key: "money" },
  { key: "invites" }, { key: "webhooks" }, { key: "audit_logs" },
  { key: "blocklist" }, { key: "white_label" },
]

function isExternal(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://")
}

export function useWhiteLabelSettings() {
  const [contractor] = useCurrentOrg()
  const spectrumId = contractor?.spectrum_id

  const { data: configRes } = useGetWhitelabelConfigQuery(spectrumId!, { skip: !spectrumId })
  const { data: sidebarRes } = useGetWhitelabelSidebarQuery(spectrumId!, { skip: !spectrumId })
  const [updateConfig, { isLoading: configSaving }] = useUpdateWhitelabelConfigMutation()
  const [updateSidebar, { isLoading: sidebarSaving }] = useUpdateWhitelabelSidebarMutation()

  const config = (configRes as any)?.data
  const sidebarItems: SidebarConfigItem[] = (sidebarRes as any)?.data ?? []

  // Config state
  const [focusMode, setFocusMode] = useState<"public" | "internal">("public")
  const [homepagePath, setHomepagePath] = useState("")
  const [requireMembership, setRequireMembership] = useState(false)

  useEffect(() => {
    if (config) {
      setFocusMode(config.focus_mode ?? "public")
      setHomepagePath(config.homepage_path ?? "")
      setRequireMembership(config.require_membership ?? false)
    }
  }, [config])

  // Sidebar state
  const [disabledTabs, setDisabledTabs] = useState<Set<string>>(new Set())
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [newPath, setNewPath] = useState("")
  const [newIcon, setNewIcon] = useState(DEFAULT_ICON)
  const [snack, setSnack] = useState<string | null>(null)

  useEffect(() => {
    const disabled = new Set<string>()
    const custom: CustomTab[] = []
    for (const item of sidebarItems) {
      if (item.standard_tab_key && !item.enabled) disabled.add(item.standard_tab_key)
      if (!item.standard_tab_key && item.custom_path) {
        custom.push({ label: item.custom_label ?? "", path: item.custom_path, icon: item.custom_icon || DEFAULT_ICON })
      }
    }
    setDisabledTabs(disabled)
    setCustomTabs(custom)
  }, [sidebarItems])

  const handleSaveConfig = useCallback(async () => {
    if (!spectrumId) return
    try {
      await updateConfig({ spectrum_id: spectrumId, focus_mode: focusMode, homepage_path: homepagePath || null, require_membership: requireMembership }).unwrap()
      setSnack("Settings saved")
    } catch { setSnack("Failed to save settings") }
  }, [spectrumId, focusMode, homepagePath, requireMembership, updateConfig])

  const handleSaveSidebar = useCallback(async () => {
    if (!spectrumId) return
    try {
      const items: SidebarConfigItem[] = []
      let order = 0
      for (const key of ALWAYS_ON_KEYS) {
        items.push({ standard_tab_key: key, custom_label: null, custom_path: null, custom_icon: null, is_external: false, enabled: true, sort_order: order++ })
      }
      for (const t of TOGGLEABLE_TABS) {
        items.push({ standard_tab_key: t.key, custom_label: null, custom_path: null, custom_icon: null, is_external: false, enabled: !disabledTabs.has(t.key), sort_order: order++ })
      }
      for (const ct of customTabs) {
        items.push({ standard_tab_key: null, custom_label: ct.label, custom_path: ct.path, custom_icon: ct.icon, is_external: isExternal(ct.path), enabled: true, sort_order: order++ })
      }
      await updateSidebar({ spectrum_id: spectrumId, items }).unwrap()
      setSnack("Sidebar saved")
    } catch { setSnack("Failed to save sidebar") }
  }, [spectrumId, disabledTabs, customTabs, updateSidebar])

  const toggleTab = useCallback((key: string) => {
    setDisabledTabs((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })
  }, [])

  const addCustomTab = useCallback(() => {
    const label = newLabel.trim(); const path = newPath.trim()
    if (!label || !path) return
    setCustomTabs((prev) => [...prev, { label, path, icon: newIcon }])
    setNewLabel(""); setNewPath(""); setNewIcon(DEFAULT_ICON)
  }, [newLabel, newPath, newIcon])

  const removeCustomTab = useCallback((index: number) => {
    setCustomTabs((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateCustomTabIcon = useCallback((index: number, icon: string) => {
    setCustomTabs((prev) => prev.map((t, i) => (i === index ? { ...t, icon } : t)))
  }, [])

  return {
    spectrumId, config,
    focusMode, setFocusMode, homepagePath, setHomepagePath, requireMembership, setRequireMembership,
    configSaving, handleSaveConfig,
    disabledTabs, toggleTab,
    customTabs, addCustomTab, removeCustomTab, updateCustomTabIcon,
    newLabel, setNewLabel, newPath, setNewPath, newIcon, setNewIcon,
    sidebarSaving, handleSaveSidebar,
    snack, setSnack,
    TOGGLEABLE_TABS,
  }
}

export { TOGGLEABLE_TABS, DEFAULT_ICON, type CustomTab, type SidebarConfigItem }

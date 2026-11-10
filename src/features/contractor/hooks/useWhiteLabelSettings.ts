import { useCallback, useEffect, useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import {
  useGetWhitelabelConfigQuery,
  useGetWhitelabelSidebarQuery,
  useUpdateWhitelabelConfigMutation,
  useUpdateWhitelabelSidebarMutation,
} from "../../../store/api/contractors"
import {
  TOGGLEABLE_TABS,
  hiddenStandardTabs,
  toggleableTabChoices,
} from "../domain/whiteLabelTabs"

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

const DEFAULT_ICON = "link"

const ALWAYS_ON_KEYS = [
  "sc_market_home",
  "orders_assigned",
  "messaging",
  "manage_listings",
  "manage_stock",
  "manage_services",
  "availability",
]

function isExternal(path: string): boolean {
  return path.startsWith("https://")
}

/**
 * Same rule as the API (PUT whitelabel/sidebar): a site path starting with
 * "/" or an https:// link. Returns the i18n key of the problem, or null when
 * it's fine.
 */
function customTabPathError(path: string): string | null {
  const p = path.trim()
  if (!p) return null
  if (p.startsWith("/") || p.startsWith("https://")) return null
  if (p.startsWith("http://")) return "sharedUi.whiteLabel.pathErrorHttps"
  return "sharedUi.whiteLabel.pathErrorFormat"
}

export function useWhiteLabelSettings() {
  const { t } = useTranslation()
  const [contractor] = useCurrentOrg()
  const spectrumId = contractor?.spectrum_id

  const { data: configRes } = useGetWhitelabelConfigQuery(spectrumId!, {
    skip: !spectrumId,
  })
  const { data: sidebarRes } = useGetWhitelabelSidebarQuery(spectrumId!, {
    skip: !spectrumId,
  })
  const [updateConfig, { isLoading: configSaving }] =
    useUpdateWhitelabelConfigMutation()
  const [updateSidebar, { isLoading: sidebarSaving }] =
    useUpdateWhitelabelSidebarMutation()

  const config = configRes?.data
  const sidebarItems: SidebarConfigItem[] = useMemo(
    () => sidebarRes?.data ?? [],
    [sidebarRes?.data],
  )

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
    // Tabs without a stored choice have their default (whiteLabelTabs.ts).
    const disabled = hiddenStandardTabs(sidebarItems)
    const custom: CustomTab[] = []
    for (const item of sidebarItems) {
      if (!item.standard_tab_key && item.custom_path) {
        custom.push({
          label: item.custom_label ?? "",
          path: item.custom_path,
          icon: item.custom_icon || DEFAULT_ICON,
        })
      }
    }
    setDisabledTabs(disabled)
    setCustomTabs(custom)
  }, [sidebarItems])

  const handleSaveConfig = useCallback(async () => {
    if (!spectrumId) return
    try {
      // Membership only applies to an Internal (login required) site.
      await updateConfig({
        spectrum_id: spectrumId,
        focus_mode: focusMode,
        homepage_path: homepagePath || null,
        require_membership: focusMode === "internal" && requireMembership,
      }).unwrap()
      setSnack(t("sharedUi.whiteLabel.settingsSaved"))
    } catch {
      setSnack(t("sharedUi.whiteLabel.settingsSaveFailed"))
    }
  }, [spectrumId, focusMode, homepagePath, requireMembership, updateConfig, t])

  const handleSaveSidebar = useCallback(async () => {
    if (!spectrumId) return
    try {
      const items: SidebarConfigItem[] = []
      let order = 0
      for (const key of ALWAYS_ON_KEYS) {
        items.push({
          standard_tab_key: key,
          custom_label: null,
          custom_path: null,
          custom_icon: null,
          is_external: false,
          enabled: true,
          sort_order: order++,
        })
      }
      // Only the tabs set away from their default: a stored row is a choice.
      for (const tab of toggleableTabChoices(disabledTabs)) {
        items.push({
          standard_tab_key: tab.key,
          custom_label: null,
          custom_path: null,
          custom_icon: null,
          is_external: false,
          enabled: tab.enabled,
          sort_order: order++,
        })
      }
      for (const ct of customTabs) {
        items.push({
          standard_tab_key: null,
          custom_label: ct.label,
          custom_path: ct.path,
          custom_icon: ct.icon,
          is_external: isExternal(ct.path),
          enabled: true,
          sort_order: order++,
        })
      }
      await updateSidebar({ spectrum_id: spectrumId, items }).unwrap()
      setSnack(t("sharedUi.whiteLabel.sidebarSaved"))
    } catch {
      setSnack(t("sharedUi.whiteLabel.sidebarSaveFailed"))
    }
  }, [spectrumId, disabledTabs, customTabs, updateSidebar, t])

  const toggleTab = useCallback((key: string) => {
    setDisabledTabs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const addCustomTab = useCallback(() => {
    const label = newLabel.trim()
    const path = newPath.trim()
    if (!label || !path || customTabPathError(path)) return
    setCustomTabs((prev) => [...prev, { label, path, icon: newIcon }])
    setNewLabel("")
    setNewPath("")
    setNewIcon(DEFAULT_ICON)
  }, [newLabel, newPath, newIcon])

  const removeCustomTab = useCallback((index: number) => {
    setCustomTabs((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateCustomTabIcon = useCallback((index: number, icon: string) => {
    setCustomTabs((prev) =>
      prev.map((tab, i) => (i === index ? { ...tab, icon } : tab)),
    )
  }, [])

  const newPathErrorKey = customTabPathError(newPath)

  return {
    spectrumId,
    config,
    focusMode,
    setFocusMode,
    homepagePath,
    setHomepagePath,
    requireMembership,
    setRequireMembership,
    configSaving,
    handleSaveConfig,
    disabledTabs,
    toggleTab,
    customTabs,
    addCustomTab,
    removeCustomTab,
    updateCustomTabIcon,
    newLabel,
    setNewLabel,
    newPath,
    setNewPath,
    newIcon,
    setNewIcon,
    newPathError: newPathErrorKey ? t(newPathErrorKey) : null,
    sidebarSaving,
    handleSaveSidebar,
    snack,
    setSnack,
    TOGGLEABLE_TABS,
  }
}

export {
  TOGGLEABLE_TABS,
  DEFAULT_ICON,
  isExternal,
  customTabPathError,
  type CustomTab,
  type SidebarConfigItem,
}

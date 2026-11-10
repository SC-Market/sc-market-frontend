import { useMemo } from "react"
import { useCustomDomain } from "../../../hooks/contractor/CustomDomain"
import {
  useGetWhitelabelSidebarQuery,
  type SidebarConfigItem,
} from "../../../store/api/contractors"
import { hiddenStandardTabs } from "../domain/whiteLabelTabs"

export interface WhiteLabelSidebar {
  /**
   * Standard tabs that are off (keys from TOGGLEABLE_TABS: market, services,
   * …): the org's choices, else the defaults (whiteLabelTabs.ts).
   */
  hidden: ReadonlySet<string>
  /** The org's own links, in their saved order. */
  customTabs: SidebarConfigItem[]
  /** Whether `hidden` is the org's saved settings (not just the defaults). */
  loaded: boolean
}

const MAIN_SITE: WhiteLabelSidebar = {
  hidden: new Set(),
  customTabs: [],
  loaded: true,
}

/**
 * The white-label org's sidebar settings (Theme & White Label › Sidebar
 * Tabs) on its own domain. Both the sidebar (SidebarV2) and the mobile bottom
 * bar apply them. On sc-market.space nothing is hidden.
 */
export function useWhiteLabelSidebar(): WhiteLabelSidebar {
  const { isCustomDomain, customOrg } = useCustomDomain()
  const { data } = useGetWhitelabelSidebarQuery(customOrg!, {
    skip: !customOrg,
  })
  return useMemo(() => {
    if (!isCustomDomain) return MAIN_SITE
    // Before the org (or its settings) is known: the defaults.
    const items = (customOrg && data?.data) || []
    return {
      hidden: hiddenStandardTabs(items),
      loaded: !!customOrg && data !== undefined,
      customTabs: items
        .filter((i) => !i.standard_tab_key && i.custom_path && i.enabled)
        .sort((a, b) => a.sort_order - b.sort_order),
    }
  }, [isCustomDomain, customOrg, data])
}

import { useMemo } from "react"
import { useCustomDomain } from "../../../hooks/contractor/CustomDomain"
import {
  useGetWhitelabelSidebarQuery,
  type SidebarConfigItem,
} from "../../../store/api/contractors"

export interface WhiteLabelSidebar {
  /** Standard tabs the org hid (keys from TOGGLEABLE_TABS: market, services, …). */
  hidden: ReadonlySet<string>
  /** The org's own links, in their saved order. */
  customTabs: SidebarConfigItem[]
}

const NONE: WhiteLabelSidebar = { hidden: new Set(), customTabs: [] }

/**
 * The white-label org's sidebar settings (Theme & White Label › Sidebar
 * Tabs) on its own domain. Both the sidebar (SidebarV2) and the mobile bottom
 * bar apply them. On sc-market.space nothing is hidden.
 */
export function useWhiteLabelSidebar(): WhiteLabelSidebar {
  const { customOrg } = useCustomDomain()
  const { data } = useGetWhitelabelSidebarQuery(customOrg!, {
    skip: !customOrg,
  })
  return useMemo(() => {
    const items = customOrg ? (data?.data ?? []) : []
    if (!items.length) return NONE
    return {
      hidden: new Set(
        items
          .filter((i) => i.standard_tab_key && !i.enabled)
          .map((i) => i.standard_tab_key!),
      ),
      customTabs: items
        .filter((i) => !i.standard_tab_key && i.custom_path && i.enabled)
        .sort((a, b) => a.sort_order - b.sort_order),
    }
  }, [customOrg, data])
}

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SidebarItemProps } from "../types"

/**
 * Hook for managing sidebar search functionality
 */
export function useSidebarSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const { t } = useTranslation()

  const filterBySearch = (entry: SidebarItemProps): boolean => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const text = t(entry.text).toLowerCase()
    const childrenMatch = entry.children?.some((child) =>
      t(child.text).toLowerCase().includes(query),
    )

    return text.includes(query) || !!childrenMatch
  }

  return { searchQuery, setSearchQuery, filterBySearch }
}

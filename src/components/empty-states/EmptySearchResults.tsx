import React from "react"
import { SearchOffOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptySearchResultsProps
  extends Omit<EmptyStateProps, "title" | "icon" | "action"> {
  /**
   * The search query that returned no results
   */
  searchQuery?: string
  /**
   * Custom title override
   */
  title?: string
  /**
   * Custom description override
   */
  description?: string
  /**
   * Action to clear filters/reset search
   */
  onClearFilters?: () => void
  /**
   * Custom action override
   */
  action?: EmptyStateProps["action"]
}

/**
 * Empty state component for search results
 *
 * Displays when a search returns no results, with option to clear filters
 */
export function EmptySearchResults({
  searchQuery,
  title,
  description,
  onClearFilters,
  action,
  ...props
}: EmptySearchResultsProps) {
  const { t } = useTranslation()

  const defaultTitle = t("emptyStates.search.noResults", {
    defaultValue: "No results found",
  })

  const defaultDescription = searchQuery
    ? t("emptyStates.search.noResultsForQuery", {
        defaultValue: `No results found for "${searchQuery}". Try different search terms or clear your filters.`,
        searchQuery,
      })
    : t("emptyStates.search.noResultsDescription", {
        defaultValue: "Try adjusting your search filters or search terms",
      })

  const defaultAction = onClearFilters
    ? {
        label: t("emptyStates.search.clearFilters", { defaultValue: "Clear Filters" }),
        onClick: onClearFilters,
        variant: "outlined" as const,
      }
    : undefined

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<SearchOffOutlined />}
      action={action || defaultAction}
      {...props}
    />
  )
}

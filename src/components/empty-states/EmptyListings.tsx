import React from "react"
import { useNavigate } from "react-router-dom"
import { Inventory2Outlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyListingsProps extends Omit<EmptyStateProps, "title" | "icon" | "action"> {
  /**
   * Whether this is a search result (vs. a general empty state)
   */
  isSearchResult?: boolean
  /**
   * Custom title override
   */
  title?: string
  /**
   * Custom description override
   */
  description?: string
  /**
   * Whether to show the create listing action
   */
  showCreateAction?: boolean
  /**
   * Custom action override
   */
  action?: EmptyStateProps["action"]
}

/**
 * Empty state component for market listings
 *
 * Displays when there are no listings to show, with options for:
 * - General empty state (no listings at all)
 * - Search results empty state (no results for search)
 * - Actionable CTA to create a listing
 */
export function EmptyListings({
  isSearchResult = false,
  title,
  description,
  showCreateAction = true,
  action,
  ...props
}: EmptyListingsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const defaultTitle = isSearchResult
    ? t("emptyStates.listings.noSearchResults", { defaultValue: "No listings found" })
    : t("emptyStates.listings.noListings", { defaultValue: "No listings yet" })

  const defaultDescription = isSearchResult
    ? t("emptyStates.listings.noSearchResultsDescription", {
        defaultValue: "Try adjusting your search filters or browse all listings",
      })
    : t("emptyStates.listings.noListingsDescription", {
        defaultValue: "Create your first listing to start selling items on the market",
      })

  const defaultAction = showCreateAction
    ? {
        label: t("emptyStates.listings.createListing", { defaultValue: "Create Listing" }),
        onClick: () => navigate("/market/create"),
        variant: "contained" as const,
      }
    : undefined

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<Inventory2Outlined />}
      action={action || defaultAction}
      {...props}
    />
  )
}

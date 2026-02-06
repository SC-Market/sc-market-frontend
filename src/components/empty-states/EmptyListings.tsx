import React from "react"
import { useNavigate } from "react-router-dom"
import { Inventory2Outlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyListingsProps extends Omit<
  EmptyStateProps,
  "title" | "icon" | "action"
> {
  /**
   * Whether this is a search result (vs. a general empty state)
   */
  isSearchResult?: boolean
  /**
   * Whether this is an error state
   */
  isError?: boolean
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
  /**
   * Retry function for error states
   */
  onRetry?: () => void
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
  isError = false,
  title,
  description,
  showCreateAction = true,
  action,
  onRetry,
  ...props
}: EmptyListingsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (isError) {
    return (
      <EmptyState
        title={
          title ||
          t("emptyStates.listings.errorTitle", {
            defaultValue: "Unable to load listings",
          })
        }
        description={
          description ||
          t("emptyStates.listings.errorDescription", {
            defaultValue:
              "We encountered an error while loading listings. Please try again.",
          })
        }
        icon={<Inventory2Outlined />}
        action={
          onRetry
            ? {
                label: t("emptyStates.listings.retry", {
                  defaultValue: "Retry",
                }),
                onClick: onRetry,
                variant: "contained",
              }
            : undefined
        }
        {...props}
      />
    )
  }

  const defaultTitle = isSearchResult
    ? t("emptyStates.listings.noSearchResults", {
        defaultValue: "No listings found",
      })
    : t("emptyStates.listings.noListings", { defaultValue: "No listings yet" })

  const defaultDescription = isSearchResult
    ? t("emptyStates.listings.noSearchResultsDescription", {
        defaultValue:
          "Try adjusting your search filters or browse all listings",
      })
    : t("emptyStates.listings.noListingsDescription", {
        defaultValue:
          "Create your first listing to start selling items on the market",
      })

  const defaultAction = showCreateAction
    ? {
        label: t("emptyStates.listings.createListing", {
          defaultValue: "Create Listing",
        }),
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

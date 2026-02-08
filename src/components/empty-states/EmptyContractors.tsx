import React from "react"
import { BusinessOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyContractorsProps extends Omit<
  EmptyStateProps,
  "title" | "icon"
> {
  /**
   * Whether this is a search result (vs. general empty state)
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
   * Retry function for error states
   */
  onRetry?: () => void
}

/**
 * Empty state component for contractors page
 */
export function EmptyContractors({
  isSearchResult = false,
  isError = false,
  title,
  description,
  onRetry,
  ...props
}: EmptyContractorsProps) {
  const { t } = useTranslation()

  if (isError) {
    return (
      <EmptyState
        title={
          title ||
          t("emptyStates.contractors.errorTitle", {
            defaultValue: "Unable to load contractors",
          })
        }
        description={
          description ||
          t("emptyStates.contractors.errorDescription", {
            defaultValue:
              "We encountered an error while loading contractors. Please try again.",
          })
        }
        icon={<BusinessOutlined />}
        action={
          onRetry
            ? {
                label: t("emptyStates.contractors.retry", {
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
    ? t("emptyStates.contractors.noSearchResults", {
        defaultValue: "No contractors found",
      })
    : t("emptyStates.contractors.noContractors", {
        defaultValue: "No contractors yet",
      })

  const defaultDescription = isSearchResult
    ? t("emptyStates.contractors.noSearchResultsDescription", {
        defaultValue:
          "Try adjusting your search filters or browse all contractors",
      })
    : t("emptyStates.contractors.noContractorsDescription", {
        defaultValue: "Check back later for contractor organizations",
      })

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<BusinessOutlined />}
      {...props}
    />
  )
}

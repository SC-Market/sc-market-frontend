import React from "react"
import { useNavigate } from "react-router-dom"
import { DescriptionOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyContractsProps extends Omit<
  EmptyStateProps,
  "title" | "icon" | "action"
> {
  /**
   * Whether this is for public contracts (vs. user's contracts)
   */
  isPublic?: boolean
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
   * Whether to show the create contract action
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
 * Empty state component for contracts
 *
 * Displays when there are no contracts to show, with actionable CTA
 */
export function EmptyContracts({
  isPublic = false,
  isError = false,
  title,
  description,
  showCreateAction = true,
  action,
  onRetry,
  ...props
}: EmptyContractsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (isError) {
    return (
      <EmptyState
        title={
          title ||
          t("emptyStates.contracts.errorTitle", {
            defaultValue: "Unable to load contracts",
          })
        }
        description={
          description ||
          t("emptyStates.contracts.errorDescription", {
            defaultValue:
              "We encountered an error while loading contracts. Please try again.",
          })
        }
        icon={<DescriptionOutlined />}
        action={
          onRetry
            ? {
                label: t("emptyStates.contracts.retry", {
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

  const defaultTitle = isPublic
    ? t("emptyStates.contracts.noPublicContracts", {
        defaultValue: "No public contracts",
      })
    : t("emptyStates.contracts.noContracts", {
        defaultValue: "No contracts yet",
      })

  const defaultDescription = isPublic
    ? t("emptyStates.contracts.noPublicContractsDescription", {
        defaultValue: "There are currently no public contracts available",
      })
    : t("emptyStates.contracts.noContractsDescription", {
        defaultValue: "Create a public contract to advertise your services",
      })

  const defaultAction = showCreateAction
    ? {
        label: t("emptyStates.contracts.createContract", {
          defaultValue: "Create Contract",
        }),
        onClick: () => navigate("/contracts/create"),
        variant: "contained" as const,
      }
    : undefined

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<DescriptionOutlined />}
      action={action || defaultAction}
      {...props}
    />
  )
}

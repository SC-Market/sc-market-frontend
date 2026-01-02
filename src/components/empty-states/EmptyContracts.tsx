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
}

/**
 * Empty state component for contracts
 *
 * Displays when there are no contracts to show, with actionable CTA
 */
export function EmptyContracts({
  isPublic = false,
  title,
  description,
  showCreateAction = true,
  action,
  ...props
}: EmptyContractsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

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

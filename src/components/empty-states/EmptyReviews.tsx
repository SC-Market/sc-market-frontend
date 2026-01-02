import React from "react"
import { StarBorderOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyReviewsProps extends Omit<EmptyStateProps, "title" | "icon" | "action"> {
  /**
   * Whether this is for a user profile (vs. contractor)
   */
  isUser?: boolean
  /**
   * Custom title override
   */
  title?: string
  /**
   * Custom description override
   */
  description?: string
  /**
   * Whether to show any action
   */
  showAction?: boolean
  /**
   * Custom action override
   */
  action?: EmptyStateProps["action"]
}

/**
 * Empty state component for reviews
 *
 * Displays when there are no reviews to show
 */
export function EmptyReviews({
  isUser = true,
  title,
  description,
  showAction = false,
  action,
  ...props
}: EmptyReviewsProps) {
  const { t } = useTranslation()

  const defaultTitle = isUser
    ? t("emptyStates.reviews.noUserReviews", { defaultValue: "No reviews yet" })
    : t("emptyStates.reviews.noContractorReviews", {
        defaultValue: "No reviews yet",
      })

  const defaultDescription = isUser
    ? t("emptyStates.reviews.noUserReviewsDescription", {
        defaultValue: "This user hasn't received any reviews yet",
      })
    : t("emptyStates.reviews.noContractorReviewsDescription", {
        defaultValue: "This contractor hasn't received any reviews yet",
      })

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<StarBorderOutlined />}
      action={showAction ? action : undefined}
      {...props}
    />
  )
}

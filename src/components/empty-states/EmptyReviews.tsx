import React from "react"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';

export interface EmptyReviewsProps extends Omit<
  EmptyStateProps,
  "title" | "icon" | "action"
> {
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

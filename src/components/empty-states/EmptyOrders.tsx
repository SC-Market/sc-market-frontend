import React from "react"
import { useNavigate } from "react-router-dom"
import { AssignmentOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyOrdersProps extends Omit<EmptyStateProps, "title" | "icon" | "action"> {
  /**
   * Whether this is for offers (vs. orders)
   */
  isOffers?: boolean
  /**
   * Custom title override
   */
  title?: string
  /**
   * Custom description override
   */
  description?: string
  /**
   * Whether to show the create order action
   */
  showCreateAction?: boolean
  /**
   * Custom action override
   */
  action?: EmptyStateProps["action"]
}

/**
 * Empty state component for orders/offers
 *
 * Displays when there are no orders or offers to show, with actionable CTA
 */
export function EmptyOrders({
  isOffers = false,
  title,
  description,
  showCreateAction = true,
  action,
  ...props
}: EmptyOrdersProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const defaultTitle = isOffers
    ? t("emptyStates.orders.noOffers", { defaultValue: "No offers yet" })
    : t("emptyStates.orders.noOrders", { defaultValue: "No orders yet" })

  const defaultDescription = isOffers
    ? t("emptyStates.orders.noOffersDescription", {
        defaultValue: "Offers will appear here when customers make purchase requests",
      })
    : t("emptyStates.orders.noOrdersDescription", {
        defaultValue: "Create your first order to get started with contracting services",
      })

  const defaultAction = showCreateAction
    ? {
        label: t("emptyStates.orders.createOrder", { defaultValue: "Create Order" }),
        onClick: () => navigate("/order/create"),
        variant: "contained" as const,
      }
    : undefined

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<AssignmentOutlined />}
      action={action || defaultAction}
      {...props}
    />
  )
}

import React from "react"
import { useNavigate } from "react-router-dom"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';

export interface EmptyOrdersProps extends Omit<
  EmptyStateProps,
  "title" | "icon" | "action" | "secondaryAction"
> {
  /**
   * Whether this is for offers (vs. orders)
   */
  isOffers?: boolean
  /**
   * For offers: whether these are sent offers (true) or received offers (false)
   * For orders: whether these are your orders (true) or all orders (false)
   */
  isSent?: boolean
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
  /**
   * Custom secondary action override
   */
  secondaryAction?: EmptyStateProps["secondaryAction"]
}

/**
 * Empty state component for orders/offers
 *
 * Displays when there are no orders or offers to show, with actionable CTA
 */
export function EmptyOrders({
  isOffers = false,
  isSent = false,
  title,
  description,
  showCreateAction = true,
  action,
  secondaryAction,
  ...props
}: EmptyOrdersProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const defaultTitle = isOffers
    ? t("emptyStates.orders.noOffers", { defaultValue: "No offers yet" })
    : t("emptyStates.orders.noOrders", { defaultValue: "No orders yet" })

  // Context-aware descriptions and actions
  let defaultDescription: string
  let defaultAction: EmptyStateProps["action"] | undefined
  let defaultSecondaryAction: EmptyStateProps["secondaryAction"] | undefined

  if (isOffers) {
    // For offers
    if (isSent) {
      // Sent offers (none) → point to market and services pages
      defaultDescription = t("emptyStates.orders.noSentOffersDescription", {
        defaultValue:
          "Browse the market and services to find items and services to purchase",
      })
      defaultAction = {
        label: t("emptyStates.orders.browseMarket", {
          defaultValue: "Browse Market",
        }),
        onClick: () => navigate("/market"),
        variant: "contained" as const,
      }
      defaultSecondaryAction = {
        label: t("emptyStates.orders.browseServices", {
          defaultValue: "Browse Services",
        }),
        onClick: () => navigate("/market/services"),
      }
    } else {
      // Received offers (none) → point to create market listing or service listing
      defaultDescription = t("emptyStates.orders.noReceivedOffersDescription", {
        defaultValue:
          "Create market listings or service listings to start receiving offers from customers",
      })
      defaultAction = {
        label: t("emptyStates.orders.createMarketListing", {
          defaultValue: "Create Market Listing",
        }),
        onClick: () => navigate("/market/create"),
        variant: "contained" as const,
      }
      defaultSecondaryAction = {
        label: t("emptyStates.orders.createServiceListing", {
          defaultValue: "Create Service Listing",
        }),
        onClick: () => navigate("/order/service/create"),
      }
    }
  } else {
    // For orders
    if (isSent) {
      // My orders (none) → point to market and services pages
      defaultDescription = t("emptyStates.orders.noMyOrdersDescription", {
        defaultValue:
          "Browse the market and services to find items and services to order",
      })
      defaultAction = {
        label: t("emptyStates.orders.browseMarket", {
          defaultValue: "Browse Market",
        }),
        onClick: () => navigate("/market"),
        variant: "contained" as const,
      }
      defaultSecondaryAction = {
        label: t("emptyStates.orders.browseServices", {
          defaultValue: "Browse Services",
        }),
        onClick: () => navigate("/market/services"),
      }
    } else {
      // All orders (none) → point to create market listing or service listing
      defaultDescription = t("emptyStates.orders.noReceivedOffersDescription", {
        defaultValue:
          "Create market listings or service listings to start receiving offers from customers",
      })
      defaultAction = showCreateAction
        ? {
            label: t("emptyStates.orders.createMarketListing", {
              defaultValue: "Create Market Listing",
            }),
            onClick: () => navigate("/market/create"),
            variant: "contained" as const,
          }
        : undefined
      defaultSecondaryAction = showCreateAction
        ? {
            label: t("emptyStates.orders.createServiceListing", {
              defaultValue: "Create Service Listing",
            }),
            onClick: () => navigate("/order/service/create"),
          }
        : undefined
    }
  }

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<AssignmentOutlined />}
      action={action || defaultAction}
      secondaryAction={secondaryAction || defaultSecondaryAction}
      {...props}
    />
  )
}

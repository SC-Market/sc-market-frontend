import React from "react"
import { useNavigate } from "react-router-dom"
import { AssignmentRounded } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"
import { MARKET_PATHS, ORDER_PATHS, SHOP_PATHS } from "../../routes/paths"
import { useOptionalShopRouteContext } from "../router/ShopContextFromRoute"
import {
  canEditShopListings,
  canManageShopServices,
} from "../../features/shops/domain/shopPermissions"

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
  const shop = useOptionalShopRouteContext()?.shop

  // Where "Create Market Listing" / "Create Service Listing" go. On a shop's
  // page (/shop/:slug/orders) they create in that shop, and only show when
  // your role there allows it; elsewhere the shop picker asks which shop.
  const listingCreatePath = shop
    ? canEditShopListings(shop)
      ? SHOP_PATHS.create(shop.slug)
      : null
    : MARKET_PATHS.create
  const serviceCreatePath = shop
    ? canManageShopServices(shop)
      ? SHOP_PATHS.serviceCreate(shop.slug)
      : null
    : ORDER_PATHS.serviceCreate
  const createActions = (): [
    EmptyStateProps["action"] | undefined,
    EmptyStateProps["secondaryAction"] | undefined,
  ] => {
    const actions: { label: string; onClick: () => void }[] = []
    if (listingCreatePath) {
      actions.push({
        label: t("emptyStates.orders.createMarketListing", {
          defaultValue: "Create Market Listing",
        }),
        onClick: () => navigate(listingCreatePath),
      })
    }
    if (serviceCreatePath) {
      actions.push({
        label: t("emptyStates.orders.createServiceListing", {
          defaultValue: "Create Service Listing",
        }),
        onClick: () => navigate(serviceCreatePath),
      })
    }
    const [first, second] = actions
    return [first && { ...first, variant: "contained" }, second]
  }

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
        onClick: () => navigate(MARKET_PATHS.search),
        variant: "contained" as const,
      }
      defaultSecondaryAction = {
        label: t("emptyStates.orders.browseServices", {
          defaultValue: "Browse Services",
        }),
        onClick: () => navigate(MARKET_PATHS.services),
      }
    } else {
      // Received offers (none) → point to create market listing or service listing
      defaultDescription = t("emptyStates.orders.noReceivedOffersDescription", {
        defaultValue:
          "Create market listings or service listings to start receiving offers from customers",
      })
      ;[defaultAction, defaultSecondaryAction] = createActions()
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
        onClick: () => navigate(MARKET_PATHS.search),
        variant: "contained" as const,
      }
      defaultSecondaryAction = {
        label: t("emptyStates.orders.browseServices", {
          defaultValue: "Browse Services",
        }),
        onClick: () => navigate(MARKET_PATHS.services),
      }
    } else {
      // All orders (none) → point to create market listing or service listing
      defaultDescription = t("emptyStates.orders.noReceivedOffersDescription", {
        defaultValue:
          "Create market listings or service listings to start receiving offers from customers",
      })
      if (showCreateAction) {
        ;[defaultAction, defaultSecondaryAction] = createActions()
      }
    }
  }

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<AssignmentRounded />}
      action={action || defaultAction}
      secondaryAction={secondaryAction || defaultSecondaryAction}
      {...props}
    />
  )
}

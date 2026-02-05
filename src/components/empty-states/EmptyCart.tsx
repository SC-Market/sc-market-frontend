import React from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingCartOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyCartProps
  extends Omit<EmptyStateProps, "title" | "icon" | "action"> {
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
   * Custom action override
   */
  action?: EmptyStateProps["action"]
  /**
   * Retry function for error states
   */
  onRetry?: () => void
}

/**
 * Empty state component for shopping cart
 */
export function EmptyCart({
  isError = false,
  title,
  description,
  action,
  onRetry,
  ...props
}: EmptyCartProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (isError) {
    return (
      <EmptyState
        title={
          title ||
          t("emptyStates.cart.errorTitle", {
            defaultValue: "Unable to load cart",
          })
        }
        description={
          description ||
          t("emptyStates.cart.errorDescription", {
            defaultValue:
              "We encountered an error while loading your cart. Please try again.",
          })
        }
        icon={<ShoppingCartOutlined />}
        action={
          onRetry
            ? {
                label: t("emptyStates.cart.retry", { defaultValue: "Retry" }),
                onClick: onRetry,
                variant: "contained",
              }
            : undefined
        }
        {...props}
      />
    )
  }

  const defaultTitle = t("emptyStates.cart.title", {
    defaultValue: "Your cart is empty",
  })

  const defaultDescription = t("emptyStates.cart.description", {
    defaultValue: "Browse the market to find items and add them to your cart",
  })

  const defaultAction = {
    label: t("emptyStates.cart.browseMarket", {
      defaultValue: "Browse Market",
    }),
    onClick: () => navigate("/market"),
    variant: "contained" as const,
  }

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<ShoppingCartOutlined />}
      action={action || defaultAction}
      {...props}
    />
  )
}

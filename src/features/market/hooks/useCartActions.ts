/**
 * Cart actions for the cart page: change an item, remove it, check out a
 * seller's items. Each sends the request and alerts; checkout also opens
 * the seller's Discord invite and goes to the new offer.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useCheckoutCartMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
  type CartItemDetail,
} from "../../../store/api/v2/market"
import { ORDER_PATHS } from "../../../routes/paths"

/** Change one cart item's quantity. */
export function useCartItemActions(cartItemId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation()

  const changeQuantity = useCallback(
    async (quantity: number) => {
      if (quantity < 1) return
      try {
        await updateCartItem({
          id: cartItemId,
          updateCartItemRequest: { quantity },
        }).unwrap()
        issueAlert({
          message: t("cart.quantityUpdated", "Quantity updated"),
          severity: "success",
        })
      } catch (error) {
        issueAlert({
          message:
            error instanceof Error ? error.message : t("marketV2.updateQuantityFailed"),
          severity: "error",
        })
      }
    },
    [cartItemId, updateCartItem, issueAlert, t],
  )

  return { changeQuantity, isUpdating }
}

/** Remove items and check out. */
export function useCartActions() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation()
  const [checkoutCart, { isLoading: isCheckingOut }] = useCheckoutCartMutation()

  const removeItem = useCallback(
    async (cartItemId: string) => {
      try {
        await removeCartItem({ id: cartItemId }).unwrap()
        issueAlert({
          message: t("cart.itemRemoved", "Item removed from cart"),
          severity: "success",
        })
      } catch (error) {
        issueAlert({
          message:
            error instanceof Error ? error.message : t("marketV2.removeItemFailed"),
          severity: "error",
        })
      }
    },
    [removeCartItem, issueAlert, t],
  )

  /**
   * Check out one shop's items as an offer. Confirms any price changes the
   * cart shows. Resolves once it has succeeded or failed (both alert).
   */
  const checkout = useCallback(
    async (args: {
      items: CartItemDetail[]
      shopId: string | undefined
      note: string | undefined
    }) => {
      try {
        const result = await checkoutCart({
          checkoutCartRequest: {
            confirm_price_changes: args.items.some((item) => item.price_changed),
            note: args.note || undefined,
            shop_id: args.shopId,
          },
        }).unwrap()
        issueAlert({
          message: t("cart.checkoutSuccess", "Offer submitted successfully"),
          severity: "success",
        })
        if (result.discord_invite) {
          window.open(`https://discord.gg/${result.discord_invite}`, "_blank")
        }
        navigate(ORDER_PATHS.offer(result.session_id))
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
      }
    },
    [checkoutCart, issueAlert, navigate, t],
  )

  return { removeItem, checkout, isRemoving, isCheckingOut }
}

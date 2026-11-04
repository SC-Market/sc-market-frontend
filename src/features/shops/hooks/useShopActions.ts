/**
 * Creating shops, the shop blocklist and the storefront directory setting.
 * Each sends the request and alerts.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useBlockUserFromShopMutation,
  useCreateShopMutation,
  useQuickCreateShopMutation,
  useSetShopStorefrontDirectoryMutation,
  useUnblockUserFromShopMutation,
  type CreateShopRequest,
  type ShopResponse,
} from "../../../store/api/v2/market"

const apiMessage = (err: unknown) =>
  (err as { data?: { message?: string } })?.data?.message

/** Create a shop from the form: its slug, or the error (slug conflicts). */
export function useCreateShop() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createShop, { isLoading }] = useCreateShopMutation()

  const create = useCallback(
    async (
      request: CreateShopRequest,
    ): Promise<{ ok: true; slug: string } | { ok: false; error: unknown }> => {
      try {
        const result = await createShop({ createShopRequest: request }).unwrap()
        issueAlert({ message: t("shopsUi.create.created"), severity: "success" })
        return { ok: true, slug: result.slug }
      } catch (error) {
        issueAlert(error as UnwrappedErrorInterface)
        return { ok: false, error }
      }
    },
    [createShop, issueAlert, t],
  )

  return { create, isLoading }
}

/**
 * Create a personal shop in one click: the new shop, or null. With
 * `announce`, say so by name.
 */
export function useQuickCreateShop() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [quickCreateShop, { isLoading }] = useQuickCreateShopMutation()

  const create = useCallback(
    async (announce = false): Promise<ShopResponse | null> => {
      try {
        const shop = await quickCreateShop({
          quickCreateShopRequest: { owner_type: "user" },
        }).unwrap()
        if (announce) {
          issueAlert({
            message: t("ShopSelector.created", "Shop created: {{name}}", { name: shop.name }),
            severity: "success",
          })
        }
        return shop
      } catch (error) {
        issueAlert({
          message: apiMessage(error) || t("ShopSelector.createError", "Failed to create shop"),
          severity: "error",
        })
        return null
      }
    },
    [quickCreateShop, issueAlert, t],
  )

  return { create, isLoading }
}

/** Block and unblock users from ordering at the shop. */
export function useShopBlocklist(shopId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [blockUser] = useBlockUserFromShopMutation()
  const [unblockUser] = useUnblockUserFromShopMutation()

  const block = useCallback(
    async (username: string, reason: string): Promise<boolean> => {
      try {
        await blockUser({ shopId, blockUserRequest: { username, reason } }).unwrap()
        issueAlert({ severity: "success", message: t("shops.blocklist.blocked", { username }) })
        return true
      } catch (err) {
        issueAlert({ severity: "error", message: String(apiMessage(err) || t("shops.blocklist.blockFailed")) })
        return false
      }
    },
    [shopId, blockUser, issueAlert, t],
  )

  const unblock = useCallback(
    async (userId: string, username: string) => {
      try {
        await unblockUser({ shopId, blockedUserId: userId }).unwrap()
        issueAlert({ severity: "success", message: t("shops.blocklist.unblocked", { username }) })
      } catch (err) {
        issueAlert({ severity: "error", message: String(apiMessage(err) || t("shops.blocklist.unblockFailed")) })
      }
    },
    [shopId, unblockUser, issueAlert, t],
  )

  return { block, unblock }
}

/** Show an org's shop in the storefront directory, or hide it. */
export function useShopStorefrontDirectory(shopId: string) {
  const [setDirectory, { isLoading, error }] = useSetShopStorefrontDirectoryMutation()
  const setShown = useCallback(
    (show: boolean) =>
      void setDirectory({ shopId, storefrontDirectoryRequest: { show_in_directory: show } }),
    [setDirectory, shopId],
  )
  return { setShown, isSaving: isLoading, error }
}

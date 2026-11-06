/**
 * Wishlists (shopping lists): add an item, change an item's quantity or
 * remove it, and the list's sharing settings.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import type { AddWishlistItemRequest } from "../../../store/api/v2/market"
import {
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useUpdateWishlistItemMutation,
  useUpdateWishlistMutation,
} from "../api/wishlistsApi"

/** Add an item. Resolves to null when added, else the message to show. */
export function useAddWishlistItem(wishlistId: string) {
  const { t } = useTranslation()
  const [addItem, { isLoading: isAdding }] = useAddWishlistItemMutation()

  const add = useCallback(
    async (request: AddWishlistItemRequest): Promise<string | null> => {
      try {
        await addItem({ wishlistId, addWishlistItemRequest: request }).unwrap()
        return null
      } catch (err: unknown) {
        return err instanceof Error
          ? err.message
          : t("marketUi.addItemDialog.addFailed")
      }
    },
    [wishlistId, addItem, t],
  )

  return { add, isAdding }
}

/** Change an item's quantity, or remove it. */
export function useWishlistItemActions(wishlistId: string) {
  const [updateItem] = useUpdateWishlistItemMutation()
  const [removeItem] = useRemoveWishlistItemMutation()

  const setQuantity = useCallback(
    (itemId: string, quantity: number) => {
      updateItem({
        wishlistId,
        itemId,
        updateWishlistItemRequest: { desired_quantity: quantity },
      })
    },
    [wishlistId, updateItem],
  )
  const remove = useCallback(
    (itemId: string) => {
      removeItem({ wishlistId, itemId })
    },
    [wishlistId, removeItem],
  )

  return { setQuantity, remove }
}

/**
 * Make a list public or private, and collaborative or not. Each resolves
 * to the message to show: `success` once saved, else `error`.
 */
export function useWishlistSharing(wishlistId: string) {
  const { t } = useTranslation()
  const [updateWishlist, { isLoading }] = useUpdateWishlistMutation()

  const setPublic = useCallback(
    async (
      isPublic: boolean,
    ): Promise<{ success: string } | { error: string }> => {
      try {
        await updateWishlist({
          wishlistId,
          updateWishlistRequest: { is_public: isPublic },
        }).unwrap()
        return {
          success: isPublic
            ? t("wishlistsUi.share.nowPublic")
            : t("wishlistsUi.share.nowPrivate"),
        }
      } catch (err: unknown) {
        return {
          error:
            err instanceof Error
              ? err.message
              : t("wishlistsUi.share.privacyError"),
        }
      }
    },
    [wishlistId, updateWishlist, t],
  )

  const setCollaborative = useCallback(
    async (
      isCollaborative: boolean,
    ): Promise<{ success: string } | { error: string }> => {
      try {
        await updateWishlist({
          wishlistId,
          updateWishlistRequest: { is_collaborative: isCollaborative },
        }).unwrap()
        return {
          success: isCollaborative
            ? t("wishlistsUi.share.collabEnabled")
            : t("wishlistsUi.share.collabDisabled"),
        }
      } catch (err: unknown) {
        return {
          error:
            err instanceof Error
              ? err.message
              : t("wishlistsUi.share.collabError"),
        }
      }
    },
    [wishlistId, updateWishlist, t],
  )

  return { setPublic, setCollaborative, isLoading }
}

/**
 * Watchlist (price alerts): add a watched item, change or pause one, stop
 * watching one. The callers show errors from the returned states.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useFormatters } from "../../../util/format"
import {
  useAddWatchlistItemMutation,
  useRemoveWatchlistItemMutation,
  useUpdateWatchlistItemMutation,
  type WatchlistItem,
} from "../../../store/api/v2/market"

/** Add a game item at a target price. Resolves to whether it was added. */
export function useAddWatchlistItem() {
  const [addMutation, state] = useAddWatchlistItemMutation()
  const add = useCallback(
    async (gameItemId: string, maxPrice: number): Promise<boolean> => {
      try {
        await addMutation({
          addWatchlistItemRequest: {
            game_item_id: gameItemId,
            max_price: maxPrice,
          },
        }).unwrap()
        return true
      } catch {
        // Shown from state.error.
        return false
      }
    },
    [addMutation],
  )
  return { add, ...state }
}

/** The watchlist's per-row actions: pause/resume and remove. */
export function useWatchlistRowActions() {
  const [removeMutation, removeState] = useRemoveWatchlistItemMutation()
  const [updateMutation, updateState] = useUpdateWatchlistItemMutation()

  const remove = useCallback(
    (watchlistId: string) => {
      removeMutation({ watchlistId })
    },
    [removeMutation],
  )
  const setPaused = useCallback(
    (watchlistId: string, paused: boolean) => {
      updateMutation({ watchlistId, updateWatchlistItemRequest: { paused } })
    },
    [updateMutation],
  )

  return { remove, removeState, setPaused, updateState }
}

/**
 * The Watch price dialog: save a target price (and minimum quality) for an
 * item, as a new watch or a change to `existing`, or stop watching it.
 * Alerts on success and resolves to whether it worked.
 */
export function useWatchPrice(props: {
  gameItemId: string
  itemName: string
  existing?: WatchlistItem | null
}) {
  const { gameItemId, itemName, existing } = props
  const { t } = useTranslation()
  const fmt = useFormatters()
  const issueAlert = useAlertHook()
  const [add, addState] = useAddWatchlistItemMutation()
  const [update, updateState] = useUpdateWatchlistItemMutation()
  const [remove, removeState] = useRemoveWatchlistItemMutation()
  const busy =
    addState.isLoading || updateState.isLoading || removeState.isLoading
  const failure = addState.error || updateState.error || removeState.error

  /** `withQuality`: send the tier on an edit (null clears it). */
  const save = useCallback(
    async (
      price: number,
      tier: number | null,
      withQuality: boolean,
    ): Promise<boolean> => {
      try {
        if (existing) {
          await update({
            watchlistId: existing.id,
            updateWatchlistItemRequest: {
              max_price: price,
              ...(withQuality ? { min_quality_tier: tier } : {}),
            },
          }).unwrap()
        } else {
          await add({
            addWatchlistItemRequest: {
              game_item_id: gameItemId,
              max_price: price,
              ...(tier != null ? { min_quality_tier: tier } : {}),
            },
          }).unwrap()
        }
        issueAlert({
          message: t(
            "priceAlerts.watch.saved",
            "Watching {{name}} at ≤ {{price}}",
            {
              name: itemName,
              price: fmt.auec(price),
            },
          ),
          severity: "success",
        })
        return true
      } catch {
        // Shown in the dialog.
        return false
      }
    },
    [existing, gameItemId, itemName, add, update, issueAlert, fmt, t],
  )

  const stop = useCallback(async (): Promise<boolean> => {
    if (!existing) return false
    try {
      await remove({ watchlistId: existing.id }).unwrap()
      issueAlert({
        message: t("priceAlerts.watch.removed", "Stopped watching {{name}}", {
          name: itemName,
        }),
        severity: "success",
      })
      return true
    } catch {
      // Shown in the dialog.
      return false
    }
  }, [existing, itemName, remove, issueAlert, t])

  return { save, stop, busy, failure }
}

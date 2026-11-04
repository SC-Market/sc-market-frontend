import { useCallback } from "react"
import {
  useGetWipeRelistQuery,
  useRelistWipeMutation,
  type WipeRelistSummary,
} from "../../../store/api/v2/market"

/**
 * The listings the latest game wipe paused that the user can relist, and
 * Relist all (backend services/listing-wipe, GET/POST /wipe-relist).
 * shopId: only that shop; otherwise every shop the user manages.
 */
export function useWipeRelist(shopId?: string) {
  const { data } = useGetWipeRelistQuery({ shopId })
  const [mutate, { isLoading }] = useRelistWipeMutation()
  const relistAll = useCallback(
    async (wipe: WipeRelistSummary): Promise<number> => {
      const { relisted } = await mutate({
        wipeRelistRequest: {
          wipe_id: wipe.wipe_id,
          ...(shopId ? { shop_id: shopId } : {}),
        },
      }).unwrap()
      return relisted
    },
    [mutate, shopId],
  )
  return { summary: data ?? null, relistAll, isRelisting: isLoading }
}

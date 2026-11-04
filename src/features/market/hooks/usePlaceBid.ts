import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { usePlaceBidMutation } from "../../../store/api/v2/market"

/** Bid on an auction listing. Resolves to whether the bid was placed. */
export function usePlaceBid(listingId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [placeBid, { isLoading }] = usePlaceBidMutation()

  const bid = useCallback(
    async (amount: number): Promise<boolean> => {
      try {
        await placeBid({ listingId, placeBidRequest: { amount } }).unwrap()
        issueAlert({
          message: t("BidAreaV2.bidPlaced", "Bid placed successfully!"),
          severity: "success",
        })
        return true
      } catch (err) {
        issueAlert({
          message:
            (err as { data?: { message?: string } })?.data?.message ||
            t("BidAreaV2.bidFailed", "Failed to place bid"),
          severity: "error",
        })
        return false
      }
    },
    [listingId, placeBid, issueAlert, t],
  )

  return { bid, isLoading }
}

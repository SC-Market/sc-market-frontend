/**
 * Buy order actions: post one, cancel one, fulfil one from a listing. Each
 * sends the request and alerts; the components keep their form state and
 * navigation.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useCancelBuyOrderMutation,
  useCreateStandingBuyOrderMutation,
  useFulfillBuyOrderMutation,
  type CreateTargetedBuyOrderRequest,
  type FulfillBuyOrderRequest,
} from "../../../store/api/v2/market"
import { extractErrorMessage } from "../../../store/api-utils"

/**
 * Post a buy order. With `failedMessage`, a failure alerts the API's message
 * (or that fallback); without it, the error goes to the alert as is (the
 * compact form).
 */
export function useCreateBuyOrder(
  successMessage: string,
  failedMessage?: string,
) {
  const issueAlert = useAlertHook()
  const [createStandingBuyOrder, { isLoading }] =
    useCreateStandingBuyOrderMutation()

  const create = useCallback(
    async (request: CreateTargetedBuyOrderRequest): Promise<boolean> => {
      try {
        await createStandingBuyOrder({
          createTargetedBuyOrderRequest: request,
        }).unwrap()
        issueAlert({ message: successMessage, severity: "success" })
        return true
      } catch (error) {
        if (failedMessage === undefined) {
          issueAlert(error as UnwrappedErrorInterface)
        } else {
          const err = error as {
            data?: { message?: string; error?: string }
            message?: string
          }
          issueAlert({
            message:
              err?.data?.message ||
              err?.data?.error ||
              err?.message ||
              failedMessage,
            severity: "error",
          })
        }
        return false
      }
    },
    [createStandingBuyOrder, issueAlert, successMessage, failedMessage],
  )

  return { create, isLoading }
}

/** Cancel one of your buy orders. `failedMessage`: when the API gives no reason. */
export function useCancelBuyOrder(failedMessage: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [cancelBuyOrder, { isLoading }] = useCancelBuyOrderMutation()

  const cancel = useCallback(
    async (buyOrderId: string) => {
      try {
        await cancelBuyOrder({ id: buyOrderId }).unwrap()
        issueAlert({
          message: t("MarketAggregateView.cancelled"),
          severity: "success",
        })
      } catch (err) {
        issueAlert({
          message:
            (err as { data?: { message?: string } })?.data?.message ||
            failedMessage,
          severity: "error",
        })
      }
    },
    [cancelBuyOrder, issueAlert, failedMessage, t],
  )

  return { cancel, isLoading }
}

/** Fulfil a buy order from one of your listings: the new order's id, or null. */
export function useFulfillBuyOrder() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [fulfillBuyOrder, { isLoading }] = useFulfillBuyOrderMutation()

  const fulfill = useCallback(
    async (
      buyOrderId: string,
      request: FulfillBuyOrderRequest,
    ): Promise<string | null> => {
      try {
        const result = await fulfillBuyOrder({
          id: buyOrderId,
          fulfillBuyOrderRequest: request,
        }).unwrap()
        issueAlert({
          message: t("buyorder.fulfilled", "Order created"),
          severity: "success",
        })
        return result.order_id
      } catch (err) {
        const reason = extractErrorMessage((err as { data?: unknown })?.data)
        issueAlert({
          message: reason
            ? t(
                "buyorder.fulfillFailedReason",
                "Could not fulfill the buy order: {{reason}}",
                { reason },
              )
            : t("buyorder.fulfillFailed", "Could not fulfill the buy order"),
          severity: "error",
        })
        return null
      }
    },
    [fulfillBuyOrder, issueAlert, t],
  )

  return { fulfill, isLoading }
}

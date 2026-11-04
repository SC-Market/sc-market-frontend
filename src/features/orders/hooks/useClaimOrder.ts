import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import { useAssignOrderMutation } from "../api/ordersApi"

/** Take an unassigned org order yourself. */
export function useClaimOrder() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [assignOrder] = useAssignOrderMutation()

  return useCallback(
    (orderId: string, username: string) =>
      assignOrder({ order_id: orderId, username })
        .unwrap()
        .then(() =>
          issueAlert({
            message: t("orders.claimed", "Order claimed"),
            severity: "success",
          }),
        )
        .catch((e) => issueAlert(e as UnwrappedErrorInterface)),
    [assignOrder, issueAlert, t],
  )
}

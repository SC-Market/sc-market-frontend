/**
 * Offer actions from the offer pages: claim, assign / unassign a member,
 * submit a counter-offer. Each sends the request and alerts.
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useAssignOfferMutation,
  useCounterOfferMutation,
  useUnassignOfferMutation,
  type CounterOfferBody,
} from "../api/offerApi"
import { assignErrorReason } from "../domain/assignError"
import { ORDER_PATHS } from "../../../routes/paths"

/** Take an unassigned offer yourself. */
export function useClaimOffer() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [assignOffer] = useAssignOfferMutation()

  return useCallback(
    (sessionId: string, username: string) =>
      assignOffer({ session_id: sessionId, username })
        .unwrap()
        .then(() =>
          issueAlert({
            message: t("orders.claimed", "Offer claimed"),
            severity: "success",
          }),
        )
        .catch((e) => issueAlert(e as UnwrappedErrorInterface)),
    [assignOffer, issueAlert, t],
  )
}

/** Assign an offer to an org member, or take it off them. */
export function useOfferAssignment(sessionId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [assignOffer] = useAssignOfferMutation()
  const [unassignOffer] = useUnassignOfferMutation()

  const assign = useCallback(
    async (username: string) => {
      const res = await assignOffer({ session_id: sessionId, username })
      if ("data" in res && !("error" in res)) {
        issueAlert({
          message: t("memberAssignArea.assigned"),
          severity: "success",
        })
      } else {
        issueAlert({
          message: `${t("memberAssignArea.failed_assign")} ${assignErrorReason(res.error)}`,
          severity: "error",
        })
      }
    },
    [assignOffer, sessionId, issueAlert, t],
  )

  const unassign = useCallback(async () => {
    const res = await unassignOffer({ session_id: sessionId })
    if ("data" in res && !("error" in res)) {
      issueAlert({
        message: t("memberAssignArea.unassigned"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("memberAssignArea.failed_unassign")} ${assignErrorReason(res.error)}`,
        severity: "error",
      })
    }
  }, [unassignOffer, sessionId, issueAlert, t])

  return { assign, unassign }
}

/** Submit the counter-offer being edited, then go back to the offer. */
export function useCounterOfferSubmit(sessionId: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const [counterOffer, { isLoading }] = useCounterOfferMutation()

  const submit = useCallback(
    (body: CounterOfferBody) =>
      counterOffer(body)
        .unwrap()
        .then(() => {
          issueAlert({
            message: t("CounterOfferSubmitArea.counterOfferSubmitted", {
              defaultValue: "Counter offer submitted successfully",
            }),
            severity: "success",
          })
          navigate(ORDER_PATHS.offer(sessionId))
        })
        .catch((e) => issueAlert(e as UnwrappedErrorInterface)),
    [counterOffer, issueAlert, navigate, sessionId, t],
  )

  return { submit, isLoading }
}

/**
 * Review revisions: ask a review's author to revise it, and save the
 * author's revised review. Each resolves to whether it worked (both alert).
 */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useRequestReviewRevisionMutation,
  useUpdateOrderReviewMutation,
} from "../api/ordersApi"

export function useRequestReviewRevision() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [requestRevision, { isLoading }] = useRequestReviewRevisionMutation()

  const request = useCallback(
    (args: { reviewId: string; orderId: string; message?: string }) =>
      requestRevision(args)
        .unwrap()
        .then(() => {
          issueAlert({ message: t("reviewRevision.success.requested"), severity: "success" })
          return true
        })
        .catch((e) => {
          issueAlert(e as UnwrappedErrorInterface)
          return false
        }),
    [requestRevision, issueAlert, t],
  )

  return { request, isLoading }
}

export function useUpdateReview() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateReview, { isLoading }] = useUpdateOrderReviewMutation()

  const update = useCallback(
    (args: { reviewId: string; orderId: string; content: string; rating: number }) =>
      updateReview(args)
        .unwrap()
        .then(() => {
          issueAlert({ message: t("reviewRevision.success.updated"), severity: "success" })
          return true
        })
        .catch((e) => {
          issueAlert(e as UnwrappedErrorInterface)
          return false
        }),
    [updateReview, issueAlert, t],
  )

  return { update, isLoading }
}

import { useCallback, useState } from "react"
import { useLeaveOrderReviewMutation } from "../api/ordersApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

export function useOrderReview(orderId: string, role: "customer" | "contractor") {
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(0)
  const issueAlert = useAlertHook()
  const { t } = useTranslation()
  const [addReview] = useLeaveOrderReviewMutation()

  const submitReview = useCallback(async () => {
    const res: { data?: any; error?: any } = await addReview({
      content,
      rating,
      order_id: orderId,
      role,
    })

    if (res?.data && !res?.error) {
      issueAlert({ message: t("orderReviewArea.alert.success"), severity: "success" })
      setContent("")
    } else {
      issueAlert({
        message: `${t("orderReviewArea.alert.error")} ${res.error?.error || res.error?.data?.error || res.error}`,
        severity: "error",
      })
    }
  }, [addReview, content, rating, orderId, role, issueAlert, t])

  return { content, setContent, rating, setRating, submitReview }
}

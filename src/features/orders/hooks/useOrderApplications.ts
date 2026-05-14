import { useCallback, useState } from "react"
import {
  useAcceptOrderApplicantMutation,
  useApplyToOrderMutation,
} from "../api/ordersApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"

export function useAcceptApplicant(
  orderId: string,
  applicant: { orgSpectrumId?: string | null; userUsername?: string | null },
) {
  const [acceptApplicant] = useAcceptOrderApplicantMutation()
  const issueAlert = useAlertHook()
  const { t } = useTranslation()

  return useCallback(async () => {
    const res = await acceptApplicant({
      order_id: orderId,
      contractor_id: applicant.orgSpectrumId,
      user_id: applicant.userUsername,
    })
    if ("data" in res && !("error" in res)) {
      issueAlert({ message: t("orderApplicantsArea.accepted"), severity: "success" })
    } else {
      const error = "error" in res ? res.error as { error?: string; data?: { error?: string } } : undefined
      issueAlert({
        message: `${t("orderApplicantsArea.failed_accept")} ${error?.error || error?.data?.error || ""}`,
        severity: "error",
      })
    }
  }, [acceptApplicant, orderId, applicant.orgSpectrumId, applicant.userUsername, issueAlert, t])
}

export function useApplyToOrder(orderId: string) {
  const [applyToOrder] = useApplyToOrderMutation()
  const [appMessage, setAppMessage] = useState("")
  const issueAlert = useAlertHook()
  const [currentOrg] = useCurrentOrg()
  const { t } = useTranslation()

  const processApp = useCallback(async () => {
    const res = await applyToOrder({
      order_id: orderId,
      contractor_id: currentOrg?.spectrum_id,
      message: appMessage,
    })
    if ("data" in res && !("error" in res)) {
      issueAlert({ message: t("orderApplicantsArea.applied"), severity: "success" })
    } else {
      const error = "error" in res ? res.error as { error?: string; data?: { error?: string } } : undefined
      issueAlert({
        message: `${t("orderApplicantsArea.failed_apply")} ${error?.error || error?.data?.error || ""}`,
        severity: "error",
      })
    }
  }, [applyToOrder, orderId, currentOrg?.spectrum_id, appMessage, issueAlert, t])

  return { appMessage, setAppMessage, processApp }
}

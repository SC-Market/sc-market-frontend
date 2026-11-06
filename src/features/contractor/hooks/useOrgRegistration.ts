/**
 * Getting an org onto SC Market: verify an RSI org with the sentinel code,
 * register a new one, or (site admins) express-verify an org for its owner.
 */
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import { ORG_PATHS } from "../../../routes/paths"
import {
  useAdminExpressVerifyContractorMutation,
  useContractorLinkMutation,
  useRegisterContractorMutation,
} from "../api/contractorApi"

/** Verify an RSI org you own. Resolves to whether it was verified. */
export function useLinkRsiOrg() {
  const issueAlert = useAlertHook()
  const [activateContractorLink] = useContractorLinkMutation()

  return useCallback(
    async (spectrumId: string): Promise<boolean> => {
      try {
        await activateContractorLink({ contractor: spectrumId }).unwrap()
        return true
      } catch (error) {
        issueAlert(error as UnwrappedErrorInterface)
        return false
      }
    },
    [activateContractorLink, issueAlert],
  )
}

export interface NewOrgRequest {
  description: string
  name: string
  identifier: string
  logo: string
  banner: string
  language_codes: string[]
}

/** Create an org, alert, and open its page (~identifier). */
export function useRegisterOrg() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const [registerNewContractor] = useRegisterContractorMutation()

  return useCallback(
    async (request: NewOrgRequest) => {
      try {
        await registerNewContractor(request).unwrap()
        issueAlert({
          message: t("contractorCreate.success", {
            defaultValue: "Organization created",
          }),
          severity: "success",
        })
        navigate(ORG_PATHS.profile(`~${request.identifier}`))
      } catch (error) {
        issueAlert(error as UnwrappedErrorInterface)
      }
    },
    [registerNewContractor, issueAlert, navigate, t],
  )
}

/** Site admins: verify an org for its owner. Resolves to whether it did. */
export function useAdminExpressVerifyOrg() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [expressVerify, { isLoading }] =
    useAdminExpressVerifyContractorMutation()

  const verify = useCallback(
    async (request: {
      owner_discord_id: string
      owner_username: string
      spectrum_id: string
    }): Promise<boolean> => {
      const res = await expressVerify(request)
      if ("data" in res && !("error" in res)) {
        issueAlert({
          message: t("adminExpressVerify.success"),
          severity: "success",
        })
        return true
      }
      let reason = String(res.error)
      if (res.error && "data" in res.error && res.error.data) {
        const errData = res.error.data as { error?: string; message?: string }
        reason = errData.error || errData.message || reason
      } else if (res.error && "message" in res.error) {
        reason = res.error.message ?? reason
      }
      issueAlert({
        message: t("adminExpressVerify.failure", {
          defaultValue: "Couldn't verify the org: {{reason}}",
          reason,
        }),
        severity: "error",
      })
      return false
    },
    [expressVerify, issueAlert, t],
  )

  return { verify, isLoading }
}

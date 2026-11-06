import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import { useUpdateProfile } from "../../profile/api/profileApi"
import { useUpdateContractorMutation } from "../../contractor/api/contractorApi"

/**
 * Save the market order template: the org's (`org` with its spectrum ID) or
 * your own. Alerts the outcome.
 */
export function useSaveMarketOrderTemplate(org: boolean) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateProfile, { isLoading: profileUpdateLoading }] =
    useUpdateProfile()
  const [updateOrg, { isLoading: orgUpdateLoading }] =
    useUpdateContractorMutation()

  const save = useCallback(
    async (template: string, spectrumId: string | undefined) => {
      try {
        if (org) {
          await updateOrg({
            contractor: spectrumId!,
            body: { market_order_template: template },
          }).unwrap()
        } else {
          await updateProfile({ market_order_template: template }).unwrap()
        }
        issueAlert({
          severity: "success",
          message: t("MarketEditTemplate.submitted"),
        })
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
      }
    },
    [org, updateOrg, updateProfile, issueAlert, t],
  )

  return { save, isLoading: orgUpdateLoading || profileUpdateLoading }
}

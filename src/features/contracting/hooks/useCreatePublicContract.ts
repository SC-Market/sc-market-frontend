import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import { ORDER_PATHS } from "../../../routes/paths"
import {
  useCreatePublicContractMutation,
  type PublicContractBody,
} from "../api/publicContractsApi"

/** Post a public contract, alert, and open it. */
export function useCreatePublicContract() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const [createPublicContract, { isLoading }] =
    useCreatePublicContractMutation()

  const create = useCallback(
    async (body: PublicContractBody) => {
      try {
        const data = await createPublicContract(body).unwrap()
        issueAlert({
          message: t("createPublicContract.submitted"),
          severity: "success",
        })
        navigate(ORDER_PATHS.publicContract(data.contract_id))
      } catch (error) {
        issueAlert(error as UnwrappedErrorInterface)
      }
    },
    [createPublicContract, issueAlert, navigate, t],
  )

  return { create, isLoading }
}

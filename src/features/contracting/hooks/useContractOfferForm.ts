import { useCallback, useState } from "react"
import { useCreateContractOfferMutation } from "../api/publicContractsApi"
import { useGetUserProfileQuery, useGetUserByUsernameQuery } from "../../profile/api/profileApi"
import { useCheckContractorOrderLimitsQuery, useCheckUserOrderLimitsQuery } from "../../orders/api/orderSettingsApi"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useAlertHook, type UnwrappedErrorInterface } from "../../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { OrderKind, PaymentType } from "../../orders/domain/types"
import type { PublicContract } from "../domain/types"

export function useContractOfferForm(contract: PublicContract) {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()

  const [title, setTitle] = useState(contract.title)
  const [description, setDescription] = useState(contract.description)
  const [kind, setKind] = useState<OrderKind>(contract.kind)
  const [cost, setCost] = useState(contract.cost)
  const [collateral, setCollateral] = useState(contract.collateral)
  const [paymentType, setPaymentType] = useState<PaymentType>(contract.payment_type)

  const [createContractOffer, { isLoading }] = useCreateContractOfferMutation()
  const { data: profile } = useGetUserProfileQuery()
  const { data: myUser } = useGetUserByUsernameQuery(profile?.username!, { skip: !profile })

  const { data: contractorLimits } = useCheckContractorOrderLimitsQuery(currentOrg?.spectrum_id || "", { skip: !currentOrg?.spectrum_id })
  const { data: userLimits } = useCheckUserOrderLimitsQuery(profile?.username || "", { skip: !profile?.username || !!currentOrg })
  const orderLimits = contractorLimits || userLimits

  const submitContractOffer = useCallback(async () => {
    createContractOffer({
      contract_id: contract.id, contractor: currentOrg?.spectrum_id || null,
      title, description, kind, collateral, cost, payment_type: paymentType,
    }).unwrap()
      .then((data) => {
        issueAlert({ message: t("createPublicContract.submitted"), severity: "success" })
        navigate(`/offer/${data.session_id}`)
      })
      .catch((error: UnwrappedErrorInterface) => {
        if (error?.error?.code === "ORDER_LIMIT_VIOLATION") {
          issueAlert({ message: error.error.message || "Order does not meet size or value requirements", severity: "error" })
        } else { issueAlert(error) }
      })
  }, [collateral, cost, createContractOffer, description, issueAlert, kind, navigate, paymentType, title, t, currentOrg, contract.id])

  return {
    title, setTitle, description, setDescription,
    kind, setKind, cost, setCost, collateral, setCollateral,
    paymentType, setPaymentType,
    isLoading, submitContractOffer,
    profile, myUser, orderLimits,
  }
}

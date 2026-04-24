import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useCreateOrderMutation } from "../api/ordersApi"
import {
  useCheckContractorAvailabilityRequirementQuery,
  useCheckUserAvailabilityRequirementQuery,
  useCheckContractorOrderLimitsQuery,
  useCheckUserOrderLimitsQuery,
} from "../api/orderSettingsApi"
import {
  useGetServicesContractorQuery,
  useGetServicesQuery,
} from "../../services/api/servicesApi"
import {
  useProfileGetAvailabilityQuery,
  useProfileUpdateAvailabilityMutation,
} from "../../profile/api/profileApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { convertAvailability } from "../../../pages/availability/Availability.lazy"
import type { Service, PaymentType } from "../domain/types"
import type { OrderLimits } from "../domain/types"

interface WorkRequestState {
  title: string
  rush: boolean
  description: string
  type: string
  collateral: number
  estimate: number
  offer: number
  service_id?: string | null
  payment_type: PaymentType
}

export interface UseCreateOrderFormParams {
  contractor_id?: string | null
  assigned_to?: string | null
  service?: Service
}

export function useCreateOrderForm(params: UseCreateOrderFormParams) {
  const { contractor_id, assigned_to } = params
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const [currentOrg] = useCurrentOrg()

  const [state, setState] = useState<WorkRequestState>({
    title: "",
    rush: false,
    description: "",
    type: "Escort",
    collateral: 0,
    estimate: 0,
    offer: 0,
    service_id: null,
    payment_type: "one-time",
  })

  const [createOrder, { isLoading }] = useCreateOrderMutation()

  // Services
  const { data: userServices } = useGetServicesQuery(assigned_to!, { skip: !assigned_to })
  const { data: contractorServices } = useGetServicesContractorQuery(contractor_id!, { skip: !contractor_id })
  const services = useMemo(() => userServices || contractorServices, [contractorServices, userServices])
  const [service, setService] = useState<Service | null>(params.service || null)

  // Availability requirement
  const { data: contractorRequirement, refetch: refetchContractorRequirement } =
    useCheckContractorAvailabilityRequirementQuery(contractor_id!, { skip: !contractor_id })
  const { data: userRequirement, refetch: refetchUserRequirement } =
    useCheckUserAvailabilityRequirementQuery(assigned_to!, { skip: !assigned_to })

  const availabilityRequirement = useMemo(() => {
    if (contractorRequirement?.required) return contractorRequirement
    if (userRequirement?.required) return userRequirement
    return undefined
  }, [contractorRequirement, userRequirement])

  const { data: userAvailability } = useProfileGetAvailabilityQuery(
    contractor_id ? currentOrg?.spectrum_id || null : null,
  )

  // Order limits
  const { data: contractorLimits } = useCheckContractorOrderLimitsQuery(contractor_id!, { skip: !contractor_id })
  const { data: userLimits } = useCheckUserOrderLimitsQuery(assigned_to!, { skip: !assigned_to })
  const orderLimits: OrderLimits | undefined = contractorLimits || userLimits

  const hasAvailabilitySet = useMemo(() => {
    if (!availabilityRequirement?.required) return true
    return availabilityRequirement.hasAvailability
  }, [availabilityRequirement])

  const formDisabled = availabilityRequirement?.required && !hasAvailabilitySet

  // Availability modal
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [availabilitySelections, setAvailabilitySelections] = useState<boolean[]>(
    convertAvailability(userAvailability?.selections || []),
  )
  const [updateAvailability] = useProfileUpdateAvailabilityMutation()

  useEffect(() => {
    if (userAvailability) {
      setAvailabilitySelections(convertAvailability(userAvailability.selections || []))
    }
  }, [userAvailability])

  const handleSaveAvailability = useCallback(
    async (selections: boolean[]) => {
      const spans: Array<{ start: number; finish: number }> = []
      let current: { start: number; finish: number } | null = null
      for (let i = 0; i < selections.length; i++) {
        if (selections[i]) {
          if (!current) current = { start: i, finish: i }
          else current.finish = i
        } else {
          if (current) { spans.push(current); current = null }
        }
      }
      if (current) spans.push(current)

      try {
        await updateAvailability({
          selections: spans,
          contractor: contractor_id || null,
        }).unwrap()
        if (contractor_id) refetchContractorRequirement()
        if (assigned_to) refetchUserRequirement()
        setIsAvailabilityModalOpen(false)
        issueAlert({ message: t("availability.updated"), severity: "success" })
      } catch (error) {
        const errorMessage = (error as any)?.error || (error as any)?.data?.error || (error instanceof Error ? error.message : String(error))
        issueAlert({ message: `${t("availability.failed")} ${errorMessage}`, severity: "error" })
      }
    },
    [contractor_id, assigned_to, updateAvailability, refetchContractorRequirement, refetchUserRequirement, issueAlert, t],
  )

  const sellerName = useMemo(() => contractor_id || assigned_to || "this seller", [contractor_id, assigned_to])

  // Sync service from props
  useEffect(() => { setService(params.service || null) }, [params.service])

  useEffect(() => {
    if (service) {
      setState((s) => ({
        ...s,
        title: service.title,
        rush: service.rush,
        description: service.description,
        collateral: service.collateral,
        offer: service.cost,
        type: service.kind,
        service_id: service.service_id,
        payment_type: service.payment_type,
      }))
    } else {
      setState({
        title: "", rush: false, description: "", type: "Escort",
        collateral: 0, estimate: 0, offer: 0, service_id: null, payment_type: "one-time",
      })
    }
  }, [service])

  const submitOrder = useCallback(async () => {
    createOrder({
      title: state.title, rush: state.rush, description: state.description,
      kind: state.type, collateral: state.collateral, cost: state.offer,
      contractor: contractor_id, assigned_to, payment_type: state.payment_type,
      service_id: service?.service_id, departure: null, destination: null,
    })
      .unwrap()
      .then((data) => {
        setState({
          title: "", rush: false, description: "", type: "Escort",
          collateral: 0, estimate: 0, offer: 0, payment_type: "one-time",
        })
        issueAlert({ message: t("CreateOrderForm.alert.submitted"), severity: "success" })
        if (data.discord_invite) {
          window.open(`https://discord.gg/${data.discord_invite}`, "_blank")
        }
        navigate(`/offer/${data.session_id}`)
      })
      .catch((err) => issueAlert(err))
  }, [createOrder, contractor_id, assigned_to, service, issueAlert, state, navigate, t])

  return {
    state, setState,
    isLoading,
    services, service, setService,
    availabilityRequirement, hasAvailabilitySet, formDisabled,
    isAvailabilityModalOpen, setIsAvailabilityModalOpen,
    availabilitySelections, handleSaveAvailability,
    orderLimits, sellerName,
    submitOrder, issueAlert,
  }
}

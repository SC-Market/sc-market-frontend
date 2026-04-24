import React, { useCallback, useEffect, useMemo, useState } from "react"
import throttle from "lodash/throttle"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { store } from "../../../store/store"
import { starmapApi } from "../../../store/api/starmap"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import type { Service, PaymentType } from "../domain/types"
import { romanize } from "../domain/formatters"
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useUploadServicePhotosMutation,
} from "../../services/api/servicesApi"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface StarmapObject {
  id: string
  code: string
  designation: string
  name: null | string
  star_system_id: string
  status: string
  type: string
  star_system: {
    id: string
    code: string
    name: null | string
    type: string
  }
}

export interface ServiceFormState {
  service_name: string
  service_description: string
  title: string
  rush: boolean
  description: string
  type: string
  collateral: number
  estimate: number
  offer: number
  payment_type: PaymentType
  departure: StarmapObject | null
  departureInput: string
  departChangeTimer: number
  destination: StarmapObject | null
  destinationInput: string
  destChangeTimer: number
  status: string
  photos: string[]
}

const INITIAL_STATE: ServiceFormState = {
  service_name: "",
  service_description: "",
  title: "",
  rush: false,
  description: "",
  type: "",
  collateral: 0,
  estimate: 0,
  offer: 0,
  payment_type: "one-time",
  departure: null,
  departureInput: "",
  departChangeTimer: Date.now(),
  destination: null,
  destinationInput: "",
  destChangeTimer: Date.now(),
  status: "active",
  photos: [],
}

export function useCreateServiceForm(service?: Service) {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const [state, setState] = useState<ServiceFormState>({ ...INITIAL_STATE })
  const issueAlert = useAlertHook()
  const navigate = useNavigate()

  const [departSuggest, setDepartSuggest] = useState<StarmapObject[]>([])
  const [destSuggest, setDestSuggest] = useState<StarmapObject[]>([])
  const [departTarget, setDepartTarget] = useState("")
  const [destTarget, setDestTarget] = useState("")
  const [departTargetObject, setDepartTargetObject] = useState<StarmapObject | null>(null)
  const [destTargetObject, setDestTargetObject] = useState<StarmapObject | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Populate form when editing existing service
  useEffect(() => {
    if (service) {
      setState({
        ...service,
        estimate: 0,
        departure: null,
        departureInput: "",
        departChangeTimer: Date.now(),
        destination: null,
        destinationInput: "",
        destChangeTimer: Date.now(),
        type: service.kind,
        offer: service.cost || 0,
        payment_type: service.payment_type || "one-time",
      })
    }
  }, [service])

  useEffect(() => {
    if (service?.photos) {
      setState((prev) => ({ ...prev, photos: service!.photos }))
    }
  }, [service?.photos])

  // Starmap suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) return []
    const result = await store.dispatch(
      starmapApi.endpoints.searchStarmap.initiate({ query }),
    )
    if (!result.data) return []
    const data = result.data as any
    const extended: StarmapObject[] = []
    await Promise.all(
      (data.objects?.resultset || data.results || []).map(async (obj: StarmapObject) => {
        if (obj.type === "SATELLITE") {
          const planetNum = obj.designation.replace(/\D/g, "")
          const planetDes = `${obj.star_system.name} ${romanize(parseInt(planetNum))}`
          extended.push(...(await getSuggestions(planetDes)))
        }
      }),
    )
    extended.push(...(data.objects?.resultset || data.results || []))
    return extended
  }, [])

  const retrieveDepart = useMemo(
    () => throttle(async (query: string) => setDepartSuggest(await getSuggestions(query)), 400),
    [getSuggestions],
  )
  const retrieveDest = useMemo(
    () => throttle(async (query: string) => setDestSuggest(await getSuggestions(query)), 400),
    [getSuggestions],
  )

  useEffect(() => { retrieveDepart(departTarget) }, [departTarget, retrieveDepart])
  useEffect(() => { retrieveDest(destTarget) }, [destTarget, retrieveDest])

  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
  }, [])

  // Mutations
  const [createService] = useCreateServiceMutation()
  const [updateService] = useUpdateServiceMutation()
  const [uploadServicePhotos, { isLoading: isUploadingPhotos }] = useUploadServicePhotosMutation()

  const submitService = useCallback(async () => {
    const allPhotos = [...state.photos]

    if (service) {
      const serviceId = service.service_id
      updateService({
        service_id: serviceId,
        body: {
          service_name: state.service_name,
          service_description: state.service_description,
          title: state.title,
          rush: state.rush,
          description: state.description,
          kind: state.type,
          collateral: state.collateral,
          departure: departTargetObject ? departTargetObject.code : null,
          destination: destTargetObject ? destTargetObject.code : null,
          cost: state.offer,
          payment_type: state.payment_type,
          contractor: currentOrg?.spectrum_id,
          status: state.status,
          photos: allPhotos,
        },
      })
        .unwrap()
        .then(async () => {
          if (uploadedFiles.length > 0) {
            uploadServicePhotos({ service_id: serviceId, photos: uploadedFiles })
              .unwrap()
              .then(() => setUploadedFiles([]))
              .catch((err) => issueAlert(err))
          }
          setState({ ...INITIAL_STATE })
          issueAlert({ message: t("CreateServiceForm.alert.submitted"), severity: "success" })
          navigate("/order/services")
        })
        .catch((err) => issueAlert(err))
    } else {
      createService({
        service_name: state.service_name,
        service_description: state.service_description,
        title: state.title,
        rush: state.rush,
        description: state.description,
        kind: state.type,
        collateral: state.collateral,
        departure: departTargetObject ? departTargetObject.code : null,
        destination: destTargetObject ? destTargetObject.code : null,
        cost: state.offer,
        payment_type: state.payment_type,
        contractor: currentOrg?.spectrum_id,
        status: state.status,
        photos: allPhotos,
      })
        .unwrap()
        .then(async (result) => {
          const serviceId = (result as any).service_id
          if (uploadedFiles.length > 0) {
            uploadServicePhotos({ service_id: serviceId, photos: uploadedFiles })
              .unwrap()
              .catch((err) => issueAlert(err))
          }
          setState({ ...INITIAL_STATE })
          setUploadedFiles([])
          issueAlert({ message: t("CreateServiceForm.alert.submitted"), severity: "success" })
          navigate(`/order/service/${serviceId}/edit`)
        })
        .catch((err) => issueAlert(err))
    }
  }, [
    createService, currentOrg?.spectrum_id, departTargetObject, destTargetObject,
    service, issueAlert, state, uploadedFiles, updateService, uploadServicePhotos, t, navigate,
  ])

  const removePendingFile = useCallback((file: File) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== file))
  }, [])

  return {
    state, setState,
    departSuggest, destSuggest,
    departTarget, setDepartTarget,
    destTarget, setDestTarget,
    departTargetObject, setDepartTargetObject,
    destTargetObject, setDestTargetObject,
    uploadedFiles, handleFileUpload, removePendingFile,
    isUploadingPhotos,
    submitService,
    issueAlert,
  }
}

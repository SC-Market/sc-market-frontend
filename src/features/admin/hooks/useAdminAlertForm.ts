import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useCreateAdminAlertMutation } from "../../../store/api/v2/admin-overrides"
import {
  useUpdateAdminAlertMutation,
  type AdminAlert,
  type AdminAlertChannel,
  type AdminAlertTargetType,
} from "../../../store/api/v2/market"
import { useSearchContractorsQuery } from "../../contractor/api/contractorApi"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import type { MinimalContractor } from "../../contractor/domain/types"
import { ADMIN_PATHS } from "../../../routes/paths"

export const ALERT_TARGET_TYPES: readonly AdminAlertTargetType[] = [
  "all_users",
  "org_members",
  "org_owners",
  "admins_only",
  "specific_org",
]

/** The editable fields of an alert. */
export interface AdminAlertFormData {
  title: string
  content: string
  link: string | null
  target_type: AdminAlertTargetType
  target_spectrum_id: string | null
  active: boolean
}

const EMPTY_FORM: AdminAlertFormData = {
  title: "",
  content: "",
  link: null,
  target_type: "all_users",
  target_spectrum_id: null,
  active: true,
}

/** New alerts: in-app + push; email and Discord DM unchecked. */
export const DEFAULT_ALERT_CHANNELS: AdminAlertChannel[] = ["in_app", "push"]

function validateUrl(url: string): boolean {
  if (!url || url.trim() === "") return true
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}

function formFrom(alert: AdminAlert): AdminAlertFormData {
  return {
    title: alert.title,
    content: alert.content,
    link: alert.link,
    target_type: alert.target_type,
    target_spectrum_id: alert.target_spectrum_id,
    active: alert.active,
  }
}

/**
 * Admin › Alerts › New / Edit: the form state and its submit. Without an
 * `alert` it creates (and sends) a new alert; with one it saves the edits.
 * Either way it returns to the alerts list when saved.
 */
export function useAdminAlertForm(alert?: AdminAlert) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const isEdit = alert !== undefined

  const [formData, setFormData] = useState<AdminAlertFormData>(() =>
    alert ? formFrom(alert) : { ...EMPTY_FORM },
  )
  const [channels, setChannels] = useState<AdminAlertChannel[]>([
    ...DEFAULT_ALERT_CHANNELS,
  ])
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false)
  const [linkError, setLinkError] = useState("")
  const [contractorError, setContractorError] = useState("")
  const [contractorSearchQuery, setContractorSearchQuery] = useState("")
  const [selectedContractor, setSelectedContractor] =
    useState<MinimalContractor | null>(null)

  const [createAlert, { isLoading: isCreating }] = useCreateAdminAlertMutation()
  const [updateAlert, { isLoading: isUpdating }] = useUpdateAdminAlertMutation()

  const { data: contractorOptions = [], isLoading: isSearchingContractors } =
    useSearchContractorsQuery(
      { query: contractorSearchQuery },
      { skip: contractorSearchQuery.length < 3 },
    )

  const handleLinkChange = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      const newLink = trimmed === "" ? null : trimmed
      setFormData((prev) => ({ ...prev, link: newLink }))
      setLinkError(
        newLink && !validateUrl(newLink)
          ? t(
              "admin.alerts.validation.invalidUrl",
              "Please enter a valid URL (http:// or https://)",
            )
          : "",
      )
    },
    [t],
  )

  const handleContractorChange = useCallback(
    (contractor: MinimalContractor | null) => {
      setSelectedContractor(contractor)
      setFormData((prev) => ({
        ...prev,
        target_spectrum_id: contractor?.spectrum_id || null,
      }))
      if (contractor) setContractorError("")
    },
    [],
  )

  const handleTargetTypeChange = useCallback((value: string) => {
    const targetType = ALERT_TARGET_TYPES.find((type) => type === value)
    if (!targetType) return
    setFormData((prev) => ({
      ...prev,
      target_type: targetType,
      ...(targetType !== "specific_org" ? { target_spectrum_id: null } : {}),
    }))
    if (targetType !== "specific_org") {
      setSelectedContractor(null)
      setContractorError("")
    }
  }, [])

  const done = useCallback(
    (message: string) => {
      issueAlert({ message, severity: "success" })
      navigate(ADMIN_PATHS.alerts)
    },
    [issueAlert, navigate],
  )

  /**
   * Create or save. Emailing all users asks for a confirmation first
   * (`confirmed` after it).
   */
  const handleSubmit = useCallback(
    (confirmed: boolean = false) => {
      if (linkError) return
      if (
        formData.target_type === "specific_org" &&
        !formData.target_spectrum_id
      ) {
        setContractorError(
          t("admin.alerts.contractorRequired", "Please select a contractor"),
        )
        return
      }
      if (alert) {
        updateAlert({
          alertId: alert.alert_id,
          adminAlertUpdateRequest: formData,
        })
          .unwrap()
          .then(() => done(t("admin.alerts.updated", "Alert updated")))
          .catch((err: UnwrappedErrorInterface) => issueAlert(err))
        return
      }
      const emailAll =
        formData.target_type === "all_users" && channels.includes("email")
      if (emailAll && !confirmed) {
        setConfirmEmailOpen(true)
        return
      }
      setConfirmEmailOpen(false)
      const { title, content, link, target_type, target_spectrum_id } = formData
      createAlert({
        adminAlertCreateRequest: {
          title,
          content,
          link,
          target_type,
          target_spectrum_id,
          channels,
          ...(emailAll ? { confirm_email_all_users: true } : {}),
        },
      })
        .unwrap()
        .then(() => done(t("admin.alerts.created", "Alert created")))
        .catch((err: UnwrappedErrorInterface) => issueAlert(err))
    },
    [
      alert,
      formData,
      channels,
      linkError,
      createAlert,
      updateAlert,
      issueAlert,
      done,
      t,
    ],
  )

  const isSaving = isCreating || isUpdating
  const canSubmit =
    !isSaving &&
    !!formData.title &&
    !!formData.content &&
    !linkError &&
    !contractorError

  return {
    isEdit,
    formData,
    setFormData,
    channels,
    setChannels,
    confirmEmailOpen,
    setConfirmEmailOpen,
    linkError,
    handleLinkChange,
    contractorError,
    contractorSearchQuery,
    setContractorSearchQuery,
    selectedContractor,
    contractorOptions,
    isSearchingContractors,
    handleContractorChange,
    handleTargetTypeChange,
    isSaving,
    canSubmit,
    handleSubmit,
  }
}

/** Everything useAdminAlertForm returns. */
export type AdminAlertFormState = ReturnType<typeof useAdminAlertForm>

import { useState, useCallback, useMemo } from "react"
import {
  useGetAdminAlertsQuery,
  useCreateAdminAlertMutation,
  useUpdateAdminAlertMutation,
  useDeleteAdminAlertMutation,
} from "../api/adminApi"
import { useSearchContractorsQuery } from "../../contractor/api/contractorApi"
import { useAlertHook, type UnwrappedErrorInterface } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import type { AdminAlert, AdminAlertCreate } from "../../../datatypes/AdminAlert"
import type { MinimalContractor } from "../../contractor/domain/types"

const INITIAL_FORM: AdminAlertCreate = {
  title: "",
  content: "",
  link: null,
  target_type: "all_users",
  target_spectrum_id: null,
}

function validateUrl(url: string): boolean {
  if (!url || url.trim() === "") return true
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}

export function useAdminAlerts() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [targetTypeFilter, setTargetTypeFilter] = useState<
    "all_users" | "org_members" | "org_owners" | "admins_only" | "specific_org" | ""
  >("")
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const { data: alertsData, isLoading, error } = useGetAdminAlertsQuery({
    page: page - 1, pageSize,
    target_type: targetTypeFilter || undefined,
    active: activeFilter !== null ? activeFilter : undefined,
  })

  const [createAlertMut, { isLoading: isCreating }] = useCreateAdminAlertMutation()
  const [updateAlertMut, { isLoading: isUpdating }] = useUpdateAdminAlertMutation()
  const [deleteAlertMut, { isLoading: isDeleting }] = useDeleteAdminAlertMutation()

  // Form state
  const [formData, setFormData] = useState<AdminAlertCreate>({ ...INITIAL_FORM })
  const [linkError, setLinkError] = useState("")
  const [contractorError, setContractorError] = useState("")
  const [contractorSearchQuery, setContractorSearchQuery] = useState("")
  const [selectedContractor, setSelectedContractor] = useState<MinimalContractor | null>(null)

  const { data: contractorOptions = [], isLoading: isSearchingContractors } =
    useSearchContractorsQuery({ query: contractorSearchQuery }, { skip: contractorSearchQuery.length < 3 })

  const handleLinkChange = useCallback((value: string) => {
    const trimmed = value.trim()
    const newLink = trimmed === "" ? null : trimmed
    setFormData((prev) => ({ ...prev, link: newLink }))
    setLinkError(newLink && !validateUrl(newLink) ? t("admin.alerts.validation.invalidUrl", "Please enter a valid URL (http:// or https://)") : "")
  }, [t])

  const handleContractorChange = useCallback((contractor: MinimalContractor | null) => {
    setSelectedContractor(contractor)
    setFormData((prev) => ({ ...prev, target_spectrum_id: contractor?.spectrum_id || null }))
    if (contractor) setContractorError("")
  }, [])

  const handleTargetTypeChange = useCallback((targetType: string) => {
    setFormData((prev) => ({ ...prev, target_type: targetType as AdminAlertCreate["target_type"], ...(targetType !== "specific_org" ? { target_spectrum_id: null } : {}) }))
    if (targetType !== "specific_org") { setSelectedContractor(null); setContractorError("") }
  }, [])

  const resetForm = useCallback(() => {
    setFormData({ ...INITIAL_FORM })
    setLinkError(""); setContractorError("")
    setSelectedContractor(null); setContractorSearchQuery("")
  }, [])

  const handleOpenCreateModal = useCallback(() => { resetForm(); setIsCreateModalOpen(true) }, [resetForm])

  const handleOpenEditModal = useCallback((alert: AdminAlert) => {
    setSelectedAlert(alert)
    setFormData({ title: alert.title, content: alert.content, link: alert.link, target_type: alert.target_type, target_spectrum_id: alert.target_spectrum_id })
    setLinkError(""); setContractorError(""); setSelectedContractor(null); setContractorSearchQuery("")
    setIsEditModalOpen(true)
  }, [])

  const handleOpenDeleteModal = useCallback((alert: AdminAlert) => { setSelectedAlert(alert); setIsDeleteModalOpen(true) }, [])

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false); setIsEditModalOpen(false); setIsDeleteModalOpen(false)
    setSelectedAlert(null); resetForm()
  }, [resetForm])

  const handleCreateAlert = useCallback(() => {
    if (linkError) return
    if (formData.target_type === "specific_org" && !formData.target_spectrum_id) {
      setContractorError(t("admin.alerts.contractorRequired", "Please select a contractor")); return
    }
    createAlertMut(formData).unwrap()
      .then(() => { issueAlert({ message: t("admin.alerts.created", "Alert created successfully"), severity: "success" }); handleCloseModals() })
      .catch((err: UnwrappedErrorInterface) => issueAlert(err))
  }, [formData, linkError, createAlertMut, issueAlert, handleCloseModals, t])

  const handleUpdateAlert = useCallback(() => {
    if (!selectedAlert || linkError) return
    if (formData.target_type === "specific_org" && !formData.target_spectrum_id) {
      setContractorError(t("admin.alerts.contractorRequired", "Please select a contractor")); return
    }
    updateAlertMut({ alertId: selectedAlert.alert_id, data: formData }).unwrap()
      .then(() => { issueAlert({ message: t("admin.alerts.updated", "Alert updated successfully"), severity: "success" }); handleCloseModals() })
      .catch((err: UnwrappedErrorInterface) => issueAlert(err))
  }, [selectedAlert, formData, linkError, updateAlertMut, issueAlert, handleCloseModals, t])

  const handleDeleteAlert = useCallback(() => {
    if (!selectedAlert) return
    deleteAlertMut(selectedAlert.alert_id).unwrap()
      .then(() => { issueAlert({ message: t("admin.alerts.deleted", "Alert deleted successfully"), severity: "success" }); handleCloseModals() })
      .catch((err: UnwrappedErrorInterface) => issueAlert(err))
  }, [selectedAlert, deleteAlertMut, issueAlert, handleCloseModals, t])

  const rows = useMemo(() => {
    if (!alertsData?.alerts) return []
    return alertsData.alerts.map((alert: AdminAlert) => ({ ...alert, id: alert.alert_id }))
  }, [alertsData?.alerts])

  return {
    // Data
    alertsData, isLoading, error, rows,
    // Pagination & filters
    page, setPage, pageSize, setPageSize,
    targetTypeFilter, setTargetTypeFilter,
    activeFilter, setActiveFilter,
    // Modals
    selectedAlert,
    isCreateModalOpen, isEditModalOpen, isDeleteModalOpen,
    handleOpenCreateModal, handleOpenEditModal, handleOpenDeleteModal, handleCloseModals,
    // Form
    formData, setFormData,
    linkError, handleLinkChange,
    contractorError, contractorSearchQuery, setContractorSearchQuery,
    selectedContractor, contractorOptions, isSearchingContractors,
    handleContractorChange, handleTargetTypeChange,
    // Actions
    isCreating, isUpdating, isDeleting,
    handleCreateAlert, handleUpdateAlert, handleDeleteAlert,
    updateAlertMut, issueAlert,
  }
}

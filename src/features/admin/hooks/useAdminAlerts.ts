import { useState, useCallback, useMemo } from "react"
import {
  useListAdminAlertsQuery,
  useDeleteAdminAlertMutation,
  type AdminAlert,
  type AdminAlertTargetType,
} from "../../../store/api/v2/market"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

/**
 * Admin › Alerts list: paging, filters and delete. Creating and editing are
 * their own pages (useAdminAlertForm).
 */
export function useAdminAlerts() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [targetTypeFilter, setTargetTypeFilter] = useState<
    AdminAlertTargetType | ""
  >("")
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const {
    data: alertsData,
    isLoading,
    error,
  } = useListAdminAlertsQuery({
    page: page - 1,
    pageSize,
    targetType: targetTypeFilter || undefined,
    active: activeFilter !== null ? activeFilter : undefined,
  })

  const [deleteAlertMut, { isLoading: isDeleting }] =
    useDeleteAdminAlertMutation()

  const handleOpenDeleteModal = useCallback((alert: AdminAlert) => {
    setSelectedAlert(alert)
    setIsDeleteModalOpen(true)
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setSelectedAlert(null)
  }, [])

  const handleDeleteAlert = useCallback(() => {
    if (!selectedAlert) return
    deleteAlertMut({ alertId: selectedAlert.alert_id })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("admin.alerts.deleted", "Alert deleted"),
          severity: "success",
        })
        handleCloseDeleteModal()
      })
      .catch((err: UnwrappedErrorInterface) => issueAlert(err))
  }, [selectedAlert, deleteAlertMut, issueAlert, handleCloseDeleteModal, t])

  const rows = useMemo(
    () =>
      (alertsData?.alerts ?? []).map((alert) => ({
        ...alert,
        id: alert.alert_id,
      })),
    [alertsData?.alerts],
  )

  return {
    alertsData,
    isLoading,
    error,
    rows,
    page,
    setPage,
    pageSize,
    setPageSize,
    targetTypeFilter,
    setTargetTypeFilter,
    activeFilter,
    setActiveFilter,
    selectedAlert,
    isDeleteModalOpen,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    isDeleting,
    handleDeleteAlert,
  }
}

/** Everything useAdminAlerts returns: list state, filters and delete. */
export type AdminAlertsState = ReturnType<typeof useAdminAlerts>

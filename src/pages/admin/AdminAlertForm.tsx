import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { Typography } from "@mui/material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminAlertFormView } from "../../views/admin/AdminAlertFormView"
import { useGetAdminAlertQuery } from "../../store/api/v2/market"
import { ADMIN_PATHS } from "../../routes/paths"

/** Admin › Alerts › New: write and send an alert. */
export function AdminAlertNew() {
  const { t } = useTranslation()
  const title = t("admin.alerts.createAlert", "Create Alert")
  return (
    <StandardPageLayout
      title={title}
      headerTitle={title}
      breadcrumbs={[
        { label: t("nav.admin"), href: "/admin" },
        {
          label: t("admin.alerts.pageTitle", "Admin Alerts"),
          href: ADMIN_PATHS.alerts,
        },
        { label: title },
      ]}
      sidebarOpen={true}
      maxWidth="md"
    >
      <AdminAlertFormView />
    </StandardPageLayout>
  )
}

/** Admin › Alerts › Edit: change an alert's text, target or active flag. */
export function AdminAlertEdit() {
  const { t } = useTranslation()
  const { alertId = "" } = useParams<{ alertId: string }>()
  const {
    data: alert,
    isLoading,
    isError,
  } = useGetAdminAlertQuery({ alertId }, { skip: !alertId })
  const title = t("admin.alerts.editAlert", "Edit Alert")
  return (
    <StandardPageLayout
      title={title}
      headerTitle={title}
      breadcrumbs={[
        { label: t("nav.admin"), href: "/admin" },
        {
          label: t("admin.alerts.pageTitle", "Admin Alerts"),
          href: ADMIN_PATHS.alerts,
        },
        { label: alert?.title ?? title },
      ]}
      sidebarOpen={true}
      maxWidth="md"
      isLoading={isLoading}
    >
      {alert ? (
        // Keyed so a different alert starts from its own values.
        <AdminAlertFormView key={alert.alert_id} alert={alert} />
      ) : (
        isError && (
          <Typography color="error">
            {t(
              "admin.alerts.notFound",
              "This alert doesn't exist or was deleted.",
            )}
          </Typography>
        )
      )}
    </StandardPageLayout>
  )
}

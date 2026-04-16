import React from "react"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminFeatureFlagsView } from "../../views/admin/AdminFeatureFlagsView"

export function AdminFeatureFlags() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("admin.featureFlags.title", "Feature Flags")}
      headerTitle={t("admin.featureFlags.title", "Feature Flags")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminFeatureFlagsView />
    </StandardPageLayout>
  )
}

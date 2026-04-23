import React from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { AdminFeatureFlagsView } from "../../views/admin/AdminFeatureFlagsView"
import { AdminFeatureFlagDetailView } from "../../views/admin/AdminFeatureFlagDetailView"

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

export function AdminFeatureFlagDetail() {
  const { flagName } = useParams<{ flagName: string }>()
  const label = (flagName || "").replace(/_/g, " ").replace(/\bv2\b/i, "V2")
  return (
    <StandardPageLayout
      title={label}
      headerTitle={label}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Feature Flags", href: "/admin/feature-flags" },
        { label },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <AdminFeatureFlagDetailView flagName={flagName!} />
    </StandardPageLayout>
  )
}

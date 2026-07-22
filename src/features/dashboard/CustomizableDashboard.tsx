/**
 * CustomizableDashboard — the flag-gated dashboard. Renders the user's saved
 * widget layout in an editable grid. This is the on-path behind the
 * `customizable_dashboard` feature flag; the legacy MemberDashboard remains the
 * off-path (see MemberDashboard.tsx).
 *
 * M2 scope: personal (user-owned) dashboard only, with the default seed layout
 * mirroring the six widgets the legacy dashboard shows. Org/shop shared
 * dashboards and the add-widget scope picker arrive in later milestones.
 */

import { useMemo, useState } from "react"
import { Box, Button, CircularProgress, Stack } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DoneIcon from "@mui/icons-material/Done"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useGetCurrentUserProfileQuery } from "../../store/api/profile"
import { useDashboardConfig } from "./useDashboardConfig"
import { DashboardGrid } from "./DashboardGrid"
import { AddWidgetButton } from "./AddWidgetGallery"
import { emptyConfig, type DashboardConfig, type DashboardOwnerRef } from "./types"

/** Default layout for a fresh personal dashboard — mirrors the legacy widgets. */
function defaultConfig(): DashboardConfig {
  return {
    version: 1,
    widgets: [
      { id: "seed-metrics", type: "order_metrics", scope: { kind: "me" }, layout: { x: 0, y: 0, w: 3, h: 4 } },
      { id: "seed-notifications", type: "notifications", scope: { kind: "me" }, layout: { x: 0, y: 4, w: 3, h: 5 } },
      { id: "seed-offers", type: "offers", scope: { kind: "me" }, layout: { x: 3, y: 0, w: 9, h: 5 } },
      { id: "seed-orders", type: "orders", scope: { kind: "me" }, layout: { x: 3, y: 5, w: 9, h: 5 } },
      { id: "seed-buy-orders", type: "matching_buy_orders", scope: { kind: "me" }, layout: { x: 3, y: 10, w: 9, h: 4 } },
      { id: "seed-trend", type: "order_trend", scope: { kind: "me" }, layout: { x: 3, y: 14, w: 9, h: 4 } },
    ],
  }
}

export function CustomizableDashboard() {
  const { t } = useTranslation()
  const { data: profile } = useGetCurrentUserProfileQuery()

  const owner = useMemo<DashboardOwnerRef>(
    () => ({ ownerType: "user", ownerId: profile?.user_id ?? "" }),
    [profile?.user_id],
  )

  const { config, isLoading, canEdit, setConfig } = useDashboardConfig(owner, {
    canEdit: true,
  })
  const [editing, setEditing] = useState(false)

  // A brand-new user with no saved layout and nothing cached gets the default
  // seed so the dashboard isn't empty on first visit.
  const effectiveConfig =
    !isLoading && config.widgets.length === 0 ? defaultConfig() : config

  const pageTitle = t("dashboard.title")

  return (
    <StandardPageLayout
      title={pageTitle}
      breadcrumbs={[{ label: pageTitle }]}
      showOrgInBreadcrumbs
      headerTitle={pageTitle}
      sidebarOpen
      maxWidth="xl"
    >
      <Box sx={{ width: "100%", px: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} justifyContent="flex-end">
          {editing && (
            <AddWidgetButton
              config={effectiveConfig}
              onConfigChange={setConfig}
            />
          )}
          {canEdit && (
            <Button
              variant={editing ? "contained" : "outlined"}
              color="secondary"
              startIcon={editing ? <DoneIcon /> : <EditIcon />}
              onClick={() => {
                // Persist the seed layout on first edit so it becomes the user's.
                if (!editing && config.widgets.length === 0) {
                  setConfig(effectiveConfig)
                }
                setEditing((v) => !v)
              }}
            >
              {editing
                ? t("dashboard.done", "Done")
                : t("dashboard.customize", "Customize")}
            </Button>
          )}
        </Stack>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DashboardGrid
            config={effectiveConfig}
            editing={editing}
            onConfigChange={setConfig}
          />
        )}
      </Box>
    </StandardPageLayout>
  )
}

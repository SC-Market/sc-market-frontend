/**
 * CustomizableDashboard — the flag-gated dashboard. Renders a saved widget layout
 * in an editable grid. This is the on-path behind the `customizable_dashboard`
 * feature flag; the legacy MemberDashboard remains the off-path.
 *
 * Owner-aware (M4): renders a personal (user) dashboard, or a shared org/shop
 * dashboard when an `owner` is supplied. For shared dashboards `canEdit` reflects
 * the viewer's permission on the owner (manage_org_details / manage_market);
 * members without it see the dashboard read-only. Scope resolution and the
 * add-widget picker are made owner-relative via DashboardOwnerProvider.
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
import { ImportExportControls } from "./ImportExportControls"
import { DashboardOwnerProvider } from "./DashboardOwnerContext"
import { emptyConfig, type DashboardConfig, type DashboardOwnerRef } from "./types"

/** Default layout for a fresh personal dashboard — mirrors the legacy widgets. */
function defaultPersonalConfig(): DashboardConfig {
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

/**
 * Default layout for a fresh shared (org/shop) dashboard. Owner-relative scopes
 * resolve to the owner, so `current_context` binds the widgets to this org/shop.
 * Personal-only widgets (matching_buy_orders) are omitted.
 */
function defaultSharedConfig(): DashboardConfig {
  return {
    version: 1,
    widgets: [
      { id: "seed-metrics", type: "order_metrics", scope: { kind: "current_context" }, layout: { x: 0, y: 0, w: 3, h: 4 } },
      { id: "seed-offers", type: "offers", scope: { kind: "current_context" }, layout: { x: 3, y: 0, w: 9, h: 5 } },
      { id: "seed-orders", type: "orders", scope: { kind: "current_context" }, layout: { x: 3, y: 5, w: 9, h: 5 } },
      { id: "seed-trend", type: "order_trend", scope: { kind: "current_context" }, layout: { x: 3, y: 10, w: 9, h: 4 } },
    ],
  }
}

export interface CustomizableDashboardProps {
  /** Owner of the dashboard. Omit for the current user's personal dashboard. */
  owner?: DashboardOwnerRef
  /** Whether the viewer may edit. Defaults to true for personal dashboards. */
  canEdit?: boolean
  /** Page title override (e.g. "<Org> Dashboard"). */
  title?: string
}

export function CustomizableDashboard({
  owner: ownerProp,
  canEdit: canEditProp,
  title,
}: CustomizableDashboardProps = {}) {
  const { t } = useTranslation()
  const { data: profile } = useGetCurrentUserProfileQuery(undefined, {
    skip: !!ownerProp,
  })

  const owner = useMemo<DashboardOwnerRef>(
    () =>
      ownerProp ?? { ownerType: "user", ownerId: profile?.user_id ?? "" },
    [ownerProp, profile?.user_id],
  )

  const isPersonal = owner.ownerType === "user"
  const canEdit = canEditProp ?? isPersonal

  const { config, isLoading, setConfig } = useDashboardConfig(owner, { canEdit })
  const [editing, setEditing] = useState(false)

  // A dashboard with no saved layout and nothing cached gets a default seed so
  // it isn't empty on first visit. Shared dashboards seed only for editors.
  const defaultConfig = isPersonal ? defaultPersonalConfig : defaultSharedConfig
  const effectiveConfig =
    !isLoading && config.widgets.length === 0 && (isPersonal || canEdit)
      ? defaultConfig()
      : config

  const pageTitle = title ?? t("dashboard.title")

  return (
    <DashboardOwnerProvider value={owner}>
      <StandardPageLayout
        title={pageTitle}
        breadcrumbs={[{ label: pageTitle }]}
        showOrgInBreadcrumbs={isPersonal}
        headerTitle={pageTitle}
        sidebarOpen
        maxWidth="xl"
      >
        <Box sx={{ width: "100%", px: 1 }}>
          {canEdit && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 2 }}
              justifyContent="flex-end"
            >
              {editing && (
                <>
                  <AddWidgetButton
                    config={effectiveConfig}
                    onConfigChange={setConfig}
                  />
                  <ImportExportControls
                    config={effectiveConfig}
                    name={pageTitle}
                    onImport={setConfig}
                  />
                </>
              )}
              <Button
                variant={editing ? "contained" : "outlined"}
                color="secondary"
                startIcon={editing ? <DoneIcon /> : <EditIcon />}
                onClick={() => {
                  // Persist the seed layout on first edit so it becomes saved.
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
            </Stack>
          )}

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DashboardGrid
              config={effectiveConfig}
              editing={editing && canEdit}
              onConfigChange={setConfig}
            />
          )}
        </Box>
      </StandardPageLayout>
    </DashboardOwnerProvider>
  )
}

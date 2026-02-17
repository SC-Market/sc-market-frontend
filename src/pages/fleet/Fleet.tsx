import React, { lazy } from "react"
import { Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { usePageFleet } from "../../features/fleet"
import { FleetPageSkeleton } from "../../features/fleet/components/FleetSections.skeleton"

const Ships = lazy(() =>
  import("../../views/fleet/Ships").then((module) => ({
    default: module.Ships,
  })),
)
const ActiveDeliveries = lazy(() =>
  import("../../views/fleet/ActiveDeliveries").then((module) => ({
    default: module.ActiveDeliveries,
  })),
)

export function Fleet() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const pageData = usePageFleet()

  return (
    <StandardPageLayout
      title={t("fleet.fleetTitle")}
      headerTitle={t("fleet.fleetTitle")}
      sidebarOpen={true}
      maxWidth="xxl"
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<FleetPageSkeleton />}
    >
      {pageData.data && (
        <Grid container spacing={theme.layoutSpacing.layout * 4}>
          <Grid item xs={12} xl={5}>
            <LazySection component={Ships} skeleton={() => null} />
          </Grid>
          <Grid item xs={12} xl={7}>
            <LazySection component={ActiveDeliveries} skeleton={() => null} />
          </Grid>
        </Grid>
      )}
    </StandardPageLayout>
  )
}

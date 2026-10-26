/**
 * Route skeleton for the personal customizable dashboard (/dashboard/overview):
 * CustomizableDashboard's page frame (breadcrumb, title, Customize button)
 * around the seed layout's grid skeleton, which is also what the page itself
 * shows while the saved layout loads.
 */
import { Box, Skeleton } from "@mui/material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { DashboardGridSkeleton } from "./DashboardGridSkeleton"
import { defaultPersonalConfig } from "./defaultConfigs"

export function DashboardPageSkeleton() {
  const { t } = useTranslation()
  const isPhone = useBreakpointDown("sm")
  const pageTitle = t("dashboard.title")

  return (
    <StandardPageLayout
      noFooter
      title={pageTitle}
      breadcrumbs={[{ label: pageTitle }]}
      headerTitle={pageTitle}
      headerActions={
        isPhone ? undefined : (
          // The outlined "Customize" button
          <Skeleton
            variant="rounded"
            width={128}
            height={36.5}
            sx={{ borderRadius: 1 }}
          />
        )
      }
      sidebarOpen
      maxWidth="xl"
    >
      <Box sx={{ width: "100%" }}>
        <DashboardGridSkeleton
          config={defaultPersonalConfig()}
          stacked={isPhone}
        />
      </Box>
    </StandardPageLayout>
  )
}

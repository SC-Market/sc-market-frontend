import React from "react"
import { Link as RouterLink } from "react-router-dom"
import { Button, Grid } from "@mui/material"
import { LockOutlined } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { EmptyState } from "../empty-states"
import { ContainerGrid } from "../layout/ContainerGrid"
import { usePageReady } from "../metadata/PageReady"
import { ORG_PATHS } from "../../routes/paths"

/** The org area an OrgAdminRoute guards; picks the empty state's wording. */
export type OrgAdminArea = "recruiting" | "orders" | "money" | "settings"

/**
 * Shown by OrgAdminRoute when the current org loaded but the user's roles
 * don't grant the area's permission: says so and links back to the org page.
 * Nothing to load, so the page is ready on mount. Keeps the route's own
 * fallback title (no <Page title>), like NoCurrentOrg.
 */
export function NoOrgPermission(props: {
  area: OrgAdminArea
  org: { spectrum_id: string; name: string }
}) {
  const { area, org } = props
  usePageReady(false)
  const { t } = useTranslation()

  return (
    <ContainerGrid sidebarOpen maxWidth="md">
      <Grid item xs={12}>
        <EmptyState
          title={t(`emptyStates.noOrgPermission.titles.${area}`)}
          description={t("emptyStates.noOrgPermission.description")}
          icon={<LockOutlined />}
        >
          <Button
            component={RouterLink}
            to={ORG_PATHS.profile(org.spectrum_id)}
            variant="contained"
            size="large"
          >
            {t("emptyStates.noOrgPermission.backToOrg", { org: org.name })}
          </Button>
        </EmptyState>
      </Grid>
    </ContainerGrid>
  )
}

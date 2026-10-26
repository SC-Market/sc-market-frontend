import React from "react"
import { Link as RouterLink } from "react-router-dom"
import { Button, Grid, Stack } from "@mui/material"
import { BusinessOutlined } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { EmptyState } from "../empty-states"
import { ContainerGrid } from "../layout/ContainerGrid"
import { usePageReady } from "../metadata/PageReady"
import { PATHS } from "../../routes/paths"

/**
 * Shown by the org-only route guards when there is no current org: points to
 * the org picker and the org directory. Nothing to load, so the page is ready
 * on mount. Keeps the route's own fallback title (no <Page title>).
 */
export function NoCurrentOrg() {
  usePageReady(false)
  const { t } = useTranslation()

  return (
    <ContainerGrid sidebarOpen maxWidth="md">
      <Grid item xs={12}>
        <EmptyState
          title={t("emptyStates.noOrg.title")}
          description={t("emptyStates.noOrg.description")}
          icon={<BusinessOutlined />}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={RouterLink}
              to={PATHS.myOrgs}
              variant="contained"
              size="large"
            >
              {t("emptyStates.noOrg.myOrgs")}
            </Button>
            <Button
              component={RouterLink}
              to={PATHS.contractors}
              variant="outlined"
              size="large"
            >
              {t("emptyStates.noOrg.browseOrgs")}
            </Button>
          </Stack>
        </EmptyState>
      </Grid>
    </ContainerGrid>
  )
}

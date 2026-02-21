import React from "react"
import { Navigate } from "react-router-dom"
import { Grid } from "@mui/material"
import { AuthenticateRSI } from "../../views/authentication/AuthenticateRSI"
import { AuthenticateRSISkeleton } from "../../views/authentication/AuthenticateRSI.skeleton"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageAuthenticateRSI } from "../../features/authentication/hooks/usePageAuthenticateRSI"

export function AuthenticateRSIPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { isRSIConfirmed, identifier } = usePageAuthenticateRSI()

  if (isRSIConfirmed) {
    return <Navigate to="/dashboard" />
  }

  return (
    <StandardPageLayout
      title={t("login.accountLink")}
      headerTitle={t("login.authenticateWithRSI")}
      maxWidth="xl"
      noSidebar
      isLoading={identifier.isLoading}
      skeleton={
        <Grid item xs={12} lg={4}>
          <Grid
            container
            spacing={theme.layoutSpacing.layout * 4}
            alignItems="flex-start"
          >
            <AuthenticateRSISkeleton />
          </Grid>
        </Grid>
      }
    >
      <Grid item xs={12} lg={4}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout * 4}
          alignItems="flex-start"
        >
          {identifier.data?.identifier && (
            <AuthenticateRSI identifier={identifier.data.identifier} />
          )}
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}

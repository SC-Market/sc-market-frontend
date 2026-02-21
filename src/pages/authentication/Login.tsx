import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React from "react"
import { Authenticate } from "../../views/authentication/Authenticate"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import {
  useGetUserProfileQuery,
  useGetAuthenticatorIdentifier,
} from "../../store/profile"
import { Navigate } from "react-router-dom"
import { LoginInfoPanel } from "./LoginInfoPanel"
import { Grid } from "@mui/material"
import { RegisterShip } from "../../views/fleet/RegisterShip"
import { DashNotificationArea } from "../../views/notifications/DashNotificationArea"
import { AuthenticateRSI } from "../../views/authentication/AuthenticateRSI"
import { AuthenticateRSISkeleton } from "../../views/authentication/AuthenticateRSI.skeleton"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function Login() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const profile = useGetUserProfileQuery()
  const identifier = useGetAuthenticatorIdentifier()

  return (
    <Page title={t("login.title", "Login")}>
      <ContainerGrid
        maxWidth={"xl"}
        sidebarOpen={true}
        noTopSpacer
        sx={{ paddingTop: 0 }}
      >
        {!profile.isLoading && !profile.error && <Navigate to={"/dashboard"} />}
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout * 4}
        >
          <LoginInfoPanel />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Grid
            container
            spacing={theme.layoutSpacing.layout * 4}
            alignItems={"flex-start"}
          >
            <HeaderTitle>{t("login.title")}</HeaderTitle>
            {identifier.isLoading || !identifier.data?.identifier ? (
              <AuthenticateRSISkeleton />
            ) : (
              <AuthenticateRSI identifier={identifier.data.identifier} />
            )}
          </Grid>
        </Grid>

        <RegisterShip />
        <DashNotificationArea />
      </ContainerGrid>
    </Page>
  )
}

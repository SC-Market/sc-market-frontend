import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React from "react"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useGetUserProfileQuery } from "../../store/profile"
import { Navigate } from "react-router-dom"
import { Grid } from "@mui/material"
import { AuthenticateRSI } from "../../views/authentication/AuthenticateRSI"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"

export function AuthenticateRSIPage() {
  const { t } = useTranslation()
  const profile = useGetUserProfileQuery()

  return (
    <Page title={t("login.accountLink")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={false}>
        {profile.data?.rsi_confirmed && <Navigate to={"/dashboard"} />}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={4} alignItems={"flex-start"}>
            <HeaderTitle>{t("login.authenticateWithRSI")}</HeaderTitle>
            <AuthenticateRSI />
          </Grid>
        </Grid>
      </ContainerGrid>
    </Page>
  )
}

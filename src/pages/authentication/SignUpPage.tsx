import React from "react"
import { Navigate } from "react-router-dom"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { SignUpArea } from "../../views/authentication/SignUpArea"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"

export function SignUpPage() {
  const { t } = useTranslation()
  const profile = useGetUserProfileQuery()

  if (profile.data) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Page title={t("auth.signUpTitle", "Sign up for SC Market")}>
      <ContainerGrid
        maxWidth="sm"
        sidebarOpen={false}
        noFooter
        noTopSpacer
        GridProps={{
          sx: {
            minHeight: "calc(100vh - 64px)",
            alignItems: "center",
          },
        }}
        sx={{
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <SignUpArea />
      </ContainerGrid>
    </Page>
  )
}

import React from "react"
import { Navigate } from "react-router-dom"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { SignUpArea } from "../../views/authentication/SignUpArea"
import { usePageSignUp } from "../../features/authentication/hooks/usePageSignUp"
import { useTranslation } from "react-i18next"
import { Grid } from "@mui/material"

export function SignUpPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading, errorMessage, clearError } = usePageSignUp()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <FormPageLayout
      title={t("auth.signUpTitle", "Sign up for SC Market")}
      formTitle="" // Empty title since SignUpArea has its own title
      maxWidth="sm"
      noFooter
      noSidebar
      noTopSpacer
      isLoading={isLoading}
      GridProps={{
        sx: {
          minHeight: "calc(100vh - 64px)",
          alignItems: "center",
        },
      }}
      ContainerProps={{
        sx: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      }}
    >
      <Grid item xs={12}>
        <SignUpArea errorMessage={errorMessage} onClearError={clearError} />
      </Grid>
    </FormPageLayout>
  )
}

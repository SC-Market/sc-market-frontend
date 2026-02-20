import React from "react"
import { Navigate } from "react-router-dom"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { SignInArea } from "../../views/authentication/SignInArea"
import { usePageLogin } from "../../features/authentication/hooks/usePageLogin"
import { useTranslation } from "react-i18next"
import { Grid } from "@mui/material"

export function LoginPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading, errorMessage, clearError } =
    usePageLogin()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <FormPageLayout
      title={t("auth.signInTitle", "Sign in to SC Market")}
      formTitle=""
      maxWidth="sm"
      isLoading={isLoading}
      GridProps={{
        sx: {
          minHeight: "calc(100vh - 64px)",
          alignItems: "center",
        },
      }}
    >
      <Grid item xs={12}>
        <SignInArea errorMessage={errorMessage} onClearError={clearError} />
      </Grid>
    </FormPageLayout>
  )
}

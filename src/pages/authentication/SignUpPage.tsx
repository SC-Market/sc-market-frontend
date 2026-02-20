import React from "react"
import { Navigate } from "react-router-dom"
import { Page } from "../../components/metadata/Page"
import { SignUpArea } from "../../views/authentication/SignUpArea"
import { usePageSignUp } from "../../features/authentication/hooks/usePageSignUp"
import { useTranslation } from "react-i18next"
import { Container, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Footer } from "../../components/footer/Footer"

export function SignUpPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { isAuthenticated, isLoading, errorMessage, clearError } =
    usePageSignUp()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Page title={t("auth.signUpTitle", "Sign up for SC Market")}>
      <main
        style={{
          flexGrow: 1,
          overflow: "auto",
          height: "100%",
          position: "relative",
        }}
      >
        {/* Top spacer for navbar */}
        <div style={{ ...theme.mixins.toolbar }} />

        {/* Form content in small container */}
        <Container
          maxWidth="sm"
          sx={{
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(4),
            minHeight: "calc(100vh - 200px)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <SignUpArea errorMessage={errorMessage} onClearError={clearError} />
            </Grid>
          </Grid>
        </Container>

        {/* Footer in large container */}
        <Container maxWidth="lg">
          <Grid container>
            <Footer />
          </Grid>
        </Container>
      </main>
    </Page>
  )
}

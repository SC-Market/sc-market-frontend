import React from "react"
import { Button, Divider, Grid, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { RefreshRounded, ArrowBackRounded } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function ErrorPageBody() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const handleRetry = () => {
    // Full page reload to avoid getting stuck in error loops
    window.location.reload()
  }

  const handleGoBack = () => {
    // Navigate back to the errored page
    navigate(location.pathname)
  }

  return (
    <>
      <Grid item xs={12}>
        <Typography
          variant={"h3"}
          sx={{ fontWeight: "bold" }}
          color={"text.secondary"}
          align={"center"}
        >
          {t("errorPage.title", "Something went wrong")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"subtitle2"}
          color={"text.primary"}
          align={"center"}
        >
          {t(
            "errorPage.subtitle",
            "We encountered an error while loading this page. This could be due to a temporary server issue or network problem.",
          )}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm="auto">
            <Button
              color={"primary"}
              variant={"contained"}
              size={"large"}
              fullWidth
              startIcon={<RefreshRounded />}
              onClick={handleRetry}
            >
              {t("errorPage.retry", "Try Again")}
            </Button>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              color={"secondary"}
              variant={"outlined"}
              size={"large"}
              fullWidth
              startIcon={<ArrowBackRounded />}
              onClick={handleGoBack}
            >
              {t("errorPage.goBackToPage", "Go Back to Page")}
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography
          variant={"body2"}
          color={"text.secondary"}
          align={"center"}
          sx={{ mt: 2 }}
        >
          {t("errorPage.path", "Page")}: <code>{location.pathname}</code>
        </Typography>
      </Grid>
    </>
  )
}

export function ErrorPage() {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      title={t("errorPage.pageTitle", "Error")}
      maxWidth={"md"}
      sidebarOpen={true}
      noTopSpacer={false}
    >
      <ErrorPageBody />
    </StandardPageLayout>
  )
}

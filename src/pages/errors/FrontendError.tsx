import React, { Suspense } from "react"
import { Button, Grid, Link, Typography } from "@mui/material"
import { PageFallback } from "../../components/metadata/Page"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { DISCORD_INVITE } from "../../util/constants"
import { HookProvider } from "../../hooks/HookProvider"
import { Root } from "../../components/layout/Root"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowBackRounded } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function FrontendErrorBody() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const target = searchParams.get("target")
  const message = searchParams.get("message")

  const handleGoBack = () => {
    // Navigate back to the errored page if target is available
    if (target) {
      navigate(target)
    }
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
          {t("frontendError.title")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"subtitle2"}
          color={"text.primary"}
          align={"center"}
        >
          {t("frontendError.subtitle")}{" "}
          <Link rel="noopener noreferrer" target="_blank" href={DISCORD_INVITE}>
            <UnderlineLink color={"text.secondary"}>Discord</UnderlineLink>
          </Link>{" "}
          {t("frontendError.afterRefresh")}
        </Typography>

        <Typography variant={"body2"} align={"center"}>
          {t("frontendError.page")}: <code>{target}</code>
        </Typography>
        <Typography variant={"body2"} align={"center"}>
          {t("frontendError.message")}: <code>{message}</code>
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2} justifyContent="center">
          {target && (
            <Grid item xs={12} sm="auto">
              <Button
                color={"primary"}
                variant={"contained"}
                size={"large"}
                fullWidth
                startIcon={<ArrowBackRounded />}
                onClick={handleGoBack}
              >
                {t("frontendError.goBackToPage", "Go Back to Page")}
              </Button>
            </Grid>
          )}
          <Grid item xs={12} sm="auto">
            <a
              href={"/dashboard"}
              style={{
                color: "inherit",
                textDecoration: "none",
                width: "100%",
              }}
            >
              <Button
                color={"secondary"}
                variant={"outlined"}
                size={"large"}
                fullWidth
              >
                {t("frontendError.returnToDashboard")}
              </Button>
            </a>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export function FrontendErrorPage() {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      title={t("frontendError.pageTitle")}
      maxWidth={"md"}
      sidebarOpen={true}
      noTopSpacer={false}
    >
      <FrontendErrorBody />
    </StandardPageLayout>
  )
}

export function FrontendErrorElement() {
  return (
    <HookProvider>
      <Root>
        <Suspense fallback={<PageFallback />}>
          <FrontendErrorPage />
        </Suspense>
      </Root>
    </HookProvider>
  )
}

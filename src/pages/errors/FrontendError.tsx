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

/**
 * The error page is the LAST line of defense — it must render even when i18n
 * isn't ready. This is the root errorElement, and if it renders before the i18n
 * instance has initialized (e.g. a chunk failed to load early in boot),
 * `useTranslation()` can hand back an undefined `t`, which then crashes the
 * error page itself ("can't access property, t is undefined"). Wrap it so `t`
 * is ALWAYS callable: use the real translator when available, otherwise fall
 * back to the inline English default (or the key).
 */
function useSafeTranslation() {
  const result = useTranslation()
  const realT = result?.t
  const safeT = (key: string, fallback?: string, opts?: Record<string, unknown>) => {
    if (typeof realT === "function") {
      // react-i18next: t(key, defaultValue, options)
      return fallback != null ? realT(key, fallback, opts) : realT(key, opts)
    }
    return fallback ?? key
  }
  return { t: safeT }
}

export function FrontendErrorBody() {
  const { t } = useSafeTranslation()
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
          {t("frontendError.title", "Something went wrong")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"subtitle2"}
          color={"text.primary"}
          align={"center"}
        >
          {t("frontendError.subtitle", "Something went wrong. Try refreshing, or reach us on")}{" "}
          <Link rel="noopener noreferrer" target="_blank" href={DISCORD_INVITE}>
            <UnderlineLink color={"text.secondary"}>Discord</UnderlineLink>
          </Link>{" "}
          {t("frontendError.afterRefresh", "if it keeps happening.")}
        </Typography>

        <Typography variant={"body2"} align={"center"}>
          {t("frontendError.page", "Page")}: <code>{target}</code>
        </Typography>
        <Typography variant={"body2"} align={"center"}>
          {t("frontendError.message", "Error")}: <code>{message}</code>
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
                {t("frontendError.returnToDashboard", "Return to Dashboard")}
              </Button>
            </a>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export function FrontendErrorPage() {
  const { t } = useSafeTranslation()
  return (
    <StandardPageLayout
      title={t("frontendError.pageTitle", "Something went wrong")}
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

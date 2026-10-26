import React, { Suspense } from "react"
import { Button, Grid, Link, Typography } from "@mui/material"
import { PageFallback } from "../../components/metadata/Page"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { DISCORD_INVITE } from "../../util/constants"
import { HookProvider } from "../../hooks/HookProvider"
import { Root } from "../../components/layout/Root"
import {
  useLocation,
  useNavigate,
  useRouteError,
  useSearchParams,
} from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowBackRounded, RefreshRounded } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { safeRedirectPath } from "../../util/safeRedirect"
import {
  isChunkLoadError,
  reloadForNewVersion,
} from "../../util/chunkLoadError"

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
  const safeT = (
    key: string,
    fallback?: string,
    opts?: Record<string, unknown>,
  ) => {
    if (typeof realT === "function") {
      // react-i18next: t(key, defaultValue, options)
      return fallback != null ? realT(key, fallback, opts) : realT(key, opts)
    }
    return fallback ?? key
  }
  return { t: safeT }
}

/**
 * A page chunk failed to load: the site was redeployed while this tab was open.
 * Shown in place (the URL stays on the failed page, see Page.tsx) or on an
 * /error?message=… URL saved before that change. Reload is a user click, so
 * it never loops; it loads `target` fresh, which picks up the new build.
 */
function NewVersionBody(props: { target: string | null; message: string }) {
  const { t } = useSafeTranslation()
  return (
    <>
      <Grid item xs={12}>
        <Typography
          variant={"h3"}
          sx={{ fontWeight: "bold" }}
          color={"text.secondary"}
          align={"center"}
        >
          {t(
            "frontendError.newVersionTitle",
            "A new version of SC Market is available",
          )}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"subtitle2"}
          color={"text.primary"}
          align={"center"}
        >
          {t(
            "frontendError.newVersionMessage",
            "The site was updated while this page was open. Reload to get the latest version.",
          )}
        </Typography>
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
              onClick={() => reloadForNewVersion(props.target)}
            >
              {t("frontendError.reload", "Reload")}
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant={"caption"}
          component={"p"}
          color={"text.secondary"}
          align={"center"}
        >
          <code>{props.message}</code>
        </Typography>
      </Grid>
    </>
  )
}

export function FrontendErrorBody() {
  const { t } = useSafeTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const routeError = useRouteError()

  // Rendered as the errorElement of a stale-chunk failure (kept in place by
  // Page.tsx): the failed page is the current URL.
  if (isChunkLoadError(routeError)) {
    return (
      <NewVersionBody
        target={location.pathname + location.search + location.hash}
        message={String(routeError)}
      />
    )
  }

  const target = searchParams.get("target")
  const message = searchParams.get("message")

  // An /error URL whose message is a stale chunk: offer the reload to target.
  if (!routeError && isChunkLoadError(message)) {
    return <NewVersionBody target={target} message={message ?? ""} />
  }

  const handleGoBack = () => {
    // Navigate back to the errored page if target is available
    if (target) {
      navigate(safeRedirectPath(target, "/"))
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
          {t(
            "frontendError.subtitle",
            "Something went wrong. Try refreshing, or reach us on",
          )}{" "}
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

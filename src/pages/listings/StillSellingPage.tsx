import React from "react"
import { Link as RouterLink, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { PageCard, PageCardActions } from "../../components/paper/PageCard"
import {
  useConfirmStillSellingActionMutation,
  useGetStillSellingActionQuery,
  type StillSellingActionPreview,
  type StillSellingActionResult,
} from "../../store/api/v2/market"
import { PATHS } from "../../routes/paths"
import { StillSellingFeedback } from "./StillSellingFeedback"

/** Where "Manage listings" goes when the link doesn't say (needs login). */
const FALLBACK_MANAGE = PATHS.dashboardShops

function ManageButton({ path }: { path?: string }) {
  const { t } = useTranslation()
  return (
    <Button
      variant="outlined"
      component={RouterLink}
      to={path || FALLBACK_MANAGE}
    >
      {t("stillSellingPage.manage", "Manage listings")}
    </Button>
  )
}

function Preview({
  preview,
  onConfirm,
  isConfirming,
}: {
  preview: StillSellingActionPreview
  onConfirm: () => void
  isConfirming: boolean
}) {
  const { t } = useTranslation()
  const keep = preview.action === "keep"
  const count = preview.listings_applicable
  if (count === 0) {
    return (
      <>
        <Alert severity="info">
          {keep
            ? t(
                "stillSellingPage.keepNothing",
                "Nothing to refresh: these listings were refreshed in the last day, or aren't listed any more.",
              )
            : t(
                "stillSellingPage.pauseNothing",
                "Nothing to pause: these listings are already paused or aren't listed any more.",
              )}
        </Alert>
        <PageCardActions>
          <ManageButton path={preview.manage_path} />
        </PageCardActions>
      </>
    )
  }
  const more = count - preview.listings.length
  return (
    <>
      <Typography variant="body1">
        {keep
          ? t("stillSellingPage.keepBody", { count })
          : t("stillSellingPage.pauseBody", { count })}
      </Typography>
      <Box
        component="ul"
        sx={{ m: 0, pl: 3 }}
        data-testid="still-selling-listings"
      >
        {preview.listings.map((l, i) => (
          <Typography
            component="li"
            key={i}
            variant="body2"
            color="text.secondary"
          >
            {l.title}
          </Typography>
        ))}
        {more > 0 && (
          <Typography component="li" variant="body2">
            {t("stillSellingPage.moreListings", { count: more })}
          </Typography>
        )}
      </Box>
      <PageCardActions>
        <Button
          variant="contained"
          color={keep ? "primary" : "warning"}
          onClick={onConfirm}
          disabled={isConfirming}
          startIcon={
            isConfirming ? (
              <CircularProgress size={18} color="inherit" />
            ) : undefined
          }
        >
          {keep
            ? t("stillSellingPage.keepConfirm", "Keep them live")
            : t("stillSellingPage.pauseConfirm", "Pause them")}
        </Button>
        <Button component={RouterLink} to={PATHS.home}>
          {t("stillSellingPage.notNow", "Not now")}
        </Button>
      </PageCardActions>
    </>
  )
}

function Done({
  result,
  token,
  feedbackSubmitted,
}: {
  result: StillSellingActionResult
  token: string
  feedbackSubmitted?: boolean
}) {
  const { t } = useTranslation()
  const count = result.changed
  return (
    <>
      {result.test && (
        <Alert severity="info" data-testid="still-selling-test-done">
          {t(
            "stillSellingPage.testDone",
            "Test mode: no listings were changed.",
          )}
        </Alert>
      )}
      <Alert severity="success">
        {result.action === "keep"
          ? t("stillSellingPage.keepDone", { count })
          : t("stillSellingPage.pauseDone", { count })}
      </Alert>
      {result.action && (
        <StillSellingFeedback
          token={token}
          action={result.action}
          alreadySubmitted={feedbackSubmitted}
        />
      )}
      <PageCardActions>
        <ManageButton path={result.manage_path} />
      </PageCardActions>
    </>
  )
}

/**
 * The "Keep them live" / "Pause them" buttons of the "Still selling?"
 * Discord DM land here (no login: the signed token in the link is the
 * credential). Shows what the action would do, asks to confirm, then shows
 * the result.
 */
export function StillSellingPage() {
  const { t } = useTranslation()
  const { token = "" } = useParams<{ token: string }>()
  const preview = useGetStillSellingActionQuery({ token }, { skip: !token })
  const [confirm, confirmState] = useConfirmStillSellingActionMutation()

  const result = confirmState.data
  const failed = (!!result && !result.ok) || confirmState.isError
  const linkProblem = !token
    ? "invalid"
    : preview.data && !preview.data.valid
      ? (preview.data.reason ?? "invalid")
      : result && !result.ok
        ? (result.reason ?? "invalid")
        : null

  const pageTitle = t("stillSellingPage.title", "Still selling?")
  let title: React.ReactNode = pageTitle
  let icon: React.ReactNode = undefined
  let body: React.ReactNode
  if (preview.isLoading) {
    body = (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={48} aria-busy="true" />
      </Box>
    )
  } else if (linkProblem) {
    body = (
      <>
        <Alert severity="warning">
          {linkProblem === "expired"
            ? t(
                "stillSellingPage.expired",
                "This link has expired. You can still refresh or pause your listings from your listings page.",
              )
            : t(
                "stillSellingPage.invalid",
                "This link doesn't work. It may have been copied incompletely.",
              )}
        </Alert>
        <PageCardActions>
          <ManageButton />
        </PageCardActions>
      </>
    )
  } else if (result?.ok) {
    icon = <CheckCircleIcon sx={{ color: "success.main" }} />
    body = (
      <Done
        result={result}
        token={token}
        feedbackSubmitted={preview.data?.feedback_submitted}
      />
    )
  } else if (preview.isError || !preview.data) {
    body = (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => preview.refetch()}
          >
            {t("stillSellingPage.retry", "Try again")}
          </Button>
        }
      >
        {t(
          "stillSellingPage.failed",
          "Something went wrong. Please try again.",
        )}
      </Alert>
    )
  } else {
    if (preview.data.listings_applicable > 0) {
      title =
        preview.data.action === "keep"
          ? t("stillSellingPage.keepTitle", "Keep your listings live?")
          : t("stillSellingPage.pauseTitle", "Pause your listings?")
    }
    body = (
      <>
        {failed && (
          <Alert severity="error">
            {t(
              "stillSellingPage.failed",
              "Something went wrong. Please try again.",
            )}
          </Alert>
        )}
        {preview.data.test && (
          <Alert severity="info" data-testid="still-selling-test-preview">
            {t(
              "stillSellingPage.testPreview",
              "Test mode: confirming won't change any listings.",
            )}
          </Alert>
        )}
        <Preview
          preview={preview.data}
          onConfirm={() => void confirm({ token })}
          isConfirming={confirmState.isLoading}
        />
      </>
    )
  }

  return (
    <StandardPageLayout title={pageTitle} maxWidth="sm">
      <PageCard title={title} icon={icon} data-testid="still-selling-card">
        {body}
      </PageCard>
    </StandardPageLayout>
  )
}

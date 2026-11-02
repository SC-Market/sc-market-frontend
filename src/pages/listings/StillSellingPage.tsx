import React from "react"
import { Link as RouterLink, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import {
  useConfirmStillSellingActionMutation,
  useGetStillSellingActionQuery,
  type StillSellingActionPreview,
  type StillSellingActionResult,
} from "../../store/api/v2/market"
import { PATHS } from "../../routes/paths"

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
      <Stack spacing={3} alignItems="center">
        <Alert severity="info" sx={{ maxWidth: 520 }}>
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
        <ManageButton path={preview.manage_path} />
      </Stack>
    )
  }
  const more = count - preview.listings.length
  return (
    <Stack spacing={3} alignItems="center" sx={{ maxWidth: 560 }}>
      <Typography variant="h5" component="h2">
        {keep
          ? t("stillSellingPage.keepTitle", "Keep your listings live?")
          : t("stillSellingPage.pauseTitle", "Pause your listings?")}
      </Typography>
      <Typography color="text.secondary">
        {keep
          ? t("stillSellingPage.keepBody", { count })
          : t("stillSellingPage.pauseBody", { count })}
      </Typography>
      <Box
        component="ul"
        sx={{ textAlign: "left", m: 0, pl: 3, alignSelf: "stretch" }}
        data-testid="still-selling-listings"
      >
        {preview.listings.map((l, i) => (
          <Typography component="li" key={i} variant="body2">
            {l.title}
          </Typography>
        ))}
        {more > 0 && (
          <Typography component="li" variant="body2" color="text.secondary">
            {t("stillSellingPage.moreListings", { count: more })}
          </Typography>
        )}
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
      </Stack>
    </Stack>
  )
}

function Done({ result }: { result: StillSellingActionResult }) {
  const { t } = useTranslation()
  const count = result.changed
  return (
    <Stack spacing={3} alignItems="center">
      <CheckCircleIcon sx={{ fontSize: 60, color: "success.main" }} />
      <Alert severity="success" sx={{ maxWidth: 520 }}>
        {result.action === "keep"
          ? t("stillSellingPage.keepDone", { count })
          : t("stillSellingPage.pauseDone", { count })}
      </Alert>
      <ManageButton path={result.manage_path} />
    </Stack>
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

  let body: React.ReactNode
  if (preview.isLoading) {
    body = <CircularProgress size={60} aria-busy="true" />
  } else if (linkProblem) {
    body = (
      <Stack spacing={3} alignItems="center">
        <Alert severity="warning" sx={{ maxWidth: 520 }}>
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
        <ManageButton />
      </Stack>
    )
  } else if (result?.ok) {
    body = <Done result={result} />
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
    body = (
      <Stack spacing={2} alignItems="center">
        {failed && (
          <Alert severity="error">
            {t(
              "stillSellingPage.failed",
              "Something went wrong. Please try again.",
            )}
          </Alert>
        )}
        <Preview
          preview={preview.data}
          onConfirm={() => void confirm({ token })}
          isConfirming={confirmState.isLoading}
        />
      </Stack>
    )
  }

  return (
    <StandardPageLayout
      title={t("stillSellingPage.title", "Still selling?")}
      maxWidth="sm"
      noSidebar={true}
    >
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            textAlign: "center",
          }}
        >
          {body}
        </Box>
      </Grid>
    </StandardPageLayout>
  )
}

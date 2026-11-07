import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetStillSellingCampaignQuery,
  type StillSellingLocale,
} from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"
import { useStillSellingCampaignActions } from "../../features/admin/hooks/useStillSellingCampaign"
import {
  StillSellingProgressTable,
  StillSellingSamplePreview,
} from "./StillSellingCampaignParts"
import { FeedbackSection } from "./StillSellingFeedback"
import { ConfirmDialog } from "../../components/dialog/ConfirmDialog"

/** Poll while a send runs, so the progress counts move. */
const RUNNING_POLL_MS = 10_000

function apiErrorMessage(error: unknown): string | null {
  const data = (error as { data?: unknown } | undefined)?.data as
    | { error?: { message?: string }; message?: string }
    | undefined
  return data?.error?.message ?? data?.message ?? null
}

/**
 * Admin › Market: the one-time "Still selling?" Discord DM campaign. A dry
 * run (who it would reach, a sample DM with fake data), Send (only when the
 * server's kill switch is on, after a confirm step) and live progress.
 */
export function StillSellingCampaignCard() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const [locale, setLocale] = useState<StillSellingLocale>("en")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const { data, isLoading, isError, refetch, isFetching } =
    useGetStillSellingCampaignQuery(
      { locale },
      { pollingInterval: running ? RUNNING_POLL_MS : 0 },
    )
  const { send, sendState, stop, stopState, sendTest, testState } =
    useStillSellingCampaignActions()
  const [testConfirmOpen, setTestConfirmOpen] = useState(false)

  const onSendTest = () => {
    setTestConfirmOpen(false)
    sendTest(locale)
  }

  const testError = testState.isError
    ? (apiErrorMessage(testState.error) ??
      t("adminUi.stillSelling.testFailed", "The test DM couldn't be sent."))
    : null

  React.useEffect(() => {
    setRunning(!!data?.run.running)
  }, [data?.run.running])

  const reasonLabel = (reason: string) =>
    t(`adminUi.stillSelling.reasons.${reason}`, reason)

  const onSend = async () => {
    if (!data) return
    setConfirmOpen(false)
    await send(data.recipients)
    void refetch()
  }

  const sendError = sendState.isError
    ? (apiErrorMessage(sendState.error) ??
      t("adminUi.stillSelling.sendFailed", "The campaign couldn't be started."))
    : null

  return (
    <Card
      variant="outlined"
      sx={{ mb: 2 }}
      data-testid="still-selling-campaign"
    >
      <CardContent>
        <Typography variant="h6" component="h2">
          {t("adminUi.stillSelling.title", '"Still selling?" DM campaign')}
        </Typography>
        {isLoading ? (
          <Stack spacing={1} aria-busy="true" sx={{ mt: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={28} />
            ))}
          </Stack>
        ) : isError || !data ? (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {t("adminUi.stillSelling.retry", "Retry")}
              </Button>
            }
          >
            {t(
              "adminUi.stillSelling.loadFailed",
              "The campaign couldn't be loaded.",
            )}
          </Alert>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t("adminUi.stillSelling.subtitle", {
                inactive: data.inactive_days,
                stale: data.stale_days,
              })}
            </Typography>

            <Alert
              severity={data.enabled ? "warning" : "info"}
              data-testid="still-selling-switch"
            >
              {data.enabled
                ? t("adminUi.stillSelling.switchOn", {
                    env: data.kill_switch_env,
                  })
                : t("adminUi.stillSelling.switchOff", {
                    env: data.kill_switch_env,
                  })}
            </Alert>

            <Box>
              <Typography
                variant="subtitle1"
                data-testid="still-selling-dry-run"
              >
                {t("adminUi.stillSelling.dryRun", {
                  recipients: data.recipients,
                  listings: data.listings,
                })}
              </Typography>
              <Typography variant="body2" data-testid="still-selling-breakdown">
                {t("adminUi.stillSelling.breakdown", {
                  sellers: data.sellers,
                  d30: data.listing_age.days_30_60,
                  d60: data.listing_age.days_60_90,
                  d90: data.listing_age.days_90_plus,
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("adminUi.stillSelling.throttle", {
                  batch: data.batch_size,
                  seconds: data.batch_pause_seconds,
                })}{" "}
                {t("adminUi.stillSelling.cap", {
                  cap: data.max_recipients,
                  env: data.max_recipients_env,
                })}
              </Typography>
            </Box>

            {data.over_cap && (
              <Alert severity="error" data-testid="still-selling-over-cap">
                {t("adminUi.stillSelling.overCap", {
                  recipients: data.recipients,
                  cap: data.max_recipients,
                  env: data.max_recipients_env,
                })}
              </Alert>
            )}

            {data.top_recipients.length > 0 && (
              <Box data-testid="still-selling-top">
                <Typography variant="subtitle2">
                  {t(
                    "adminUi.stillSelling.top",
                    "Largest recipients (display name · listings)",
                  )}
                </Typography>
                <Box component="ol" sx={{ m: 0, pl: 3 }}>
                  {data.top_recipients.map((r, i) => (
                    <Typography component="li" variant="body2" key={i}>
                      {r.display_name} · {r.listings}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            <StillSellingSamplePreview
              sample={data.sample}
              locale={locale}
              setLocale={setLocale}
            />

            {data.run.running ? (
              <Alert severity="info" data-testid="still-selling-running">
                {t("adminUi.stillSelling.running", {
                  sent: data.run.sent_this_run,
                  limit: data.run.limit ?? 0,
                })}
              </Alert>
            ) : data.run.finished_at && data.run.finish_reason ? (
              <Typography variant="body2" color="text.secondary">
                {t("adminUi.stillSelling.lastRun", {
                  when: fmt.dateTime(data.run.finished_at),
                  reason: reasonLabel(data.run.finish_reason),
                })}
              </Typography>
            ) : null}

            {sendError && <Alert severity="error">{sendError}</Alert>}

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="warning"
                disabled={
                  !data.enabled ||
                  data.run.running ||
                  data.recipients === 0 ||
                  data.over_cap ||
                  sendState.isLoading
                }
                onClick={() => setConfirmOpen(true)}
              >
                {t("adminUi.stillSelling.send", "Send")}
              </Button>
              {data.run.running && (
                <Button
                  variant="outlined"
                  onClick={() => void stop().then(() => refetch())}
                  disabled={stopState.isLoading}
                >
                  {t("adminUi.stillSelling.stop", "Stop")}
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => setTestConfirmOpen(true)}
                disabled={testState.isLoading}
              >
                {t("adminUi.stillSelling.sendTest", "Send test DM to me")}
              </Button>
              <Button onClick={() => refetch()} disabled={isFetching}>
                {t("adminUi.stillSelling.refresh", "Refresh")}
              </Button>
            </Stack>
            {testError && <Alert severity="error">{testError}</Alert>}
            {testState.data && !testState.isError && (
              <Alert severity="success" data-testid="still-selling-test-sent">
                {testState.data.sample
                  ? t(
                      "adminUi.stillSelling.testSentSample",
                      "Test DM sent to your Discord, with sample numbers (you have no live listings).",
                    )
                  : t(
                      "adminUi.stillSelling.testSent",
                      "Test DM sent to your Discord, with your own listing numbers.",
                    )}
              </Alert>
            )}

            <StillSellingProgressTable progress={data.progress} />

            <FeedbackSection feedback={data.feedback} />
          </Stack>
        )}
      </CardContent>

      <ConfirmDialog
        open={testConfirmOpen}
        onClose={() => setTestConfirmOpen(false)}
        title={t(
          "adminUi.stillSelling.testConfirmTitle",
          "Send a test DM to yourself?",
        )}
        message={t("adminUi.stillSelling.testConfirmBody", {
          locale,
          limit: 5,
        })}
        onConfirm={onSendTest}
        confirmLabel={t(
          "adminUi.stillSelling.testConfirmSend",
          "Send it to me",
        )}
        cancelLabel={t("adminUi.stillSelling.cancel", "Cancel")}
        maxWidth="sm"
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("adminUi.stillSelling.confirmTitle", "Send the campaign?")}
        message={t("adminUi.stillSelling.confirmBody", {
          count: data?.recipients ?? 0,
          batch: data?.batch_size ?? 0,
          seconds: data?.batch_pause_seconds ?? 0,
        })}
        onConfirm={() => void onSend()}
        confirmLabel={t("adminUi.stillSelling.confirmSend", {
          count: data?.recipients ?? 0,
        })}
        cancelLabel={t("adminUi.stillSelling.cancel", "Cancel")}
        confirmColor="warning"
        maxWidth="sm"
      />
    </Card>
  )
}

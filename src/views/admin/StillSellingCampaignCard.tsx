import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetStillSellingCampaignQuery,
  useSendStillSellingCampaignMutation,
  useStopStillSellingCampaignMutation,
  type StillSellingLocale,
} from "../../store/api/v2/market"

const LOCALES: StillSellingLocale[] = [
  "en",
  "de",
  "es",
  "fr",
  "ja",
  "uk",
  "zh-CN",
  "zh-TW",
]

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
  const { t, i18n } = useTranslation()
  const [locale, setLocale] = useState<StillSellingLocale>("en")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const { data, isLoading, isError, refetch, isFetching } =
    useGetStillSellingCampaignQuery(
      { locale },
      { pollingInterval: running ? RUNNING_POLL_MS : 0 },
    )
  const [send, sendState] = useSendStillSellingCampaignMutation()
  const [stop, stopState] = useStopStillSellingCampaignMutation()

  React.useEffect(() => {
    setRunning(!!data?.run.running)
  }, [data?.run.running])

  const reasonLabel = (reason: string) =>
    t(`adminUi.stillSelling.reasons.${reason}`, reason)

  const onSend = async () => {
    if (!data) return
    setConfirmOpen(false)
    try {
      await send({
        stillSellingSendRequest: { expected_recipients: data.recipients },
      }).unwrap()
    } catch {
      // Shown from sendState.error below.
    }
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

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">
                  {t(
                    "adminUi.stillSelling.sample",
                    "Sample DM (fake data: 3 listings, 2 months)",
                  )}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="still-selling-locale">
                    {t("adminUi.stillSelling.sampleLocale", "Language")}
                  </InputLabel>
                  <Select
                    labelId="still-selling-locale"
                    label={t("adminUi.stillSelling.sampleLocale", "Language")}
                    value={locale}
                    onChange={(e) =>
                      setLocale(e.target.value as StillSellingLocale)
                    }
                  >
                    {LOCALES.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Typography
                variant="body2"
                sx={{ mb: 1 }}
                data-testid="still-selling-sample-text"
              >
                {data.sample.text}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {data.sample.buttons.map((b) => (
                  <Button
                    key={b.label}
                    size="small"
                    variant="outlined"
                    disabled
                    title={b.url}
                  >
                    {b.label}
                  </Button>
                ))}
              </Stack>
            </Paper>

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
                  when: new Date(data.run.finished_at).toLocaleString(
                    i18n.language,
                  ),
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
              <Button onClick={() => refetch()} disabled={isFetching}>
                {t("adminUi.stillSelling.refresh", "Refresh")}
              </Button>
            </Stack>

            <TableContainer>
              <Table size="small" data-testid="still-selling-progress">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">
                      {t("adminUi.stillSelling.progress.sent", "Sent")}
                    </TableCell>
                    <TableCell align="right">
                      {t(
                        "adminUi.stillSelling.progress.delivered",
                        "Delivered",
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {t(
                        "adminUi.stillSelling.progress.failedClosed",
                        "Failed (closed)",
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {t(
                        "adminUi.stillSelling.progress.failedOther",
                        "Failed (other)",
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {t(
                        "adminUi.stillSelling.progress.clickedKeep",
                        "Clicked keep",
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {t(
                        "adminUi.stillSelling.progress.clickedPause",
                        "Clicked pause",
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {t(
                        "adminUi.stillSelling.progress.listings",
                        "Listings kept · paused",
                      )}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="right">{data.progress.sent}</TableCell>
                    <TableCell align="right">
                      {data.progress.delivered}
                    </TableCell>
                    <TableCell align="right">
                      {data.progress.failed_closed}
                    </TableCell>
                    <TableCell align="right">
                      {data.progress.failed - data.progress.failed_closed}
                    </TableCell>
                    <TableCell align="right">
                      {data.progress.clicked_keep}
                    </TableCell>
                    <TableCell align="right">
                      {data.progress.clicked_pause}
                    </TableCell>
                    <TableCell align="right">
                      {data.progress.kept_listings} ·{" "}
                      {data.progress.paused_listings}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </CardContent>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {t("adminUi.stillSelling.confirmTitle", "Send the campaign?")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("adminUi.stillSelling.confirmBody", {
              count: data?.recipients ?? 0,
              batch: data?.batch_size ?? 0,
              seconds: data?.batch_pause_seconds ?? 0,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            {t("adminUi.stillSelling.cancel", "Cancel")}
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => void onSend()}
          >
            {t("adminUi.stillSelling.confirmSend", {
              count: data?.recipients ?? 0,
            })}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

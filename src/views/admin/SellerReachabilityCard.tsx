import React from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  useGetSellerReachabilityQuery,
  type ReachabilityBucket,
  type ReachabilityCount,
  type SellerReachabilityCounts,
} from "../../store/api/v2/market"

type Column = Exclude<keyof SellerReachabilityCounts, "sellers" | "listings">

const COLUMNS: Column[] = [
  "discord_dm",
  "discord_dm_confirmed",
  "email",
  "email_confirmed",
  "push",
  "any",
  "none",
]

/** "12 · 40": sellers, then their listings. */
function CountCell({ count }: { count: ReachabilityCount }) {
  const { t } = useTranslation()
  return (
    <TableCell align="right">
      {t("adminUi.sellerReachability.count", {
        sellers: count.sellers,
        listings: count.listings,
        defaultValue: "{{sellers}} · {{listings}}",
      })}
    </TableCell>
  )
}

/**
 * Admin › Market: how many sellers with listings up SC Market can reach, by
 * when they were last seen and by channel (GET /admin/seller-reachability).
 * Counts only; says which channels have a delivery-result signal.
 */
export function SellerReachabilityCard() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch, isFetching } =
    useGetSellerReachabilityQuery()

  const bucketLabel = (bucket: ReachabilityBucket) =>
    ({
      today: t("adminUi.sellerReachability.buckets.today", "Seen today"),
      this_week: t(
        "adminUi.sellerReachability.buckets.this_week",
        "Seen this week",
      ),
      this_month: t(
        "adminUi.sellerReachability.buckets.this_month",
        "Seen this month",
      ),
      over_a_month: t(
        "adminUi.sellerReachability.buckets.over_a_month",
        "Not seen for over a month",
      ),
      unknown: t(
        "adminUi.sellerReachability.buckets.unknown",
        "No one to contact",
      ),
    })[bucket]

  const columnLabel = (column: Column) =>
    ({
      discord_dm: t(
        "adminUi.sellerReachability.columns.discord_dm",
        "Discord DM",
      ),
      discord_dm_confirmed: t(
        "adminUi.sellerReachability.columns.discord_dm_confirmed",
        "DM delivered",
      ),
      email: t("adminUi.sellerReachability.columns.email", "Email"),
      email_confirmed: t(
        "adminUi.sellerReachability.columns.email_confirmed",
        "Email delivered",
      ),
      push: t("adminUi.sellerReachability.columns.push", "Push"),
      any: t("adminUi.sellerReachability.columns.any", "Any channel"),
      none: t("adminUi.sellerReachability.columns.none", "None"),
    })[column]

  // "No one to contact" only matters when some org has nobody who manages it.
  const buckets =
    data?.buckets.filter((b) => b.bucket !== "unknown" || b.sellers > 0) ?? []

  return (
    <Card variant="outlined" sx={{ mb: 2 }} data-testid="seller-reachability">
      <CardContent>
        <Typography variant="h6" component="h2">
          {t("adminUi.sellerReachability.title", "Seller reachability")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            "adminUi.sellerReachability.subtitle",
            "Sellers with public listings, by when they were last seen, and how many of them (and their listings) SC Market can reach. An org counts through its members who manage orders or the market. Counts only.",
          )}
        </Typography>

        {isLoading ? (
          <Stack spacing={1} aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={28} />
            ))}
          </Stack>
        ) : isError || !data ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {t("adminUi.sellerReachability.retry", "Retry")}
              </Button>
            }
          >
            {t(
              "adminUi.sellerReachability.loadFailed",
              "The reachability report couldn't be loaded.",
            )}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table
                size="small"
                aria-label={t(
                  "adminUi.sellerReachability.title",
                  "Seller reachability",
                )}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {t(
                        "adminUi.sellerReachability.columns.lastSeen",
                        "Last seen",
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {t(
                        "adminUi.sellerReachability.columns.sellers",
                        "Sellers · listings",
                      )}
                    </TableCell>
                    {COLUMNS.map((c) => (
                      <TableCell key={c} align="right">
                        {columnLabel(c)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buckets.map((b) => (
                    <TableRow
                      key={b.bucket}
                      data-testid={`reachability-${b.bucket}`}
                    >
                      <TableCell component="th" scope="row">
                        {bucketLabel(b.bucket)}
                      </TableCell>
                      <CountCell
                        count={{ sellers: b.sellers, listings: b.listings }}
                      />
                      {COLUMNS.map((c) => (
                        <CountCell key={c} count={b[c]} />
                      ))}
                    </TableRow>
                  ))}
                  <TableRow data-testid="reachability-total">
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: "bold" }}
                    >
                      {t("adminUi.sellerReachability.total", "Total")}
                    </TableCell>
                    <CountCell
                      count={{
                        sellers: data.totals.sellers,
                        listings: data.totals.listings,
                      }}
                    />
                    {COLUMNS.map((c) => (
                      <CountCell key={c} count={data.totals[c]} />
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box component="ul" sx={{ mt: 2, mb: 0, pl: 2.5 }}>
              <Typography
                component="li"
                variant="caption"
                color="text.secondary"
              >
                {data.signals.discord_dm_delivery_results
                  ? t("adminUi.sellerReachability.notes.discord", {
                      days: data.signals.discord_dm_result_retention_days,
                      defaultValue:
                        'Discord DM: Discord linked, and their last DM from SC Market (kept {{days}} days) didn\'t fail. Sellers never DMed in that time count, unconfirmed; "DM delivered" counts those whose last DM arrived.',
                    })
                  : t(
                      "adminUi.sellerReachability.notes.discordNoSignal",
                      "Discord DM: Discord linked. No DM delivery results are recorded.",
                    )}
              </Typography>
              <Typography
                component="li"
                variant="caption"
                color="text.secondary"
              >
                {data.signals.email_delivery_results
                  ? t("adminUi.sellerReachability.notes.emailChecked", {
                      days: data.signals.email_delivered_window_days,
                      defaultValue:
                        'Email: a verified address that hasn\'t bounced or been reported as spam, not unsubscribed from announcement emails. Sellers not emailed in the last {{days}} days count, unconfirmed; "Email delivered" counts those with a delivery confirmed in that time.',
                    })
                  : t(
                      "adminUi.sellerReachability.notes.email",
                      "Email: a verified address, not unsubscribed from announcement emails. Bounces aren't recorded, so a verified address may still bounce.",
                    )}
              </Typography>
              <Typography
                component="li"
                variant="caption"
                color="text.secondary"
              >
                {data.signals.push_delivery_results
                  ? t(
                      "adminUi.sellerReachability.notes.pushChecked",
                      "Push: at least one push subscription.",
                    )
                  : t(
                      "adminUi.sellerReachability.notes.push",
                      "Push: at least one push subscription. Expired ones are removed when a push fails, but no delivery result is recorded.",
                    )}
              </Typography>
              <Typography
                component="li"
                variant="caption"
                color="text.secondary"
              >
                {t(
                  "adminUi.sellerReachability.notes.lastSeen",
                  "Last seen counts every seller, including those who hide their online status from buyers.",
                )}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

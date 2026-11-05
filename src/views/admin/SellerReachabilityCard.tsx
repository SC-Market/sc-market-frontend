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
  type DiscordInstallClickCount,
  type ReachabilityBucket,
  type ReachabilityCount,
  type SellerReachabilityCounts,
} from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"

type Column = Exclude<keyof SellerReachabilityCounts, "sellers" | "listings">

const COLUMNS: Column[] = [
  "discord_dm",
  "discord_dm_confirmed",
  "discord_dm_closed",
  "discord_server_or_app",
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

/** Clicks on "Add SC Market to Discord" links, per install type and surface. */
function InstallClicksTable({
  clicks,
}: {
  clicks: DiscordInstallClickCount[]
}) {
  const { t } = useTranslation()
  const typeLabel = (type: DiscordInstallClickCount["install_type"]) =>
    type === "user"
      ? t("adminUi.sellerReachability.installClicks.user", "Your account")
      : t("adminUi.sellerReachability.installClicks.server", "A server")
  return (
    <Box sx={{ mt: 2 }} data-testid="reachability-install-clicks">
      <Typography variant="subtitle2" component="h3" color="text.secondary">
        {t(
          "adminUi.sellerReachability.installClicks.title",
          '"Add SC Market to Discord" clicks',
        )}
      </Typography>
      {clicks.length === 0 ? (
        <Typography variant="body2" color="text.primary">
          {t("adminUi.sellerReachability.installClicks.none", "No clicks yet.")}
        </Typography>
      ) : (
        <TableContainer>
          <Table
            size="small"
            aria-label={t(
              "adminUi.sellerReachability.installClicks.title",
              '"Add SC Market to Discord" clicks',
            )}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  {t(
                    "adminUi.sellerReachability.installClicks.type",
                    "Install to",
                  )}
                </TableCell>
                <TableCell>
                  {t("adminUi.sellerReachability.installClicks.src", "Where")}
                </TableCell>
                <TableCell align="right">
                  {t(
                    "adminUi.sellerReachability.installClicks.days7",
                    "Last 7 days",
                  )}
                </TableCell>
                <TableCell align="right">
                  {t(
                    "adminUi.sellerReachability.installClicks.days30",
                    "Last 30 days",
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clicks.map((c) => (
                <TableRow key={`${c.install_type}:${c.src}`}>
                  <TableCell>{typeLabel(c.install_type)}</TableCell>
                  <TableCell>
                    {t(
                      `adminUi.sellerReachability.installClicks.sources.${c.src}`,
                      c.src,
                    )}
                  </TableCell>
                  <TableCell align="right">{c.clicks_7d}</TableCell>
                  <TableCell align="right">{c.clicks_30d}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

/**
 * Admin › Market: how many sellers with listings up SC Market can reach, by
 * when they were last seen and by channel (GET /admin/seller-reachability).
 * Counts only; says which channels have a delivery-result signal.
 */
export function SellerReachabilityCard() {
  const { t } = useTranslation()
  const fmt = useFormatters()
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
      discord_dm_closed: t(
        "adminUi.sellerReachability.columns.discord_dm_closed",
        "DM failed (closed)",
      ),
      discord_server_or_app: t(
        "adminUi.sellerReachability.columns.discord_server_or_app",
        "Shares a server or installed the app",
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

            <InstallClicksTable clicks={data.install_clicks} />

            <Box component="ul" sx={{ mt: 2, mb: 0, pl: 2.5 }}>
              <Typography
                component="li"
                variant="caption"
                color="text.secondary"
              >
                {t(
                  "adminUi.sellerReachability.notes.cells",
                  "Each cell: sellers · their public listings.",
                )}
              </Typography>
              <Typography
                component="li"
                variant="caption"
                color="text.secondary"
              >
                {data.signals.discord_dm_delivery_results
                  ? t("adminUi.sellerReachability.notes.discordRule", {
                      days: data.signals.discord_dm_result_retention_days,
                      code: data.signals.discord_dm_refusal_codes.join(" / "),
                      defaultValue:
                        'Discord DM: Discord linked, their last DM from SC Market (kept {{days}} days) wasn\'t refused with error {{code}}, and they share a server with the bot. Sellers never DMed in that time count, unconfirmed; "DM delivered" counts those whose last DM arrived.',
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
                {t("adminUi.sellerReachability.notes.discordClosedInstall", {
                  code: data.signals.discord_dm_refusal_codes.join(" / "),
                  defaultValue:
                    "DM failed (closed): not reachable by DM because Discord refused their last DM (error {{code}}: DMs closed, or no way for the bot to reach them). A refused DM also clears a recorded app install. For an org, this holds for everyone who can be contacted.",
                })}
              </Typography>
              <Typography
                component="li"
                variant="caption"
                color="text.secondary"
                data-testid="reachability-server-or-app-note"
              >
                {data.signals.discord_shared_server_checked_at
                  ? t("adminUi.sellerReachability.notes.serverOrApp", {
                      when: fmt.dateTime(
                        data.signals.discord_shared_server_checked_at,
                      ),
                      defaultValue:
                        "Shares a server or installed the app: Discord linked, and either a member of at least one server the SC Market bot is in (checked about every 12 hours from the bot's member lists, without sending anything; last checked {{when}}), or seen using the bot through the app installed on their own Discord account. Not counted in Any channel or None.",
                    })
                  : t(
                      "adminUi.sellerReachability.notes.serverOrAppNever",
                      "Shares a server or installed the app: Discord linked, and either a member of at least one server the SC Market bot is in (checked about every 12 hours, without sending anything; not checked yet), or seen using the bot through the app installed on their own Discord account. Not counted in Any channel or None.",
                    )}{" "}
                {data.signals.discord_user_install_counts_as_dm
                  ? t(
                      "adminUi.sellerReachability.notes.installCounts",
                      "Installing the app counts as reachable by Discord DM.",
                    )
                  : t(
                      "adminUi.sellerReachability.notes.installNotCounted",
                      "App installs are recorded but not counted as reachable by Discord DM until it's confirmed the bot can DM someone who shares no server with it.",
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
                  "adminUi.sellerReachability.notes.anyNone",
                  "Any channel: reachable by Discord DM, email or push. None: by none of them.",
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

import { Section } from "../../components/paper/Section"
import React from "react"
import { Grid, List, ListItem } from "@mui/material"
import { MuiAreaChart, MuiLineChart } from "../../components/charts/MuiCharts"
import { useTranslation } from "react-i18next"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { OfferAnalytics } from "../../features/offers/domain/types"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface OfferAnalyticsProps {
  analytics: OfferAnalytics
}

export function OfferAnalyticsCharts({ analytics }: OfferAnalyticsProps) {
  const { t } = useTranslation()

  const formatChartData = (data: typeof analytics.daily_totals) =>
    data.map((item) => ({ x: new Date(item.date).toISOString(), y: item.total }))

  const formatStatusData = (
    data: typeof analytics.daily_totals,
    status: "active" | "accepted" | "rejected",
  ) => data.map((item) => ({ x: new Date(item.date).toISOString(), y: item[status] }))

  return (
    <>
      <Section xs={12} title={t("offerTrend.offer_count_daily", "Offer Count (Daily)")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              { name: t("offerTrend.total", "Total"), data: formatChartData(analytics.daily_totals) },
              { name: t("offerTrend.active", "Active"), data: formatStatusData(analytics.daily_totals, "active") },
              { name: t("offerTrend.accepted", "Accepted"), data: formatStatusData(analytics.daily_totals, "accepted") },
              { name: t("offerTrend.rejected", "Rejected"), data: formatStatusData(analytics.daily_totals, "rejected") },
            ]}
            height={400}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("offerTrend.offer_count_weekly", "Offer Count (Weekly)")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              { name: t("offerTrend.total", "Total"), data: formatChartData(analytics.weekly_totals) },
              { name: t("offerTrend.active", "Active"), data: formatStatusData(analytics.weekly_totals, "active") },
              { name: t("offerTrend.accepted", "Accepted"), data: formatStatusData(analytics.weekly_totals, "accepted") },
              { name: t("offerTrend.rejected", "Rejected"), data: formatStatusData(analytics.weekly_totals, "rejected") },
            ]}
            height={400}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("offerTrend.offer_count_monthly", "Offer Count (Monthly)")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              { name: t("offerTrend.total", "Total"), data: formatChartData(analytics.monthly_totals) },
              { name: t("offerTrend.active", "Active"), data: formatStatusData(analytics.monthly_totals, "active") },
              { name: t("offerTrend.accepted", "Accepted"), data: formatStatusData(analytics.monthly_totals, "accepted") },
              { name: t("offerTrend.rejected", "Rejected"), data: formatStatusData(analytics.monthly_totals, "rejected") },
            ]}
            height={400}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("offerTrend.average_accepted_value_monthly", "Average Accepted Offer Value (Monthly)")}>
        <Grid item xs={12}>
          <MuiLineChart
            series={[
              {
                name: t("offerTrend.average_accepted_value", "Average Accepted Value"),
                data: analytics.monthly_totals.map((item) => ({
                  x: new Date(item.date).toISOString(),
                  y: item.average_accepted_value || 0,
                })),
              },
            ]}
            height={400}
          />
        </Grid>
      </Section>
    </>
  )
}

export function OfferTopShopsAnalytics({ analytics }: OfferAnalyticsProps) {
  return (
    <Section title={"Top Shops (Offers)"} xs={12} lg={3}>
      <ol>
        {(analytics.top_shops || []).map((s) => (
          <li key={s.slug}>
            <UnderlineLink color={"text.secondary"} to={`/shops/${s.slug}`} component={Link}>
              {s.name}
            </UnderlineLink>
            : {s.accepted_offers}/{s.total_offers}
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function OfferTopUsersAnalytics({ analytics }: OfferAnalyticsProps) {
  return (
    <Section title={"Top Users (Offers)"} xs={12} lg={3}>
      <List sx={{ maxHeight: 400, overflowY: "scroll" }}>
        {analytics.top_users.map((c, i) => (
          <ListItem key={c.username}>
            {i + 1}.&nbsp;
            <UnderlineLink color={"text.secondary"} to={`/user/${c.username}`} component={Link}>
              {c.username}
            </UnderlineLink>
            : {c.accepted_offers}/{c.total_offers}
          </ListItem>
        ))}
      </List>
    </Section>
  )
}

export function OfferSummary({ analytics }: OfferAnalyticsProps) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Section title={"Offer Summary"} xs={12} lg={6}>
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={6}>
          <strong>Total Offers:</strong> {analytics.summary.total_offers}
        </Grid>
        <Grid item xs={6}>
          <strong>Active Offers:</strong> {analytics.summary.active_offers}
        </Grid>
        <Grid item xs={6}>
          <strong>Waiting for Buyer:</strong> {analytics.summary.waiting_for_buyer}
        </Grid>
        <Grid item xs={6}>
          <strong>Waiting for Seller:</strong> {analytics.summary.waiting_for_seller}
        </Grid>
        <Grid item xs={6}>
          <strong>Accepted Offers:</strong> {analytics.summary.accepted_offers}
        </Grid>
        <Grid item xs={6}>
          <strong>Rejected Offers:</strong> {analytics.summary.rejected_offers}
        </Grid>
        <Grid item xs={6}>
          <strong>Total Value:</strong> {analytics.summary.total_value.toLocaleString()} aUEC
        </Grid>
      </Grid>
    </Section>
  )
}

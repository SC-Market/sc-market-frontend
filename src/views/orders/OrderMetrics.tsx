import React from "react"
import { Grid, Typography, Box, Divider } from "@mui/material"
import { Section } from "../../components/paper/Section"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useGetContractorOrderMetricsQuery,
  ContractorOrderMetrics,
} from "../../store/orders"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function MetricSection(props: {
  title: string
  body: React.ReactNode
  bodyColor?: string
}) {
  const { title, body, bodyColor } = props
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid item xs={12} lg={3}>
      <Grid container spacing={theme.layoutSpacing.compact}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"} color={bodyColor || "text.secondary"}>
            {body}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Grid>
    </Grid>
  )
}

export function ContractorOrderMetricsDisplay(props: {
  metrics: ContractorOrderMetrics
}) {
  const { metrics } = props
  const { t, i18n } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const activeOrders =
    metrics.status_counts["in-progress"] + metrics.status_counts["not-started"]
  const completedOrders = metrics.status_counts["fulfilled"]

  return (
    <React.Fragment>
      {/* Active Orders */}
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderMetrics.activeOrders")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"} color={"success.main"}>
            {activeOrders.toLocaleString(i18n.language)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Section>

      {/* All Orders */}
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderMetrics.allOrders")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"}>
            {metrics.total_orders.toLocaleString(i18n.language)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Section>

      {/* Active Order Value */}
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderMetrics.activeOrderValue")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"} color={"text.secondary"}>
            {metrics.active_value.toLocaleString(i18n.language)} aUEC
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Section>

      {/* Completed Order Value */}
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderMetrics.completedOrderValue")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"} color={"text.secondary"}>
            {metrics.completed_value.toLocaleString(i18n.language)} aUEC
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Section>

      {/* Recent Activity - Orders Last 7 Days */}
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderMetrics.ordersLast7Days")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"} color={"primary.main"}>
            {metrics.recent_activity.orders_last_7_days.toLocaleString(
              i18n.language,
            )}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Section>

      {/* Recent Activity - Orders Last 30 Days */}
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderMetrics.ordersLast30Days")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"} color={"primary.main"}>
            {metrics.recent_activity.orders_last_30_days.toLocaleString(
              i18n.language,
            )}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Section>

      {/* Recent Activity - Value Last 7 Days */}
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderMetrics.valueLast7Days")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"} color={"success.main"}>
            {metrics.recent_activity.value_last_7_days.toLocaleString(
              i18n.language,
            )}{" "}
            aUEC
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Section>

      {/* Recent Activity - Value Last 30 Days */}
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderMetrics.valueLast30Days")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"h6"} color={"success.main"}>
            {metrics.recent_activity.value_last_30_days.toLocaleString(
              i18n.language,
            )}{" "}
            aUEC
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
      </Section>

      {/* Top Customers */}
      {metrics.top_customers.length > 0 && (
        <Section xs={12}>
          <Grid item xs={12}>
            <Typography
              variant={"subtitle1"}
              color={"text.primary"}
              fontWeight={"bold"}
            >
              {t("orderMetrics.topCustomers")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={theme.layoutSpacing.compact}>
              {metrics.top_customers.slice(0, 5).map((customer, index) => (
                <Grid item xs={12} key={customer.username}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body1">
                      {index + 1}. {customer.username}
                    </Typography>
                    <Box textAlign="right">
                      <Typography variant="body2" color="text.secondary">
                        {customer.order_count} {t("orderMetrics.orders")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.total_value.toLocaleString(i18n.language)}{" "}
                        aUEC
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider light />
          </Grid>
        </Section>
      )}
    </React.Fragment>
  )
}

export function OrderMetrics(props: {}) {
  const theme = useTheme<ExtendedTheme>()
  const [contractor] = useCurrentOrg()
  const {
    data: metrics,
    isLoading,
    error,
  } = useGetContractorOrderMetricsQuery(contractor?.spectrum_id!, {
    skip: !contractor?.spectrum_id,
  })

  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Section xs={12}>
        <Typography variant="h6" color="text.secondary">
          {t("common.loading")}...
        </Typography>
      </Section>
    )
  }

  if (error) {
    return (
      <Section xs={12}>
        <Typography variant="h6" color="error.main">
          {t("common.error")}: {t("orderMetrics.failedToLoad")}
        </Typography>
      </Section>
    )
  }

  if (!metrics) {
    return (
      <Section xs={12}>
        <Typography variant="h6" color="text.secondary">
          {t("orderMetrics.noData")}
        </Typography>
      </Section>
    )
  }

  return <ContractorOrderMetricsDisplay metrics={metrics} />
}

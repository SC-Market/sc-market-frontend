import { Section } from "../../components/paper/Section"
import React from "react"
import { DynamicApexChart } from "../../components/charts/DynamicCharts"
import { useTranslation } from "react-i18next"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { OrderAnalytics } from "../../datatypes/Order"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import { GridProps } from '@mui/material/Grid';
import List from '@mui/material/List';
import TablePagination from '@mui/material/TablePagination';
import ListItem from '@mui/material/ListItem';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Announcement from '@mui/icons-material/Announcement';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HourglassTop from '@mui/icons-material/HourglassTop';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import Warning from '@mui/icons-material/Warning';

interface OrderAnalyticsProps {
  analytics: OrderAnalytics
}

export function OrderAnalyticsCharts({ analytics }: OrderAnalyticsProps) {
  const { t } = useTranslation()

  const formatChartData = (data: typeof analytics.daily_totals) => {
    return data.map((item) => ({
      x: new Date(item.date).toISOString(),
      y: item.total,
    }))
  }

  const formatStatusData = (
    data: typeof analytics.daily_totals,
    status: keyof Omit<(typeof data)[0], "date" | "total">,
  ) => {
    return data.map((item) => ({
      x: new Date(item.date).toISOString(),
      y: item[status],
    }))
  }

  return (
    <>
      <Section xs={12} title={t("orderTrend.order_count_daily")}>
        <Grid item xs={12}>
          {/* @ts-ignore */}
          <DynamicApexChart
            width={"100%"}
            height={400}
            type={"area"}
            options={{
              xaxis: {
                type: "datetime",
                labels: {
                  format: "yy/MM/dd",
                },
              },
              yaxis: {
                forceNiceScale: true,
                min: 0,
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
              },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  inverseColors: false,
                  opacityFrom: 0.45,
                  opacityTo: 0.05,
                  stops: [20, 100, 100, 100],
                },
              },
              tooltip: {
                x: {
                  format: "yy/MM/dd",
                },
              },
            }}
            series={[
              {
                name: t("orderTrend.orders_daily"),
                data: formatChartData(analytics.daily_totals),
              },
              {
                name: t("orderTrend.in_progress"),
                data: formatStatusData(analytics.daily_totals, "in_progress"),
              },
              {
                name: t("orderTrend.fulfilled"),
                data: formatStatusData(analytics.daily_totals, "fulfilled"),
              },
              {
                name: t("orderTrend.cancelled"),
                data: formatStatusData(analytics.daily_totals, "cancelled"),
              },
              {
                name: t("orderTrend.not_started"),
                data: formatStatusData(analytics.daily_totals, "not_started"),
              },
            ]}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("orderTrend.order_count_weekly")}>
        <Grid item xs={12}>
          {/* @ts-ignore */}
          <DynamicApexChart
            width={"100%"}
            height={400}
            type={"area"}
            options={{
              xaxis: {
                type: "datetime",
                labels: {
                  format: "yy/MM/dd",
                },
              },
              yaxis: {
                forceNiceScale: true,
                min: 0,
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
              },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  inverseColors: false,
                  opacityFrom: 0.45,
                  opacityTo: 0.05,
                  stops: [20, 100, 100, 100],
                },
              },
              tooltip: {
                x: {
                  format: "yy/MM/dd",
                },
              },
            }}
            series={[
              {
                name: t("orderTrend.orders_weekly"),
                data: formatChartData(analytics.weekly_totals),
              },
              {
                name: t("orderTrend.in_progress"),
                data: formatStatusData(analytics.weekly_totals, "in_progress"),
              },
              {
                name: t("orderTrend.fulfilled"),
                data: formatStatusData(analytics.weekly_totals, "fulfilled"),
              },
              {
                name: t("orderTrend.cancelled"),
                data: formatStatusData(analytics.weekly_totals, "cancelled"),
              },
              {
                name: t("orderTrend.not_started"),
                data: formatStatusData(analytics.weekly_totals, "not_started"),
              },
            ]}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("orderTrend.order_count_monthly")}>
        <Grid item xs={12}>
          {/* @ts-ignore */}
          <DynamicApexChart
            width={"100%"}
            height={400}
            type={"area"}
            options={{
              xaxis: {
                type: "datetime",
                labels: {
                  format: "MM/yy",
                },
              },
              yaxis: {
                forceNiceScale: true,
                min: 0,
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
              },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  inverseColors: false,
                  opacityFrom: 0.45,
                  opacityTo: 0.05,
                  stops: [20, 100, 100, 100],
                },
              },
              tooltip: {
                x: {
                  format: "MM/yy",
                },
              },
            }}
            series={[
              {
                name: t("orderTrend.orders_monthly"),
                data: formatChartData(analytics.monthly_totals),
              },
              {
                name: t("orderTrend.in_progress"),
                data: formatStatusData(analytics.monthly_totals, "in_progress"),
              },
              {
                name: t("orderTrend.fulfilled"),
                data: formatStatusData(analytics.monthly_totals, "fulfilled"),
              },
              {
                name: t("orderTrend.cancelled"),
                data: formatStatusData(analytics.monthly_totals, "cancelled"),
              },
              {
                name: t("orderTrend.not_started"),
                data: formatStatusData(analytics.monthly_totals, "not_started"),
              },
            ]}
          />
        </Grid>
      </Section>

      <Section
        xs={12}
        title={t(
          "orderTrend.average_order_value_monthly",
          "Average Order Value (Monthly)",
        )}
      >
        <Grid item xs={12}>
          {/* @ts-ignore */}
          <DynamicApexChart
            width={"100%"}
            height={400}
            type={"line"}
            options={{
              xaxis: {
                type: "datetime",
                labels: {
                  format: "MM/yy",
                },
              },
              yaxis: {
                forceNiceScale: true,
                min: 0,
                labels: {
                  formatter: (value: number) => {
                    return `${value.toLocaleString()} aUEC`
                  },
                },
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
                width: 3,
              },
              tooltip: {
                x: {
                  format: "MM/yy",
                },
                y: {
                  formatter: (value: number) => {
                    return `${value.toLocaleString()} aUEC`
                  },
                },
              },
              colors: ["#1976d2"], // Primary color for the line
            }}
            series={[
              {
                name: t(
                  "orderTrend.average_order_value",
                  "Average Order Value",
                ),
                data: analytics.monthly_totals.map((item) => ({
                  x: new Date(item.date).toISOString(),
                  y: item.average_fulfilled_value || 0,
                })),
              },
            ]}
          />
        </Grid>
      </Section>
    </>
  )
}

export function TopContractorsAnalytics({ analytics }: OrderAnalyticsProps) {
  return (
    <Section title={"Top Contractors"} xs={12} lg={3}>
      <ol>
        {analytics.top_contractors.map((c) => (
          <li key={c.name}>
            <UnderlineLink
              color={"text.secondary"}
              to={`/contractor/${c.name}`}
              component={Link}
            >
              {c.name}
            </UnderlineLink>
            : {c.fulfilled_orders}/{c.total_orders}
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function TopUsersAnalytics({ analytics }: OrderAnalyticsProps) {
  return (
    <Section title={"Top Users"} xs={12} lg={3}>
      <List sx={{ maxHeight: 400, overflowY: "scroll" }}>
        {analytics.top_users.map((c, i) => (
          <ListItem key={c.username}>
            {i + 1}.&nbsp;
            <UnderlineLink
              color={"text.secondary"}
              to={`/user/${c.username}`}
              component={Link}
            >
              {c.username}
            </UnderlineLink>
            : {c.fulfilled_orders}/{c.total_orders}
          </ListItem>
        ))}
      </List>
    </Section>
  )
}

export function OrderSummary({ analytics }: OrderAnalyticsProps) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Section title={"Order Summary"} xs={12} lg={6}>
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={6}>
          <strong>Total Orders:</strong> {analytics.summary.total_orders}
        </Grid>
        <Grid item xs={6}>
          <strong>Active Orders:</strong> {analytics.summary.active_orders}
        </Grid>
        <Grid item xs={6}>
          <strong>Completed Orders:</strong>{" "}
          {analytics.summary.completed_orders}
        </Grid>
        <Grid item xs={6}>
          <strong>Total Value:</strong> $
          {analytics.summary.total_value.toLocaleString()}
        </Grid>
      </Grid>
    </Section>
  )
}

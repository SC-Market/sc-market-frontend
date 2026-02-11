import React from "react"
import { Section } from "../../components/paper/Section"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useGetContractorOrderMetricsQuery,
  ContractorOrderMetrics,
} from "../../store/orders"
import { useTranslation } from "react-i18next"
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
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ButtonGroup from '@mui/material/ButtonGroup';
import Rating from '@mui/material/Rating';
import CardActionArea from '@mui/material/CardActionArea';
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
import PersonRemoveRounded from '@mui/icons-material/PersonRemoveRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import PublishRounded from '@mui/icons-material/PublishRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';
import DoneRounded from '@mui/icons-material/DoneRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import StarRounded from '@mui/icons-material/StarRounded';

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

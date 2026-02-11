import { Order, OrderApplicant } from "../../datatypes/Order"
import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import {
  useAcceptOrderApplicantMutation,
  useApplyToOrderMutation,
} from "../../store/orders"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
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

export function OrderApplicantsArea(props: { order: Order }) {
  const { order } = props
  const { t } = useTranslation()

  return (
    <Section xs={12} title={t("orderApplicantsArea.applicants")}>
      <List sx={{ width: "100%" }}>
        {order.applicants.map((applicant, index) => (
          <ApplicantListItem order={order} key={index} applicant={applicant} />
        ))}
      </List>
    </Section>
  )
}

export function ApplicantListItem(props: {
  order: Order
  applicant: OrderApplicant
}) {
  const { applicant } = props
  const theme = useTheme<ExtendedTheme>()

  const { order } = props
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const [acceptApplicant] = useAcceptOrderApplicantMutation()

  const issueAlert = useAlertHook()

  const acceptApp = useCallback(async () => {
    const res: {
      data?: any
      error?: any
    } = await acceptApplicant({
      order_id: order.order_id,
      contractor_id: applicant.org_applicant?.spectrum_id,
      user_id: applicant.user_applicant?.username,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("orderApplicantsArea.accepted"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("orderApplicantsArea.failed_accept")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }, [
    acceptApplicant,
    order.order_id,
    applicant.org_applicant?.spectrum_id,
    applicant.user_applicant?.username,
    issueAlert,
    t,
  ])

  return (
    <>
      <ListItem
        secondaryAction={
          <IconButton
            edge="end"
            aria-label={t("orderApplicantsArea.expand")}
            onClick={() => setOpen((o) => !o)}
            color={"inherit"}
          >
            {open ? <KeyboardArrowUpRounded /> : <KeyboardArrowDownRounded />}
          </IconButton>
        }
      >
        <ListItemAvatar>
          <Avatar
            variant={"rounded"}
            src={
              applicant.org_applicant?.avatar ||
              applicant.user_applicant?.username
            }
          />
        </ListItemAvatar>
        <ListItemText>
          {applicant.org_applicant?.spectrum_id ||
            applicant.user_applicant?.username}
        </ListItemText>
      </ListItem>
      <Collapse component={ListItem} in={open}>
        <Grid container spacing={theme.layoutSpacing.compact}>
          <Grid item xs={12}>
            <Typography sx={{ width: "100%" }}>{applicant.message}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Button color={"primary"} variant={"outlined"} onClick={acceptApp}>
              {t("orderApplicantsArea.accept")}
            </Button>
          </Grid>
        </Grid>
      </Collapse>
    </>
  )
}

export function OrderApplyArea(props: { order: Order }) {
  const { order } = props
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()

  const [
    applyToOrder, // This is the mutation trigger
    // {isLoading}, // This is the destructured mutation result
  ] = useApplyToOrderMutation()

  const [appMessage, setAppMessage] = useState("")
  const issueAlert = useAlertHook()

  const processApp = async () => {
    const res: {
      data?: any
      error?: any
    } = await applyToOrder({
      order_id: order.order_id,
      contractor_id: currentOrg?.spectrum_id,
      message: appMessage,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("orderApplicantsArea.applied"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: `${t("orderApplicantsArea.failed_apply")} ${
          res.error?.error || res.error?.data?.error || res.error
        }`,
        severity: "error",
      })
    }
  }

  return (
    <Section xs={12} title={t("orderApplicantsArea.apply")}>
      <Grid item xs={12}>
        <TextField
          value={appMessage}
          onChange={(e) => setAppMessage(e.target.value)}
          maxRows={5}
          minRows={5}
          label={t("orderApplicantsArea.message")}
          multiline
          sx={{ width: "100%" }}
        />
      </Grid>

      <Grid item xs={12}>
        <Box
          display={"flex"}
          alignItems={"flex-end"}
          justifyContent={"flex-end"}
          sx={{ width: "100%" }}
        >
          <Button
            variant={"contained"}
            color={"primary"}
            onClick={processApp}
            startIcon={<PublishRounded />}
          >
            {t("orderApplicantsArea.apply")}
          </Button>
        </Box>
      </Grid>
    </Section>
  )
}

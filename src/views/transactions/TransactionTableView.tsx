import { Transaction } from "../../datatypes/Transaction"
import React, { MouseEventHandler, useMemo } from "react"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { HeadCell } from "../../components/table/PaginatedTable"
import { Section } from "../../components/paper/Section"
import { ScrollableTable } from "../../components/table/ScrollableTable"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useTheme } from '@mui/material/styles';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormGroup from '@mui/material/FormGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BusinessIcon from '@mui/icons-material/Business';

const statusColors = new Map<
  "Completed" | "Pending" | "Cancelled",
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
>()
statusColors.set("Completed", "success")
statusColors.set("Pending", "warning")
statusColors.set("Cancelled", "error")

// const fulldays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function getLocalizedMonths(t: any) {
  return [
    t("transactions.months.jan"),
    t("transactions.months.feb"),
    t("transactions.months.mar"),
    t("transactions.months.apr"),
    t("transactions.months.may"),
    t("transactions.months.jun"),
    t("transactions.months.jul"),
    t("transactions.months.aug"),
    t("transactions.months.sep"),
    t("transactions.months.oct"),
    t("transactions.months.nov"),
    t("transactions.months.dec"),
  ]
}

function formatAMPM(date: Date, t: any) {
  let hours = date.getHours()
  let minutes: number | string = date.getMinutes()
  const ampm =
    hours >= 12 ? t("transactions.time.pm") : t("transactions.time.am")
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes
  return hours + ":" + minutes + " " + ampm
}

function formatDate(someDateTimeStamp: number, t: any) {
  const months = getLocalizedMonths(t)
  const dt = new Date(someDateTimeStamp),
    date = dt.getDate(),
    month = months[dt.getMonth()],
    // timeDiff = someDateTimeStamp - Date.now(),
    diffDays = new Date().getDate() - date,
    diffMonths = new Date().getMonth() - dt.getMonth(),
    diffYears = new Date().getFullYear() - dt.getFullYear()

  if (diffYears === 0 && diffDays === 0 && diffMonths === 0) {
    return formatAMPM(dt, t)
  } else if (diffYears === 0 && diffDays === 1) {
    return t("transactions.yesterday")
  } else if (diffYears >= 1) {
    return month + " " + date + ", " + new Date(someDateTimeStamp).getFullYear()
  } else {
    return month + " " + date
  }
}

export function TransactionTableRow(props: {
  row: Transaction
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { row, index, isItemSelected } = props
  const { t, i18n } = useTranslation()

  const { data: profile } = useGetUserProfileQuery()
  const userRec = useMemo(
    () => profile?.username === props.row.user_recipient_id,
    [profile?.username, props.row.user_recipient_id],
  )

  const [currentOrg] = useCurrentOrg()
  const orgRec = useMemo(
    () => currentOrg?.spectrum_id === props.row.contractor_recipient_id,
    [currentOrg?.spectrum_id, props.row.contractor_recipient_id],
  )

  const receiving = useMemo(
    () => (currentOrg && orgRec) || userRec,
    [currentOrg, orgRec, userRec],
  )

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <TableRow
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        hover
        // onClick={onClick}
        onClick={() => {}}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={index}
        selected={isItemSelected}
      >
        <TableCell>
          <Typography variant={"subtitle1"}>
            {formatDate(new Date(row.timestamp).getTime(), t)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography color={"secondary"}>
            {t(`transactions.kind.${row.kind}`, row.kind)}{" "}
            {receiving ? t("transactions.from") : t("transactions.to")}{" "}
            {receiving
              ? row.user_sender_id || row.contractor_sender_id
              : row.user_recipient_id || row.contractor_recipient_id}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            color={statusColors.get(row.status) || "info"}
            label={t(`transactions.status.${row.status.toLowerCase()}`)}
          />
        </TableCell>
        <TableCell align={"right"}>
          {row.status === "Cancelled" ? (
            <Typography sx={{ textDecoration: "line-through" }}>
              {receiving ? "" : "-"}
              {row.amount.toLocaleString(i18n.language)} aUEC
            </Typography>
          ) : (
            <Typography color={receiving ? "success.light" : "error.dark"}>
              {receiving ? "" : "-"}
              {row.amount.toLocaleString(i18n.language)} aUEC
            </Typography>
          )}
        </TableCell>
      </TableRow>
    </Fade>
  )
}

export const transactionsHeadCells: readonly HeadCell<Transaction>[] = [
  {
    id: "timestamp",
    numeric: true,
    disablePadding: false,
    label: "transactions.date",
    minWidth: 100,
  },
  {
    id: "kind",
    numeric: false,
    disablePadding: false,
    label: "transactions.details",
    minWidth: 300,
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "transactions.status.title",
  },
  {
    id: "amount",
    numeric: true,
    disablePadding: false,
    label: "transactions.amount",
    minWidth: 150,
  },
]

export function TransactionTableView(props: { transactions: Transaction[] }) {
  const { t } = useTranslation()
  return (
    <Section
      xs={12}
      title={t("transactions.recent_transactions")}
      disablePadding
    >
      <ScrollableTable<Transaction>
        rows={props.transactions}
        initialSort={"timestamp"}
        generateRow={TransactionTableRow}
        headCells={transactionsHeadCells.map((cell) => ({
          ...cell,
          label: t(cell.label),
        }))}
        keyAttr={"transaction_id"}
        initialDirection={"desc"}
        disableSelect
      />
    </Section>
  )
}

import { Transaction } from "../../datatypes/Transaction"
import React, { MouseEventHandler, useMemo } from "react"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { Chip, Fade, TableCell, TableRow, Typography } from "@mui/material"
import { HeadCell } from "../../components/table/PaginatedTable"
import { Section } from "../../components/paper/Section"
import { ScrollableTable } from "../../components/table/ScrollableTable"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next" // ✅ локалізація

const statusColors = new Map<
  "Completed" | "Pending" | "Cancelled",
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
>()
statusColors.set("Completed", "success")
statusColors.set("Pending", "warning")
statusColors.set("Cancelled", "error")

// const fulldays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function formatAMPM(date: Date) {
  let hours = date.getHours()
  let minutes: number | string = date.getMinutes()
  const ampm = hours >= 12 ? "pm" : "am"
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes
  return hours + ":" + minutes + " " + ampm
}

function formatDate(someDateTimeStamp: number, t: any) {
  const dt = new Date(someDateTimeStamp),
    date = dt.getDate(),
    month = months[dt.getMonth()],
    // timeDiff = someDateTimeStamp - Date.now(),
    diffDays = new Date().getDate() - date,
    diffMonths = new Date().getMonth() - dt.getMonth(),
    diffYears = new Date().getFullYear() - dt.getFullYear()

  if (diffYears === 0 && diffDays === 0 && diffMonths === 0) {
    return formatAMPM(dt)
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
  const { t } = useTranslation()

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
              {row.amount.toLocaleString("en-US")} aUEC
            </Typography>
          ) : (
            <Typography color={receiving ? "success.light" : "error.dark"}>
              {receiving ? "" : "-"}
              {row.amount.toLocaleString("en-US")} aUEC
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

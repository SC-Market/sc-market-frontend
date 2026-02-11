import { Section } from "../../components/paper/Section"
import React, { MouseEventHandler } from "react"
import { ScrollableTable } from "../../components/table/ScrollableTable"
import {
  ActiveDelivery,
  makeActiveDeliveries,
} from "../../datatypes/Deliveries"
import { HeadCell } from "../../components/table/PaginatedTable"
import { useTranslation } from "react-i18next" // Added for localization

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
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';

const statusColors = new Map<
  string,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
>()
statusColors.set("OK", "success")
statusColors.set("Damaged", "warning")
statusColors.set("Low Fuel", "warning")
statusColors.set("Off Course", "warning")
statusColors.set("Under Attack", "error")
statusColors.set("Offline", "error")

export function ActiveDeliveryTableRow(props: {
  row: ActiveDelivery
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { row, index, isItemSelected } = props
  const { t } = useTranslation()

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
        <TableCell component="th" scope="row">
          <Avatar>
            <LocalShipping />
          </Avatar>
        </TableCell>
        <TableCell>{row.location}</TableCell>
        <TableCell>{row.departure}</TableCell>
        <TableCell>{row.destination}</TableCell>
        <TableCell>
          <Chip
            color={statusColors.get(row.status) || "info"}
            label={t(`deliveries.status.${row.status}`)}
          />
        </TableCell>
        <TableCell align="right" colSpan={2}>
          <LinearProgress
            variant="determinate"
            value={row.progress}
            sx={{ width: "100%" }}
          />
        </TableCell>
      </TableRow>
    </Fade>
  )
}

// Language headCells via t()
export function useActiveDeliveryHeadCells() {
  const { t } = useTranslation()
  return [
    {
      id: "id",
      numeric: false,
      disablePadding: true,
      label: "",
      noSort: true,
    },
    {
      id: "location",
      numeric: false,
      disablePadding: false,
      label: t("deliveries.table.location"),
    },
    {
      id: "departure",
      numeric: false,
      disablePadding: false,
      label: t("deliveries.table.start"),
    },
    {
      id: "destination",
      numeric: false,
      disablePadding: false,
      label: t("deliveries.table.end"),
    },
    {
      id: "status",
      numeric: false,
      disablePadding: false,
      label: t("deliveries.table.status"),
    },
    {
      id: "progress",
      numeric: true,
      disablePadding: false,
      label: t("deliveries.table.progress"),
    },
  ] as const
}

export function ActiveDeliveries() {
  const deliveries = makeActiveDeliveries()
  const { t } = useTranslation()
  const headCells = useActiveDeliveryHeadCells()

  return (
    <Section
      xs={12}
      md={12}
      lg={12}
      xl={12}
      title={t("deliveries.section_title")}
      disablePadding
    >
      <ScrollableTable
        rows={deliveries}
        initialSort={"id"}
        generateRow={ActiveDeliveryTableRow}
        headCells={headCells}
        keyAttr={"id"}
        disableSelect
        sx={{ maxHeight: 435 }}
      />
    </Section>
  )
}

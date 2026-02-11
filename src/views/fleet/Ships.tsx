import { Section } from "../../components/paper/Section"
import React, { MouseEventHandler } from "react"
import { Ship } from "../../datatypes/Ship"
import { ScrollableTable } from "../../components/table/ScrollableTable"
import { HeadCell } from "../../components/table/PaginatedTable"
import { getRelativeTime } from "../../util/time"
import { useGetMyShips } from "../../store/ships"
import { useTranslation } from "react-i18next" // Import translation hook

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
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';

const statusColors = new Map<
  string,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
>()
statusColors.set("flight-ready", "success")
statusColors.set("in-repair", "warning")
statusColors.set("awaiting-repair", "error")
statusColors.set("in-concept", "info")

export function ShipTableRow(props: {
  row: Ship
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
        {/*<TableCell component="th" scope="row">*/}
        {/*    <Avatar>*/}
        {/*        <LocalShipping/>*/}
        {/*    </Avatar>*/}
        {/*</TableCell>*/}
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.manufacturer}</TableCell>
        <TableCell>{row.kind}</TableCell>
        <TableCell>
          <Chip
            color={statusColors.get(row.condition) || "info"}
            label={t(`ships.condition.${row.condition}`, {
              defaultValue: row.condition,
            })}
          />
        </TableCell>
        {/*<TableCell align="right">*/}
        {/*    {getRelativeTime(new Date(row.checkin_timestamp))}*/}
        {/*</TableCell>*/}
      </TableRow>
    </Fade>
  )
}

export const fleetHeadCells: readonly HeadCell<Ship>[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "ships.table.ship", // i18n key
  },
  {
    id: "manufacturer",
    numeric: false,
    disablePadding: false,
    label: "ships.table.manufacturer",
  },
  {
    id: "kind",
    numeric: false,
    disablePadding: false,
    label: "ships.table.kind",
  },
  {
    id: "condition",
    numeric: false,
    disablePadding: false,
    label: "ships.table.condition",
  },
  // {
  //     id: 'checkin_timestamp',
  //     numeric: true,
  //     disablePadding: false,
  //     label: 'ships.table.last_checkin',
  // },
]

export function Ships() {
  const { t } = useTranslation()
  const { data: ships } = useGetMyShips()

  return (
    <Section
      xs={12}
      md={12}
      lg={12}
      xl={5}
      title={t("ships.section_title")}
      disablePadding
    >
      <ScrollableTable
        rows={ships || []}
        initialSort={"manufacturer"}
        generateRow={ShipTableRow}
        headCells={fleetHeadCells.map((cell) => ({
          ...cell,
          label: t(cell.label),
        }))}
        keyAttr={"ship_id"}
        disableSelect
        sx={{ maxHeight: 855, marginBottom: 4 }}
      />
    </Section>
  )
}

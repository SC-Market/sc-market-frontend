import React, {
  MouseEventHandler,
  ReactElement,
  useMemo,
  useState,
} from "react"
import { Section } from "../../components/paper/Section"
import {
  Avatar,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { Commodity } from "../../datatypes/Commodity"
import { useTranslation } from "react-i18next" // i18

import AgricultureIcon from "@mui/icons-material/Agriculture"
import DeleteIcon from "@mui/icons-material/Delete"
import FastfoodIcon from "@mui/icons-material/Fastfood"
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"
import {
  brown,
  green,
  grey,
  lightBlue,
  lightGreen,
  lime,
  purple,
  red,
  yellow,
} from "@mui/material/colors"
import ParkIcon from "@mui/icons-material/Park"
import BoltIcon from "@mui/icons-material/Bolt"
import SmokingRoomsIcon from "@mui/icons-material/SmokingRooms"
import SettingsIcon from "@mui/icons-material/Settings"
import LiquorIcon from "@mui/icons-material/Liquor"
import DiamondIcon from "mdi-material-ui/Diamond"
import FireIcon from "mdi-material-ui/Fire"
import GasCylinderIcon from "mdi-material-ui/GasCylinder"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import SearchIcon from "@mui/icons-material/Search"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useGetCommoditiesQuery } from "../../store/commodities"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"

export const kindIcons: { [key: string]: [ReactElement, string] } = {
  Agricultural: [<AgricultureIcon key={"Agricultural"} />, green[500]],
  Waste: [<DeleteIcon key={"Waste"} />, lightGreen[800]],
  Metal: [<DirectionsCarIcon key={"Metal"} />, brown[200]],
  Drug: [<SmokingRoomsIcon key={"Drug"} />, grey[500]],
  Vice: [<LiquorIcon key={"Vice"} />, grey[400]],
  Natural: [<ParkIcon key={"Natural"} />, green[300]],
  Mineral: [<DiamondIcon key={"Mineral"} />, lightBlue[300]],
  Halogen: [<GasCylinderIcon key={"Halogen"} />, yellow[100]],
  Temporary: [<BoltIcon key={"Temporary"} />, purple[100]],
  Scrap: [<SettingsIcon key={"Scrap"} />, brown[400]],
  Gas: [<FireIcon key={"Gas"} />, grey[100]],
  Medical: [<LocalHospitalIcon key={"Medical"} />, red[400]],
  Food: [<FastfoodIcon key={"Food"} />, brown[400]],
  Other: [<LocalOfferIcon key={"Other"} />, lime[400]],
}

function SellItemRow(props: {
  row: Commodity
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}): ReactElement {
  const { t, i18n } = useTranslation()
  const { row, onClick, isItemSelected, labelId } = props
  const bgColor = useMemo(
    () => (kindIcons[row.kind] ? kindIcons[row.kind][1] : "#FFF"),
    [row],
  )
  return (
    <TableRow
      hover
      onClick={onClick}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.username}
      selected={isItemSelected}
    >
      <TableCell
        component="th"
        id={labelId}
        scope="row"
        // padding="none"
      >
        <Avatar sx={{ bgcolor: bgColor }}>
          {kindIcons[row.kind] ? kindIcons[row.kind][0] : <DiamondIcon />}
        </Avatar>
      </TableCell>
      <TableCell>
        <Typography variant={"subtitle1"} noWrap>
          {row.name}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant={"subtitle1"}>{row.code}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant={"subtitle1"} noWrap>
          {t(`SellMaterialsList.kind.${row.kind}`, row.kind)}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant={"subtitle1"} color={"secondary"}>
          {(row.trade_price_sell * 0.9).toLocaleString(i18n.language)} aUEC
        </Typography>
      </TableCell>

      <TableCell align="right">
        <Button
          color={"primary"}
          variant={"contained"}
          onClick={
            (event) => event.stopPropagation() // Don't highlight cell if button clicked
          }
        >
          {t("SellMaterialsList.sell")}
        </Button>
      </TableCell>
    </TableRow>
  )
}

const headCells: readonly HeadCell<Commodity>[] = [
  {
    id: "avatar",
    numeric: false,
    disablePadding: false,
    label: "",
    noSort: true,
  },
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "SellMaterialsList.commodity",
    minWidth: 240,
  },
  {
    id: "code",
    numeric: false,
    disablePadding: false,
    label: "SellMaterialsList.code",
  },
  {
    id: "kind",
    numeric: false,
    disablePadding: false,
    label: "SellMaterialsList.kindHeader",
    minWidth: 140,
  },
  {
    id: "trade_price_sell",
    numeric: true,
    disablePadding: false,
    label: "SellMaterialsList.sellPrice",
    minWidth: 125,
  },
  {
    id: "button",
    numeric: true,
    disablePadding: false,
    label: "",
  },
]

function onlyUnique<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index
}

export function SellMaterialsList(props: {}): ReactElement {
  const { t } = useTranslation()
  const theme: ExtendedTheme = useTheme()
  const [kind, setKind] = useState<string>("Any")
  const [query, setQuery] = useState<string>("")

  const { data: commoditiesData } = useGetCommoditiesQuery()

  return (
    <Section
      xs={12}
      title={t("SellMaterialsList.title")}
      disablePadding
      subtitle={
        <Grid
          container
          justifyContent={"right"}
          alignItems={"center"}
          spacing={2}
        >
          <Grid item>
            <TextField
              color={"secondary"}
              sx={{
                "& fieldset": {
                  borderColor: theme.palette.outline.main,
                },
              }}
              size={"small"}
              type="search"
              label={t("SellMaterialsList.search")}
              value={query}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setQuery(event.target.value)
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon style={{ color: theme.palette.text.primary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item>
            <TextField
              fullWidth
              select
              size={"small"}
              id="order-type"
              variant={"outlined"}
              color={"secondary"}
              sx={{
                "& fieldset": {
                  borderColor: theme.palette.outline.main,
                },
              }}
              type="search"
              label={t("SellMaterialsList.kindHeader")}
              value={kind}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setKind(event.target.value)
              }}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
            >
              {[t("SellMaterialsList.any") /* "Any" */]
                .concat(
                  (commoditiesData?.data || [])
                    .map((c) => c.kind)
                    .filter(onlyUnique),
                )
                .map((choice, idx) => (
                  <MenuItem value={choice} key={choice}>
                    {t(`SellMaterialsList.kind.${choice}`, choice)}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>
      }
    >
      <PaginatedTable
        rows={(commoditiesData?.data || []).filter((item) => {
          if (kind !== t("SellMaterialsList.any")) {
            if (item.kind !== kind) {
              return false
            }
          }

          if (query !== "") {
            if (!item.name.toLowerCase().includes(query.toLowerCase())) {
              return false
            }
          }

          return true
        })}
        initialSort={"name"}
        generateRow={SellItemRow}
        keyAttr={"name"}
        headCells={headCells.map((c) => ({
          ...c,
          label: c.label ? t(c.label) : "",
        }))}
        disableSelect
      />
    </Section>
  )
}

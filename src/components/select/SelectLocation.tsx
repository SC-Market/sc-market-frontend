import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { BACKEND_URL } from "../../util/constants"
import throttle from "lodash/throttle"
import { Section } from "../paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/BoxProps';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import useTheme1 from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { FabProps } from '@mui/material/FabProps';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextFieldProps';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { BreadcrumbsProps } from '@mui/material/BreadcrumbsProps';
import MaterialLink from '@mui/material/Link';
import { TypographyProps } from '@mui/material/TypographyProps';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { GridProps } from '@mui/material/Grid';
import { PaperProps } from '@mui/material/PaperProps';
import CardActions from '@mui/material/CardActions';
import ListItemButton from '@mui/material/ListItemButton';
import DialogContentText from '@mui/material/DialogContentText';
import Snackbar from '@mui/material/Snackbar';
import MuiRating from '@mui/material/Rating';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import FilterList from '@mui/icons-material/FilterList';
import AddRounded from '@mui/icons-material/AddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import MessageRounded from '@mui/icons-material/MessageRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import MenuRounded from '@mui/icons-material/MenuRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import Info from '@mui/icons-material/Info';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import GetAppRounded from '@mui/icons-material/GetAppRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Person from '@mui/icons-material/Person';
import Business from '@mui/icons-material/Business';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import AutoGraphOutlined from '@mui/icons-material/AutoGraphOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import WhatshotRounded from '@mui/icons-material/WhatshotRounded';
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import CalendarTodayRounded from '@mui/icons-material/CalendarTodayRounded';
import RocketLaunchRounded from '@mui/icons-material/RocketLaunchRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';

export function romanize(num: number) {
  if (isNaN(num)) return NaN
  const digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ]
  let roman = "",
    i = 3
  while (i--) {
    const digit = digits.pop()
    if (digit == null) break
    roman = (key[+digit + i * 10] || "") + roman
  }
  return Array(+digits.join("") + 1).join("M") + roman
}

export interface StarmapObject {
  id: string
  code: string
  designation: string
  name: null | string
  star_system_id: string
  status: string
  type: string
  star_system: {
    id: string
    code: string
    name: null | string
    type: string
  }
}

export function SelectLocation() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const [locationSuggest, setLocationSuggest] = useState<StarmapObject[]>([])
  const [locationTarget, setLocationTarget] = useState("")
  const [locationTargetObject, setLocationTargetObject] =
    useState<StarmapObject | null>(null)

  const getSuggestions = React.useCallback(async (query: string) => {
    if (query.length < 3) {
      return []
    }

    const resp = await fetch(
      `${BACKEND_URL}/api/starmap/search/${encodeURIComponent(query)}`,
      {
        method: "GET",
        credentials: "include",
      },
    )
    const data = await resp.json()

    const extended: StarmapObject[] = []

    await Promise.all(
      data.objects.resultset.map(async (obj: StarmapObject) => {
        if (obj.type === "SATELLITE") {
          const planetNum = obj.designation.replace(/\D/g, "")
          const planetDes = `${obj.star_system.name} ${romanize(
            parseInt(planetNum),
          )}`

          extended.push(...(await getSuggestions(planetDes)))
        }
      }),
    )
    extended.push(...data.objects.resultset)

    return extended
  }, [])

  const retrieveLocation = React.useMemo(
    () =>
      throttle(async (query: string) => {
        const suggestions = await getSuggestions(query)
        setLocationSuggest(suggestions)
      }, 400),
    [getSuggestions],
  )

  useEffect(() => {
    retrieveLocation(locationTarget)
  }, [locationTarget, retrieveLocation])

  return (
    <>
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("selectLocation.title", "Location")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid item xs={12} lg={12}>
            <Autocomplete
              id="locationure-select"
              options={locationSuggest}
              getOptionLabel={(option: StarmapObject) => {
                console.log(option)
                if (option.type === "SATELLITE") {
                  const planetNum = option.designation.replace(/\D/g, "")
                  const planetDes = `${option.star_system.name} ${romanize(
                    parseInt(planetNum),
                  )}`
                  const planet = locationSuggest.find(
                    (obj) => obj.designation === planetDes,
                  )

                  return `${option.name || option.designation} - ${
                    planet ? planet.name : ""
                  } - ${option.star_system.name} (${option.designation})`
                } else if (option.type === "STAR") {
                  return `${option.name || option.designation} (${
                    option.designation
                  })`
                }

                return `${option.name || option.designation} - ${
                  option.star_system.name
                } (${option.designation})`
              }}
              value={locationTargetObject}
              onChange={(
                event: React.SyntheticEvent,
                newValue: StarmapObject | null,
              ) => {
                setLocationTargetObject(newValue)
              }}
              inputValue={locationTarget}
              onInputChange={(event, newInputValue) => {
                setLocationTarget(newInputValue)
              }}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label={t("selectLocation.inputLabel", "Source (Optional)")}
                    color={"secondary"}
                    SelectProps={{
                      IconComponent: KeyboardArrowDownRoundedIcon,
                    }}
                    sx={{
                      "& .MuiSelect-icon": {
                        fill: "white",
                      },
                    }}
                    helperText={t(
                      "selectLocation.helperText",
                      "For Escort and Transport, for example, from where to where will the order occur? For Support, where should the contractor find you?",
                    )}
                  />
                )
              }}
            />
          </Grid>
        </Grid>
      </Section>
    </>
  );
}

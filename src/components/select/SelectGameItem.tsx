import React, { useMemo } from "react"
import {
  useGetMarketCategoriesQuery,
  useGetMarketItemsByCategoryQuery,
} from "../../features/market"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/Box';
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
import { useTheme } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { FabProps } from '@mui/material/Fab';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextField';
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
import { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import { TypographyProps } from '@mui/material/Typography';
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
import { PaperProps } from '@mui/material/Paper';
import CardActions from '@mui/material/CardActions';
import ListItemButton from '@mui/material/ListItemButton';
import DialogContentText from '@mui/material/DialogContentText';
import Snackbar from '@mui/material/Snackbar';
import MuiRating from '@mui/material/Rating';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import { Theme } from '@mui/material/styles';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import { ContainerProps } from '@mui/material/Container';
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

export interface SelectGameItemProps {
  item_type: string
  item_name: string | null
  onTypeChange: (newValue: string) => void
  onItemChange: (newValue: string | null) => void
  TextfieldProps?: TextFieldProps
  size?: "small" | "medium" | undefined
}

export function SelectGameItemStack(props: SelectGameItemProps) {
  const { t } = useTranslation()
  const { data: categories } = useGetMarketCategoriesQuery()
  const { data: items, isLoading: itemsLoading } =
    useGetMarketItemsByCategoryQuery(props.item_type!, {
      skip: !props.item_type,
    })

  const category_value = useMemo(
    () =>
      categories
        ? (categories || []).find((o) => o.subcategory === props.item_type) || {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          }
        : {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          },
    [categories, props.item_type, t],
  )
  const item_name_value = useMemo(
    () =>
      props.item_name
        ? (items || []).find((o) => o.name === props.item_name) || null
        : null,
    [items, props.item_name],
  )

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={categories || []}
          id="item-type"
          size={props.size || "medium"}
          value={category_value}
          onChange={(event, value) => {
            if (value) {
              props.onTypeChange(value.subcategory)
            }
          }}
          groupBy={(o) => o.category}
          color={"secondary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("market.item_type", "Item Type")}
              aria-describedby="item-type-help"
              inputProps={{
                ...params.inputProps,
                "aria-label": t(
                  "accessibility.selectItemType",
                  "Select item type",
                ),
              }}
            />
          )}
          getOptionLabel={(option) => option.subcategory}
          aria-label={t("accessibility.itemTypeSelector", "Item type selector")}
        />
        <div id="item-type-help" className="sr-only">
          {t(
            "accessibility.itemTypeHelp",
            "Select the category of item you want to list",
          )}
        </div>
      </Grid>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={props.item_type ? items || [] : []}
          id="item-name"
          size={props.size || "medium"}
          value={item_name_value}
          onChange={(event, value) => {
            props.onItemChange(value ? value.name : null)
          }}
          color={"secondary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("market.item_name", "Item Name")}
              {...props.TextfieldProps}
              aria-describedby="item-name-help"
              inputProps={{
                ...params.inputProps,
                "aria-label": t(
                  "accessibility.selectItemName",
                  "Select item name",
                ),
              }}
            />
          )}
          getOptionLabel={(option) => option.name}
          disabled={!props.item_type || !items || items.length === 0}
          loading={itemsLoading}
          aria-label={t("accessibility.itemNameSelector", "Item name selector")}
          aria-describedby={
            !props.item_type ? "item-name-disabled-help" : "item-name-help"
          }
        />
        <div id="item-name-help" className="sr-only">
          {t(
            "accessibility.itemNameHelp",
            "Select the specific item you want to list",
          )}
        </div>
        {!props.item_type && (
          <div id="item-name-disabled-help" className="sr-only">
            {t(
              "accessibility.itemNameDisabledHelp",
              "Please select an item type first",
            )}
          </div>
        )}
      </Grid>
    </>
  )
}

export function SelectGameItem(props: SelectGameItemProps) {
  const { t } = useTranslation()
  const { data: categories } = useGetMarketCategoriesQuery()
  const { data: items, isLoading: itemsLoading } =
    useGetMarketItemsByCategoryQuery(props.item_type!, {
      skip: !props.item_type,
    })

  const category_value = useMemo(
    () =>
      categories
        ? (categories || []).find((o) => o.subcategory === props.item_type) || {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          }
        : {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          },
    [categories, props.item_type, t],
  )
  const item_name_value = useMemo(
    () =>
      props.item_name
        ? (items || []).find((o) => o.name === props.item_name) || null
        : null,
    [items, props.item_name],
  )

  return (
    <>
      <Autocomplete
        // fullWidth
        options={categories || []}
        id="item-type"
        value={category_value}
        onChange={(event, value) => {
          if (value) {
            props.onTypeChange(value.subcategory)
          }
        }}
        groupBy={(o) => o.category}
        color={"secondary"}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("market.item_type", "Item Type")}
            {...props.TextfieldProps}
            aria-describedby="item-type-help"
            inputProps={{
              ...params.inputProps,
              "aria-label": t(
                "accessibility.selectItemType",
                "Select item type",
              ),
            }}
          />
        )}
        getOptionLabel={(option) => option.subcategory}
        aria-label={t("accessibility.itemTypeSelector", "Item type selector")}
        aria-describedby="item-type-help"
      />
      <div id="item-type-help" className="sr-only">
        {t(
          "accessibility.itemTypeHelp",
          "Select the category of item you want to list",
        )}
      </div>
      <Autocomplete
        // fullWidth
        options={props.item_type ? items || [] : []}
        id="item-name"
        value={item_name_value}
        onChange={(event, value) => {
          props.onItemChange(value ? value.name : null)
        }}
        color={"secondary"}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("market.item_name", "Item Name")}
            {...props.TextfieldProps}
            aria-describedby={
              !props.item_type ? "item-name-disabled-help" : "item-name-help"
            }
            inputProps={{
              ...params.inputProps,
              "aria-label": t(
                "accessibility.selectItemName",
                "Select item name",
              ),
            }}
          />
        )}
        getOptionLabel={(option) => option.name}
        disabled={!props.item_type || !items || items.length === 0}
        loading={itemsLoading}
        aria-label={t("accessibility.itemNameSelector", "Item name selector")}
        aria-describedby={
          !props.item_type ? "item-name-disabled-help" : "item-name-help"
        }
      />
      <div id="item-name-help" className="sr-only">
        {t(
          "accessibility.itemNameHelp",
          "Select the specific item you want to list",
        )}
      </div>
      {!props.item_type && (
        <div id="item-name-disabled-help" className="sr-only">
          {t(
            "accessibility.itemNameDisabledHelp",
            "Please select an item type first",
          )}
        </div>
      )}
    </>
  )
}

export function SelectGameCategory(props: {
  item_type: string
  onTypeChange: (newValue: string) => void
  TextfieldProps?: TextFieldProps
}) {
  const { t } = useTranslation()
  const { data: categories } = useGetMarketCategoriesQuery()

  const category_value = useMemo(
    () =>
      categories
        ? (categories || []).find((o) => o.subcategory === props.item_type) || {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          }
        : {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          },
    [categories, props.item_type, t],
  )

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={categories || []}
          id="item-type"
          value={category_value}
          onChange={(event, value) => {
            if (value) {
              props.onTypeChange(value.subcategory)
            }
          }}
          groupBy={(o) => o.category}
          color={"secondary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("market.item_type", "Item Type")}
              {...props.TextfieldProps}
            />
          )}
          getOptionLabel={(option) => option.subcategory}
        />
      </Grid>
    </>
  )
}

export function SelectGameCategoryOption(props: {
  item_type: string | null
  onTypeChange: (newValue: string | null) => void
  TextfieldProps?: TextFieldProps
}) {
  const { t } = useTranslation()
  const { data: categories } = useGetMarketCategoriesQuery()

  const category_value = useMemo(
    () =>
      categories
        ? (categories || []).find((o) => o.subcategory === props.item_type) || {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          }
        : {
            category: t("market.other_category", "Other"),
            subcategory: t("market.other_category", "Other"),
          },
    [categories, props.item_type, t],
  )

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Autocomplete
          // fullWidth
          options={categories || []}
          id="item-type"
          value={category_value}
          onChange={(event, value) => {
            props.onTypeChange(value ? value.subcategory : null)
          }}
          groupBy={(o) => o.category}
          color={"secondary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("market.item_type", "Item Type")}
              {...props.TextfieldProps}
            />
          )}
          getOptionLabel={(option) => option.subcategory}
        />
      </Grid>
    </>
  )
}

import React, { useCallback, useContext, useState } from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import { GridRowModes, GridRowModesModel } from "@mui/x-data-grid"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { UniqueListing, MarketListingUpdateBody } from "../../domain/types"
import { useUpdateMarketListingMutation } from "../../api/marketApi"
import { NewListingRow } from "../types"
import { ManageStockArea, ItemStockContext } from "./ManageStockArea"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import useTheme1 from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MaterialLink from '@mui/material/Link';
import { ButtonProps } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { DialogProps } from '@mui/material/Dialog';
import Menu from '@mui/material/Menu';
import { MenuProps } from '@mui/material/Menu';
import { MenuItemProps } from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import { AccordionProps } from '@mui/material/Accordion';
import Switch from '@mui/material/Switch';
import { SwitchProps } from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import { TabProps } from '@mui/material/Tab';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TablePagination from '@mui/material/TablePagination';
import { TablePaginationProps } from '@mui/material/TablePagination';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import { GridProps } from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import { DrawerProps } from '@mui/material/Drawer';
import Checkbox from '@mui/material/Checkbox';
import { CheckboxProps } from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { IconButtonProps } from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import ListItemIcon from '@mui/material/ListItemIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BoxProps } from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Skeleton from '@mui/material/Skeleton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Toolbar from '@mui/material/Toolbar';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TransferIcon from '@mui/icons-material/SwapHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowIcon from '@mui/icons-material/ArrowForward';
import AddRounded from '@mui/icons-material/AddRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';

export function ItemStockToolbar(props: {
  listings: UniqueListing[]
  setNewRows: (newRows: (oldRows: NewListingRow[]) => NewListingRow[]) => void
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void
  newRows: NewListingRow[]
  isMobile?: boolean
  onAddQuickListing?: () => void
}) {
  const context = useContext(ItemStockContext)
  if (!context || !Array.isArray(context)) {
    return null
  }
  const [selectionModel] = context
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = props.isMobile ?? useMediaQuery(theme.breakpoints.down("md"))

  const [updateListing, { isLoading }] = useUpdateMarketListingMutation()
  const updateListingCallback = useCallback(
    async (body: MarketListingUpdateBody) => {
      selectionModel.ids.forEach((row_id) => {
        updateListing({
          listing_id: row_id.toString(),
          body,
        })
      })
    },
    [selectionModel, updateListing],
  )

  if (isMobile) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <ManageStockArea listings={props.listings} />
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <LoadingButton
            color={"success"}
            startIcon={<RadioButtonCheckedRounded />}
            variant={"outlined"}
            size={"small"}
            loading={isLoading}
            onClick={() => {
              updateListingCallback({ status: "active" })
            }}
            fullWidth
          >
            {t("ItemStock.activate")}
          </LoadingButton>
          <LoadingButton
            color={"error"}
            startIcon={<RadioButtonUncheckedRounded />}
            variant={"outlined"}
            size={"small"}
            loading={isLoading}
            onClick={() => {
              updateListingCallback({ status: "inactive" })
            }}
            fullWidth
          >
            {t("ItemStock.deactivate")}
          </LoadingButton>
          <Button
            onClick={props.onAddQuickListing}
            color="primary"
            variant="outlined"
            size="small"
            startIcon={<AddRounded />}
            sx={{ flex: "0 0 auto" }}
          >
            {t("ItemStock.addQuickListing")}
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Toolbar sx={{ justifyContent: "flex-end" }}>
      <Stack direction="row" spacing="1px">
        <ManageStockArea listings={props.listings} />
        <LoadingButton
          color={"success"}
          startIcon={<RadioButtonCheckedRounded />}
          variant={"outlined"}
          size={"small"}
          loading={isLoading}
          onClick={() => {
            updateListingCallback({ status: "active" })
          }}
        >
          {t("ItemStock.activate")}
        </LoadingButton>
        <LoadingButton
          color={"error"}
          startIcon={<RadioButtonUncheckedRounded />}
          variant={"outlined"}
          size={"small"}
          loading={isLoading}
          onClick={() => {
            updateListingCallback({ status: "inactive" })
          }}
        >
          {t("ItemStock.deactivate")}
        </LoadingButton>
        <Tooltip title={t("ItemStock.addQuickListing")}>
          <IconButton
            onClick={() => {
              const id = `new-${Date.now()}`
              const newRow: NewListingRow = {
                id,
                item_type: "Other",
                item_name: null,
                price: 1,
                quantity_available: 1,
                status: "active",
                isNew: true,
              }

              props.setNewRows((prev) => [...prev, newRow])
              props.setRowModesModel((oldModel) => ({
                ...oldModel,
                [id]: { mode: GridRowModes.Edit, fieldToFocus: "item_type" },
              }))
            }}
            color="primary"
          >
            <AddRounded />
          </IconButton>
        </Tooltip>
      </Stack>
    </Toolbar>
  )
}

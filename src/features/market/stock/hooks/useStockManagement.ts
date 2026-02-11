import { useState, useCallback, useMemo } from "react"
import { GridRowModesModel, GridRowId, GridRowModes } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import {
  useMarketRefreshListingMutation,
  useUpdateListingQuantityMutation,
  useCreateMarketListingMutation,
  useUpdateMarketListingMutation,
  useMarketGetGameItemByNameQuery,
} from "../../api/marketApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { UniqueListing } from "../../domain/types"
import { StockRow, NewListingRow } from "../types"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
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
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
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
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import CreateRounded from '@mui/icons-material/CreateRounded';

export function useStockManagement(
  listings: UniqueListing[],
  onRefresh?: () => Promise<void>,
) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [currentOrg] = useCurrentOrg()

  // API hooks
  const [refresh] = useMarketRefreshListingMutation()
  const [updateQuantity] = useUpdateListingQuantityMutation()
  const [createListing] = useCreateMarketListingMutation()
  const [updateListing] = useUpdateMarketListingMutation()

  // State
  const [newRows, setNewRows] = useState<NewListingRow[]>([])
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [editingRows, setEditingRows] = useState<
    Record<string, Partial<NewListingRow>>
  >({})
  const [fetchingItemName, setFetchingItemName] = useState<string>("")

  // Fetch item details
  const { data: gameItem } = useMarketGetGameItemByNameQuery(fetchingItemName, {
    skip: !fetchingItemName,
  })

  // Transform listings to rows
  const rows: StockRow[] = useMemo(
    () =>
      listings.map((listing) => ({
        ...listing.details,
        ...listing.listing,
        ...(listing.stats || {
          offer_count: 0,
          order_count: 0,
          view_count: 0,
        }),
        image_url: listing.photos[0],
      })),
    [listings],
  )

  // Update quantity handler
  const handleUpdateQuantity = useCallback(
    async (listingId: string, newQuantity: number) => {
      try {
        await updateQuantity({
          listing_id: listingId,
          quantity: newQuantity,
        }).unwrap()
        issueAlert({
          message: t("ItemStock.updated"),
          severity: "success",
        })
        if (onRefresh) {
          await onRefresh()
        }
      } catch (error) {
        issueAlert(error as any)
      }
    },
    [updateQuantity, issueAlert, t, onRefresh],
  )

  // Edit mode handlers
  const handleEditClick = useCallback(
    (id: GridRowId) => () => {
      const currentRow = newRows.find((row) => row.id === id)
      if (currentRow) {
        setEditingRows((prev) => ({
          ...prev,
          [id]: { ...currentRow },
        }))
      }
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
    },
    [newRows, rowModesModel],
  )

  const handleCancelClick = useCallback(
    (id: GridRowId) => () => {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      })

      const editedRow = newRows.find((row) => row.id === id)
      if (editedRow?.isNew) {
        setNewRows(newRows.filter((row) => row.id !== id))
      }
      setEditingRows((prev) => {
        const { [id]: _, ...rest } = prev
        return rest
      })
    },
    [newRows, rowModesModel],
  )

  return {
    // State
    rows,
    newRows,
    setNewRows,
    rowModesModel,
    setRowModesModel,
    editingRows,
    setEditingRows,
    fetchingItemName,
    setFetchingItemName,
    gameItem,
    currentOrg,
    // API mutations
    refresh,
    createListing,
    updateListing,
    // Handlers
    handleUpdateQuantity,
    handleEditClick,
    handleCancelClick,
    // Utils
    issueAlert,
    t,
  }
}

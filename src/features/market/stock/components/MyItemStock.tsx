import React, { useState, useMemo, useCallback } from "react"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../../../store/profile"
import { useGetMyListingsQuery } from "../../api/marketApi"
import { useMarketSearch } from "../../index"
import { DisplayStock } from "../../components/ItemStock"

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

export function MyItemStock() {
  const [currentOrg] = useCurrentOrg()
  const { data: profile, isLoading: profileLoading } = useGetUserProfileQuery()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)
  const [searchState] = useMarketSearch()

  const hasOrg = currentOrg && currentOrg.spectrum_id

  const searchQueryParams = useMemo(() => {
    return {
      page_size: perPage,
      index: page * perPage,
      quantityAvailable: searchState.quantityAvailable ?? 1,
      query: searchState.query || "",
      sort: searchState.sort || "activity",
      statuses: searchState.statuses || undefined,
      minCost: searchState.minCost || undefined,
      maxCost: searchState.maxCost || undefined,
      item_type: searchState.item_type || undefined,
      sale_type: searchState.sale_type || undefined,
    }
  }, [perPage, page, searchState])

  const finalParams = hasOrg
    ? { ...searchQueryParams, contractor_id: currentOrg?.spectrum_id }
    : searchQueryParams

  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useGetMyListingsQuery(finalParams)

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  const handleRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const listings = searchResults?.listings || []

  return (
    <>
      <DisplayStock
        listings={listings}
        total={searchResults?.total}
        page={page}
        perPage={perPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onRefresh={handleRefresh}
      />
    </>
  )
}

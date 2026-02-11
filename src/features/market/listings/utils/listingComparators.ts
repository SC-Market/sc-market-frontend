import {
  MarketListingType,
  SellerListingType,
  UniqueListing,
  MarketAggregate,
} from "../../domain/types"

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
import { DialogProps } from '@mui/material/DialogProps';
import Menu from '@mui/material/Menu';
import { MenuProps } from '@mui/material/MenuProps';
import { MenuItemProps } from '@mui/material/MenuItemProps';
import Accordion from '@mui/material/Accordion';
import { AccordionProps } from '@mui/material/AccordionProps';
import Switch from '@mui/material/Switch';
import { SwitchProps } from '@mui/material/SwitchProps';
import Tab from '@mui/material/Tab';
import { TabProps } from '@mui/material/TabProps';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TablePagination from '@mui/material/TablePagination';
import { TablePaginationProps } from '@mui/material/TablePaginationProps';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import { GridProps } from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import { DrawerProps } from '@mui/material/DrawerProps';
import Checkbox from '@mui/material/Checkbox';
import { CheckboxProps } from '@mui/material/CheckboxProps';
import IconButton from '@mui/material/IconButton';
import { IconButtonProps } from '@mui/material/IconButtonProps';
import SvgIcon from '@mui/material/SvgIcon';
import ListItemIcon from '@mui/material/ListItemIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BoxProps } from '@mui/material/BoxProps';
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

export function getComparePrice(
  listing: MarketListingType | SellerListingType,
) {
  const market_listing = listing as UniqueListing
  if (market_listing.listing?.sale_type) {
    return market_listing.listing.price
  }

  const market_aggregate = listing as MarketAggregate
  if (!market_aggregate.listings.length) {
    return 0
  }
  return market_aggregate.listings.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr,
  ).price
}

export function getCompareTimestamp(
  listing: MarketListingType | SellerListingType,
) {
  const market_listing = listing as UniqueListing
  if (market_listing.listing?.sale_type) {
    return +new Date(market_listing.listing.timestamp)
  }

  const market_aggregate = listing as MarketAggregate
  if (market_aggregate.listings.length) {
    return +new Date(
      market_aggregate.listings.reduce((prev, curr) =>
        new Date(prev.timestamp) > new Date(curr.timestamp) ? prev : curr,
      ).timestamp,
    )
  }

  return +new Date()
}

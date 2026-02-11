import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { Order } from "../../datatypes/Order"

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

export function OrderListItem(props: { order: Order }) {
  const { order } = props
  // Use customer_minimal data from the order instead of making a separate API call
  const customer = (
    order as Order & {
      customer_minimal?: { avatar: string; username: string }
    }
  ).customer_minimal

  return (
    <ListItemButton component={Link} to={`/contract/${order.order_id}`}>
      <ListItemAvatar>
        <Avatar
          variant={"rounded"}
          src={customer?.avatar}
          alt={`Avatar of ${customer?.username}`}
        />
      </ListItemAvatar>
      <ListItemText>{order.title}</ListItemText>
    </ListItemButton>
  )
}

export function OrderList(props: { title?: string | null; orders: Order[] }) {
  const orders = useMemo(() => props.orders.filter((o) => o), [props.orders])

  return (
    <List
      subheader={
        props.title ? <ListSubheader>{props.title}</ListSubheader> : undefined
      }
      sx={{ width: "100%" }}
    >
      {orders.map((o, i) => (
        <OrderListItem order={o} key={i} />
      ))}
    </List>
  )
}

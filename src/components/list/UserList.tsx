import { Contractor, MinimalContractor } from "../../datatypes/Contractor"
import React, { useMemo } from "react"
import { MinimalUser } from "../../datatypes/User"
import { Link } from "react-router-dom"
import { Discord } from "../icon/DiscordIcon"

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

function format_discord(u: MinimalUser) {
  return `@${u.discord_profile?.username}${
    u.discord_profile?.discriminator && +u.discord_profile.discriminator
      ? `#${u.discord_profile.discriminator}`
      : ""
  }`
}

export function UserList(props: {
  title?: string
  users: (MinimalUser | MinimalContractor | null | undefined)[]
}) {
  const users = useMemo(() => props.users.filter((u) => u), [props.users])

  return (
    <List
      subheader={
        props.title ? <ListSubheader>{props.title}</ListSubheader> : null
      }
      sx={{ width: "100%" }}
    >
      {users.map((u, i) => (
        <ListItemButton
          component={Link}
          key={i}
          to={
            (u as MinimalUser).username
              ? `/user/${(u as MinimalUser).username}`
              : `/contractor/${(u as MinimalContractor).spectrum_id}`
          }
        >
          <ListItemAvatar>
            <Avatar
              variant={"rounded"}
              src={u?.avatar}
              alt={`Avatar of ${
                (u as MinimalUser).username ||
                (u as MinimalContractor).spectrum_id
              }`}
            />
          </ListItemAvatar>
          <ListItemText>
            <Typography>
              {(u as MinimalUser).display_name || (u as Contractor).name}
            </Typography>
            <Typography
              alignItems={"center"}
              color={"secondary"}
              display={"flex"}
            >
              {(u as MinimalUser).discord_profile ? (
                <>
                  <Discord />
                  &nbsp;{format_discord(u as MinimalUser)}
                </>
              ) : null}
            </Typography>
          </ListItemText>
        </ListItemButton>
      ))}
    </List>
  )
}

export function UserSubtitleList(props: {
  title?: string
  users: [MinimalUser | MinimalContractor | null | undefined, string][]
}) {
  const users = useMemo(() => props.users.filter((u) => u[0]), [props.users])

  return (
    <List
      subheader={
        props.title ? <ListSubheader>{props.title}</ListSubheader> : null
      }
      sx={{ width: "100%" }}
    >
      {users.map(([u, subtitle], i) => (
        <ListItemButton
          component={Link}
          key={i}
          to={
            (u as MinimalUser).username
              ? `/user/${(u as MinimalUser).username}`
              : `/contractor/${(u as MinimalContractor).spectrum_id}`
          }
        >
          <ListItemAvatar>
            <Avatar
              variant={"rounded"}
              src={u?.avatar}
              alt={`Avatar of ${
                (u as MinimalUser).username ||
                (u as MinimalContractor).spectrum_id
              }`}
            />
          </ListItemAvatar>
          <ListItemText>
            <Typography variant={"subtitle1"} color={"text.secondary"}>
              {(u as MinimalUser).display_name || (u as Contractor).name}
            </Typography>
            <Typography variant={"subtitle2"}>{subtitle}</Typography>
          </ListItemText>
        </ListItemButton>
      ))}
    </List>
  )
}

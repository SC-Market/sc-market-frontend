import { MinimalUser, User } from "../../datatypes/User"
import { Stack } from "@mui/system"
import React from "react"
import { MinimalContractor } from "../../datatypes/Contractor"
import { UniqueListing } from "../../features/market"
import { Link } from "react-router-dom"
import { formatCompleteListingUrl, formatMarketUrl } from "../../util/urls"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import {
  MarketListingSearchResult,
  MarketSearchResult,
} from "../../features/market"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack1 from '@mui/material/Stack';
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

export function UserDetails(props: { user: MinimalUser }) {
  const { user } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      alignItems={"center"}
    >
      <Avatar src={user.avatar} />
      <Stack direction={"column"} justifyContent={"left"}>
        <MaterialLink
          component={Link}
          to={`/user/${user.username}`}
          underline={"hover"}
        >
          <Typography
            variant={"subtitle1"}
            color={"text.secondary"}
            fontWeight={"bold"}
          >
            {user.display_name}
          </Typography>
        </MaterialLink>
        <Typography variant={"subtitle2"}>{user.username}</Typography>
      </Stack>
    </Stack>
  )
}

export function OrgDetails(props: { org: MinimalContractor }) {
  const { org } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      alignItems={"center"}
    >
      <Avatar src={org.avatar} />
      <Stack direction={"column"} justifyContent={"left"}>
        <MaterialLink
          component={Link}
          to={`/contractor/${org.spectrum_id}`}
          underline={"hover"}
        >
          <Typography
            variant={"subtitle1"}
            color={"text.secondary"}
            fontWeight={"bold"}
          >
            {org.name}
          </Typography>
        </MaterialLink>
        <Typography variant={"subtitle2"}>{org.spectrum_id}</Typography>
      </Stack>
    </Stack>
  )
}

export function MarketListingDetails(props: {
  listing: MarketListingSearchResult
}) {
  const { listing } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      alignItems={"center"}
    >
      <Avatar
        src={listing.photo || FALLBACK_IMAGE_URL}
        variant={"rounded"}
        imgProps={{
          onError: ({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src = FALLBACK_IMAGE_URL
          },
        }}
      />
      <Stack direction={"column"} justifyContent={"left"}>
        <MaterialLink
          component={Link}
          to={formatMarketUrl(listing)}
          underline={"hover"}
        >
          <Typography variant={"subtitle2"} color={"text.secondary"}>
            {listing.title}
          </Typography>
        </MaterialLink>
      </Stack>
    </Stack>
  )
}

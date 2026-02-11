import { Contractor } from "../../datatypes/Contractor"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import React from "react"

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

export function UserContractorList(props: {
  contractors: {
    spectrum_id: string
    roles: string[]
    name: string
    role_details?: { role_id: string; role_name: string; position: number }[]
  }[]
}) {
  const { contractors } = props

  return (
    <List sx={{ paddingTop: 0, paddingBottom: 0 }}>
      {contractors ? (
        contractors.map((c) => (
          <UserContractorListItem key={c.spectrum_id} membership={c} />
        ))
      ) : (
        <Typography
          color={"text.primary"}
          variant={"subtitle2"}
          fontWeight={600}
        >
          This user is not a part of any organizations
        </Typography>
      )}
    </List>
  )
}

export function UserContractorListItem(props: {
  membership: {
    spectrum_id: string
    roles: string[]
    name: string
    role_details?: { role_id: string; role_name: string; position: number }[]
  }
}) {
  const {
    membership: { spectrum_id, role_details },
  } = props
  const { data: contractor } = useGetContractorBySpectrumIDQuery(spectrum_id)

  // Sort roles by position (lowest position = highest authority)
  // Handle case where role_details might be undefined (backward compatibility)
  // Create a copy to avoid mutating immutable Redux state
  const sortedRoles = [...(role_details || [])].sort(
    (a, b) => a.position - b.position,
  )

  return (
    <ListItem key={contractor?.spectrum_id}>
      <ListItemIcon
        sx={{
          width: 64,
          marginRight: 1,
        }}
      >
        <Link to={`/contractor/${contractor?.spectrum_id}`}>
          <Avatar
            variant={"rounded"}
            src={contractor?.avatar}
            alt={`Avatar of ${contractor?.spectrum_id}`}
            sx={{
              maxHeight: 60,
              maxWidth: 60,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Link>
      </ListItemIcon>
      <ListItemText>
        <Link to={`/contractor/${contractor?.spectrum_id}`}>
          <UnderlineLink
            color={"text.secondary"}
            variant={"subtitle1"}
            fontWeight={600}
            sx={{
              lineHeight: 1.24,
              marginBottom: -0.5,
            }}
          >
            {contractor?.name}
          </UnderlineLink>
        </Link>

        <Typography
          color={"text.primary"}
          variant={"subtitle2"}
          fontWeight={600}
          sx={{ textTransform: "capitalize" }}
        >
          {sortedRoles.map((roleItem, index) => (
            <span key={roleItem.role_id}>
              {roleItem.role_name}
              {index < sortedRoles.length - 1 && ", "}
            </span>
          ))}
        </Typography>
      </ListItemText>
    </ListItem>
  )
}

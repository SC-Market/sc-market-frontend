import { useTheme } from "@mui/material/styles"
import React from "react"

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
import Link from '@mui/material/Link';
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

const PROD_LIGHT_LOGO_URL =
  "https://citizenid.space/assets/prod/citizenid-icon-light.png"
const PROD_DARK_LOGO_URL =
  "https://citizenid.space/assets/prod/citizenid-icon-dark.png"

const DEV_LIGHT_LOGO_URL =
  "https://dev.citizenid.space/assets/dev/citizenid-icon-light.png"
const DEV_DARK_LOGO_URL =
  "https://dev.citizenid.space/assets/dev/citizenid-icon-dark.png"

export function CitizenIDLogo(props: { height?: number }) {
  const theme = useTheme()
  const logoHeight = props.height ?? 20
  const useDevAssets = import.meta.env.DEV
  const lightLogo = useDevAssets ? DEV_LIGHT_LOGO_URL : PROD_LIGHT_LOGO_URL
  const darkLogo = useDevAssets ? DEV_DARK_LOGO_URL : PROD_DARK_LOGO_URL
  const logoSrc = theme.palette.mode === "dark" ? lightLogo : darkLogo

  return (
    <Box
      component="img"
      src={logoSrc}
      alt=""
      role="presentation"
      sx={{
        height: logoHeight,
        width: "auto",
        display: "block",
      }}
    />
  )
}

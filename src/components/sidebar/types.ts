import { ReactNode } from "react"

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import SecurityRounded from '@mui/icons-material/SecurityRounded';

export interface SidebarItemProps {
  to?: string
  params?: string
  text: string
  icon?: ReactNode
  chip?: ReactNode
  children?: SidebarItemProps[]
  hidden?: boolean
  logged_in?: boolean
  org?: boolean
  org_admin?: boolean
  site_admin?: boolean
  custom?: boolean
  external?: boolean
  toOrgPublic?: boolean
  orgRouteRest?: string
}

export interface SidebarSectionProps {
  title: string
  items: SidebarItemProps[]
}

export interface SidebarLinkProps extends SidebarItemProps {
  to: string
  isStarred?: boolean
  onToggleStar?: (path: string) => void
}

export interface SidebarItemWithStarProps extends SidebarItemProps {
  isStarred?: boolean
  onToggleStar?: (path: string) => void
  starredItems?: string[]
}

import type {} from "@mui/x-data-grid/themeAugmentation"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions1 from '@mui/material/ThemeOptions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    xxl: true
  }

  interface TypeBackground {
    navbar: string
    sidebar: string
    light: string
    overlay: string
    overlayDark: string
    imageOverlay: string
    imageOverlayHover: string
  }

  interface TypeAction {
    hover: string
  }

  interface CommonColors {
    subheader: string
    focus: string
    badge: {
      gold: string
      silver: string
      bronze: string
      purple: string
    }
  }

  interface LayoutSpacing {
    layout: number
    component: number
    text: number
    compact: number
  }

  interface BorderRadius {
    topLevel: number
    image: number
    button: number
    input: number
    minimal: number
  }

  interface Palette {
    discord: Palette["primary"]
    outline: Palette["primary"]
  }

  interface PaletteOptions {
    discord?: PaletteOptions["primary"]
    outline?: PaletteOptions["primary"]
  }

  interface ThemeOptions {
    navKind?: "elevation" | "outlined"
    layoutSpacing?: Partial<LayoutSpacing>
    borderRadius?: Partial<BorderRadius>
  }

  interface Theme {
    navKind?: "elevation" | "outlined"
    layoutSpacing: LayoutSpacing
    borderRadius: BorderRadius
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    discord: true
  }
}

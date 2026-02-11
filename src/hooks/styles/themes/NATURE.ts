import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
} from "../Theme"

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
import ThemeOptions from '@mui/material/ThemeOptions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
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

export const natureThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#2D5016", // Deep forest green
        contrastText: "#FFFFFF",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#6B8E23", // Olive green
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#2C3E1F", // Dark green-gray
      secondary: "#4A5D2E",
      disabled: "#A0A0A0",
    },
    background: {
      default: "#F5F7F0", // Very light green-tinted white
      paper: "#FFFFFF",
      sidebar: "#F0F4E8", // Light sage green
      navbar: "#FFFFFF",
      light: "#FFFFFF",
      overlay: "rgba(45, 80, 22, 0.4)", // Forest green overlay
      overlayDark: "rgba(45, 80, 22, 0.6)",
      imageOverlay: "rgba(45, 80, 22, 0.5)",
      imageOverlayHover: "rgba(45, 80, 22, 0.7)",
    },
    outline: {
      main: "rgba(107, 142, 35, 0.3)", // Olive green outline
    },
    action: {
      hover: "rgba(107, 142, 35, 0.1)", // Light olive hover
    },
    common: {
      subheader: "#6B7A4F", // Muted green-gray
      focus: "#2D5016",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  navKind: "outlined",
  components: {
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        outlined: {
          border: "1px solid rgba(107, 142, 35, 0.3)",
          boxShadow:
            "rgba(107, 142, 35, 0.1) 0px 0px 2px 0px, rgba(107, 142, 35, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(107, 142, 35, 0.3)",
          boxShadow:
            "rgba(107, 142, 35, 0.1) 0px 0px 2px 0px, rgba(107, 142, 35, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          bgcolor: "rgba(107, 142, 35, 0.2)",
          "&::before, &::after": {
            borderColor: "rgba(107, 142, 35, 0.2)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(107, 142, 35, 0.2)",
        },
      },
    },
  },
}

export const NATURE_theme = responsiveFontSizes(
  createTheme(
    themeBase,
    mainThemeOptions,
    lightThemeOptions,
    natureThemeOptions,
  ),
)

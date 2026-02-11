import { mainThemeOptions, refTheme, themeBase } from "../Theme"

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
import { ThemeOptions } from '@mui/material/styles';
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

export const industrialThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#FFC107", // Vibrant yellow for industrial accents
        contrastText: "#000000",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#4A90E2", // Steel blue
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#E8E8E8",
      secondary: "#B8B8B8",
      disabled: "#666666",
    },
    background: {
      default: "#1A1A1A", // Deep charcoal
      paper: "#2A2A2A", // Slightly lighter charcoal
      sidebar: "#252525", // Medium gray
      navbar: "#252525",
      light: "#FFFFFF",
      overlay: "rgba(0, 0, 0, 0.6)",
      overlayDark: "rgba(0, 0, 0, 0.8)",
      imageOverlay: "rgba(0, 0, 0, 0.85)",
      imageOverlayHover: "rgba(0, 0, 0, 0.95)",
    },
    outline: {
      main: "rgba(255, 193, 7, 0.3)", // Yellow outline with transparency
    },
    action: {
      hover: "rgba(255, 193, 7, 0.15)", // Yellow hover with low opacity
    },
    common: {
      subheader: "#888888",
      focus: "#FFC107",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  borderRadius: {
    topLevel: 0,
    image: 0,
    button: 0,
    input: 0,
    minimal: 0,
  },
  navKind: "outlined",
  components: {
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        outlined: {
          border: "1px solid rgba(255, 193, 7, 0.3)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 193, 7, 0.3)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: "rgba(255, 193, 7, 0.3)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(255, 193, 7, 0.3)",
        },
      },
    },
  },
}

export const INDUSTRIAL_theme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions, industrialThemeOptions),
)

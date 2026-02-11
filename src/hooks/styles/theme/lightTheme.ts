import { refTheme } from "./constants"
import { themeBase } from "./baseTheme"
import type { ExtendedThemeOptions } from "./constants"

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

export const lightThemeOptions: ExtendedThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#10b881",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#4e36f5",
      },
    }),
    outline: {
      main: "rgba(0, 0, 0, 0.12)",
    },
    text: {
      primary: "#000000AA",
      secondary: "#000000",
      disabled: "#EEEEEEC0",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
      navbar: "#101827",
      sidebar: "#101827",
      overlay: "rgba(0, 0, 0, 0.5)",
      overlayDark: "rgba(0, 0, 0, 0.7)",
      imageOverlay: "rgba(0, 0, 0, 0.6)",
      imageOverlayHover: "rgba(0, 0, 0, 0.8)",
    },
    action: {
      hover: "rgba(0, 0, 0, 0.04)",
    },
    common: {
      subheader: "rgba(0, 0, 0, 0.6)",
      focus: "#1976d2",
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
          boxShadow:
            "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        // MUI Card accepts outlined variant at runtime; types are incomplete
        // @ts-expect-error - outlined variant style override
        outlined: {
          boxShadow:
            "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          bgcolor: "rgba(0, 0, 0, 0.12)",
          "&::before, &::after": {
            borderColor: "rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {},
      },
    },
  },
}

export const lightTheme = responsiveFontSizes(
  createTheme(themeBase, lightThemeOptions),
)

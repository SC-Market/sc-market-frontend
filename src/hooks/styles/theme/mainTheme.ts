import { refTheme, mainOutline } from "./constants"
import { themeBase } from "./baseTheme"
import type { ExtendedTheme } from "./utils"
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

export const mainThemeOptions: ExtendedThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#10b881" } }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#7a7efe",
        contrastText: "#111828",
      },
    }),
    text: {
      primary: "#b7b7b7",
      secondary: "#e8e8e8",
      disabled: "#EEEEEEC0",
    },
    DataGrid: {
      bg: "transparent",
      pinnedBg: "transparent",
      headerBg: "transparent",
    },
    background: {
      default: "#0b0f1a",
      paper: "#111828",
      sidebar: "#111828",
      navbar: "#111828",
      light: "#FFF",
      overlay: "rgba(0, 0, 0, 0.5)",
      overlayDark: "rgba(0, 0, 0, 0.7)",
      imageOverlay: "rgba(0, 0, 0, 0.8)",
      imageOverlayHover: "rgba(0, 0, 0, 0.9)",
    },
    outline: {
      main: mainOutline,
    },
    action: {
      hover: "rgba(36, 41, 58, 0.43)",
    },
    common: {
      subheader: "#929ca1",
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
    MuiDataGrid: {
      styleOverrides: {
        root: {
          "--DataGrid-containerBackground":
            "var(--mui-palette-background-paper)",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        outlined: {
          border: `1px solid ${mainOutline}`,
        },
        root: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            borderRadius: theme.spacing(extTheme.borderRadius.topLevel),
          }
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            border: `1px solid ${mainOutline}`,
            borderRadius: theme.spacing(extTheme.borderRadius.topLevel),
          }
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: mainOutline,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: mainOutline,
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiInputAdornment: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disablePortal: true,
        },
      },
      styleOverrides: {
        icon: {
          color: "inherit",
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        disablePortal: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: "#0b0f1a",
        },
        "*:focus": {
          outlineColor: "var(--mui-palette-common-focus, #1976d2)",
        },
      },
    },
  },
}

export const mainTheme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions),
)

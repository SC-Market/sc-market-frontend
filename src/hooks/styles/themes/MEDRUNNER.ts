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
import ThemeOptions from '@mui/material/styles';
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

export const medrunnerThemeOptions: ThemeOptions = {
  palette: {
    // 27354a
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "rgb(155, 0, 2)",
        // light: '#b000cc',
        // contrastText: '#89348c'
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "rgb(40, 217, 199)",
        contrastText: "#FFF",
        // light: '#79018C'
      },
    }),
    background: {
      // default: "linear-gradient(45deg, #cb5cff, #9c61f8)",
      default: "#eeeff2",
      // default: "url(https://wallpaperaccess.com/download/dark-minimalist-568180)",
      // default: "url(https://wallpaperaccess.com/download/minimalist-space-1145565)",
      paper: "#FFFFFF",
      sidebar: "#FFFFFF",
      navbar: "transparent",
    },
    common: {
      subheader: "rgba(155, 0, 2, 0.7)", // Dark red for subheaders
      focus: "rgb(155, 0, 2)",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  borderRadius: {
    topLevel: 1.5, // Increased from 0.375 (3px) to 1.5 (12px)
    image: 1.5, // Increased from 0.375 (3px) to 1.5 (12px)
    button: 2, // Increased from 1 (8px) to 2 (16px)
    input: 1, // Increased from 0.5 (4px) to 1 (8px)
    minimal: 0,
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 8,
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 8,
      },
    },
  },
}

export const MEDRUNNER_theme = responsiveFontSizes(
  createTheme(
    themeBase,
    mainThemeOptions,
    lightThemeOptions,
    medrunnerThemeOptions,
  ),
)

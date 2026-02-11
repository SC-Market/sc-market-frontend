import { useTheme, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

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
import useTheme1 from '@mui/material/styles';
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
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/Paper';
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
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';

export function MsgPaper(
  props: PaperProps & {
    other?: boolean
    author:
      | {
          username: string
          avatar: string
        }
      | null
      | undefined
  },
) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { author, other, ...paperProps } = props

  if (author) {
    return (
      <Paper
        {...paperProps}
        sx={{
          bgcolor: other
            ? theme.palette.background.paper
            : theme.palette.secondary.main,
          padding: 1,
          paddingRight: 2,
          paddingLeft: 2,
          marginRight: 2,
          display: "inline-block",
          whiteSpace: "pre-line",
          borderRadius: theme.spacing(theme.borderRadius.button),
          width: "100%",
        }}
      >
        <MaterialLink
          component={Link}
          to={`/user/${author?.username}`}
          color={
            other ? "text.secondary" : theme.palette.secondary.contrastText
          }
        >
          <Typography variant={"subtitle2"}>{author?.username}</Typography>
        </MaterialLink>

        {props.children}
      </Paper>
    )
  } else {
    return (
      <Paper
        {...paperProps}
        sx={{
          bgcolor: other
            ? theme.palette.background.paper
            : theme.palette.secondary.main,
          padding: 1,
          paddingRight: 2,
          paddingLeft: 2,
          marginRight: 2,
          display: "inline-block",
          whiteSpace: "pre-line",
          maxWidth: 400,
          flexGrow: 1,
          borderRadius: theme.spacing(theme.borderRadius.button),
        }}
      >
        <Typography variant={"subtitle2"}>
          {t("MessagesBody.system")}
        </Typography>
        {props.children}
      </Paper>
    )
  }
}

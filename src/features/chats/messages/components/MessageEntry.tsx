import { useTheme, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../../../store/profile"
import { getRelativeTime } from "../../../../util/time"
import SCMarketLogo from "../../../../assets/scmarket-logo.webp"
import { useMemo } from "react"
import type { Message } from "../../domain/types"
import { replaceDiscordTimestamps } from "../utils/timestampFormatter"
import { MsgPaper } from "./MsgPaper"

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
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Fab from '@mui/material/Fab';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import Autocomplete from '@mui/material/Autocomplete';
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
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import WarningRounded from '@mui/icons-material/WarningRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import SyncProblemRounded from '@mui/icons-material/SyncProblemRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRounded from '@mui/icons-material/RemoveCircleOutlineRounded';

export function MessageEntry(props: { message: Message }) {
  const { message } = props
  const { data: profile } = useGetUserProfileQuery()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const theme = useTheme<ExtendedTheme>()
  const convertedContent = useMemo(
    () => replaceDiscordTimestamps(message.content),
    [message.content],
  )

  if (message.author === profile?.username) {
    return (
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        justifyContent={"flex-end"}
        sx={{ marginBottom: 1 }}
      >
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "75%", sm: "80%" },
            minWidth: 0,
          }}
        >
          <MsgPaper author={author}>
            <Typography
              color={theme.palette.secondary.contrastText}
              align={"left"}
              width={"100%"}
              sx={{
                fontWeight: 400,
                overflowWrap: "break-word",
                fontSize: ".9em",
              }}
            >
              {convertedContent}
            </Typography>
          </MsgPaper>
          <Typography
            align={"right"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginRight: 4,
              fontSize: "0.75em",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Box>

        <Link to={`/user/${message.author}`}>
          <Avatar
            variant="rounded"
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              flexShrink: 0,
            }}
            src={author?.avatar}
          />
        </Link>
      </Stack>
    )
  } else if (!message.author) {
    return (
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        justifyContent={"flex-start"}
        sx={{ marginBottom: 1 }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            flexShrink: 0,
          }}
          src={SCMarketLogo}
        />
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "85%", sm: "90%" },
            minWidth: 0,
          }}
        >
          <MsgPaper other author={author}>
            <Typography
              color={theme.palette.text.secondary}
              align={"left"}
              width={"100%"}
              sx={{
                fontWeight: 400,
                overflowWrap: "break-word",
                fontSize: ".9em",
              }}
            >
              {convertedContent}
            </Typography>
          </MsgPaper>
          <Typography
            align={"left"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginLeft: 2,
              fontSize: "0.75em",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Box>
      </Stack>
    )
  } else {
    return (
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        justifyContent={"flex-end"}
        sx={{ marginBottom: 1 }}
      >
        <Link to={`/user/${message.author}`}>
          <Avatar
            variant="rounded"
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              flexShrink: 0,
            }}
            src={author?.avatar}
          />
        </Link>
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "85%", sm: "90%" },
            minWidth: 0,
          }}
        >
          <MsgPaper other author={author}>
            <Typography
              color={theme.palette.text.secondary}
              align={"left"}
              width={"100%"}
              sx={{
                fontWeight: 400,
                overflowWrap: "break-word",
                fontSize: ".9em",
              }}
            >
              {convertedContent}
            </Typography>
          </MsgPaper>
          <Typography
            align={"left"}
            color={"text.primary"}
            variant={"subtitle2"}
            sx={{
              marginTop: 0.5,
              marginLeft: 2,
              fontSize: "0.75em",
              lineHeight: 1.66,
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Box>
      </Stack>
    )
  }
}

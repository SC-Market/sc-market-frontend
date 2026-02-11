import { useTheme, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded"
import { Link } from "react-router-dom"
import { useGetUserByUsernameQuery } from "../../../../store/profile"
import { getRelativeTime } from "../../../../util/time"
import { MarkdownRender } from "../../../../components/markdown/Markdown"
import { LongPressMenu } from "../../../../components/gestures"
import SCMarketLogo from "../../../../assets/scmarket-logo.webp"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import type { Message } from "../../domain/types"
import { replaceDiscordTimestamps } from "../utils/timestampFormatter"

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
import ThemeOptions from '@mui/material/ThemeOptions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
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

export function MessageEntry2(props: { message: Message }) {
  const { message } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const convertedContent = useMemo(
    () => replaceDiscordTimestamps(message.content),
    [message.content],
  )

  const longPressActions = useMemo(() => {
    if (!message.content) return []
    return [
      {
        label: t("messages.copy", { defaultValue: "Copy" }),
        icon: <ContentCopyRounded />,
        onClick: () => {
          navigator.clipboard.writeText(message.content || "")
        },
      },
    ]
  }, [message.content, t])

  const messageContent = (
    <Stack
      direction={"row"}
      spacing={theme.layoutSpacing.compact}
      justifyContent={"flex-start"}
    >
      {message.author ? (
        <Link to={`/user/${author?.username}`}>
          <Avatar
            variant="rounded"
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              flexShrink: 0,
            }}
            src={author?.avatar || SCMarketLogo}
          />
        </Link>
      ) : (
        <Avatar
          variant="rounded"
          sx={{
            width: { xs: 36, sm: 42 },
            height: { xs: 36, sm: 42 },
            flexShrink: 0,
          }}
          src={SCMarketLogo}
        />
      )}

      <Stack direction={"column"}>
        <Stack
          direction={"row"}
          spacing={theme.layoutSpacing.compact}
          alignItems={"flex-end"}
        >
          {message.author ? (
            <MaterialLink
              component={Link}
              to={`/user/${author?.username}`}
              color={"text.secondary"}
            >
              <Typography variant={"subtitle2"}>{author?.username}</Typography>
            </MaterialLink>
          ) : (
            <Typography variant={"subtitle2"}>
              {t("MessagesBody.system")}
            </Typography>
          )}
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
        </Stack>
        <Box
          sx={{
            "& p": {
              margin: 0,
              marginBottom: 0.5,
              "&:last-child": { marginBottom: 0 },
            },
          }}
        >
          <MarkdownRender text={convertedContent} />
        </Box>
      </Stack>
    </Stack>
  )

  if (isMobile && longPressActions.length > 0) {
    return (
      <LongPressMenu actions={longPressActions} enabled={isMobile}>
        {messageContent}
      </LongPressMenu>
    )
  }

  return messageContent
}

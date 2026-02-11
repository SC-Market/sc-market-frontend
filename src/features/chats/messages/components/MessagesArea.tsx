import { useTheme, createTheme } from "@mui/material/styles";
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useCurrentChat } from "../../hooks/CurrentChat"
import React, { RefObject, useEffect } from "react"
import type { Message } from "../../domain/types"
import { MessageEntry2 } from "./MessageEntry2"

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

export function MessagesArea(props: {
  messages: Message[]
  messageBoxRef: RefObject<HTMLDivElement | null>
  maxHeight?: number
  inputAreaHeight?: number
}) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { messageBoxRef, inputAreaHeight } = props
  const [chat] = useCurrentChat()

  useEffect(() => {
    const currentRef = messageBoxRef.current
    if (currentRef) {
      currentRef.scrollTop = currentRef.scrollHeight
    }
  }, [messageBoxRef, chat, props.messages])

  const { messages } = props
  return (
    <React.Fragment>
      <Box
        ref={messageBoxRef}
        sx={{
          flexGrow: 1,
          width: "100%",
          padding: { xs: 1.5, sm: 2 },
          paddingBottom: { xs: 2, sm: 2 },
          borderColor: theme.palette.outline.main,
          boxSizing: "border-box",
          borderWidth: 0,
          borderStyle: "solid",
          overflow: "auto",
          maxHeight: props.maxHeight,
          WebkitOverflowScrolling: "touch",
          minHeight: 0,
          flex: 1,
          marginBottom:
            isMobile && inputAreaHeight ? `${inputAreaHeight}px` : 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack spacing={theme.layoutSpacing.compact}>
          {messages.map((message: Message) => (
            <MessageEntry2
              message={message}
              key={`${message.timestamp}-${message.author}-${message.content.substring(0, 20)}`}
            />
          ))}
        </Stack>
        <div ref={props.messageBoxRef} />
      </Box>
    </React.Fragment>
  )
}

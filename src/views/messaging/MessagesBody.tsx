import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Grid,
  IconButton,
  Link as MaterialLink,
  Paper,
  PaperProps,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material"
import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Message } from "../../datatypes/Chat"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import { getRelativeTime } from "../../util/time"
import { useMessagingSidebar } from "../../hooks/messaging/MessagingSidebar"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { ChevronLeftRounded } from "@mui/icons-material"
import { useCurrentChat } from "../../hooks/messaging/CurrentChat"
import { useSendChatMessageMutation } from "../../store/chats"
import { io } from "socket.io-client"
import { WS_URL } from "../../util/constants"
import { Stack } from "@mui/system"
import SCMarketLogo from "../../assets/scmarket-logo.png"
import { DateTimePicker } from "@mui/x-date-pickers"
import moment from "moment"
import { useTranslation } from "react-i18next"

function MessageHeader() {
  const profile = useGetUserProfileQuery()
  const theme = useTheme<ExtendedTheme>()
  const [messageSidebarOpen, setMessageSidebar] = useMessagingSidebar()

  const [chat] = useCurrentChat()

  const [dateTime, setDateTime] = useState(moment())
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        paddingTop: 2,
        paddingLeft: 2,
        boxSizing: "border-box",
        borderWidth: 0,
        borderBottom: `solid 1px ${theme.palette.outline.main}`,
        bgcolor: theme.palette.background.paper,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {chat?.participants?.length ? (
        <Box
          sx={{
            display: "flex",
            overflow: "hide",
            width: "100%",
            maxWidth: "100%",
          }}
          alignItems={"center"}
        >
          {messageSidebarOpen !== undefined && (
            <IconButton
              color="secondary"
              aria-label={t("MessagesBody.toggleSidebar")}
              onClick={() => {
                setMessageSidebar((v) => !v)
              }}
              sx={{ marginRight: 3 }}
            >
              {!messageSidebarOpen ? <MenuIcon /> : <ChevronLeftRounded />}
            </IconButton>
          )}

          <Tooltip
            title={chat!.participants
              .filter(
                (part) =>
                  chat?.participants?.length === 1 ||
                  part.username !== profile.data?.username,
              )
              .map((part) => part.username)
              .join(", ")}
          >
            <AvatarGroup max={3} spacing={"small"}>
              {chat!.participants
                .filter(
                  (part) =>
                    chat?.participants?.length === 1 ||
                    part.username !== profile.data?.username,
                )
                .map((part) => (
                  <Avatar
                    alt={part.username}
                    src={part.avatar}
                    key={part.username}
                  />
                ))}
            </AvatarGroup>
          </Tooltip>

          <Box sx={{ marginLeft: 1, overflow: "hidden" }}>
            <Typography noWrap align={"left"} color={"text.secondary"}>
              {chat!.participants
                .filter(
                  (part) =>
                    chat?.participants?.length === 1 ||
                    part.username !== profile.data?.username,
                )
                .map((part) => part.username)
                .join(", ")}
            </Typography>
          </Box>
        </Box>
      ) : null}

      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        useFlexGap
        alignItems={"center"}
        justifyContent={"right"}
      >
        <DateTimePicker
          value={dateTime}
          onChange={(newValue) => {
            if (newValue) {
              setDateTime(newValue)
            }
          }}
        />
        <Button
          onClick={() => {
            navigator.clipboard.writeText(
              `<t:${Math.trunc(dateTime.valueOf() / 1000)}:D>`,
            )
          }}
        >
          {t("MessagesBody.copyDate")}
        </Button>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(
              `<t:${Math.trunc(dateTime.valueOf() / 1000)}:t>`,
            )
          }}
        >
          {t("MessagesBody.copyTime")}
        </Button>
      </Stack>
    </Box>
  )
}

// function MessageItem(props: { message: Message }) {
//     return (
//
//     )
// }

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

// Replace Discord-like timestamp tags in messages with human-readable strings
function replaceDiscordTimestamps(input: string) {
  return input.replace(
    /<t:(\d+):([dDtTfFR])>/g,
    (match, timestamp, formatChar) => {
      const date = new Date(parseInt(timestamp, 10) * 1000)

      let options

      switch (formatChar.toLowerCase()) {
        case "t": // short time
          options = { hour: "2-digit", minute: "2-digit" } as const
          break
        case "T": // long time
          options = {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          } as const
          break
        case "d": // short date
          options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          } as const
          break
        case "D": // long date
          options = { year: "numeric", month: "long", day: "numeric" } as const
          break
        case "f": // short date/time
          options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          } as const
          break
        case "F": // long date/time
          options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          } as const
          break
        case "R": {
          // Relative time
          const now = new Date()
          const diff = (+date - +now) / 1000
          const rtf = new Intl.RelativeTimeFormat(undefined, {
            numeric: "auto",
          })

          const ranges = [
            ["year", 60 * 60 * 24 * 365],
            ["month", 60 * 60 * 24 * 30],
            ["week", 60 * 60 * 24 * 7],
            ["day", 60 * 60 * 24],
            ["hour", 60 * 60],
            ["minute", 60],
            ["second", 1],
          ] as const

          for (const [unit, secondsInUnit] of ranges) {
            const delta = Math.round(diff / secondsInUnit)
            if (Math.abs(delta) >= 1) {
              return rtf.format(delta, unit)
            }
          }
          return rtf.format(0, "second")
        }
        default:
          return match // fallback: return original
      }

      return date.toLocaleString(undefined, options)
    },
  )
}

function MessageEntry2(props: { message: Message }) {
  const { message } = props
  const { data: profile } = useGetUserProfileQuery()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const convertedContent = useMemo(
    () => replaceDiscordTimestamps(message.content),
    [message.content],
  )

  return (
    <Stack direction={"row"} spacing={theme.layoutSpacing.compact} justifyContent={"flex-start"}>
      {message.author ? (
        <Link to={`/user/${author?.username}`}>
          <Avatar
            variant="rounded"
            sx={{ width: 42, height: 42 }}
            src={author?.avatar || SCMarketLogo}
          />
        </Link>
      ) : (
        <Avatar
          variant="rounded"
          sx={{ width: 42, height: 42 }}
          src={SCMarketLogo}
        />
      )}

      <Stack direction={"column"}>
        <Stack direction={"row"} spacing={theme.layoutSpacing.compact} alignItems={"flex-end"}>
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
              {t("MessagesBody.scMarket")}
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
        <Typography variant={"subtitle2"}>{convertedContent}</Typography>
      </Stack>
    </Stack>
  )
}

function MessageEntry(props: { message: Message }) {
  const { message } = props
  const { data: profile } = useGetUserProfileQuery()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const theme = useTheme<ExtendedTheme>()
  const convertedContent = useMemo(
    () => replaceDiscordTimestamps(message.content),
    [message.content],
  ) // todo add a popover for the original date content

  // Message from the current user
  if (message.author === profile?.username) {
    return (
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        justifyContent={"flex-end"}
        sx={{ marginBottom: 1 }}
      >
        <Box sx={{ flexGrow: 1, maxWidth: "80%" }}>
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
            sx={{ width: 36, height: 36 }}
            src={author?.avatar}
          />
        </Link>
      </Stack>
    )
  }
  // System message
  else if (!message.author) {
    return (
      <Stack
        direction={"row"}
        spacing={theme.layoutSpacing.compact}
        justifyContent={"flex-start"}
        sx={{ marginBottom: 1 }}
      >
        <Avatar
          variant="rounded"
          sx={{ width: 36, height: 36 }}
          src={SCMarketLogo}
        />
        <Box sx={{ flexGrow: 1, maxWidth: "90%" }}>
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
  // Message from another user
  else {
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
            sx={{ width: 36, height: 36 }}
            src={author?.avatar}
          />
        </Link>
        <Box sx={{ flexGrow: 1, maxWidth: "90%" }}>
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

function MessagesArea(props: {
  messages: Message[]
  messageBoxRef: RefObject<HTMLDivElement | null>
  maxHeight?: number
}) {
  const theme = useTheme<ExtendedTheme>()
  const { messageBoxRef } = props
  const [chat] = useCurrentChat()

  useEffect(() => {
    const currentRef = messageBoxRef.current
    if (currentRef) {
      currentRef.scrollTop = currentRef.scrollHeight
    }
  }, [messageBoxRef, chat])

  const { messages } = props
  return (
    <React.Fragment>
      <Box
        ref={messageBoxRef}
        sx={{
          flexGrow: 1,
          width: "100%",
          padding: 2,
          borderColor: theme.palette.outline.main,
          boxSizing: "border-box",
          borderWidth: 0,
          borderStyle: "solid",
          overflow: "scroll",
          maxHeight: props.maxHeight,
        }}
      >
        <Stack spacing={theme.layoutSpacing.compact}>
          {messages.map((message: Message) => (
            <MessageEntry2 message={message} key={message.timestamp} />
          ))}
        </Stack>
        <div ref={props.messageBoxRef} />
      </Box>
    </React.Fragment>
  )
}

function MessageSendArea(props: { onSend: (content: string) => void }) {
  const theme = useTheme<ExtendedTheme>()
  const [textEntry, setTextEntry] = useState("")
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        width: "100%",
        padding: 1,
        borderTopColor: theme.palette.outline.main,
        boxSizing: "border-box",
        borderWidth: 0,
        borderTop: `solid 1px ${theme.palette.outline.main}`,
        display: "flex",
        bgcolor: theme.palette.background.paper,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        variant={"outlined"}
        sx={{ marginRight: 2 }}
        value={textEntry}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setTextEntry(event.target.value)
        }}
      />
      <Button
        variant={"outlined"}
        sx={{ maxHeight: 60 }}
        onClick={() => {
          props.onSend(textEntry)
          setTextEntry("")
        }}
      >
        {t("MessagesBody.send")}
      </Button>
    </Box>
  )
}

export const socket = io(WS_URL, {
  withCredentials: true,
  path: "/ws",
  reconnectionDelay: 4000,
  autoConnect: false,
  secure: true,
  transports: ["websocket", "polling", "xhr-polling"],
})

/**
 * The main messages body used across Orders and Offers
 */
export function MessagesBody(props: { maxHeight?: number }) {
  const theme = useTheme<ExtendedTheme>()
  const [currentChat, setCurrentChat] = useCurrentChat()
  const messageBoxRef = useRef<HTMLDivElement>(null)
  const [sendChatMessage] = useSendChatMessageMutation()
  const { isSuccess } = useGetUserProfileQuery()

  useEffect(() => {
    if (isSuccess && !socket.connected) {
      socket.connect()
    }

    if (!isSuccess || socket.connected) {
      socket.disconnect()
    }
  }, [isSuccess])

  useEffect(() => {
    function onServerMessage(message: Message): void {
      setCurrentChat((chat) => {
        if (chat && message.chat_id === chat.chat_id) {
          return {
            ...chat,
            messages: chat.messages.concat([message]),
          }
        } else {
          return chat
        }
      })
    }
    socket.on("serverMessage", onServerMessage)
    return () => {
      socket.off("serverMessage", onServerMessage)
    }
  }, [])

  useEffect(() => {
    if (currentChat) {
      socket.emit("clientJoinRoom", { chat_id: currentChat.chat_id })
    }
    return () => {
      if (currentChat) {
        socket.emit("clientLeaveRoom", { chat_id: currentChat.chat_id })
      }
    }
  }, [currentChat?.chat_id])

  const onSend = useCallback(
    (content: string) => {
      if (content) {
        sendChatMessage({ chat_id: currentChat!.chat_id, content })
      }
    },
    [currentChat, sendChatMessage],
  )

  return (
    <>
      {currentChat && (
        <React.Fragment>
          <MessageHeader />
          <MessagesArea
            messages={currentChat.messages}
            messageBoxRef={messageBoxRef}
            maxHeight={props.maxHeight}
          />
          <MessageSendArea onSend={onSend} />
        </React.Fragment>
      )}
    </>
  )
}

import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Link as MaterialLink,
  Paper,
  PaperProps,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material"
import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import BusinessIcon from "@mui/icons-material/BusinessRounded"
import DescriptionIcon from "@mui/icons-material/DescriptionRounded"
import SendIcon from "@mui/icons-material/SendRounded"
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded"
import { UserParticipant, ContractorParticipant } from "../../datatypes/Chat"
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
import { useSendChatMessageMutation, useGetChatByIDQuery } from "../../store/chats"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import { WS_URL } from "../../util/constants"
import { Stack } from "@mui/system"
import SCMarketLogo from "../../assets/scmarket-logo.png"
import { DateTimePicker } from "@mui/x-date-pickers"
import moment from "moment"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { LongPressMenu } from "../../components/gestures"

function MessageHeader() {
  const profile = useGetUserProfileQuery()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [messageSidebarOpen, setMessageSidebar] = useMessagingSidebar()
  const navigate = useNavigate()

  const [chat] = useCurrentChat()

  const [dateTime, setDateTime] = useState(moment())
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        width: "100%",
        padding: { xs: 1.5, sm: 2 },
        boxSizing: "border-box",
        borderWidth: 0,
        borderBottom: `solid 1px ${theme.palette.outline.main}`,
        bgcolor: theme.palette.background.paper,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: { xs: 1, sm: 0 },
        minHeight: { xs: "auto", sm: 64 },
      }}
    >
      {chat?.participants?.length ? (
        <Box
          sx={{
            display: "flex",
            overflow: "hidden",
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
                if (isMobile) {
                  // On mobile, navigate back to messages list
                  navigate("/messages")
                } else {
                  // On desktop, toggle sidebar
                  setMessageSidebar((v) => !v)
                }
              }}
              sx={{
                marginRight: { xs: 1, sm: 3 },
                display: { xs: "flex", sm: "flex" },
                flexShrink: 0,
              }}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? (
                <ChevronLeftRounded />
              ) : !messageSidebarOpen ? (
                <MenuIcon />
              ) : (
                <ChevronLeftRounded />
              )}
            </IconButton>
          )}

          {(() => {
            // Separate user and contractor participants
            const userParticipants = chat!.participants.filter(
              (p): p is UserParticipant => p.type === "user",
            )
            const contractorParticipants = chat!.participants.filter(
              (p): p is ContractorParticipant => p.type === "contractor",
            )

            const otherUsers = userParticipants.filter(
              (part) =>
                userParticipants.length === 1 ||
                part.username !== profile.data?.username,
            )

            const participantNames = [
              ...otherUsers.map((u) => u.username),
              ...contractorParticipants.map((c) => c.name),
            ]

            return (
              <>
                <Tooltip title={participantNames.join(", ")}>
                  <AvatarGroup max={3} spacing={"small"} sx={{ flexShrink: 0 }}>
                    {otherUsers.map((part) => (
                      <Avatar
                        alt={part.username}
                        src={part.avatar}
                        key={part.username}
                      />
                    ))}
                    {contractorParticipants.map((part) => (
                      <Avatar
                        alt={part.name}
                        src={part.avatar}
                        key={part.spectrum_id}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Tooltip>

                <Box
                  sx={{
                    marginLeft: 1,
                    overflow: "hidden",
                    flexGrow: 1,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      flexWrap: "wrap",
                    }}
                  >
                    {chat!.title ? (
                      <Typography
                        noWrap
                        align={"left"}
                        color={"text.secondary"}
                        sx={{
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          minWidth: 0,
                        }}
                      >
                        {chat!.title}
                      </Typography>
                    ) : (
                      <>
                        {otherUsers.length > 0 && (
                          <Typography
                            noWrap
                            align={"left"}
                            color={"text.secondary"}
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              minWidth: 0,
                            }}
                          >
                            {otherUsers.map((x) => x.username).join(", ")}
                          </Typography>
                        )}
                        {contractorParticipants.map((contractor) => (
                          <Chip
                            key={contractor.spectrum_id}
                            icon={<BusinessIcon sx={{ fontSize: 16 }} />}
                            label={contractor.name}
                            size="small"
                            component={Link}
                            to={`/contractor/${contractor.spectrum_id}`}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              height: 20,
                              fontSize: "0.75rem",
                              "& .MuiChip-icon": {
                                marginLeft: 0.5,
                              },
                            }}
                          />
                        ))}
                      </>
                    )}
                    {chat!.order_id ? (
                      <Chip
                        icon={<DescriptionIcon sx={{ fontSize: 16 }} />}
                        label="View Order"
                        size="small"
                        component={Link}
                        to={`/order/${chat!.order_id}`}
                        onClick={(e) => e.stopPropagation()}
                        clickable
                        sx={{
                          height: 20,
                          fontSize: "0.75rem",
                          "& .MuiChip-icon": {
                            marginLeft: 0.5,
                          },
                        }}
                      />
                    ) : chat!.session_id ? (
                      <Chip
                        icon={<DescriptionIcon sx={{ fontSize: 16 }} />}
                        label="View Offer"
                        size="small"
                        component={Link}
                        to={`/offer/${chat!.session_id}`}
                        onClick={(e) => e.stopPropagation()}
                        clickable
                        sx={{
                          height: 20,
                          fontSize: "0.75rem",
                          "& .MuiChip-icon": {
                            marginLeft: 0.5,
                          },
                        }}
                      />
                    ) : null}
                  </Box>
                </Box>
              </>
            )
          })()}
        </Box>
      ) : null}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={theme.layoutSpacing.compact}
        useFlexGap
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent={"right"}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        <DateTimePicker
          value={dateTime}
          onChange={(newValue) => {
            if (newValue) {
              setDateTime(newValue)
            }
          }}
          slotProps={{
            textField: {
              size: isMobile ? "small" : "medium",
              sx: { width: { xs: "100%", sm: "auto" } },
            },
          }}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `<t:${Math.trunc(dateTime.valueOf() / 1000)}:D>`,
              )
            }}
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            {t("MessagesBody.copyDate")}
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `<t:${Math.trunc(dateTime.valueOf() / 1000)}:t>`,
              )
            }}
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
          >
            {t("MessagesBody.copyTime")}
          </Button>
        </Stack>
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
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const convertedContent = useMemo(
    () => replaceDiscordTimestamps(message.content),
    [message.content],
  )

  // Long-press menu actions for messages
  const longPressActions = useMemo(() => {
    if (!message.content) return [] // No content to copy
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
        <Typography variant={"subtitle2"}>{convertedContent}</Typography>
      </Stack>
    </Stack>
  )

  // Wrap with LongPressMenu on mobile if there are actions
  if (isMobile && longPressActions.length > 0) {
    return (
      <LongPressMenu actions={longPressActions} enabled={isMobile}>
        {messageContent}
      </LongPressMenu>
    )
  }

  return messageContent
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
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "75%", sm: "80%" },
            minWidth: 0, // Allow text to shrink
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
            minWidth: 0, // Allow text to shrink
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
            minWidth: 0, // Allow text to shrink
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

function MessagesArea(props: {
  messages: Message[]
  messageBoxRef: RefObject<HTMLDivElement | null>
  maxHeight?: number
}) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { messageBoxRef } = props
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
          paddingBottom: { xs: 2, sm: 2 }, // Reduced padding since input area is sticky
          borderColor: theme.palette.outline.main,
          boxSizing: "border-box",
          borderWidth: 0,
          borderStyle: "solid",
          overflow: "auto",
          maxHeight: props.maxHeight,
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
          // On mobile, ensure this area can scroll independently
          minHeight: 0,
          flex: 1,
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [textEntry, setTextEntry] = useState("")
  const { t } = useTranslation()

  const handleSend = () => {
    if (textEntry.trim()) {
      props.onSend(textEntry)
      setTextEntry("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    // Shift+Enter allows newline (default behavior)
  }

  return (
    <Box
      sx={{
        width: "100%",
        padding: { xs: 1.5, sm: 1 },
        borderTopColor: theme.palette.outline.main,
        boxSizing: "border-box",
        borderWidth: 0,
        borderTop: `solid 1px ${theme.palette.outline.main}`,
        display: "flex",
        flexDirection: "row",
        gap: { xs: 1, sm: 0 },
        bgcolor: theme.palette.background.paper,
        alignItems: { xs: "flex-end", sm: "center" },
        position: isMobile ? "sticky" : "relative",
        bottom: isMobile ? "calc(64px + env(safe-area-inset-bottom))" : "auto", // Position above bottom nav (64px + safe area)
        zIndex: isMobile ? 1000 : "auto", // High z-index to be above bottom nav
        // On mobile, add safe area padding for iOS keyboard
        paddingBottom: isMobile
          ? `calc(1.5rem + env(safe-area-inset-bottom))`
          : 1,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={isMobile ? 3 : 4}
        variant={"outlined"}
        size={isMobile ? "small" : "medium"}
        sx={{
          marginRight: { xs: 0, sm: 2 },
          marginBottom: { xs: 0, sm: 0 },
        }}
        value={textEntry}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setTextEntry(event.target.value)
        }}
        onKeyPress={handleKeyPress}
        placeholder={t("MessagesBody.typeMessage") || "Type a message..."}
      />
      {isMobile ? (
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!textEntry.trim()}
          sx={{
            flexShrink: 0,
            alignSelf: "flex-end",
            marginBottom: 0.5, // Align with text field baseline
          }}
        >
          <SendIcon />
        </IconButton>
      ) : (
        <Button
          variant={"contained"}
          color={"primary"}
          sx={{
            maxHeight: 60,
            whiteSpace: "nowrap",
          }}
          onClick={handleSend}
          disabled={!textEntry.trim()}
          size="large"
        >
          {t("MessagesBody.send")}
        </Button>
      )}
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [currentChat, setCurrentChat] = useCurrentChat()
  const messageBoxRef = useRef<HTMLDivElement>(null)
  const [sendChatMessage] = useSendChatMessageMutation()
  const { isSuccess } = useGetUserProfileQuery()
  const { data: profile } = useGetUserProfileQuery()

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
  }, [setCurrentChat])

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

  // Subscribe to RTK Query cache updates to sync with currentChat state
  const { chat_id } = useParams<{ chat_id: string }>()
  const { data: chatFromCache } = useGetChatByIDQuery(chat_id!, {
    skip: !chat_id,
  })

  useEffect(() => {
    if (chatFromCache && currentChat && chatFromCache.chat_id === currentChat.chat_id) {
      // Sync currentChat with cache updates (including optimistic updates)
      const sortedMessages = [...chatFromCache.messages].sort(
        (a: Message, b: Message) => a.timestamp - b.timestamp,
      )
      if (JSON.stringify(sortedMessages) !== JSON.stringify(currentChat.messages)) {
        setCurrentChat({
          ...chatFromCache,
          messages: sortedMessages,
        })
      }
    }
  }, [chatFromCache, currentChat, setCurrentChat])

  const issueAlert = useAlertHook()

  const onSend = useCallback(
    (content: string) => {
      if (content && currentChat) {
        // Optimistically update currentChat state immediately
        const optimisticMessage: Message = {
          author: profile?.username || null,
          content: content,
          timestamp: Date.now(),
          chat_id: currentChat.chat_id,
        }
        setCurrentChat({
          ...currentChat,
          messages: [...currentChat.messages, optimisticMessage],
        })

        // Then send to server
        sendChatMessage({ chat_id: currentChat.chat_id, content })
          .unwrap()
          .catch((error) => {
            // Rollback on error
            setCurrentChat({
              ...currentChat,
              messages: currentChat.messages.filter(
                (msg) => msg.timestamp !== optimisticMessage.timestamp,
              ),
            })
            issueAlert(error)
          })
      }
    },
    [currentChat, sendChatMessage, issueAlert, profile, setCurrentChat],
  )

  return (
    <>
      {currentChat && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <MessageHeader />
          <MessagesArea
            messages={currentChat.messages}
            messageBoxRef={messageBoxRef}
            maxHeight={props.maxHeight}
          />
          <MessageSendArea onSend={onSend} />
        </Box>
      )}
    </>
  )
}

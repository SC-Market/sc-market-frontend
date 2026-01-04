/**
 * Mobile-specific messaging components
 * Handles keyboard visibility, sticky input, and bottom nav hiding
 */

import {
  Avatar,
  AvatarGroup,
  Box,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
  Stack,
  Button,
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
import { useTheme as useMuiTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import BusinessIcon from "@mui/icons-material/BusinessRounded"
import DescriptionIcon from "@mui/icons-material/DescriptionRounded"
import SendIcon from "@mui/icons-material/SendRounded"
import { ChevronLeftRounded, AccessTimeRounded } from "@mui/icons-material"
import { UserParticipant, ContractorParticipant } from "../../datatypes/Chat"
import { Message } from "../../datatypes/Chat"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import { getRelativeTime } from "../../util/time"
import { useMessagingSidebar } from "../../hooks/messaging/MessagingSidebar"
import { useCurrentChat } from "../../hooks/messaging/CurrentChat"
import { useSendChatMessageMutation, useGetChatByIDQuery } from "../../store/chats"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import { WS_URL } from "../../util/constants"
import SCMarketLogo from "../../assets/scmarket-logo.png"
import { DateTimePicker } from "@mui/x-date-pickers"
import moment from "moment"
import { useTranslation } from "react-i18next"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { LongPressMenu } from "../../components/gestures"
import { MobileFAB } from "../../components/mobile/MobileFAB"
import { BottomSheet } from "../../components/mobile"
import { ContentCopyRounded } from "@mui/icons-material"

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

function MessageEntryMobile(props: { message: Message }) {
  const { message } = props
  const theme = useTheme<ExtendedTheme>()
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
      spacing={1.5}
      justifyContent={"flex-start"}
    >
      {message.author ? (
        <Link to={`/user/${author?.username}`}>
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
            }}
            src={author?.avatar || SCMarketLogo}
          />
        </Link>
      ) : (
        <Avatar
          variant="rounded"
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
          }}
          src={SCMarketLogo}
        />
      )}

      <Stack direction={"column"} sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction={"row"}
          spacing={1}
          alignItems={"flex-end"}
        >
          {message.author ? (
            <Typography variant={"subtitle2"} sx={{ fontWeight: 500 }}>
              {author?.username}
            </Typography>
          ) : (
            <Typography variant={"subtitle2"}>
              {t("MessagesBody.system")}
            </Typography>
          )}
          <Typography
            color={"text.secondary"}
            variant={"caption"}
            sx={{
              fontSize: "0.7em",
            }}
          >
            {getRelativeTime(new Date(message.timestamp))}
          </Typography>
        </Stack>
        <Box sx={{ wordBreak: "break-word", "& p": { margin: 0, marginBottom: 0.5, "&:last-child": { marginBottom: 0 } } }}>
          <MarkdownRender text={convertedContent} />
        </Box>
      </Stack>
    </Stack>
  )

  // Wrap with LongPressMenu if there are actions
  if (longPressActions.length > 0) {
    return (
      <LongPressMenu actions={longPressActions} enabled={true}>
        {messageContent}
      </LongPressMenu>
    )
  }

  return messageContent
}

function MessageHeaderMobile() {
  const profile = useGetUserProfileQuery()
  const theme = useTheme<ExtendedTheme>()
  const [messageSidebarOpen, setMessageSidebar] = useMessagingSidebar()
  const navigate = useNavigate()
  const [chat] = useCurrentChat()
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        width: "100%",
        padding: 1.5,
        boxSizing: "border-box",
        borderWidth: 0,
        borderBottom: `solid 1px ${theme.palette.outline.main}`,
        bgcolor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // Vertically center all content
        gap: 1,
        minHeight: 56,
        height: 56, // Fixed height for consistent centering
        flexShrink: 0,
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
          <IconButton
            color="secondary"
            aria-label={t("MessagesBody.toggleSidebar")}
            onClick={() => {
              navigate("/messages")
            }}
            sx={{
              marginRight: 1,
              flexShrink: 0,
            }}
            size="small"
          >
            <ChevronLeftRounded />
          </IconButton>

          {(() => {
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
    </Box>
  )
}

function MessagesAreaMobile(props: {
  messages: Message[]
  messageBoxRef: RefObject<HTMLDivElement | null>
  inputAreaHeight: number
}) {
  const theme = useTheme<ExtendedTheme>()
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
    <Box
      ref={messageBoxRef}
      sx={{
        flex: 1,
        width: "100%",
        padding: 1,
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        minHeight: 0,
        // Add bottom padding to account for fixed input area
        paddingBottom: inputAreaHeight > 0 ? `${inputAreaHeight + 12}px` : 1.5,
      }}
    >
      <Stack spacing={1.5}>
        {messages.map((message: Message) => (
          <MessageEntryMobile message={message} key={message.timestamp} />
        ))}
      </Stack>
      <div ref={props.messageBoxRef} />
    </Box>
  )
}

function MessageSendAreaMobile(props: { 
  onSend: (content: string) => void
  isKeyboardOpen: boolean
  inputRef?: React.RefObject<HTMLDivElement | null>
}) {
  const theme = useTheme<ExtendedTheme>()
  const [textEntry, setTextEntry] = useState("")
  const { t } = useTranslation()
  const localInputRef = useRef<HTMLDivElement>(null)
  const inputRef = props.inputRef || localInputRef

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
  }

  const safeAreaBottom = "env(safe-area-inset-bottom)"

  return (
    <Box
      ref={inputRef}
      sx={{
        width: "100%",
        padding: 1.5,
        borderTopColor: theme.palette.outline.main,
        boxSizing: "border-box",
        borderWidth: 0,
        borderTop: `solid 1px ${theme.palette.outline.main}`,
        display: "flex",
        flexDirection: "row",
        gap: 1,
        bgcolor: theme.palette.background.paper,
        alignItems: "flex-end",
        paddingBottom: 2,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={3}
        variant={"outlined"}
        size={"small"}
        value={textEntry}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setTextEntry(event.target.value)
        }}
        onKeyPress={handleKeyPress}
        onFocus={(e) => {
          // With resizes-content mode, the browser will automatically resize the viewport
          // We just need to ensure the input is visible - the resize event will handle positioning
          const inputElement = e.target as HTMLElement
          // Small delay to allow browser to resize viewport, then scroll if needed
          setTimeout(() => {
            inputElement.scrollIntoView({ behavior: "smooth", block: "end" })
          }, 100)
        }}
        placeholder={t("MessagesBody.typeMessage") || "Type a message..."}
      />
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!textEntry.trim()}
        sx={{
          flexShrink: 0,
          alignSelf: "flex-end",
          marginBottom: 0.5,
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  )
}

function DateTimePickerBottomSheetMobile(props: {
  open: boolean
  onClose: () => void
  dateTime: moment.Moment
  setDateTime: (dateTime: moment.Moment) => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { dateTime, setDateTime, open, onClose } = props
  const [pickerOpen, setPickerOpen] = useState(false)

  // Track when picker opens
  const handlePickerOpen = () => {
    setPickerOpen(true)
  }

  // Track when picker closes
  const handlePickerClose = () => {
    setPickerOpen(false)
  }

  // Keep bottom sheet mounted and visible when picker opens
  // The MUI DateTimePicker modal will appear on top with higher z-index
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t("MessagesBody.dateTimePicker", "Date & Time Picker")}
      maxHeight="90vh"
      disableBackdropClose={pickerOpen}
    >
      <Stack spacing={2}>
        <DateTimePicker
          value={dateTime}
          onChange={(newValue) => {
            if (newValue) {
              setDateTime(newValue)
            }
          }}
          onOpen={handlePickerOpen}
          onClose={handlePickerClose}
          slotProps={{
            textField: {
              size: "medium",
              fullWidth: true,
            },
            // Ensure the picker modal appears above the bottom sheet
            dialog: {
              sx: {
                zIndex: theme.zIndex.modal + 10,
              },
            },
          }}
        />

        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `<t:${Math.trunc(dateTime.valueOf() / 1000)}:D>`,
              )
            }}
            variant="outlined"
            fullWidth
          >
            {t("MessagesBody.copyDate")}
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `<t:${Math.trunc(dateTime.valueOf() / 1000)}:t>`,
              )
            }}
            variant="outlined"
            fullWidth
          >
            {t("MessagesBody.copyTime")}
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  )
}

export function MessagesBodyMobile(props: { maxHeight?: number }) {
  const theme = useTheme<ExtendedTheme>()
  const [currentChat, setCurrentChat] = useCurrentChat()
  const messageBoxRef = useRef<HTMLDivElement>(null)
  const [sendChatMessage] = useSendChatMessageMutation()
  const { isSuccess } = useGetUserProfileQuery()
  const { data: profile } = useGetUserProfileQuery()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [keyboardTop, setKeyboardTop] = useState(0)
  const inputAreaRef = useRef<HTMLDivElement>(null)
  const [inputAreaHeight, setInputAreaHeight] = useState(0)

  // Track keyboard visibility using viewport resize mode
  // With resizes-content mode, the viewport height actually shrinks when keyboard opens
  useEffect(() => {
    const updateKeyboardState = () => {
      // Use requestAnimationFrame to ensure we get the latest viewport values
      requestAnimationFrame(() => {
        // Store initial height on first load
        if (!(window as any).initialInnerHeight) {
          (window as any).initialInnerHeight = window.innerHeight
        }
        
        const currentHeight = window.innerHeight
        const initialHeight = (window as any).initialInnerHeight
        
        // Keyboard is open if viewport height is significantly reduced
        // Use a threshold (e.g., 75% of initial height) to detect keyboard
        const keyboardIsOpen = currentHeight < initialHeight * 0.75
        
        setIsKeyboardOpen(keyboardIsOpen)
        
        // With resizes-content mode, when keyboard is open, the viewport has already resized
        // So we position the input at bottom: 0 (it will sit right above the keyboard)
        // When closed, position above bottom nav
        setKeyboardTop(0)
      })
    }
    
    // Initial check
    updateKeyboardState()

    // Listen to window resize events (viewport resizes when keyboard opens/closes)
    window.addEventListener("resize", updateKeyboardState)
    
    // Also listen to visualViewport if available for more accurate detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateKeyboardState)
      return () => {
        window.removeEventListener("resize", updateKeyboardState)
        window.visualViewport?.removeEventListener("resize", updateKeyboardState)
      }
    } else {
      return () => {
        window.removeEventListener("resize", updateKeyboardState)
      }
    }
  }, [])

  // Measure input area height
  useEffect(() => {
    if (inputAreaRef.current) {
      const updateHeight = () => {
        setInputAreaHeight(inputAreaRef.current?.offsetHeight || 0)
      }
      updateHeight()
      const resizeObserver = new ResizeObserver(updateHeight)
      resizeObserver.observe(inputAreaRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  // Socket connection management
  useEffect(() => {
    if (isSuccess && !socket.connected) {
      socket.connect()
    }

    if (!isSuccess || socket.connected) {
      socket.disconnect()
    }
  }, [isSuccess])

  // Listen for server messages
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

  // Join/leave chat rooms
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

  const { t } = useTranslation()
  const [dateTime, setDateTime] = useState(moment())
  const [dateTimeSheetOpen, setDateTimeSheetOpen] = useState(false)

  return (
    <>
      {currentChat && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100dvh", // Use dynamic viewport height to accommodate keyboard resize
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
          }}
        >
          {/* Header spacer using mixins */}
          <Box
            sx={{
              ...theme.mixins.toolbar,
              minHeight: 64,
              height: 64,
              flexShrink: 0,
            }}
          />
          
          <MessageHeaderMobile />
          
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <MessagesAreaMobile
              messages={currentChat.messages}
              messageBoxRef={messageBoxRef}
              inputAreaHeight={inputAreaHeight}
            />
          </Box>
          
          {/* Dynamic container for FAB and input area - positioned at bottom of viewport */}
          <Box
            ref={inputAreaRef}
            sx={{
              position: "fixed",
              bottom: isKeyboardOpen 
                ? 0 // With resizes-content mode, viewport has already resized, so position at bottom: 0
                : `calc(64px + env(safe-area-inset-bottom))`, // Position above bottom nav (64px height) + safe area when closed
              left: 0,
              right: 0,
              zIndex: theme.zIndex.drawer + 2, // Above bottom nav (drawer + 1) but below modals
              display: "flex",
              flexDirection: "column",
              transition: "bottom 0.2s ease-in-out",
            }}
          >
            {/* FAB for date/time picker - fixed, moves with input area */}
            <Box
              sx={{
                position: "absolute",
                bottom: inputAreaHeight > 0 ? `${inputAreaHeight + 64}px` : "144px",
                right: 16,
                zIndex: theme.zIndex.speedDial,
                pointerEvents: "auto",
              }}
            >
              <MobileFAB
                color="primary"
                size="small"
                aria-label={t("MessagesBody.dateTimePicker", "Date & Time Picker")}
                onClick={() => setDateTimeSheetOpen(true)}
                position="bottom-right"
                aboveBottomNav={false}
                sx={{
                  position: "relative",
                  bottom: "auto",
                  right: "auto",
                }}
              >
                <AccessTimeRounded />
              </MobileFAB>
            </Box>
            
            {/* Input area - inside fixed container */}
            <MessageSendAreaMobile 
              onSend={onSend} 
              isKeyboardOpen={isKeyboardOpen}
              inputRef={inputAreaRef}
            />
          </Box>
          
          {/* Bottom sheet for date/time picker */}
          <DateTimePickerBottomSheetMobile
            open={dateTimeSheetOpen}
            onClose={() => setDateTimeSheetOpen(false)}
            dateTime={dateTime}
            setDateTime={setDateTime}
          />
        </Box>
      )}
    </>
  )
}

// Export socket for use in other components
export const socket = io(WS_URL, {
  withCredentials: true,
  path: "/ws",
  reconnectionDelay: 4000,
  autoConnect: false,
  secure: true,
  transports: ["websocket", "polling", "xhr-polling"],
})

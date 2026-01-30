import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useCurrentChatID } from "../../hooks/messaging/CurrentChatID"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useGetUserProfileQuery } from "../../store/profile"
import SearchIcon from "@mui/icons-material/Search"
import CreateIcon from "@mui/icons-material/Create"
import BusinessIcon from "@mui/icons-material/BusinessRounded"
import { useMessageGroupCreate } from "../../hooks/messaging/MessageGroupCreate"
import {
  Chat,
  UserParticipant,
  ContractorParticipant,
} from "../../datatypes/Chat"
import { useGetMyChatsQuery } from "../../store/chats"
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useDrawerOpen } from "../../hooks/layout/Drawer"
import { MenuRounded } from "@mui/icons-material"
import { MessageListSkeleton } from "../../components/skeletons"
import {
  EmptyMessages,
  EmptySearchResults,
} from "../../components/empty-states"
import { useGetNotificationsQuery } from "../../store/notification"
import { getRelativeTime } from "../../util/time"
import { MarkdownRender } from "../../components/markdown/Markdown"

// Single chat entry in the chat list
function ChatEntry(props: {
  chat: Chat
  unreadCount?: number
  isVisible?: boolean
  entryRef?: (el: HTMLElement | null) => void
}) {
  const theme: ExtendedTheme = useTheme<ExtendedTheme>()
  const { chat_id } = useParams<{ chat_id?: string }>()
  const [currentChatID, setCurrentChatID] = useCurrentChatID()
  const profile = useGetUserProfileQuery()
  const navigate = useNavigate()

  const [, setCreatingMessageGroup] = useMessageGroupCreate()
  const { t } = useTranslation()

  const isSelected =
    chat_id === props.chat.chat_id || currentChatID === props.chat.chat_id

  // Only query unread notifications for visible chats
  // Chats can be associated with orders or offers, so we query based on order_id or session_id
  // If chat has order_id, query order_message with that order_id as entityId
  // If chat has session_id, query offer_message with that session_id as entityId
  const { data: orderNotificationsData } = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "order_message",
      entityId: props.chat.order_id || undefined,
    },
    { skip: !props.chat.chat_id || !props.chat.order_id || !props.isVisible },
  )

  const { data: offerNotificationsData } = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "offer_message",
      entityId: props.chat.session_id || undefined,
    },
    { skip: !props.chat.chat_id || !props.chat.session_id || !props.isVisible },
  )

  // Use the appropriate notification data based on chat type
  const chatNotificationsData = props.chat.order_id
    ? orderNotificationsData
    : props.chat.session_id
      ? offerNotificationsData
      : undefined

  // Calculate unread count from notifications
  const unreadCount = useMemo(() => {
    if (props.unreadCount !== undefined) return props.unreadCount
    if (!chatNotificationsData?.notifications) return 0
    return chatNotificationsData.notifications.filter((n) => !n.read).length
  }, [props.unreadCount, chatNotificationsData])

  // Separate user and contractor participants
  const userParticipants = props.chat.participants.filter(
    (p): p is UserParticipant => p.type === "user",
  )
  const contractorParticipants = props.chat.participants.filter(
    (p): p is ContractorParticipant => p.type === "contractor",
  )

  // Filter out current user
  const otherUsers = userParticipants.filter(
    (part) =>
      userParticipants.length === 1 || part.username !== profile.data?.username,
  )

  // Build participant display text
  const participantNames = [
    ...otherUsers.map((u) => u.username),
    ...contractorParticipants.map((c) => c.name),
  ]

  return (
    <ListItemButton
      ref={props.entryRef}
      data-chat-id={props.chat.chat_id}
      sx={{
        width: "100%",
        borderBottom: 1,
        borderColor: theme.palette.outline.main,
        padding: { xs: 1, sm: 1.5 },
        minHeight: { xs: 56, sm: 64 },
      }}
      onClick={() => {
        setCurrentChatID(props.chat.chat_id)
        setCreatingMessageGroup(false)
        navigate(`/messages/${props.chat.chat_id}`)
      }}
      selected={isSelected}
    >
      <Box
        sx={{
          display: "flex",
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
        }}
        alignItems={"center"}
      >
        <Tooltip title={participantNames.join(", ")}>
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : undefined}
            color="primary"
            max={99}
          >
            <AvatarGroup max={3} spacing={"small"}>
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
          </Badge>
        </Tooltip>

        <Box
          sx={{ marginLeft: 1, overflow: "hidden", flexGrow: 1, minWidth: 0 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              noWrap
              align={"left"}
              color={unreadCount > 0 ? "primary.main" : "text.secondary"}
              sx={{
                fontWeight: unreadCount > 0 ? 600 : 500,
                flex: 1,
                minWidth: 0,
              }}
            >
              {props.chat.title || (
                <>
                  {otherUsers.length > 0 && (
                    <span>{otherUsers.map((x) => x.username).join(", ")}</span>
                  )}
                  {contractorParticipants.length > 0 && (
                    <>
                      {otherUsers.length > 0 && ", "}
                      {contractorParticipants.map((c) => c.name).join(", ")}
                    </>
                  )}
                </>
              )}
            </Typography>
          </Box>
          <Box
            sx={{
              fontSize: "0.875rem",
              fontWeight: unreadCount > 0 ? 500 : 400,
              color: unreadCount > 0 ? "text.primary" : "text.secondary",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
              "& p": {
                margin: 0,
                display: "block",
                fontSize: "inherit",
              },
            }}
          >
            {props.chat.messages.length > 0 ? (
              <MarkdownRender
                text={`**${props.chat.messages[props.chat.messages.length - 1].author || t("MessagesBody.system")}**: ${props.chat.messages[props.chat.messages.length - 1].content} *${getRelativeTime(new Date(props.chat.messages[props.chat.messages.length - 1].timestamp))}*`}
                plainText
              />
            ) : (
              <Typography
                component="span"
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: unreadCount > 0 ? 500 : 400,
                  color: unreadCount > 0 ? "text.primary" : "text.secondary",
                }}
              >
                {t("MessagingSidebar.noMessages")}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </ListItemButton>
  )
}

export interface MessagingSidebarContentProps {
  asPageContent?: boolean
}

export function MessagingSidebarContent(
  props: MessagingSidebarContentProps = {},
) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()
  const [, setCreatingMessageGroup] = useMessageGroupCreate()
  const { data: chats, isLoading, isFetching, refetch } = useGetMyChatsQuery()
  const [searchQuery, setSearchQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  // Query recent notifications to calculate unread counts for sorting
  // Using the same pattern as UnreadChatCount hook - query recent notifications
  // and match them to chats. This avoids fetching all notifications ever.
  const { data: orderMessageNotifications } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "order_message",
  })

  const { data: offerMessageNotifications } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "offer_message",
  })

  // Create a map of chat_id -> unread count from recent notifications
  // Using the same matching logic as UnreadChatCount hook
  const unreadCountsByChat = useMemo(() => {
    const counts: Record<string, number> = {}
    
    if (!chats) return counts

    // Initialize all chats with 0 unread
    chats.forEach((chat) => {
      counts[chat.chat_id] = 0
    })

    // Count unread notifications from order_message notifications
    if (orderMessageNotifications?.notifications) {
      orderMessageNotifications.notifications.forEach((notif) => {
        if (notif.read) return
        
        // Match to chat by order_id (same logic as UnreadChatCount)
        if (notif.entity && typeof notif.entity === "object" && "order_id" in notif.entity) {
          const orderId = (notif.entity as any).order_id
          const chat = chats.find((c) => c.order_id === orderId)
          if (chat) {
            counts[chat.chat_id] = (counts[chat.chat_id] || 0) + 1
          }
        }
      })
    }

    // Count unread notifications from offer_message notifications
    if (offerMessageNotifications?.notifications) {
      offerMessageNotifications.notifications.forEach((notif) => {
        if (notif.read) return
        
        // Match to chat by session_id (same logic as UnreadChatCount)
        if (notif.entity && typeof notif.entity === "object" && "id" in notif.entity) {
          const sessionId = (notif.entity as any).id
          const chat = chats.find((c) => c.session_id === sessionId)
          if (chat) {
            counts[chat.chat_id] = (counts[chat.chat_id] || 0) + 1
          }
        }
      })
    }

    return counts
  }, [chats, orderMessageNotifications, offerMessageNotifications])

  // Sort chats: unread first, then by last activity (most recent first)
  const sortedChats = useMemo(() => {
    if (!chats) return []
    
    return [...chats].sort((a, b) => {
      const aUnread = unreadCountsByChat[a.chat_id] || 0
      const bUnread = unreadCountsByChat[b.chat_id] || 0

      // First, sort by unread status (unread chats first)
      if (aUnread > 0 && bUnread === 0) return -1
      if (aUnread === 0 && bUnread > 0) return 1

      // Then sort by last activity (most recent first)
      const aLastMessage = a.messages[a.messages.length - 1]
      const bLastMessage = b.messages[b.messages.length - 1]
      
      // If no messages, put at the end
      if (!aLastMessage && !bLastMessage) return 0
      if (!aLastMessage) return 1
      if (!bLastMessage) return -1

      // Sort by timestamp descending (most recent first)
      return bLastMessage.timestamp - aLastMessage.timestamp
    })
  }, [chats, unreadCountsByChat])

  // Track visible chat entries using Intersection Observer
  const [visibleChatIds, setVisibleChatIds] = useState<Set<string>>(new Set())
  const chatEntryRefs = useRef<Map<string, HTMLElement>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Set up intersection observer once
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleChatIds((prev) => {
          const next = new Set(prev)
          entries.forEach((entry) => {
            const chatId = entry.target.getAttribute("data-chat-id")
            if (chatId) {
              if (entry.isIntersecting) {
                next.add(chatId)
              } else {
                next.delete(chatId)
              }
            }
          })
          return next
        })
      },
      {
        root: null, // Use viewport as root
        rootMargin: "50px", // Start loading 50px before entry becomes visible
        threshold: 0.1, // Trigger when 10% visible
      },
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [])

  // Observe/unobserve elements as refs are set
  const createEntryRef = useCallback((chatId: string) => {
    return (el: HTMLElement | null) => {
      if (el) {
        chatEntryRefs.current.set(chatId, el)
        if (observerRef.current) {
          observerRef.current.observe(el)
        }
      } else {
        const existing = chatEntryRefs.current.get(chatId)
        if (existing && observerRef.current) {
          observerRef.current.unobserve(existing)
        }
        chatEntryRefs.current.delete(chatId)
      }
    }
  }, [])

  const content = (
    <Box
      sx={{
        width: "100%",
        height: props.asPageContent ? "100%" : undefined,
        flexDirection: "column",
        display: "flex",
        borderRight: props.asPageContent ? 0 : 1,
        paddingTop: props.asPageContent
          ? 0
          : { xs: theme.spacing(2), sm: theme.spacing(3) },
        borderColor: props.asPageContent
          ? "transparent"
          : theme.palette.outline.main,
        overflow: "hidden", // Prevent this container from scrolling
      }}
    >
      <Box
        display={"flex"}
        sx={{
          width: "100%",
          padding: { xs: 1.5, sm: 2 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 },
        }}
        justifyContent={"space-between"}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <HeaderTitle sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
          {t("MessagingSidebar.messages")}
        </HeaderTitle>
        <Button
          variant={"contained"}
          color={"secondary"}
          startIcon={<CreateIcon />}
          size={isMobile ? "medium" : "large"}
          onClick={() => setCreatingMessageGroup(true)}
          fullWidth={isMobile}
        >
          {t("MessagingSidebar.group")}
        </Button>
      </Box>
      <Box sx={{ padding: { xs: 1.5, sm: 2 } }}>
        <TextField
          fullWidth
          label={t("MessagingSidebar.search")}
          value={searchQuery}
          onChange={(event: React.ChangeEvent<{ value: string }>) => {
            setSearchQuery(event.target.value)
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton size={isMobile ? "small" : "medium"}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          color={"secondary"}
          size={isMobile ? "small" : "medium"}
        />
      </Box>
      <List
        sx={{
          borderTop: 1,
          borderColor: theme.palette.outline.main,
          flexGrow: props.asPageContent ? 1 : 0,
          minHeight: 0, // Allow flex item to shrink
          overflow: "auto", // Only the list scrolls, not the whole sidebar
        }}
      >
        {isLoading || isFetching ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <MessageListSkeleton key={i} index={i} />
            ))}
          </>
        ) : (chats || []).length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptyMessages
              isChatList={true}
              showCreateAction={true}
              sx={{ py: 2 }}
            />
          </Box>
        ) : sortedChats.filter((chat) => {
            if (!searchQuery) return true
            // Search in user usernames and contractor names
            const searchLower = searchQuery.toLowerCase()
            return chat.participants.some((p) => {
              if (p.type === "user") {
                return p.username.toLowerCase().includes(searchLower)
              } else {
                return p.name.toLowerCase().includes(searchLower)
              }
            })
          }).length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptySearchResults
              searchQuery={searchQuery}
              onClearFilters={() => setSearchQuery("")}
              sx={{ py: 2 }}
            />
          </Box>
        ) : (
          sortedChats
            .filter((chat) => {
              if (!searchQuery) return true
              // Search in user usernames and contractor names
              const searchLower = searchQuery.toLowerCase()
              return chat.participants.some((p) => {
                if (p.type === "user") {
                  return p.username.toLowerCase().includes(searchLower)
                } else {
                  return p.name.toLowerCase().includes(searchLower)
                }
              })
            })
            .map((chat) => {
              const isVisible = visibleChatIds.has(chat.chat_id)
              return (
                <ChatEntry
                  key={chat.chat_id}
                  chat={chat}
                  unreadCount={unreadCountsByChat[chat.chat_id]}
                  isVisible={isVisible}
                  entryRef={createEntryRef(chat.chat_id)}
                />
              )
            })
        )}
      </List>
    </Box>
  )

  return content
}

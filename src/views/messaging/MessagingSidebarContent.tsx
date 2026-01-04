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
import React, { useState, useMemo } from "react"
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
function ChatEntry(props: { chat: Chat; unreadCount?: number }) {
  const theme: ExtendedTheme = useTheme<ExtendedTheme>()
  const { chat_id } = useParams<{ chat_id?: string }>()
  const [currentChatID, setCurrentChatID] = useCurrentChatID()
  const profile = useGetUserProfileQuery()
  const navigate = useNavigate()

  const [, setCreatingMessageGroup] = useMessageGroupCreate()
  const { t } = useTranslation()

  const isSelected =
    chat_id === props.chat.chat_id || currentChatID === props.chat.chat_id

  // Query unread notifications for this specific chat
  // Chats can be associated with orders or offers, so we query based on order_id or session_id
  // If chat has order_id, query order_message with that order_id as entityId
  // If chat has session_id, query offer_message with that session_id as entityId
  const { data: orderNotificationsData } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "order_message",
    entityId: props.chat.order_id || undefined,
  }, { skip: !props.chat.chat_id || !props.chat.order_id })
  
  const { data: offerNotificationsData } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "offer_message",
    entityId: props.chat.session_id || undefined,
  }, { skip: !props.chat.chat_id || !props.chat.session_id })
  
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
      sx={{
        width: "100%",
        borderBottom: 1,
        borderColor: theme.palette.outline.main,
        padding: { xs: 2, sm: 3 },
        minHeight: { xs: 72, sm: 80 },
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
        </Tooltip>

        <Box
          sx={{ marginLeft: 1, overflow: "hidden", flexGrow: 1, minWidth: 0 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              align={"left"}
              color={unreadCount > 0 ? "primary.main" : "text.secondary"}
              sx={{ fontWeight: unreadCount > 0 ? 600 : 500, flex: 1, minWidth: 0 }}
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
            {unreadCount > 0 && (
              <Badge
                variant="dot"
                color="primary"
                sx={{
                  flexShrink: 0,
                  "& .MuiBadge-badge": {
                    width: 8,
                    height: 8,
                  },
                }}
              >
                <Box sx={{ width: 0, height: 0 }} />
              </Badge>
            )}
          </Box>
          <Box
            sx={{
              fontSize: "0.875rem",
              fontWeight: unreadCount > 0 ? 500 : 400,
              color: unreadCount > 0 ? "text.primary" : "text.secondary",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              "& p": {
                margin: 0,
                display: "inline",
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

  // Create a map of chat_id -> unread count
  // We'll query notifications per chat using entityId for accurate counts
  // This is done in the ChatEntry component to avoid N+1 queries
  // For now, we'll pass 0 and let ChatEntry query its own notifications
  const unreadCountsByChat: Record<string, number> = {}

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
          ) : (chats || [])
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
              .length === 0 ? (
            <Box sx={{ p: 3 }}>
              <EmptySearchResults
                searchQuery={searchQuery}
                onClearFilters={() => setSearchQuery("")}
                sx={{ py: 2 }}
              />
            </Box>
          ) : (
            (chats || [])
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
              .map((chat) => (
                <ChatEntry
                  chat={chat}
                  key={chat.chat_id}
                />
              ))
          )}
      </List>
    </Box>
  )

  return content
}

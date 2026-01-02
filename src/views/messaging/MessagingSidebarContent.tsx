import {
  Avatar,
  AvatarGroup,
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
import React, { useState } from "react"
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

// Single chat entry in the chat list
function ChatEntry(props: { chat: Chat }) {
  const theme: ExtendedTheme = useTheme<ExtendedTheme>()
  const { chat_id } = useParams<{ chat_id?: string }>()
  const [currentChatID, setCurrentChatID] = useCurrentChatID()
  const profile = useGetUserProfileQuery()
  const navigate = useNavigate()

  const [, setCreatingMessageGroup] = useMessageGroupCreate()
  const { t } = useTranslation()

  const isSelected =
    chat_id === props.chat.chat_id || currentChatID === props.chat.chat_id

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
          <Typography
            noWrap
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: 500 }}
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
          <Typography
            noWrap
            align={"left"}
            color={"text.primary"}
            sx={{ fontSize: "0.875rem" }}
          >
            {props.chat.messages.length > 0
              ? (props.chat.messages[props.chat.messages.length - 1].author ||
                  t("MessagesBody.system")) +
                ": " +
                props.chat.messages[props.chat.messages.length - 1].content
              : t("MessagingSidebar.noMessages")}
          </Typography>
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
  const { data: chats } = useGetMyChatsQuery()
  const [searchQuery, setSearchQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

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
          overflow: "auto",
        }}
      >
        {(chats || [])
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
            <ChatEntry chat={chat} key={chat.chat_id} />
          ))}
      </List>
    </Box>
  )

  return content
}

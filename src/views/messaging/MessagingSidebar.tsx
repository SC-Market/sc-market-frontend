import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React, { useState } from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { useCurrentChatID } from "../../hooks/messaging/CurrentChatID"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useGetUserProfileQuery } from "../../store/profile"
import { useMessagingSidebar } from "../../hooks/messaging/MessagingSidebar"
import SearchIcon from "@mui/icons-material/Search"
import CreateIcon from "@mui/icons-material/Create"
import { useMessageGroupCreate } from "../../hooks/messaging/MessageGroupCreate"
import { Chat } from "../../datatypes/Chat"
import { useGetMyChatsQuery } from "../../store/chats"
import { useTranslation } from "react-i18next" // Added

export const messagingDrawerWidth = 360

// Single chat entry in the chat list
function ChatEntry(props: { chat: Chat }) {
  const theme: ExtendedTheme = useTheme<ExtendedTheme>()
  const [currentChatID, setCurrentChatID] = useCurrentChatID()
  const profile = useGetUserProfileQuery()

  const [, setCreatingMessageGroup] = useMessageGroupCreate()
  const { t } = useTranslation() // Added

  return (
    <ListItemButton
      sx={{
        width: "100%",
        borderBottom: 1,
        borderColor: theme.palette.outline.main,
        padding: 3,
      }}
      onClick={() => {
        setCurrentChatID(props.chat.chat_id)
        setCreatingMessageGroup(false)
      }}
      selected={currentChatID === props.chat.chat_id}
    >
      <Box
        sx={{
          display: "flex",
          overflow: "hide",
          width: "100%",
          maxWidth: "100%",
        }}
        alignItems={"center"}
      >
        <Tooltip
          title={props.chat.participants
            .filter(
              (part) =>
                props.chat.participants.length === 1 ||
                part.username !== profile.data?.username,
            )
            .map((x) => x.username)
            .join(", ")}
        >
          <AvatarGroup max={3} spacing={"small"}>
            {props.chat.participants
              .filter(
                (part) =>
                  props.chat.participants.length === 1 ||
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
          <Tooltip
            title={props.chat.participants
              .filter(
                (part) =>
                  props.chat.participants.length === 1 ||
                  part.username !== profile.data?.username,
              )
              .map((x) => x.username)
              .join(", ")}
          >
            <Typography noWrap align={"left"} color={"text.secondary"}>
              {props.chat.participants
                .filter(
                  (part) =>
                    props.chat.participants.length === 1 ||
                    part.username !== profile.data?.username,
                )
                .map((x) => x.username)
                .join(", ")}
            </Typography>
          </Tooltip>
          <Typography noWrap align={"left"} color={"text.primary"}>
            {props.chat.messages.length > 0
              ? props.chat.messages[props.chat.messages.length - 1].author +
                ": " +
                props.chat.messages[props.chat.messages.length - 1].content
              : t("MessagingSidebar.noMessages")}
          </Typography>
        </Box>
      </Box>
    </ListItemButton>
  )
}

// Sidebar with chat list and search/group creation controls
export function MessagingSidebar() {
  const theme = useTheme<ExtendedTheme>()
  const [drawerOpen] = useDrawerOpen()
  const [messagingSidebar] = useMessagingSidebar()
  const [creatingMessageGroup, setCreatingMessageGroup] =
    useMessageGroupCreate()

  const [searchQuery, setSearchQuery] = useState("")

  const { data: chats } = useGetMyChatsQuery()
  const { t } = useTranslation() // Added

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        zIndex: theme.zIndex.drawer - 3,
        width: messagingSidebar ? messagingDrawerWidth : 0,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.easeOut,
          duration: "0.3s",
        }),
        "& .MuiDrawer-paper": {
          width: messagingSidebar ? messagingDrawerWidth : 0,
          boxSizing: "border-box",
          overflow: "scroll",
          left: drawerOpen ? sidebarDrawerWidth : 0,
          backgroundColor: theme.palette.background.paper,
          transition: theme.transitions.create(["width", "borderRight", "borderColor"], {
            easing: theme.transitions.easing.easeOut,
            duration: "0.3s",
          }),
          borderRight: messagingSidebar ? 1 : 0,
          borderColor: messagingSidebar ? theme.palette.outline.main : "transparent",
        },
        position: "relative",
        whiteSpace: "nowrap",
        // backgroundColor: "#132321",
        // backgroundRepeat: 'no-repeat',
        // backgroundPosition: 'center',
        // backgroundSize: "cover",
        background: "transparent",
        overflow: "scroll",
      }}
      container={
        window !== undefined
          ? () => window.document.getElementById("rootarea")
          : undefined
      }
    >
      <Box
        sx={{
          ...theme.mixins.toolbar,
          position: "relative",
          backgroundColor: theme.palette.background.paper,
          // color: theme.palette.primary.contrastText,
          width: "100%",
          height: 67,
          borderBottom: 1,
          borderColor: theme.palette.outline.main,
        }}
      />
      <Box
        sx={{
          // backgroundColor: 'rgb(0,0,0,.6)',
          width: "100%",
          height: "100%",
          flexDirection: "column",
          // justifyContent: 'space-between',
          display: "flex",
          borderRight: messagingSidebar ? 1 : 0,
          // borderTop: 1,
          paddingTop: theme.spacing(3),
          borderColor: messagingSidebar ? theme.palette.outline.main : "transparent",
        }}
      >
        <Box
          display={"flex"}
          sx={{ width: "100%", padding: 2 }}
          justifyContent={"space-between"}
        >
          <HeaderTitle>{t("MessagingSidebar.messages")}</HeaderTitle>
          <Button
            variant={"contained"}
            color={"secondary"}
            startIcon={<CreateIcon />}
            size={"large"}
            onClick={() => setCreatingMessageGroup(true)}
          >
            {t("MessagingSidebar.group")}
          </Button>
        </Box>
        <Box sx={{ padding: 2 }}>
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
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            color={"secondary"}
          />
        </Box>
        <List sx={{ borderTop: 1, borderColor: theme.palette.outline.main }}>
          {(chats || [])
            .filter(
              (chat) =>
                !(
                  searchQuery &&
                  !chat.participants.join(", ").includes(searchQuery)
                ),
            )
            .map((chat) => (
              <ChatEntry chat={chat} key={chat.chat_id} />
            ))}
        </List>
      </Box>
    </Drawer>
  )
}

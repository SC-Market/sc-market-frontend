import {
  AvatarGroup,
  Badge,
  Box,
  ListItemButton,
  Tooltip,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useCurrentChatID } from "../hooks/CurrentChatID"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import BusinessIcon from "@mui/icons-material/BusinessRounded"
import { useMessageGroupCreate } from "../hooks/MessageGroupCreate"
import type {
  Chat,
  UserParticipant,
  ContractorParticipant,
} from "../domain/types"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { PATHS } from "../../../routes/paths"
import { useFormatters, useNow } from "../../../util/format"

// Single chat entry in the chat list
export function ChatEntry(props: {
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
  const fmt = useFormatters()
  const now = useNow()

  const isSelected =
    chat_id === props.chat.chat_id || currentChatID === props.chat.chat_id

  // Use unread count from props (provided by backend)
  const unreadCount = props.unreadCount || 0

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
        navigate(`${PATHS.messages}/${props.chat.chat_id}`)
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
            variant="dot"
            invisible={!unreadCount || unreadCount === 0}
            color="primary"
          >
            <AvatarGroup max={3} spacing={"small"}>
              {otherUsers.map((part) => (
                <ImageAvatar
                  alt={part.username}
                  src={part.avatar}
                  key={part.username}
                />
              ))}
              {contractorParticipants.map((part) => (
                <ImageAvatar
                  alt={part.name}
                  src={part.avatar}
                  key={part.spectrum_id}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  <BusinessIcon />
                </ImageAvatar>
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
                text={`**${props.chat.messages[props.chat.messages.length - 1].author || t("MessagesBody.system")}**: ${props.chat.messages[props.chat.messages.length - 1].content} *${fmt.relative(props.chat.messages[props.chat.messages.length - 1].timestamp, now)}*`}
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

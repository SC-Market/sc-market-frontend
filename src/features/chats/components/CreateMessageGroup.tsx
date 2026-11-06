import { Box, Chip, Paper, Typography, Stack } from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import React, { useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { User } from "../../../datatypes/User"
import { useSearchUsersQuery } from "../../profile/api/profileApi"
import { PersonAddRounded } from "@mui/icons-material"
import { useMessageGroupCreate } from "../hooks/MessageGroupCreate"
import throttle from "lodash/throttle"
import { useGetMyChatsQuery } from "../api/chatsApi"
import { useCreateChat } from "../hooks/useChatActions"
import { useTranslation } from "react-i18next"
import { MessageHeader } from "./CreateMessageGroupHeader"

function CreateChatBody(props: { selectedUsers: User[] }) {
  const { selectedUsers } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: "100%",
        padding: { xs: 2, sm: 4 },
        borderColor: theme.palette.outline.main,
        boxSizing: "border-box",
        borderWidth: 0,
        borderStyle: "solid",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      {selectedUsers.length === 0 ? (
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            textAlign: "center",
            maxWidth: { xs: "100%", sm: 500 },
            padding: { xs: 2, sm: 4 },
          }}
        >
          <PersonAddRounded
            sx={{
              fontSize: { xs: 48, sm: 64 },
              color: theme.palette.text.secondary,
              opacity: 0.5,
            }}
          />
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {t("CreateMessageGroupBody.startNewChat") || "Start a new chat"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              opacity: 0.7,
            }}
          >
            {t("CreateMessageGroupBody.searchAndSelect") ||
              "Search for users above and select them to create a group chat"}
          </Typography>
        </Stack>
      ) : (
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 600 },
            padding: { xs: 2, sm: 3 },
            bgcolor: theme.palette.background.default,
            border: `1px solid ${theme.palette.outline.main}`,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ marginBottom: 2, fontWeight: 600 }}
          >
            {t("CreateMessageGroupBody.selectedUsers") || "Selected Users"} (
            {selectedUsers.length})
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {selectedUsers.map((user) => (
              <Chip
                key={user.username}
                avatar={
                  <ImageAvatar
                    src={user.avatar}
                    alt={user.display_name || user.username}
                  />
                }
                label={user.display_name || user.username}
                size={isMobile ? "small" : "medium"}
                sx={{
                  maxWidth: { xs: "100%", sm: 200 },
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  )
}

export function CreateMessageGroupBody() {
  const [targetObject, setTargetObject] = useState<User[]>([])
  const [target, setTarget] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [, setGroupCreate] = useMessageGroupCreate()
  const { t } = useTranslation()

  const {
    data: options,
    isLoading: isSearching,
    refetch,
  } = useSearchUsersQuery(target, {
    skip: target.length < 3,
  })

  const retrieve = React.useCallback(
    () => throttle(refetch, 400, { trailing: true }),
    [refetch],
  )

  useEffect(() => {
    retrieve()
  }, [retrieve])

  const { create: createChatMutation, isCreating } = useCreateChat()

  // Refetch chats after creation to get the new chat
  const { refetch: refetchChats } = useGetMyChatsQuery()

  // Reset state when component unmounts or when create is cancelled
  useEffect(() => {
    return () => {
      setTarget("")
      setTargetObject([])
      setError(null)
    }
  }, [])

  const createChat = async () => {
    if (targetObject.length === 0) {
      setError(t("messagesUi2.createChat.selectAtLeastOne"))
      return
    }

    setError(null)
    const failure = await createChatMutation(
      targetObject.map((u) => u.username),
    )
    if (failure) {
      setError(failure)
    } else {
      // Refetch chats to get the newly created chat
      refetchChats()
      setGroupCreate(false)
      setTarget("")
      setTargetObject([])
      setError(null)
    }
  }

  const removeUser = (userToRemove: User) => {
    setTargetObject(
      targetObject.filter((u) => u.username !== userToRemove.username),
    )
    setError(null)
  }

  const handleClose = () => {
    setGroupCreate(false)
    setTarget("")
    setTargetObject([])
    setError(null)
  }

  return (
    <React.Fragment>
      <MessageHeader
        target={target}
        setTarget={setTarget}
        targetObject={targetObject}
        setTargetObject={setTargetObject}
        options={options || []}
        isSearching={isSearching}
        isCreating={isCreating}
        error={error}
        setError={setError}
        createChat={createChat}
        removeUser={removeUser}
        onClose={handleClose}
      />
      <CreateChatBody selectedUsers={targetObject} />
    </React.Fragment>
  )
}

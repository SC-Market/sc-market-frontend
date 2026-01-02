import {
  Autocomplete,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  Alert,
  Stack,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { User } from "../../datatypes/User"
import {
  useGetUserProfileQuery,
  useSearchUsersQuery,
} from "../../store/profile"
import { useMessagingSidebar } from "../../hooks/messaging/MessagingSidebar"
import MenuIcon from "@mui/icons-material/MenuRounded"
import {
  ChevronLeftRounded,
  CloseRounded,
  PersonAddRounded,
} from "@mui/icons-material"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useMessageGroupCreate } from "../../hooks/messaging/MessageGroupCreate"
import throttle from "lodash/throttle"
import { useCreateChatMutation, useGetMyChatsQuery } from "../../store/chats"
import { useTranslation } from "react-i18next"
import { useCurrentChatID } from "../../hooks/messaging/CurrentChatID"
import { useAlertHook } from "../../hooks/alert/AlertHook"

function MessageHeader(props: {
  target: string
  setTarget: (value: string) => void
  targetObject: User[]
  setTargetObject: (value: User[]) => void
  options: User[]
  isSearching: boolean
  isCreating: boolean
  error: string | null
  setError: (error: string | null) => void
  createChat: () => void
  removeUser: (user: User) => void
  onClose: () => void
}) {
  const {
    target,
    setTarget,
    targetObject,
    setTargetObject,
    options,
    isSearching,
    isCreating,
    error,
    setError,
    createChat,
    removeUser,
    onClose,
  } = props

  const [messageSidebarOpen, setMessageSidebar] = useMessagingSidebar()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        width: "100%",
        padding: { xs: 1.5, sm: 2 },
        paddingLeft: { xs: 1.5, sm: 3 },
        boxSizing: "border-box",
        borderWidth: 0,
        borderBottom: `solid 1px ${theme.palette.outline.main}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
          gap: { xs: 1.5, sm: 2 },
        }}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <IconButton
          color="secondary"
          aria-label={
            t("CreateMessageGroupBody.toggleSidebar") || "Toggle sidebar"
          }
          onClick={() => {
            setMessageSidebar((v) => !v)
          }}
          sx={{
            marginRight: { xs: 1, sm: 2 },
            flexShrink: 0,
          }}
          size={isMobile ? "small" : "medium"}
        >
          {!messageSidebarOpen ? <MenuIcon /> : <ChevronLeftRounded />}
        </IconButton>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            gap: 1.5,
            width: { xs: "100%", sm: "auto" },
            minWidth: 0,
          }}
        >
          <Autocomplete
            multiple
            filterOptions={(x) => x}
            fullWidth
            options={options || []}
            disableCloseOnSelect
            autoHighlight
            filterSelectedOptions
            getOptionLabel={(option) => option.display_name || option.username}
            loading={isSearching}
            noOptionsText={
              target.length < 3
                ? t("CreateMessageGroupBody.typeToSearch") ||
                  "Type at least 3 characters to search"
                : t("CreateMessageGroupBody.noUsersFound") || "No users found"
            }
            renderOption={(props, option) => (
              <ListItem {...props} key={option.username}>
                <ListItemAvatar>
                  <Avatar
                    src={option.avatar}
                    alt={option.display_name || option.username}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={option.display_name || option.username}
                  secondary={`@${option.username}`}
                />
              </ListItem>
            )}
            renderTags={(value, getTagProps) => (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  maxHeight: { xs: 100, sm: 120 },
                  overflow: "auto",
                }}
              >
                {value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.username}
                    avatar={
                      <Avatar
                        src={option.avatar}
                        alt={option.display_name || option.username}
                      />
                    }
                    label={option.display_name || option.username}
                    onDelete={() => removeUser(option)}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      maxWidth: { xs: "100%", sm: 200 },
                    }}
                  />
                ))}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  t("CreateMessageGroupBody.usernames") || "Search users..."
                }
                placeholder={
                  t("CreateMessageGroupBody.searchPlaceholder") ||
                  "Type to search users"
                }
                size={isMobile ? "small" : "medium"}
                helperText={
                  target.length > 0 && target.length < 3
                    ? t("CreateMessageGroupBody.minChars") ||
                      "Type at least 3 characters"
                    : targetObject.length > 0
                      ? `${targetObject.length} user${targetObject.length === 1 ? "" : "s"} selected`
                      : undefined
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {isSearching ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            value={targetObject}
            onChange={(event: any, newValue) => {
              setTargetObject(newValue)
              setError(null)
            }}
            inputValue={target}
            onInputChange={(event, newInputValue) => {
              setTarget(newInputValue)
              setError(null)
            }}
            sx={{
              flexGrow: 1,
              minWidth: 0,
            }}
          />

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mt: 0 }}
            >
              {error}
            </Alert>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 1.5 },
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
            flexShrink: 0,
          }}
        >
          <Button
            variant={"contained"}
            color={"primary"}
            onClick={createChat}
            disabled={targetObject.length === 0 || isCreating}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
            startIcon={
              isCreating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonAddRounded />
              )
            }
            sx={{
              minWidth: { xs: "auto", sm: 120 },
            }}
          >
            {isCreating
              ? t("CreateMessageGroupBody.creating") || "Creating..."
              : t("CreateMessageGroupBody.create") || "Create Chat"}
          </Button>

          <IconButton
            color="secondary"
            aria-label={t("CreateMessageGroupBody.close") || "Close"}
            onClick={onClose}
            size={isMobile ? "small" : "medium"}
            sx={{ flexShrink: 0 }}
          >
            <CloseRounded />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

function CreateChatBody(props: { selectedUsers: User[] }) {
  const { selectedUsers } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
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
                  <Avatar
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

  const [
    createChatMutation,
    { isLoading: isCreating },
  ] = useCreateChatMutation()
  const issueAlert = useAlertHook()

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
      setError("Please select at least one user")
      return
    }

    setError(null)
    createChatMutation({ users: targetObject.map((u) => u.username) })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("messages.chatCreated", {
            defaultValue: "Chat created successfully",
          }),
          severity: "success",
        })
        // Refetch chats to get the newly created chat
        refetchChats()
        setGroupCreate(false)
        setTarget("")
        setTargetObject([])
        setError(null)
      })
      .catch((err) => {
        issueAlert(err)
        setError(
          err && "data" in err && err.data
            ? (err.data as { error?: { message?: string } })?.error?.message ||
              "Failed to create chat"
            : "Failed to create chat",
        )
      })
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

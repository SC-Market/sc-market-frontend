import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Alert,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { User } from "../../../datatypes/User"
import { useMessagingSidebar } from "../hooks/MessagingSidebar"
import MenuIcon from "@mui/icons-material/MenuRounded"
import {
  ChevronLeftRounded,
  CloseRounded,
  PersonAddRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"

export function MessageHeader(props: {
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
  const isMobile = useIsMobile()
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
                  <ImageAvatar
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
                      <ImageAvatar
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
                label={t("CreateMessageGroupBody.usernames") || "Search users"}
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
                      ? t("CreateMessageGroupBody.selectedCount", {
                          count: targetObject.length,
                        })
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
            onChange={(_event: React.SyntheticEvent, newValue) => {
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

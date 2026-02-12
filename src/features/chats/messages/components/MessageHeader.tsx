import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { HapticIconButton } from "../../../../components/haptic"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import BusinessIcon from "@mui/icons-material/BusinessRounded"
import DescriptionIcon from "@mui/icons-material/DescriptionRounded"
import MenuIcon from "@mui/icons-material/MenuRounded"
import { ChevronLeftRounded } from "@mui/icons-material"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useGetUserProfileQuery } from "../../../../store/profile"
import { useMessagingSidebar } from "../../hooks/MessagingSidebar"
import { useCurrentChat } from "../../hooks/CurrentChat"
import { DateTimePicker } from "@mui/x-date-pickers"
import { useTranslation } from "react-i18next"
import type { UserParticipant, ContractorParticipant } from "../../domain/types"

export function MessageHeader(props: {
  dateTime: Date
  setDateTime: (dateTime: Date) => void
}) {
  const profile = useGetUserProfileQuery()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [messageSidebarOpen, setMessageSidebar] = useMessagingSidebar()
  const navigate = useNavigate()
  const location = useLocation()

  const [chat] = useCurrentChat()

  const { dateTime, setDateTime } = props
  const { t } = useTranslation()

  const isViewingFromOrderOrOffer =
    location.pathname.includes("/order/") ||
    location.pathname.includes("/offer/")

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
            <HapticIconButton
              color="secondary"
              aria-label={t("MessagesBody.toggleSidebar")}
              onClick={() => {
                if (isMobile) {
                  navigate("/messages")
                } else {
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
            </HapticIconButton>
          )}

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
                    {isViewingFromOrderOrOffer && chat?.chat_id ? (
                      <Chip
                        icon={<DescriptionIcon sx={{ fontSize: 16 }} />}
                        label={t("messages.viewChat", "View Chat")}
                        size="small"
                        component={Link}
                        to={`/messages/${chat.chat_id}`}
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
                    ) : chat!.order_id ? (
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

      {!isMobile && (
        <Stack
          direction="row"
          spacing={theme.layoutSpacing.compact}
          useFlexGap
          alignItems="center"
          justifyContent="right"
          sx={{ width: "auto" }}
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
                size: "medium",
                sx: { width: "auto" },
              },
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `<t:${Math.trunc(dateTime.getTime() / 1000)}:D>`,
                )
              }}
              size="medium"
            >
              {t("MessagesBody.copyDate")}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `<t:${Math.trunc(dateTime.getTime() / 1000)}:t>`,
                )
              }}
              size="medium"
            >
              {t("MessagesBody.copyTime")}
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  )
}

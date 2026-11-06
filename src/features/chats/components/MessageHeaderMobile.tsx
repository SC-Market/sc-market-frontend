import { AvatarGroup, Box, Typography, useTheme, Chip } from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { HapticIconButton } from "../../../components/haptic"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import BusinessIcon from "@mui/icons-material/BusinessRounded"
import DescriptionIcon from "@mui/icons-material/DescriptionRounded"
import { ChevronLeftRounded } from "@mui/icons-material"
import type { UserParticipant, ContractorParticipant } from "../domain/types"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useCurrentChat } from "../hooks/CurrentChat"
import { useTranslation } from "react-i18next"
import { PATHS, ORG_PATHS, ORDER_PATHS } from "../../../routes/paths"

export function MessageHeaderMobile() {
  const profile = useGetUserProfileQuery()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const location = useLocation()
  const [chat] = useCurrentChat()
  const { t } = useTranslation()

  // Check if we're viewing from orders or offers page
  const isViewingFromOrderOrOffer =
    location.pathname.includes("/order/") ||
    location.pathname.includes("/offer/")

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
          <HapticIconButton
            aria-label={t("MessagesBody.toggleSidebar")}
            onClick={() => {
              navigate(PATHS.messages)
            }}
            sx={{
              marginRight: 1,
              flexShrink: 0,
            }}
            size="small"
          >
            <ChevronLeftRounded />
          </HapticIconButton>

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

            return (
              <>
                <AvatarGroup max={3} spacing={"small"} sx={{ flexShrink: 0 }}>
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
                            to={ORG_PATHS.profile(contractor.spectrum_id)}
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
                        to={`${PATHS.messages}/${chat.chat_id}`}
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
                        label={t("messagesUi.viewOrder")}
                        size="small"
                        component={Link}
                        to={ORDER_PATHS.detail(chat!.order_id)}
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
                        label={t("messagesUi.viewOffer")}
                        size="small"
                        component={Link}
                        to={ORDER_PATHS.offer(chat!.session_id)}
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

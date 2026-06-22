import React, { useEffect, useState } from "react"
import {
  Avatar,
  Box,
  createTheme,
  MenuItem,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material"
import { useLocation, useNavigate, matchPath } from "react-router-dom"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useCookies } from "react-cookie"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"
import { ORG_ROUTE_REST_TO_CANONICAL } from "./components/SidebarLinkBody"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import {
  useGetMyShopsQuery,
  useQuickCreateShopMutation,
} from "../../store/api/v2/market"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import StoreRoundedIcon from "@mui/icons-material/StoreRounded"

const localTheme = createTheme({
  palette: {
    mode: "dark",
  },
})

/** Sub-paths within /shop/:slug/ that we preserve when switching shops */
const SHOP_SUB_PATHS = [
  "listings",
  "listings/create",
  "stock",
  "orders",
  "services",
  "settings",
] as const

export function SidebarActorSelect() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: profile } = useGetUserProfileQuery()

  const [cookies, setCookie, deleteCookie] = useCookies([
    "current_contractor",
    "current_shop_slug",
  ])

  // On white-label domains, force the org to the white-label org
  const isWhiteLabel = !!CURRENT_CUSTOM_ORG
  const [contractorSpectrumID, setContractorSpectrumID] = useState(
    isWhiteLabel ? CURRENT_CUSTOM_ORG! : (cookies.current_contractor || "_"),
  )

  // Keep it locked on white-label
  useEffect(() => {
    if (isWhiteLabel && contractorSpectrumID !== CURRENT_CUSTOM_ORG) {
      setContractorSpectrumID(CURRENT_CUSTOM_ORG!)
    }
  }, [isWhiteLabel, contractorSpectrumID])

  const contractor = useGetContractorBySpectrumIDQuery(contractorSpectrumID!, {
    skip: !contractorSpectrumID || contractorSpectrumID === "_",
  })

  const [, setCurrentOrg] = useCurrentOrg()

  // Shop data
  const { data: myShops } = useGetMyShopsQuery(undefined, {
    skip: !profile,
  })
  const [quickCreateShop] = useQuickCreateShopMutation()

  // Determine current shop slug from URL
  const currentShopSlug = React.useMemo(() => {
    const m = matchPath("/shop/:shopSlug/*", location.pathname)
    return (m?.params as { shopSlug?: string })?.shopSlug ?? null
  }, [location.pathname])

  // Keep cookie in sync with current shop slug from URL
  useEffect(() => {
    if (currentShopSlug) {
      setCookie("current_shop_slug", currentShopSlug, {
        path: "/",
        sameSite: "strict",
        maxAge: 31536000,
      })
    }
  }, [currentShopSlug, setCookie])

  useEffect(() => {
    if (!profile) {
      return
    }

    const isMember = profile.contractors.some(
      (choice) => choice.spectrum_id === contractorSpectrumID,
    )

    if (!contractorSpectrumID || contractorSpectrumID === "_" || !isMember) {
      if (contractorSpectrumID !== "_") {
        setContractorSpectrumID("_")
      }
      setCurrentOrg(null)
      deleteCookie("current_contractor")
      return
    }

    if (contractor.error) {
      setContractorSpectrumID("_")
      setCurrentOrg(null)
      deleteCookie("current_contractor")
      return
    }

    if (contractor.data) {
      // If the contractor is archived, reset to personal profile
      if (contractor.data.archived) {
        setContractorSpectrumID("_")
        setCurrentOrg(null)
        deleteCookie("current_contractor")
        return
      }

      setCurrentOrg(contractor.data)
      setCookie("current_contractor", contractorSpectrumID, {
        path: "/",
        sameSite: "strict",
        maxAge: 31536000, // 1 year in seconds
      })
    }
  }, [
    contractor.data,
    contractor.error,
    contractorSpectrumID,
    deleteCookie,
    profile,
    setContractorSpectrumID,
    setCurrentOrg,
    setCookie,
  ])

  const theme = useTheme<ExtendedTheme>()

  // On white-label, don't render the selector at all — org is auto-set
  if (isWhiteLabel) return null

  const handleShopSelect = (slug: string) => {
    // Try to preserve the current sub-path when switching
    const shopMatch = matchPath("/shop/:shopSlug/:rest/*", location.pathname)
    const currentSubPath =
      (shopMatch?.params as { rest?: string })?.rest ?? "listings"
    const validSubPath = SHOP_SUB_PATHS.includes(
      currentSubPath as (typeof SHOP_SUB_PATHS)[number],
    )
      ? currentSubPath
      : "listings"

    navigate(`/shop/${slug}/${validSubPath}`)
  }

  const handleCreateShop = async () => {
    try {
      const result = await quickCreateShop({
        quickCreateShopRequest: { owner_type: "user" },
      }).unwrap()
      navigate(`/shop/${result.slug}/settings`)
    } catch {
      // Quick-create failed — navigate to the shops page
      navigate("/dashboard/shops")
    }
  }

  return (
    <Paper
      sx={{
        backgroundColor: theme.palette.background.sidebar,
        boxShadow: "none",
      }}
    >
      <ThemeProvider theme={localTheme}>
        {/* Org switcher */}
        <TextField
          select
          fullWidth
          value={contractorSpectrumID}
          onChange={(event: React.ChangeEvent<{ value: string }>) => {
            const newValue = event.target.value
            setContractorSpectrumID(newValue)

            const m = matchPath("/org/:contractor_id/*", location.pathname)
            const rest = (
              m?.params as { contractor_id?: string; "*"?: string }
            )?.["*"]
            if (rest && ORG_ROUTE_REST_TO_CANONICAL[rest]) {
              if (newValue === "_") {
                navigate(ORG_ROUTE_REST_TO_CANONICAL[rest])
              } else {
                navigate(`/org/${newValue}/${rest}`)
              }
            }
          }}
          SelectProps={{
            IconComponent: KeyboardArrowDownRoundedIcon,
            sx: {
              "& .MuiSvgIcon-root": {
                color: theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                ),
              },
            },
            MenuProps: {
              PaperProps: {
                sx: {
                  bgcolor: theme.palette.background.sidebar,
                  "& .MuiMenuItem-root": {
                    color: theme.palette.getContrastText(
                      theme.palette.background.sidebar,
                    ),
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  },
                },
                variant: "outlined",
                padding: 2,
              },
            },
          }}
          sx={{
            borderRadius: 32,
            "& .MuiInputLabel-root": {
              color: theme.palette.getContrastText(
                theme.palette.background.sidebar,
              ),
            },
            "& .MuiOutlinedInput-root": {
              color: theme.palette.getContrastText(
                theme.palette.background.sidebar,
              ),
              "& fieldset": {
                borderColor: theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                ),
                opacity: 0.3,
              },
              "&:hover fieldset": {
                borderColor: theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                ),
                opacity: 0.5,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                ),
                opacity: 0.7,
              },
            },
          }}
          label={t("sidebar_actor_select.select_role")}
        >
          {profile ? (
            [
              <MenuItem value={"_"} key={"user"}>
                <Stack
                  direction={"row"}
                  spacing={theme.layoutSpacing.compact}
                  alignItems={"center"}
                  justifyContent={"left"}
                >
                  <Avatar
                    variant={"rounded"}
                    src={profile?.avatar}
                    alt={t("sidebar_actor_select.avatar_of", {
                      username: profile.username,
                    })}
                    sx={{ height: 48, width: 48 }}
                  />
                  <Box>
                    <Typography
                      color={theme.palette.getContrastText(
                        theme.palette.background.sidebar,
                      )}
                    >
                      {profile.display_name}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>,
              ...profile.contractors.map((choice) => (
                <MenuItem value={choice.spectrum_id} key={choice.spectrum_id}>
                  <Stack
                    direction={"row"}
                    spacing={theme.layoutSpacing.compact}
                    alignItems={"center"}
                    justifyContent={"left"}
                    maxWidth={"100%"}
                    sx={{ whiteSpace: "normal" }}
                  >
                    <Avatar
                      variant={"rounded"}
                      src={choice?.avatar}
                      alt={t("sidebar_actor_select.avatar_of", {
                        username: choice.avatar,
                      })}
                      sx={{ height: 48, width: 48 }}
                    />
                    <Typography
                      style={{ whiteSpace: "normal" }}
                      color={theme.palette.getContrastText(
                        theme.palette.background.sidebar,
                      )}
                    >
                      {choice.name}
                    </Typography>
                  </Stack>
                </MenuItem>
              )),
            ]
          ) : (
            <MenuItem value={contractorSpectrumID}>
              <Typography
                color={theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                )}
              >
                {t("sidebar_actor_select.login_to_select_role")}
              </Typography>
            </MenuItem>
          )}
        </TextField>

        {/* Shop switcher — only show when user has shops or is logged in */}
        {profile && (
          <TextField
            select
            fullWidth
            value={currentShopSlug || "_none"}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              const newValue = event.target.value
              if (newValue === "_create") {
                handleCreateShop()
              } else if (newValue !== "_none") {
                handleShopSelect(newValue)
              }
            }}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
              sx: {
                "& .MuiSvgIcon-root": {
                  color: theme.palette.getContrastText(
                    theme.palette.background.sidebar,
                  ),
                },
              },
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: theme.palette.background.sidebar,
                    "& .MuiMenuItem-root": {
                      color: theme.palette.getContrastText(
                        theme.palette.background.sidebar,
                      ),
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    },
                  },
                  variant: "outlined",
                  padding: 2,
                },
              },
            }}
            sx={{
              mt: 1,
              borderRadius: 32,
              "& .MuiInputLabel-root": {
                color: theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                ),
              },
              "& .MuiOutlinedInput-root": {
                color: theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                ),
                "& fieldset": {
                  borderColor: theme.palette.getContrastText(
                    theme.palette.background.sidebar,
                  ),
                  opacity: 0.3,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.getContrastText(
                    theme.palette.background.sidebar,
                  ),
                  opacity: 0.5,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.getContrastText(
                    theme.palette.background.sidebar,
                  ),
                  opacity: 0.7,
                },
              },
            }}
            label={t("sidebar_actor_select.select_shop", "Shop")}
          >
            {myShops && myShops.length > 0 ? (
              [
                ...myShops.map((shop) => (
                  <MenuItem value={shop.slug} key={shop.shop_id}>
                    <Stack
                      direction={"row"}
                      spacing={theme.layoutSpacing.compact}
                      alignItems={"center"}
                      justifyContent={"left"}
                      maxWidth={"100%"}
                      sx={{ whiteSpace: "normal" }}
                    >
                      {shop.logo_url ? (
                        <Avatar
                          variant={"rounded"}
                          src={shop.logo_url}
                          alt={shop.name}
                          sx={{ height: 36, width: 36 }}
                        />
                      ) : (
                        <Avatar
                          variant={"rounded"}
                          sx={{ height: 36, width: 36 }}
                        >
                          <StoreRoundedIcon />
                        </Avatar>
                      )}
                      <Typography
                        style={{ whiteSpace: "normal" }}
                        color={theme.palette.getContrastText(
                          theme.palette.background.sidebar,
                        )}
                      >
                        {shop.name}
                      </Typography>
                    </Stack>
                  </MenuItem>
                )),
                <MenuItem value="_create" key="_create">
                  <Stack
                    direction={"row"}
                    spacing={theme.layoutSpacing.compact}
                    alignItems={"center"}
                    justifyContent={"left"}
                  >
                    <Avatar
                      variant={"rounded"}
                      sx={{ height: 36, width: 36 }}
                    >
                      <AddRoundedIcon />
                    </Avatar>
                    <Typography
                      color={theme.palette.getContrastText(
                        theme.palette.background.sidebar,
                      )}
                    >
                      {t("sidebar_actor_select.create_shop", "Create Shop")}
                    </Typography>
                  </Stack>
                </MenuItem>,
              ]
            ) : (
              <MenuItem value="_create" key="_create">
                <Stack
                  direction={"row"}
                  spacing={theme.layoutSpacing.compact}
                  alignItems={"center"}
                  justifyContent={"left"}
                >
                  <Avatar variant={"rounded"} sx={{ height: 36, width: 36 }}>
                    <AddRoundedIcon />
                  </Avatar>
                  <Typography
                    color={theme.palette.getContrastText(
                      theme.palette.background.sidebar,
                    )}
                  >
                    {t("sidebar_actor_select.create_shop", "Create Shop")}
                  </Typography>
                </Stack>
              </MenuItem>
            )}
          </TextField>
        )}
      </ThemeProvider>
    </Paper>
  )
}

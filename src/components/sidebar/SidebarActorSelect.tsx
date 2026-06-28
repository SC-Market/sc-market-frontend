import React, { useEffect, useMemo } from "react"
import {
  Avatar,
  Box,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import { useLocation, useNavigate, matchPath } from "react-router-dom"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useCookies } from "react-cookie"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import {
  useGetMyShopsQuery,
  useQuickCreateShopMutation,
} from "../../store/api/v2/market"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import StoreRoundedIcon from "@mui/icons-material/StoreRounded"

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
  const theme = useTheme<ExtendedTheme>()

  const [cookies, setCookie] = useCookies(["current_shop_slug"])

  // On white-label, don't render
  if (CURRENT_CUSTOM_ORG) return null

  const { data: myShops } = useGetMyShopsQuery(undefined, { skip: !profile })
  const [quickCreateShop] = useQuickCreateShopMutation()

  const currentShopSlug = useMemo(() => {
    const m = matchPath("/shop/:shopSlug/*", location.pathname)
    return (m?.params as { shopSlug?: string })?.shopSlug ?? null
  }, [location.pathname])

  useEffect(() => {
    if (currentShopSlug) {
      setCookie("current_shop_slug", currentShopSlug, {
        path: "/",
        sameSite: "strict",
        maxAge: 31536000,
      })
    }
  }, [currentShopSlug, setCookie])

  const handleShopSelect = (slug: string) => {
    // Update cookie so shopRouteRest links resolve to this shop
    setCookie("current_shop_slug", slug, {
      path: "/",
      sameSite: "strict",
      maxAge: 31536000,
    })

    // If currently on a /shop/:slug/... page, replace the slug segment and stay on same sub-page
    const shopMatch = matchPath("/shop/:shopSlug/:rest/*", location.pathname)
    if (shopMatch) {
      const currentSubPath =
        (shopMatch.params as { rest?: string })?.rest ?? "listings"
      const validSubPath = SHOP_SUB_PATHS.includes(
        currentSubPath as (typeof SHOP_SUB_PATHS)[number],
      )
        ? currentSubPath
        : "listings"
      navigate(`/shop/${slug}/${validSubPath}`)
    }
    // If not on a shop page, just update cookie — sidebar links will use the new shop
  }

  const handleCreateShop = async () => {
    try {
      const result = await quickCreateShop({
        quickCreateShopRequest: { owner_type: "user" },
      }).unwrap()
      navigate(`/shop/${result.slug}/settings`)
    } catch {
      navigate("/shops/create")
    }
  }

  // Only show on shop routes — selector is contextual, not global
  if (!currentShopSlug) return null

  if (!profile) return null

  return (
    <Paper
      sx={{
        backgroundColor: theme.palette.background.sidebar,
        boxShadow: "none",
      }}
    >
      <TextField
        select
        fullWidth
        value={currentShopSlug || "_none"}
        onChange={(event: React.ChangeEvent<{ value: string }>) => {
          const val = event.target.value
          if (val === "_create") {
            handleCreateShop()
          } else if (val !== "_none") {
            handleShopSelect(val)
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
            },
          },
        }}
        sx={{
          borderRadius: 32,
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
          },
        }}
        label={t("sidebar_actor_select.select_shop", "Shop")}
      >
        {/* No shop selected */}
        <MenuItem value="_none" disabled>
          <Typography variant="body2" color="text.secondary">
            {t("sidebar_actor_select.select_a_shop", "Select a shop...")}
          </Typography>
        </MenuItem>

        {/* User's shops */}
        {myShops?.map((shop) => (
          <MenuItem value={shop.slug} key={shop.shop_id}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                variant="rounded"
                src={shop.logo_url || undefined}
                sx={{ height: 32, width: 32 }}
              >
                <StoreRoundedIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="body2">{shop.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  /{shop.slug}
                </Typography>
              </Box>
            </Stack>
          </MenuItem>
        ))}

        {/* Create new shop */}
        <MenuItem value="_create">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              variant="rounded"
              sx={{ height: 32, width: 32, bgcolor: "primary.main" }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="body2">
              {t("sidebar_actor_select.create_shop", "Create Shop")}
            </Typography>
          </Stack>
        </MenuItem>
      </TextField>
    </Paper>
  )
}

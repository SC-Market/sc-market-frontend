import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import LockRounded from "@mui/icons-material/LockRounded"
import {
  AdminPanelSettingsRounded,
  ExpandMoreRounded,
  LoginRounded,
  PeopleRounded,
  SearchRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import type { UserProfileState } from "../../hooks/login/UserProfile"
import type { ShopResponse } from "../../features/shops/api/shopsApi"
import { PATHS } from "../../routes/paths"
import { isSiteAdmin } from "../../util/siteRole"
import { isMfaLockedAdmin } from "../../features/mfa/adminLock"
import type { NavContext } from "./sidebarNavItems"

/**
 * The sidebar's identity area. Logged in: a context switcher (browse / shops
 * / orgs / admin). Logged out: a Sign in button.
 */
export function SidebarContextSwitcher({
  profile,
  shops,
  context,
  selectedShop,
  selectedShopSlug,
  selectedOrgId,
  contextLabel,
  onSwitch,
  onSignIn,
}: {
  profile: UserProfileState | undefined
  shops: ShopResponse[]
  context: NavContext
  selectedShop: ShopResponse | undefined
  selectedShopSlug: string | null
  selectedOrgId: string | null
  contextLabel: string
  onSwitch: (ctx: NavContext, id?: string) => void
  onSignIn: () => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const choose = (ctx: NavContext, id?: string) => {
    onSwitch(ctx, id)
    setAnchorEl(null)
  }
  return (
    <>
      {/* Identity area. Logged in: a context switcher (browse / shops / orgs /
          admin). Logged out: a Sign in CTA — there's no identity to switch and
          no shops/orgs/admin to offer, so showing an empty avatar + blank name
          would be misleading. */}
      {profile ? (
        <Box
          role="button"
          tabIndex={0}
          aria-label={t("nav.switchContext", "Switch context")}
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl)}
          sx={{
            px: 2,
            py: 1.5,
            cursor: "pointer",
            transition: "background-color 0.2s",
            outline: "none",
            "&:hover": { backgroundColor: theme.palette.action.hover },
            "&:focus": { outline: "none" },
            "&:focus-visible": {
              backgroundColor: theme.palette.action.hover,
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: "-2px",
            },
          }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setAnchorEl(e.currentTarget as HTMLElement)
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={
                context === "admin"
                  ? undefined
                  : context === "shop" && selectedShop
                    ? selectedShop.logo_url || undefined
                    : profile?.avatar
              }
              sx={{ width: 32, height: 32 }}
            >
              {context === "admin" ? (
                <AdminPanelSettingsRounded fontSize="small" />
              ) : context === "shop" ? (
                <StorefrontRounded fontSize="small" />
              ) : undefined}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {profile?.display_name || profile?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {contextLabel}
              </Typography>
            </Box>
            <ExpandMoreRounded fontSize="small" color="action" />
          </Stack>
        </Box>
      ) : (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Button
            component={Link}
            to={PATHS.login}
            rel="nofollow"
            fullWidth
            variant="contained"
            startIcon={<LoginRounded />}
            onClick={onSignIn}
          >
            {t("auth.signIn", "Sign in")}
          </Button>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{ zIndex: theme.zIndex.modal + 2 }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem
          selected={context === "browse"}
          onClick={() => choose("browse")}
        >
          <ListItemIcon>
            <SearchRounded />
          </ListItemIcon>
          <ListItemText>{t("nav.browsing", "Browsing")}</ListItemText>
        </MenuItem>
        {shops.length > 0 && <Divider />}
        {shops.map((shop) => (
          <MenuItem
            key={shop.slug}
            selected={context === "shop" && selectedShopSlug === shop.slug}
            onClick={() => choose("shop", shop.slug)}
          >
            <ListItemIcon>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={<StorefrontRounded sx={{ fontSize: 12 }} />}
              >
                <Avatar
                  src={shop.logo_url || undefined}
                  sx={{ width: 28, height: 28 }}
                >
                  <StorefrontRounded fontSize="small" />
                </Avatar>
              </Badge>
            </ListItemIcon>
            <ListItemText>{shop.name}</ListItemText>
          </MenuItem>
        ))}
        {(profile?.contractors?.length ?? 0) > 0 && <Divider />}
        {profile?.contractors?.map((org) => (
          <MenuItem
            key={org.spectrum_id}
            selected={context === "org" && selectedOrgId === org.spectrum_id}
            onClick={() => choose("org", org.spectrum_id)}
          >
            <ListItemIcon>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={<PeopleRounded sx={{ fontSize: 12 }} />}
              >
                <Avatar
                  src={org.avatar || undefined}
                  sx={{ width: 28, height: 28 }}
                >
                  <PeopleRounded fontSize="small" />
                </Avatar>
              </Badge>
            </ListItemIcon>
            <ListItemText>{org.name}</ListItemText>
          </MenuItem>
        ))}
        {(isSiteAdmin(profile) || isMfaLockedAdmin(profile)) && [
          <Divider key="admin-divider" />,
          <MenuItem
            key="admin-item"
            selected={context === "admin"}
            onClick={() => choose("admin")}
          >
            <ListItemIcon>
              {isSiteAdmin(profile) ? (
                <AdminPanelSettingsRounded />
              ) : (
                <LockRounded />
              )}
            </ListItemIcon>
            <ListItemText
              secondary={
                isSiteAdmin(profile)
                  ? undefined
                  : t("mfa.nav.locked", "Verify to unlock")
              }
            >
              {t("nav.admin", "Admin")}
            </ListItemText>
          </MenuItem>,
        ]}
      </Menu>
    </>
  )
}

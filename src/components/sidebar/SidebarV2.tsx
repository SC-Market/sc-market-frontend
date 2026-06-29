/**
 * SidebarV2 — Context-aware navigation with identity switcher.
 *
 * Renders behind the `nav_v2` feature flag. Replaces the collapsible
 * multi-section sidebar with a flat, role-adaptive navigation panel.
 */

import React, { useMemo, useState } from "react"
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  DashboardRounded,
  StorefrontRounded,
  ShoppingCartRounded,
  LocalShippingRounded,
  InventoryRounded,
  BarChartRounded,
  SettingsRounded,
  PeopleRounded,
  SearchRounded,
  MessageRounded,
  MenuBookRounded,
  ExpandMoreRounded,
  AddRounded,
  ListAltRounded,
  ScienceRounded,
  RocketLaunchRounded,
  DesignServicesRounded,
  DescriptionRounded,
  ExpandLessRounded,
  ChevronLeftRounded,
} from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useGetMyShopsQuery, type ShopResponse } from "../../store/api/v2/market"
import { SHOP_PATHS } from "../../routes/paths"

type NavContext = "browse" | "shop" | "org"

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  badge?: number
}

export function SidebarV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const bottomNavHeight = useBottomNavHeight()
  const location = useLocation()

  const { data: profile } = useGetUserProfileQuery()
  const { data: shops = [] } = useGetMyShopsQuery()

  const [context, setContext] = useState<NavContext>("browse")
  const [selectedShopSlug, setSelectedShopSlug] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const selectedShop = useMemo(
    () => shops.find((s) => s.slug === selectedShopSlug) || shops[0],
    [shops, selectedShopSlug],
  )

  const contextLabel = useMemo(() => {
    if (context === "shop" && selectedShop) return selectedShop.name
    if (context === "org") return profile?.contractors?.[0]?.name || "Organization"
    return t("nav.browsing", "Browsing")
  }, [context, selectedShop, profile, t])

  // Items based on current context
  const contextItems = useMemo<NavItem[]>(() => {
    if (context === "shop" && selectedShop) {
      const slug = selectedShop.slug
      return [
        { label: t("nav.dashboard", "Dashboard"), to: SHOP_PATHS.root(slug), icon: <DashboardRounded /> },
        { label: t("nav.listings", "Listings"), to: SHOP_PATHS.listings(slug), icon: <ListAltRounded /> },
        { label: t("nav.createListing", "Create Listing"), to: SHOP_PATHS.create(slug), icon: <AddRounded /> },
        { label: t("nav.stock", "Stock"), to: SHOP_PATHS.stock(slug), icon: <InventoryRounded /> },
        { label: t("nav.orders", "Orders"), to: SHOP_PATHS.orders(slug), icon: <LocalShippingRounded /> },
        { label: t("nav.analytics", "Analytics"), to: SHOP_PATHS.analytics(slug), icon: <BarChartRounded /> },
        { label: t("nav.shopSettings", "Shop Settings"), to: SHOP_PATHS.settings(slug), icon: <SettingsRounded /> },
      ]
    }
    if (context === "org" && profile?.contractors?.[0]) {
      const spectrumId = profile.contractors[0].spectrum_id
      return [
        { label: t("nav.orgDashboard", "Dashboard"), to: `/org/${spectrumId}/dashboard`, icon: <DashboardRounded /> },
        { label: t("nav.members", "Members"), to: `/org/${spectrumId}/members`, icon: <PeopleRounded /> },
        { label: t("nav.fleet", "Fleet"), to: `/org/${spectrumId}/fleet`, icon: <RocketLaunchRounded /> },
        { label: t("nav.orgSettings", "Settings"), to: `/org/${spectrumId}/manage`, icon: <SettingsRounded /> },
      ]
    }
    // Browse mode
    return [
      { label: t("nav.market", "Market"), to: "/market", icon: <SearchRounded /> },
      { label: t("nav.services", "Services"), to: "/market/services", icon: <DesignServicesRounded /> },
      { label: t("nav.contracts", "Contracts"), to: "/contracts", icon: <DescriptionRounded /> },
      { label: t("nav.buyOrders", "Buy Orders"), to: "/buyorders", icon: <ShoppingCartRounded /> },
      { label: t("nav.shops", "Shops"), to: "/shops", icon: <StorefrontRounded /> },
      { label: t("nav.recruiting", "Recruiting"), to: "/recruiting", icon: <PeopleRounded /> },
      { label: t("nav.myOrders", "My Orders"), to: "/orders", icon: <LocalShippingRounded /> },
      { label: t("nav.dashboard", "Dashboard"), to: "/dashboard", icon: <DashboardRounded /> },
    ]
  }, [context, selectedShop, profile, t])

  const [gameDataOpen, setGameDataOpen] = useState(false)

  const gameDataItems = useMemo<NavItem[]>(() => [
    { label: t("nav.wiki", "Items"), to: "/wiki/items", icon: <MenuBookRounded /> },
    { label: t("nav.wikiShips", "Ships"), to: "/wiki/ships", icon: <RocketLaunchRounded /> },
    { label: t("nav.wikiCommodities", "Commodities"), to: "/wiki/commodities", icon: <InventoryRounded /> },
    { label: t("nav.wikiLocations", "Locations"), to: "/wiki/locations", icon: <DescriptionRounded /> },
    { label: t("nav.missions", "Missions"), to: "/missions", icon: <DescriptionRounded /> },
    { label: t("nav.blueprints", "Blueprints"), to: "/blueprints", icon: <ScienceRounded /> },
    { label: t("nav.craftingCalc", "Crafting"), to: "/crafting/calculator", icon: <ScienceRounded /> },
    { label: t("nav.resources", "Resources"), to: "/resources", icon: <InventoryRounded /> },
    { label: t("nav.mining", "Mining"), to: "/mining", icon: <InventoryRounded /> },
  ], [t])

  const handleContextSwitch = (ctx: NavContext, shopSlug?: string) => {
    setContext(ctx)
    if (shopSlug) setSelectedShopSlug(shopSlug)
    setAnchorEl(null)
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  const drawerContent = (
    <Stack sx={{ height: "100%", py: 1 }}>
      {/* Context Switcher */}
      <Box
        sx={{ px: 2, py: 1.5, cursor: "pointer" }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            src={context === "shop" && selectedShop ? undefined : profile?.avatar}
            sx={{ width: 32, height: 32 }}
          >
            {context === "shop" ? <StorefrontRounded fontSize="small" /> : undefined}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem
          selected={context === "browse"}
          onClick={() => handleContextSwitch("browse")}
        >
          <ListItemIcon><SearchRounded /></ListItemIcon>
          <ListItemText>{t("nav.browsing", "Browsing")}</ListItemText>
        </MenuItem>
        {shops.length > 0 && <Divider />}
        {shops.map((shop) => (
          <MenuItem
            key={shop.slug}
            selected={context === "shop" && selectedShopSlug === shop.slug}
            onClick={() => handleContextSwitch("shop", shop.slug)}
          >
            <ListItemIcon>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={<StorefrontRounded sx={{ fontSize: 12 }} />}
              >
                <Avatar src={shop.logo_url || undefined} sx={{ width: 28, height: 28 }}>
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
            selected={context === "org"}
            onClick={() => handleContextSwitch("org")}
          >
            <ListItemIcon>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={<PeopleRounded sx={{ fontSize: 12 }} />}
              >
                <Avatar src={org.avatar || undefined} sx={{ width: 28, height: 28 }}>
                  <PeopleRounded fontSize="small" />
                </Avatar>
              </Badge>
            </ListItemIcon>
            <ListItemText>{org.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Divider sx={{ mx: 2, my: 0.5 }} />

      {/* Context-specific items */}
      <List dense sx={{ flex: 1, px: 1 }}>
        {contextItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={isActive(item.to)}
            sx={{ borderRadius: 1.5, mb: 0.25 }}
            onClick={() => isMobile && setDrawerOpen(false)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ variant: "body2" }}
            />
            {item.badge && item.badge > 0 && (
              <Chip label={item.badge} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />
            )}
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 0.5 }} />

      {/* Universal items */}
      <List dense sx={{ px: 1, flex: 1, overflowY: "auto" }}>
        <ListItemButton
          sx={{ borderRadius: 1.5, mb: 0.25 }}
          component={Link}
          to="/messaging"
          selected={isActive("/messaging")}
          onClick={() => isMobile && setDrawerOpen(false)}
        >
          <ListItemIcon sx={{ minWidth: 36 }}><MessageRounded /></ListItemIcon>
          <ListItemText primary={t("nav.messages", "Messages")} primaryTypographyProps={{ variant: "body2" }} />
        </ListItemButton>

        {/* Game Data — collapsible */}
        <ListItemButton
          sx={{ borderRadius: 1.5, mb: 0.25 }}
          onClick={() => setGameDataOpen((v) => !v)}
        >
          <ListItemIcon sx={{ minWidth: 36 }}><MenuBookRounded /></ListItemIcon>
          <ListItemText primary={t("nav.gameData", "Game Data")} primaryTypographyProps={{ variant: "body2" }} />
          {gameDataOpen ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
        </ListItemButton>
        <Collapse in={gameDataOpen}>
          <List dense disablePadding sx={{ pl: 2 }}>
            {gameDataItems.map((item) => (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={isActive(item.to)}
                sx={{ borderRadius: 1.5, mb: 0.25 }}
                onClick={() => isMobile && setDrawerOpen(false)}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2" }} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        <ListItemButton
          sx={{ borderRadius: 1.5, mb: 0.25 }}
          component={Link}
          to="/settings"
          selected={isActive("/settings")}
          onClick={() => isMobile && setDrawerOpen(false)}
        >
          <ListItemIcon sx={{ minWidth: 36 }}><SettingsRounded /></ListItemIcon>
          <ListItemText primary={t("nav.settings", "Settings")} primaryTypographyProps={{ variant: "body2" }} />
        </ListItemButton>
      </List>
    </Stack>
  )

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          zIndex: theme.zIndex.modal + 1,
          "& .MuiDrawer-paper": { width: sidebarDrawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Drawer
      variant="persistent"
      open={drawerOpen}
      sx={{
        width: drawerOpen ? sidebarDrawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sidebarDrawerWidth,
          boxSizing: "border-box",
          top: 0,
          height: "100%",
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* Site logo header — matches V1 SidebarHeader */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, minHeight: 64 }}
      >
        <Box
          component={Link}
          to="/"
          sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none", color: "inherit" }}
        >
          <Avatar
            src="/scmarket-logo.png"
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          />
          <Typography fontWeight={600} color="text.primary">
            {t("sidebar.sc_market.title", "SC Market")}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setDrawerOpen(false)}
          sx={{ color: "text.secondary" }}
        >
          <ChevronLeftRounded />
        </IconButton>
      </Stack>
      <Divider />
      {drawerContent}
    </Drawer>
  )
}

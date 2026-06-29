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
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  DashboardRounded,
  StorefrontRounded,
  ShoppingCartRounded,
  LocalShippingRounded,
  InventoryRounded,
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()

  // Infer context from URL
  const inferredContext = useMemo<{ ctx: NavContext; shopSlug: string | null; orgId: string | null }>(() => {
    const path = location.pathname
    const shopMatch = path.match(/^\/shop\/([^/]+)/)
    if (shopMatch) return { ctx: "shop", shopSlug: shopMatch[1], orgId: null }
    const orgMatch = path.match(/^\/org\/([^/]+)/)
    if (orgMatch) return { ctx: "org", shopSlug: null, orgId: orgMatch[1] }
    return { ctx: "browse", shopSlug: null, orgId: null }
  }, [location.pathname])

  const [contextOverride, setContextOverride] = useState<{ ctx: NavContext; shopSlug: string | null; orgId: string | null } | null>(null)
  const context = contextOverride?.ctx ?? inferredContext.ctx
  const selectedShopSlug = contextOverride?.shopSlug ?? inferredContext.shopSlug
  const selectedOrgId = contextOverride?.orgId ?? inferredContext.orgId

  const selectedShop = useMemo(
    () => shops.find((s) => s.slug === selectedShopSlug) || shops[0],
    [shops, selectedShopSlug],
  )

  const contextLabel = useMemo(() => {
    if (context === "shop" && selectedShop) return selectedShop.name
    if (context === "org" && selectedOrgId) {
      const org = profile?.contractors?.find((c) => c.spectrum_id === selectedOrgId)
      return org?.name || "Organization"
    }
    return t("nav.browsing", "Browsing")
  }, [context, selectedShop, selectedOrgId, profile, t])

  // Items based on current context
  const contextItems = useMemo<NavItem[]>(() => {
    if (context === "shop" && selectedShop) {
      const slug = selectedShop.slug
      return [
        { label: t("nav.orders", "Orders"), to: SHOP_PATHS.orders(slug), icon: <LocalShippingRounded /> },
        { label: t("nav.listings", "Listings"), to: SHOP_PATHS.listings(slug), icon: <ListAltRounded /> },
        { label: t("nav.createListing", "Create Listing"), to: SHOP_PATHS.create(slug), icon: <AddRounded /> },
        { label: t("nav.stock", "Stock"), to: SHOP_PATHS.stock(slug), icon: <InventoryRounded /> },
        { label: t("nav.shopSettings", "Shop Settings"), to: SHOP_PATHS.settings(slug), icon: <SettingsRounded /> },
      ]
    }
    if (context === "org" && selectedOrgId) {
      return [
        { label: t("nav.members", "Members"), to: `/org/${selectedOrgId}/members`, icon: <PeopleRounded /> },
        { label: t("nav.orgSettings", "Settings"), to: `/org/${selectedOrgId}/manage`, icon: <SettingsRounded /> },
      ]
    }
    // Browse mode
    return [
      { label: t("nav.market", "Market"), to: "/market", icon: <SearchRounded /> },
      { label: t("nav.services", "Services"), to: "/market/services", icon: <DesignServicesRounded /> },
      { label: t("nav.contracts", "Contracts"), to: "/contracts", icon: <DescriptionRounded /> },
      { label: t("nav.buyOrders", "Buy Orders"), to: "/buyorders", icon: <ShoppingCartRounded /> },
      { label: t("nav.myOrders", "My Orders"), to: "/orders", icon: <LocalShippingRounded /> },
    ]
  }, [context, selectedShop, profile, t])

  const [wikiOpen, setWikiOpen] = useState(false)
  const [craftingOpen, setCraftingOpen] = useState(false)

  const handleContextSwitch = (ctx: NavContext, id?: string) => {
    if (ctx === "shop" && id) {
      setContextOverride({ ctx, shopSlug: id, orgId: null })
      navigate(SHOP_PATHS.orders(id))
    } else if (ctx === "org" && id) {
      setContextOverride({ ctx, shopSlug: null, orgId: id })
      navigate(`/org/${id}/members`)
    } else {
      setContextOverride({ ctx: "browse", shopSlug: null, orgId: null })
      navigate("/market")
    }
    setAnchorEl(null)
  }

  const isActive = (path: string) => {
    // Exact match for short paths to avoid false positives
    if (path === "/market" || path === "/orders" || path === "/mining" || path === "/messaging" || path === "/settings") {
      return location.pathname === path || location.pathname.startsWith(path + "/")
    }
    return location.pathname === path || location.pathname.startsWith(path)
  }

  const drawerContent = (
    <Stack sx={{ height: "100%", overflow: "hidden" }}>
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
            selected={context === "org" && selectedOrgId === org.spectrum_id}
            onClick={() => handleContextSwitch("org", org.spectrum_id)}
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

      {/* Scrollable content area */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
      {/* Context-specific items */}
      <List dense sx={{ px: 1 }}>
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

      {/* Browse section (only in browse mode) */}
      {context === "browse" && (
        <>
          <Typography variant="overline" sx={{ px: 2.5, pt: 1, color: "text.secondary", fontSize: "0.65rem" }}>
            {t("nav.groupBrowse", "Browse")}
          </Typography>
          <List dense sx={{ px: 1 }}>
            <ListItemButton component={Link} to="/shops" selected={isActive("/shops")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 36 }}><StorefrontRounded /></ListItemIcon>
              <ListItemText primary={t("nav.shops", "Shops")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/contractors" selected={isActive("/contractors")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 36 }}><PeopleRounded /></ListItemIcon>
              <ListItemText primary={t("nav.orgs", "Organizations")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/recruiting" selected={isActive("/recruiting")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 36 }}><PeopleRounded /></ListItemIcon>
              <ListItemText primary={t("nav.recruiting", "Recruiting")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
          </List>
        </>
      )}

      <Divider sx={{ mx: 2, my: 0.5 }} />

      {/* Game Data section */}
      <Typography variant="overline" sx={{ px: 2.5, pt: 1, color: "text.secondary", fontSize: "0.65rem" }}>
        {t("sidebar.gameData.title", "Game Data")}
      </Typography>
      <List dense sx={{ px: 1 }}>
        {/* Missions */}
        <ListItemButton component={Link} to="/missions" selected={isActive("/missions")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
          <ListItemIcon sx={{ minWidth: 36 }}><DescriptionRounded /></ListItemIcon>
          <ListItemText primary={t("sidebar.gameData.missions", "Missions")} primaryTypographyProps={{ variant: "body2" }} />
        </ListItemButton>

        {/* Mining */}
        <ListItemButton component={Link} to="/mining" selected={isActive("/mining")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
          <ListItemIcon sx={{ minWidth: 36 }}><InventoryRounded /></ListItemIcon>
          <ListItemText primary={t("sidebar.gameData.mining", "Mining")} primaryTypographyProps={{ variant: "body2" }} />
        </ListItemButton>

        {/* Crafting — collapsible */}
        <ListItemButton sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => setCraftingOpen((v) => !v)}>
          <ListItemIcon sx={{ minWidth: 36 }}><ScienceRounded /></ListItemIcon>
          <ListItemText primary={t("sidebar.gameData.crafting", "Crafting")} primaryTypographyProps={{ variant: "body2" }} />
          {craftingOpen ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
        </ListItemButton>
        <Collapse in={craftingOpen}>
          <List dense disablePadding sx={{ pl: 2 }}>
            <ListItemButton component={Link} to="/blueprints" selected={isActive("/blueprints")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><ScienceRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.gameData.blueprints", "Blueprints")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/crafting/calculator" selected={isActive("/crafting/calculator")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><ScienceRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.gameData.craftingCalculator", "Crafting Calculator")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/resources" selected={isActive("/resources")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><InventoryRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.gameData.resources", "Resources")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/shopping-lists" selected={isActive("/shopping-lists")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><ShoppingCartRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.gameData.shoppingLists", "Shopping Lists")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Wiki — collapsible */}
        <ListItemButton sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => setWikiOpen((v) => !v)}>
          <ListItemIcon sx={{ minWidth: 36 }}><MenuBookRounded /></ListItemIcon>
          <ListItemText primary={t("sidebar.wiki.title", "Wiki")} primaryTypographyProps={{ variant: "body2" }} />
          {wikiOpen ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
        </ListItemButton>
        <Collapse in={wikiOpen}>
          <List dense disablePadding sx={{ pl: 2 }}>
            <ListItemButton component={Link} to="/wiki/items" selected={isActive("/wiki/items")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><MenuBookRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.wiki.items", "Items")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/wiki/ships" selected={isActive("/wiki/ships")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><RocketLaunchRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.wiki.vehicles", "Ships & Vehicles")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/wiki/commodities" selected={isActive("/wiki/commodities")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><InventoryRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.wiki.commodities", "Commodities")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/wiki/locations" selected={isActive("/wiki/locations")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><DescriptionRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.wiki.locations", "Locations")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/wiki/manufacturers" selected={isActive("/wiki/manufacturers")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><StorefrontRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.wiki.manufacturers", "Manufacturers")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
            <ListItemButton component={Link} to="/wiki/refinery" selected={isActive("/wiki/refinery")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
              <ListItemIcon sx={{ minWidth: 32 }}><ScienceRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.wiki.refinery", "Refinery")} primaryTypographyProps={{ variant: "body2" }} />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
      </Box>

      {/* Account items — sticky at bottom */}
      <Box sx={{ flexShrink: 0 }}>
        <Divider sx={{ mx: 2 }} />
        <List dense sx={{ px: 1, py: 0.5 }}>
          <ListItemButton component={Link} to="/messaging" selected={isActive("/messaging")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
            <ListItemIcon sx={{ minWidth: 36 }}><MessageRounded /></ListItemIcon>
            <ListItemText primary={t("nav.messages", "Messages")} primaryTypographyProps={{ variant: "body2" }} />
          </ListItemButton>
          <ListItemButton component={Link} to="/settings" selected={isActive("/settings")} sx={{ borderRadius: 1.5, mb: 0.25 }} onClick={() => isMobile && setDrawerOpen(false)}>
            <ListItemIcon sx={{ minWidth: 36 }}><SettingsRounded /></ListItemIcon>
            <ListItemText primary={t("nav.settings", "Settings")} primaryTypographyProps={{ variant: "body2" }} />
          </ListItemButton>
        </List>
      </Box>
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

/**
 * SidebarV2 — Context-aware navigation with identity switcher.
 *
 * Renders behind the `nav_v2` feature flag. Replaces the collapsible
 * multi-section sidebar with a flat, role-adaptive navigation panel.
 */

import React, { useMemo, useState } from "react"
import { useCookies } from "react-cookie"
import {
  Avatar,
  Badge,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
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
  AdminPanelSettingsRounded,
  BusinessRounded,
  PersonAddRounded,
  CalculateRounded,
  StarRounded,
  StarBorderRounded,
  CloseRounded,
} from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { has_permission } from "../../views/contractor/OrgRoles"
import { useGetMyShopsQuery, type ShopResponse } from "../../store/api/v2/market"
import { SHOP_PATHS } from "../../routes/paths"
import { useUnreadChatCount } from "../../features/chats"
import { usePendingOrderCount } from "../../features/orders/hooks/usePendingOrderCount"
import { haptic } from "../../util/haptics"

type NavContext = "browse" | "shop" | "org" | "admin"

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  badge?: number
  /** Optional subsection grouping label shown above the item */
  group?: string
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
  const unreadChatCount = useUnreadChatCount()
  const pendingOrderCount = usePendingOrderCount()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [search, setSearch] = useState("")
  const [cookies, setCookie] = useCookies(["starred_nav_v2"])
  const starred: string[] = useMemo(() => cookies.starred_nav_v2 || [], [cookies.starred_nav_v2])
  const navigate = useNavigate()

  const toggleStar = (path: string) => {
    haptic.light()
    const next = starred.includes(path)
      ? starred.filter((p) => p !== path)
      : [...starred, path]
    setCookie("starred_nav_v2", next, { path: "/", maxAge: 31536000 })
  }

  // Infer context from URL
  const inferredContext = useMemo<{ ctx: NavContext; shopSlug: string | null; orgId: string | null }>(() => {
    const path = location.pathname
    if (path.startsWith("/admin")) return { ctx: "admin", shopSlug: null, orgId: null }
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

  // Fetch selected org's contractor data for permission checks
  const { data: selectedContractor } = useGetContractorBySpectrumIDQuery(
    selectedOrgId || "",
    { skip: !selectedOrgId },
  )

  const selectedShop = useMemo(
    () => shops.find((s) => s.slug === selectedShopSlug) || shops[0],
    [shops, selectedShopSlug],
  )

  const contextLabel = useMemo(() => {
    if (context === "admin") return t("nav.admin", "Admin")
    if (context === "shop" && selectedShop) return selectedShop.name
    if (context === "org" && selectedOrgId) {
      const org = profile?.contractors?.find((c) => c.spectrum_id === selectedOrgId)
      return org?.name || "Organization"
    }
    return t("nav.browsing", "Browsing")
  }, [context, selectedShop, selectedOrgId, profile, t])

  // Items based on current context
  const contextItems = useMemo<NavItem[]>(() => {
    if (context === "admin") {
      const ops = t("nav.groupAdminOps", "Operations")
      const data = t("nav.groupAdminData", "Data & Config")
      return [
        { label: t("nav.adminOrders", "Orders"), to: "/admin/orders", icon: <LocalShippingRounded />, group: ops },
        { label: t("nav.adminUsers", "Users"), to: "/admin/users", icon: <PeopleRounded />, group: ops },
        { label: t("nav.adminMarket", "Market"), to: "/admin/market", icon: <StorefrontRounded />, group: ops },
        { label: t("nav.adminPremium", "Premium"), to: "/admin/premium", icon: <DescriptionRounded />, group: ops },
        { label: t("nav.adminAlerts", "Alerts"), to: "/admin/alerts", icon: <DescriptionRounded />, group: ops },
        { label: t("nav.adminModeration", "Moderation"), to: "/admin/moderation", icon: <AdminPanelSettingsRounded />, group: ops },
        { label: t("nav.adminFeatureFlags", "Feature Flags"), to: "/admin/feature-flags", icon: <SettingsRounded />, group: data },
        { label: t("nav.adminGameData", "Game Data Import"), to: "/admin/game-data-import", icon: <ScienceRounded />, group: data },
        { label: t("nav.adminAttributes", "Attributes"), to: "/admin/attribute-definitions", icon: <ListAltRounded />, group: data },
        { label: t("nav.adminGameItemAttrs", "Game Item Attributes"), to: "/admin/game-item-attributes", icon: <ListAltRounded />, group: data },
        { label: t("nav.adminImportMonitoring", "Import Monitoring"), to: "/admin/import-monitoring", icon: <ScienceRounded />, group: data },
        { label: t("nav.adminMigration", "Migration"), to: "/admin/migration", icon: <SettingsRounded />, group: data },
        { label: t("nav.adminAuditLogs", "Audit Logs"), to: "/admin/audit-logs", icon: <DescriptionRounded />, group: data },
        { label: t("nav.adminNotificationTest", "Notification Test"), to: "/admin/notification-test", icon: <MessageRounded />, group: data },
      ]
    }
    if (context === "shop" && selectedShop) {
      const slug = selectedShop.slug
      const perms = selectedShop.permissions
      const manage = t("nav.groupManage", "Manage")
      const items: NavItem[] = [
        { label: t("nav.orders", "Orders"), to: SHOP_PATHS.orders(slug), icon: <LocalShippingRounded /> },
        { label: t("nav.listings", "Listings"), to: SHOP_PATHS.listings(slug), icon: <ListAltRounded /> },
        { label: t("nav.services", "Services"), to: SHOP_PATHS.services(slug), icon: <DesignServicesRounded /> },
      ]
      if (perms?.manage_market) {
        items.push({ label: t("nav.createListing", "Create Listing"), to: SHOP_PATHS.create(slug), icon: <AddRounded /> })
      }
      if (perms?.manage_stock || perms?.manage_market) {
        items.push({ label: t("nav.stock", "Stock"), to: SHOP_PATHS.stock(slug), icon: <InventoryRounded /> })
      }
      if (perms?.can_manage) {
        items.push(
          { label: t("nav.customers", "Customers"), to: `/shop/${slug}/customers`, icon: <PeopleRounded />, group: manage },
          { label: t("nav.shopSettings", "Settings"), to: SHOP_PATHS.settings(slug), icon: <SettingsRounded />, group: manage },
        )
      }
      return items
    }
    if (context === "org" && selectedOrgId) {
      const canManageDetails = has_permission(selectedContractor, profile, "manage_org_details", profile?.contractors)
      const canManageRoles = has_permission(selectedContractor, profile, "manage_roles", profile?.contractors)
      const canManageInvites = has_permission(selectedContractor, profile, "manage_invites", profile?.contractors)
      const canManageOrders = has_permission(selectedContractor, profile, "manage_orders", profile?.contractors)
      const canManageWebhooks = has_permission(selectedContractor, profile, "manage_webhooks", profile?.contractors)
      const canManageBlocklist = has_permission(selectedContractor, profile, "manage_blocklist", profile?.contractors)
      const canManageTheme = has_permission(selectedContractor, profile, "manage_theme", profile?.contractors)
      const manage = t("nav.groupManage", "Manage")
      const items: NavItem[] = [
        { label: t("nav.orgPage", "Org Page"), to: `/contractor/${selectedOrgId}`, icon: <StorefrontRounded /> },
        { label: t("nav.orgDashboard", "Dashboard"), to: `/org/${selectedOrgId}/dashboard`, icon: <DashboardRounded /> },
        { label: t("nav.members", "Members"), to: `/org/${selectedOrgId}/members`, icon: <PeopleRounded /> },
      ]
      if (canManageOrders) {
        items.push({ label: t("nav.orgOrders", "Org Orders"), to: `/org/${selectedOrgId}/orders`, icon: <LocalShippingRounded /> })
      }
      if (canManageDetails) {
        items.push({ label: t("nav.orgAbout", "About"), to: `/org/${selectedOrgId}/manage/about`, icon: <DescriptionRounded />, group: manage })
      }
      if (canManageRoles) {
        items.push({ label: t("nav.orgRoles", "Roles"), to: `/org/${selectedOrgId}/manage/roles`, icon: <PeopleRounded />, group: manage })
      }
      if (canManageInvites) {
        items.push({ label: t("nav.orgInvites", "Invites"), to: `/org/${selectedOrgId}/manage/invites`, icon: <PeopleRounded />, group: manage })
      }
      if (canManageWebhooks) {
        items.push({ label: t("nav.orgDiscord", "Discord"), to: `/org/${selectedOrgId}/manage/discord`, icon: <MessageRounded />, group: manage })
      }
      if (canManageTheme) {
        items.push({ label: t("nav.orgTheme", "Theme"), to: `/org/${selectedOrgId}/manage/theme`, icon: <DesignServicesRounded />, group: manage })
      }
      if (canManageDetails) {
        items.push({ label: t("nav.orgSettings", "Settings"), to: `/org/${selectedOrgId}/manage/settings`, icon: <SettingsRounded />, group: manage })
      }
      return items
    }
    // Browse mode
    const marketplace = t("nav.groupMarketplace", "Marketplace")
    const personal = t("nav.groupPersonal", "Personal")
    const items: NavItem[] = [
      { label: t("nav.market", "Market"), to: "/market", icon: <SearchRounded />, group: marketplace },
      { label: t("nav.services", "Services"), to: "/market/services", icon: <DesignServicesRounded />, group: marketplace },
      { label: t("nav.contracts", "Contracts"), to: "/contracts", icon: <DescriptionRounded />, group: marketplace },
      { label: t("nav.buyOrders", "Buy Orders"), to: "/buyorders", icon: <ShoppingCartRounded />, group: marketplace },
    ]
    if (profile) {
      items.push(
        { label: t("nav.myOrders", "My Orders"), to: "/orders", icon: <LocalShippingRounded />, badge: pendingOrderCount, group: personal },
        { label: t("nav.assignedOrders", "Assigned to Me"), to: "/dashboard", icon: <DashboardRounded />, group: personal },
        { label: t("nav.messages", "Messages"), to: "/messages", icon: <MessageRounded />, badge: unreadChatCount, group: personal },
        { label: t("nav.myShops", "My Shops"), to: "/dashboard/shops", icon: <StorefrontRounded />, group: personal },
        { label: t("nav.inventory", "Inventory"), to: "/inventory", icon: <InventoryRounded />, group: personal },
        { label: t("nav.availability", "Availability"), to: "/availability", icon: <DescriptionRounded />, group: personal },
      )
    }
    return items
  }, [context, selectedShop, selectedOrgId, selectedContractor, profile, shops, t, pendingOrderCount, unreadChatCount])

  const [wikiOpen, setWikiOpen] = useState(() => location.pathname.startsWith("/wiki"))
  const [craftingOpen, setCraftingOpen] = useState(
    () =>
      location.pathname.startsWith("/blueprints") ||
      location.pathname.startsWith("/crafting") ||
      location.pathname.startsWith("/resources") ||
      location.pathname.startsWith("/shopping-lists"),
  )

  const handleContextSwitch = (ctx: NavContext, id?: string) => {
    haptic.selection()
    if (ctx === "admin") {
      setContextOverride({ ctx: "admin", shopSlug: null, orgId: null })
      navigate("/admin/orders")
    } else if (ctx === "shop" && id) {
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
    const current = location.pathname
    if (current === path) return true
    // Don't match parent paths when a more specific child item exists in the nav
    // e.g. /shop/x/listings should not highlight when on /shop/x/listings/create
    const hasMoreSpecificMatch = contextItems.some(
      (item) => item.to !== path && item.to.startsWith(path + "/") && current.startsWith(item.to),
    )
    if (hasMoreSpecificMatch) return false
    return current.startsWith(path + "/") || current.startsWith(path + "?")
  }

  const sidebarContrast = theme.palette.getContrastText(
    theme.palette.background.sidebar || theme.palette.background.paper,
  )

  const itemSx = {
    borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 0.375),
    mt: 0.5,
    transition: "0.3s",
    "& .MuiListItemIcon-root": { color: sidebarContrast, transition: "0.3s", fontSize: "0.9em" },
    "& .MuiListItemText-primary": { color: sidebarContrast, fontWeight: "bold", transition: "0.3s" },
    "&.Mui-selected": {
      "& .MuiListItemIcon-root": { color: "primary.main" },
      "& .MuiListItemText-primary": { color: "primary.main" },
    },
    "&:hover": { backgroundColor: theme.palette.action.hover },
    // reveal star button on hover
    "&:hover .nav-star, &:focus-within .nav-star": { opacity: 1 },
  }

  const sectionHeaderSx = {
    px: 2,
    pt: 1.5,
    pb: 0.5,
    fontWeight: "bold",
    opacity: 0.7,
    textTransform: "uppercase" as const,
    fontSize: "0.85em",
  }

  const closeIfMobile = () => {
    if (isMobile) setDrawerOpen(false)
  }

  const q = search.trim().toLowerCase()
  const matchesSearch = (label: string) => !q || label.toLowerCase().includes(q)

  // Render a single nav link with star toggle
  const renderNavItem = (item: NavItem, nested = false) => (
    <ListItemButton
      key={item.to}
      component={Link}
      to={item.to}
      selected={isActive(item.to)}
      sx={itemSx}
      onClick={() => { haptic.light(); closeIfMobile() }}
    >
      <ListItemIcon sx={{ minWidth: nested ? 32 : 36 }}>{item.icon}</ListItemIcon>
      <ListItemText primary={item.label} primaryTypographyProps={{ variant: "subtitle2" }} />
      {item.badge && item.badge > 0 ? (
        <Badge
          badgeContent={item.badge}
          color="primary"
          sx={{ mr: 1.5, "& .MuiBadge-badge": { position: "static", transform: "none" } }}
        />
      ) : null}
      <Tooltip title={starred.includes(item.to) ? t("nav.unstar", "Unpin") : t("nav.star", "Pin")}>
        <IconButton
          className="nav-star"
          size="small"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStar(item.to) }}
          sx={{
            opacity: starred.includes(item.to) ? 1 : 0,
            transition: "opacity 0.2s",
            color: starred.includes(item.to) ? "primary.main" : sidebarContrast,
            p: 0.25,
          }}
        >
          {starred.includes(item.to) ? <StarRounded fontSize="small" /> : <StarBorderRounded fontSize="small" />}
        </IconButton>
      </Tooltip>
    </ListItemButton>
  )

  // Flat list of every navigable destination for starred lookup + search
  const allNavigable = useMemo<NavItem[]>(() => {
    const wiki: NavItem[] = [
      { label: t("sidebar.wiki.items", "Items"), to: "/wiki/items", icon: <MenuBookRounded /> },
      { label: t("sidebar.wiki.vehicles", "Ships & Vehicles"), to: "/wiki/ships", icon: <RocketLaunchRounded /> },
      { label: t("sidebar.wiki.commodities", "Commodities"), to: "/wiki/commodities", icon: <InventoryRounded /> },
      { label: t("sidebar.wiki.locations", "Locations"), to: "/wiki/locations", icon: <DescriptionRounded /> },
      { label: t("sidebar.wiki.manufacturers", "Manufacturers"), to: "/wiki/manufacturers", icon: <StorefrontRounded /> },
      { label: t("sidebar.wiki.refinery", "Refinery"), to: "/wiki/refinery", icon: <ScienceRounded /> },
    ]
    const gameData: NavItem[] = [
      { label: t("sidebar.gameData.missions", "Missions"), to: "/missions", icon: <DescriptionRounded /> },
      { label: t("sidebar.gameData.mining", "Mining"), to: "/mining", icon: <InventoryRounded /> },
      { label: t("sidebar.gameData.blueprints", "Blueprints"), to: "/blueprints", icon: <ScienceRounded /> },
      { label: t("sidebar.gameData.craftingCalculator", "Crafting Calculator"), to: "/crafting/calculator", icon: <CalculateRounded /> },
      { label: t("sidebar.gameData.resources", "Resources"), to: "/resources", icon: <InventoryRounded /> },
    ]
    if (profile) {
      gameData.push({ label: t("sidebar.gameData.shoppingLists", "Shopping Lists"), to: "/shopping-lists", icon: <ShoppingCartRounded /> })
    }
    return [...contextItems, ...gameData, ...wiki]
  }, [contextItems, profile, t])

  const starredItems = useMemo(
    () => allNavigable.filter((item) => starred.includes(item.to)),
    [allNavigable, starred],
  )

  const drawerContent = (
    <Stack sx={{ height: "100%", overflow: "hidden" }}>
      {/* Context Switcher */}
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
          "&:hover": { backgroundColor: theme.palette.action.hover },
          "&:focus-visible": { backgroundColor: theme.palette.action.hover, outline: "none" },
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
            src={context === "admin" ? undefined : context === "shop" && selectedShop ? selectedShop.logo_url || undefined : profile?.avatar}
            sx={{ width: 32, height: 32 }}
          >
            {context === "admin" ? <AdminPanelSettingsRounded fontSize="small" /> : context === "shop" ? <StorefrontRounded fontSize="small" /> : undefined}
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
        {profile?.role === "admin" && [
          <Divider key="admin-divider" />,
          <MenuItem
            key="admin-item"
            selected={context === "admin"}
            onClick={() => handleContextSwitch("admin")}
          >
            <ListItemIcon><AdminPanelSettingsRounded /></ListItemIcon>
            <ListItemText>{t("nav.admin", "Admin")}</ListItemText>
          </MenuItem>,
        ]}
      </Menu>

      {/* Search bar */}
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("nav.searchPlaceholder", "Search navigation...")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")} aria-label={t("nav.clearSearch", "Clear search")}>
                  <CloseRounded fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      </Box>

      <Divider sx={{ mx: 2, my: 0.5 }} />

      {/* Scrollable content area */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
      {q ? (
        /* SEARCH RESULTS — flat filtered list across all destinations */
        <List dense sx={{ px: 1 }}>
          {allNavigable.filter((item) => matchesSearch(item.label)).length === 0 ? (
            <Typography variant="body2" sx={{ px: 2, py: 2, color: "text.secondary", textAlign: "center" }}>
              {t("nav.noResults", "No matching pages")}
            </Typography>
          ) : (
            allNavigable
              .filter((item) => matchesSearch(item.label))
              .map((item) => renderNavItem(item))
          )}
        </List>
      ) : (
        <>
          {/* Starred / pinned section */}
          {starredItems.length > 0 && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ...sectionHeaderSx }}>
                <StarRounded sx={{ fontSize: "1em" }} />
                <Typography variant="body2" component="span" sx={{ fontWeight: "bold", fontSize: "1em", textTransform: "uppercase" }}>
                  {t("nav.pinned", "Pinned")}
                </Typography>
              </Box>
              <List dense sx={{ px: 1 }}>
                {starredItems.map((item) => renderNavItem(item))}
              </List>
              <Divider sx={{ mx: 2, my: 0.5 }} />
            </>
          )}

          {/* Context-specific items — grouped by subsection */}
          <List dense sx={{ px: 1 }}>
            {contextItems.map((item, i) => {
              const showGroup = item.group && item.group !== contextItems[i - 1]?.group
              return (
                <React.Fragment key={item.to}>
                  {showGroup && (
                    <Typography variant="body2" sx={sectionHeaderSx}>
                      {item.group}
                    </Typography>
                  )}
                  {renderNavItem(item)}
                </React.Fragment>
              )
            })}
          </List>

          {/* Browse section (only in browse mode) */}
          {context === "browse" && (
            <>
              <Typography variant="body2" sx={sectionHeaderSx}>
                {t("nav.groupBrowse", "Browse")}
              </Typography>
              <List dense sx={{ px: 1 }}>
                {renderNavItem({ label: t("nav.shops", "Shops"), to: "/shops", icon: <StorefrontRounded /> })}
                {renderNavItem({ label: t("nav.orgs", "Organizations"), to: "/contractors", icon: <BusinessRounded /> })}
                {renderNavItem({ label: t("nav.recruiting", "Recruiting"), to: "/recruiting", icon: <PersonAddRounded /> })}
                {profile && renderNavItem({ label: t("nav.myOrgs", "My Organizations"), to: "/my-orgs", icon: <PeopleRounded /> })}
              </List>
            </>
          )}

          <Divider sx={{ mx: 2, my: 0.5 }} />

          {/* Game Data section */}
          <Typography variant="body2" sx={sectionHeaderSx}>
            {t("sidebar.gameData.title", "Game Data")}
          </Typography>
          <List dense sx={{ px: 1 }}>
            {renderNavItem({ label: t("sidebar.gameData.missions", "Missions"), to: "/missions", icon: <DescriptionRounded /> })}
            {renderNavItem({ label: t("sidebar.gameData.mining", "Mining"), to: "/mining", icon: <InventoryRounded /> })}

            {/* Crafting — collapsible */}
            <ListItemButton sx={itemSx} onClick={() => setCraftingOpen((v) => !v)}>
              <ListItemIcon sx={{ minWidth: 36 }}><ScienceRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.gameData.crafting", "Crafting")} primaryTypographyProps={{ variant: "subtitle2" }} />
              {craftingOpen ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
            </ListItemButton>
            <Collapse in={craftingOpen}>
              <List dense disablePadding sx={{ pl: 2 }}>
                {renderNavItem({ label: t("sidebar.gameData.blueprints", "Blueprints"), to: "/blueprints", icon: <ScienceRounded /> }, true)}
                {renderNavItem({ label: t("sidebar.gameData.craftingCalculator", "Crafting Calculator"), to: "/crafting/calculator", icon: <CalculateRounded /> }, true)}
                {renderNavItem({ label: t("sidebar.gameData.resources", "Resources"), to: "/resources", icon: <InventoryRounded /> }, true)}
                {profile && renderNavItem({ label: t("sidebar.gameData.shoppingLists", "Shopping Lists"), to: "/shopping-lists", icon: <ShoppingCartRounded /> }, true)}
              </List>
            </Collapse>

            {/* Wiki — collapsible */}
            <ListItemButton sx={itemSx} onClick={() => setWikiOpen((v) => !v)}>
              <ListItemIcon sx={{ minWidth: 36 }}><MenuBookRounded /></ListItemIcon>
              <ListItemText primary={t("sidebar.wiki.title", "Wiki")} primaryTypographyProps={{ variant: "subtitle2" }} />
              {wikiOpen ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
            </ListItemButton>
            <Collapse in={wikiOpen}>
              <List dense disablePadding sx={{ pl: 2 }}>
                {renderNavItem({ label: t("sidebar.wiki.items", "Items"), to: "/wiki/items", icon: <MenuBookRounded /> }, true)}
                {renderNavItem({ label: t("sidebar.wiki.vehicles", "Ships & Vehicles"), to: "/wiki/ships", icon: <RocketLaunchRounded /> }, true)}
                {renderNavItem({ label: t("sidebar.wiki.commodities", "Commodities"), to: "/wiki/commodities", icon: <InventoryRounded /> }, true)}
                {renderNavItem({ label: t("sidebar.wiki.locations", "Locations"), to: "/wiki/locations", icon: <DescriptionRounded /> }, true)}
                {renderNavItem({ label: t("sidebar.wiki.manufacturers", "Manufacturers"), to: "/wiki/manufacturers", icon: <StorefrontRounded /> }, true)}
                {renderNavItem({ label: t("sidebar.wiki.refinery", "Refinery"), to: "/wiki/refinery", icon: <ScienceRounded /> }, true)}
              </List>
            </Collapse>
          </List>
        </>
      )}
      </Box>

      {/* Account items — sticky at bottom */}
      <Box sx={{ flexShrink: 0 }}>
        <Divider sx={{ mx: 2 }} />
        <List dense sx={{ px: 1, py: 0.5 }}>
          <ListItemButton component={Link} to="/settings" selected={isActive("/settings")} sx={itemSx} onClick={() => isMobile && setDrawerOpen(false)}>
            <ListItemIcon sx={{ minWidth: 36 }}><SettingsRounded /></ListItemIcon>
            <ListItemText primary={t("nav.settings", "Settings")} primaryTypographyProps={{ variant: "subtitle2" }} />
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

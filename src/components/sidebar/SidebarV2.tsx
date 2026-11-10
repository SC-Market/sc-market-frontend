/**
 * SidebarV2 — Context-aware navigation with identity switcher.
 *
 * The site's only sidebar: a flat, role-adaptive navigation panel. (It shipped
 * behind the now-retired `nav_v2` flag, which replaced the legacy collapsible
 * multi-section sidebar.)
 */

import React, { useEffect, useMemo, useState } from "react"
import { Box, Divider, Drawer, List, Stack, Typography } from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { useTheme } from "@mui/material/styles"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { MobileNavDrawer } from "./MobileNavDrawer"
import { useHydrated } from "../../hooks/ssr/useHydrated"
import { useIsAuthenticated, useSession } from "../../hooks/login/useSession"
import { useStartupGateOpen } from "../../util/startupDeferral"
import { useFeatureFlag } from "../../hooks/market"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { useCustomDomain } from "../../hooks/contractor/CustomDomain"
import { setSidebarShopContext } from "./shopContextState"
import { useGetMyShopsQuery } from "../../features/shops/api/shopsApi"
import { ADMIN_PATHS, MARKET_PATHS, ORG_PATHS } from "../../routes/paths"
import { shopLandingPath } from "../../features/shops/domain/shopPermissions"
import { useUnreadChatCount } from "../../features/chats/hooks/UnreadChatCount"
import { usePendingOrderCount } from "../../features/orders/hooks/usePendingOrderCount"
import { useShopPendingOrderCount } from "../../features/orders/hooks/useShopPendingOrderCount"
import { haptic } from "../../util/haptics"
import { useWhiteLabelSidebar } from "../../features/contractor/hooks/useWhiteLabelSidebar"
import { getWhiteLabelConfig } from "../../hooks/contractor/CustomDomain"
import { useWhiteLabelRoutes } from "../../features/storefront/hooks/useWhiteLabelRoutes"

import {
  browseDirectoryItems,
  browseNavItems,
  gameDataNavItems,
  orgNavItems,
  shopNavItems,
  wikiNavItems,
  type NavContext,
  type NavItem,
} from "./sidebarNavItems"
import { useSidebarStyles } from "./sidebarStyles"
import { SidebarNavItem } from "./SidebarNavItem"
import { SidebarContextSwitcher } from "./SidebarContextSwitcher"
import { SidebarGameDataSection } from "./SidebarGameDataSection"
import { SidebarFooter } from "./SidebarFooter"
import { SidebarBrandHeader } from "./SidebarBrandHeader"
import { SidebarWhiteLabelTabs } from "./SidebarWhiteLabelTabs"
import { useWarmWhenIdle } from "./useWarmWhenIdle"
import { SidebarSearchField } from "./SidebarSearchField"
import { SidebarSearchResults } from "./SidebarSearchResults"
import { SidebarPinnedSection } from "./SidebarPinnedSection"
import { inferNavSelection, type NavSelection } from "./navSelection"
import { useStarredNav } from "./useStarredNav"
import { adminNavItems } from "./adminNavItems"

export function SidebarV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const isMobile = useBreakpointDown("sm")
  const hydrated = useHydrated()
  const mobileDrawerWarm = useWarmWhenIdle(isMobile)
  // The per-item pin buttons (Tooltip + IconButton on every nav link) are a
  // large share of the sidebar's first render at 4x CPU, and the signed-in
  // sidebar has the most items. They're hover/focus-only, so the first render
  // draws a look-alike static icon and the real buttons arrive when idle.
  const pinButtonsReady = useWarmWhenIdle(true)
  const location = useLocation()

  const { profile } = useSession()
  const isAuthenticated = useIsAuthenticated()
  // The shops only show in the context switcher's menu, except on a shop
  // page (the shop context): elsewhere they wait for the startup gate
  // (util/startupDeferral.ts) instead of competing with the first page.
  const startupDone = useStartupGateOpen()
  const onShopPage = /^\/shop\//.test(location.pathname)
  const { data: shops = [] } = useGetMyShopsQuery(undefined, {
    skip: !isAuthenticated || (!startupDone && !onShopPage),
  })
  const { flags } = useFeatureFlag()
  // On a white-label domain: the tabs the org hid and its own links.
  const whiteLabel = useWhiteLabelSidebar()
  // On an org's white-label subdomain the header is the org's brand.
  const { isCustomDomain, customOrg } = useCustomDomain()
  const { data: customOrgData } = useGetContractorBySpectrumIDQuery(
    customOrg!,
    {
      skip: !customOrg,
    },
  )
  const whiteLabelBrand = customOrg
    ? {
        name: customOrgData?.name ?? getWhiteLabelConfig()?.name ?? customOrg,
        logo: customOrgData?.avatar || undefined,
      }
    : null
  // Not the tabs the org hid, nor SC Market-wide pages (whiteLabelRoutes.ts)
  const { shows } = useWhiteLabelRoutes()
  const shownOnWhiteLabel = (item: NavItem) =>
    (!item.whiteLabelKey || !whiteLabel.hidden.has(item.whiteLabelKey)) &&
    shows(item.to)
  const unreadChatCount = useUnreadChatCount()
  const pendingOrderCount = usePendingOrderCount()

  const [search, setSearch] = useState("")
  const { starred, toggleStar } = useStarredNav()
  const navigate = useNavigate()

  // Infer context from URL
  const inferredContext = useMemo(
    () => inferNavSelection(location.pathname, location.state),
    [location.pathname, location.state],
  )

  const [contextOverride, setContextOverride] = useState<NavSelection | null>(
    null,
  )
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

  const shopPendingOrderCount = useShopPendingOrderCount(
    context === "shop" ? selectedShop?.slug : undefined,
  )

  // Pages outside /shop/:slug read the shop the sidebar is in (Quick List)
  const sidebarShopSlug =
    context === "shop" ? (selectedShop?.slug ?? null) : null
  useEffect(() => {
    setSidebarShopContext(sidebarShopSlug)
    return () => setSidebarShopContext(null)
  }, [sidebarShopSlug])

  const contextLabel = useMemo(() => {
    if (context === "admin") return t("nav.admin", "Admin")
    if (context === "shop" && selectedShop) return selectedShop.name
    if (context === "org" && selectedOrgId) {
      const org = profile?.contractors?.find(
        (c) => c.spectrum_id === selectedOrgId,
      )
      return org?.name || "Organization"
    }
    return t("nav.browsing", "Browsing")
  }, [context, selectedShop, selectedOrgId, profile, t])

  // Items based on current context
  const contextItems = useMemo<NavItem[]>(() => {
    if (context === "admin") return adminNavItems(t)
    if (context === "shop" && selectedShop)
      return shopNavItems(
        t,
        selectedShop,
        flags.customizable_dashboard,
        shopPendingOrderCount,
      )
    if (context === "org" && selectedOrgId)
      return orgNavItems(
        t,
        selectedOrgId,
        selectedContractor,
        profile,
        flags.customizable_dashboard,
      )
    return browseNavItems(
      t,
      whiteLabel.hidden,
      profile,
      flags.customizable_dashboard,
      pendingOrderCount,
      unreadChatCount,
    ).filter((item) => shows(item.to))
  }, [
    shows,
    context,
    selectedShop,
    selectedOrgId,
    selectedContractor,
    profile,
    t,
    pendingOrderCount,
    unreadChatCount,
    shopPendingOrderCount,
    flags.customizable_dashboard,
    whiteLabel.hidden,
  ])

  const [wikiOpen, setWikiOpen] = useState(() =>
    location.pathname.startsWith("/wiki"),
  )
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
      navigate(ADMIN_PATHS.orders)
    } else if (ctx === "shop" && id) {
      // The switcher lists exactly `shops`, so the chosen one is in it.
      const shop = shops.find((s) => s.slug === id)
      if (!shop) return
      setContextOverride({ ctx, shopSlug: id, orgId: null })
      navigate(shopLandingPath(shop))
    } else if (ctx === "org" && id) {
      setContextOverride({ ctx, shopSlug: null, orgId: id })
      navigate(ORG_PATHS.members(id))
    } else {
      setContextOverride({ ctx: "browse", shopSlug: null, orgId: null })
      navigate(MARKET_PATHS.search)
    }
  }

  const isActive = (path: string) => {
    const current = location.pathname
    if (current === path) return true
    // Don't match parent paths when a more specific child item exists in the nav
    // e.g. /shop/x/listings should not highlight when on /shop/x/listings/create
    const hasMoreSpecificMatch = contextItems.some(
      (item) =>
        item.to !== path &&
        item.to.startsWith(path + "/") &&
        current.startsWith(item.to),
    )
    if (hasMoreSpecificMatch) return false
    return current.startsWith(path + "/") || current.startsWith(path + "?")
  }

  const { itemSx, sectionHeaderSx, pinSx } = useSidebarStyles()

  const closeIfMobile = () => {
    if (isMobile) setDrawerOpen(false)
  }

  const q = search.trim().toLowerCase()
  const matchesSearch = (label: string) => !q || label.toLowerCase().includes(q)

  // Render a single nav link with star toggle
  const renderNavItem = (item: NavItem, nested = false) => (
    <SidebarNavItem
      key={item.to}
      item={item}
      nested={nested}
      selected={isActive(item.to)}
      starred={starred.includes(item.to)}
      pinReady={pinButtonsReady}
      onToggleStar={toggleStar}
      onNavigate={closeIfMobile}
      itemSx={itemSx}
      pinSx={pinSx}
    />
  )

  // Flat list of every navigable destination for starred lookup + search
  // Game Data and the wiki are SC Market-wide: not on a white-label domain.
  const allNavigable = useMemo<NavItem[]>(() => {
    if (isCustomDomain) return contextItems
    return [
      ...contextItems,
      ...gameDataNavItems(t, Boolean(profile)),
      ...wikiNavItems(t),
    ]
  }, [contextItems, isCustomDomain, profile, t])

  const starredItems = useMemo(
    () => allNavigable.filter((item) => starred.includes(item.to)),
    [allNavigable, starred],
  )

  const drawerContent = (
    <Stack sx={{ height: "100%", overflow: "hidden" }}>
      <SidebarContextSwitcher
        profile={profile}
        shops={shops}
        context={context}
        selectedShop={selectedShop}
        selectedShopSlug={selectedShopSlug}
        selectedOrgId={selectedOrgId}
        contextLabel={contextLabel}
        onSwitch={handleContextSwitch}
        onSignIn={closeIfMobile}
      />

      {/* Search bar */}
      <SidebarSearchField value={search} onChange={setSearch} />

      <Divider sx={{ mx: 2, my: 0.5 }} />

      {/* Scrollable content area */}
      <Box sx={{ flex: 1, overflowY: "auto", pb: 1 }}>
        {q ? (
          /* SEARCH RESULTS — flat filtered list across all destinations */
          <SidebarSearchResults
            results={allNavigable.filter((item) => matchesSearch(item.label))}
            renderNavItem={renderNavItem}
          />
        ) : (
          <>
            {/* Starred / pinned section */}
            {starredItems.length > 0 && (
              <SidebarPinnedSection
                starredItems={starredItems}
                renderNavItem={renderNavItem}
                sectionHeaderSx={sectionHeaderSx}
              />
            )}

            {/* Context-specific items — grouped by subsection */}
            <List dense component="div" sx={{ px: 1 }}>
              {contextItems.map((item, i) => {
                const showGroup =
                  item.group && item.group !== contextItems[i - 1]?.group
                return (
                  <React.Fragment key={item.to}>
                    {showGroup && (
                      <Typography
                        variant="body2"
                        sx={{ ...sectionHeaderSx, px: 1 }}
                      >
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
                <List dense component="div" sx={{ px: 1 }}>
                  {browseDirectoryItems(t)
                    .filter(shownOnWhiteLabel)
                    .map((item) => renderNavItem(item))}
                </List>
              </>
            )}

            {/* A white-label org's own links (Sidebar Tabs › Custom Tabs) */}
            {context === "browse" && whiteLabel.customTabs.length > 0 && (
              <SidebarWhiteLabelTabs
                customTabs={whiteLabel.customTabs}
                brandName={whiteLabelBrand?.name}
                isActive={isActive}
                onNavigate={closeIfMobile}
                itemSx={itemSx}
                sectionHeaderSx={sectionHeaderSx}
              />
            )}

            {/* Game Data section — browse mode only, main site only */}
            {context === "browse" && !isCustomDomain && (
              <SidebarGameDataSection
                signedIn={Boolean(profile)}
                renderNavItem={renderNavItem}
                craftingOpen={craftingOpen}
                onToggleCrafting={() => setCraftingOpen((v) => !v)}
                wikiOpen={wikiOpen}
                onToggleWiki={() => setWikiOpen((v) => !v)}
                itemSx={itemSx}
                sectionHeaderSx={sectionHeaderSx}
              />
            )}
          </>
        )}
      </Box>

      <SidebarFooter
        signedIn={Boolean(profile)}
        isActive={isActive}
        onNavigate={closeIfMobile}
        itemSx={itemSx}
      />
    </Stack>
  )

  if (isMobile) {
    return (
      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        // Mounted (hidden) once the page is idle, then kept: see useWarmWhenIdle.
        keepMounted={mobileDrawerWarm}
        width={sidebarDrawerWidth}
      >
        {drawerContent}
      </MobileNavDrawer>
    )
  }

  return (
    <Drawer
      variant="persistent"
      open={drawerOpen}
      sx={{
        width: drawerOpen ? sidebarDrawerWidth : 0,
        flexShrink: 0,
        // A prerendered page's first render is the desktop one (the viewport
        // isn't known yet): on phones the open sidebar stays hidden by CSS
        // until the app switches to the mobile drawer (closed by default).
        ...(hydrated ? {} : { display: { xs: "none", sm: "block" } }),
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
      <SidebarBrandHeader
        whiteLabelBrand={whiteLabelBrand}
        onClose={() => setDrawerOpen(false)}
      />
      <Divider />
      {drawerContent}
    </Drawer>
  )
}

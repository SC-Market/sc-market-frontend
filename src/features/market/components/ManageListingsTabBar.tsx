/**
 * Shared tab bar for Manage Listings, Manage Stock, and Manage Services pages.
 * Renders a page title (HeaderTitle style), tabs, and optional right-aligned action.
 * Uses flex space-between so the action button stays right-justified; wraps on mobile.
 */

import React from "react"
import { Box, Tabs, Tab, Typography } from "@mui/material"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useOptionalShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { canOpenShopSection } from "../../shops/domain/shopPermissions"
import { SHOP_PATHS } from "../../../routes/paths"

export interface ManageListingsTabBarProps {
  /** Page title shown to the left of the tabs (e.g. "Manage Listings", "Manage Stock", "Manage Services") */
  title: string
  /** Optional content to render on the right (e.g. Create Listing / Create Service button) */
  rightAction?: React.ReactNode
}

type ManageTab = "listings" | "stock" | "services"

function getTabForPath(pathname: string): ManageTab {
  if (pathname.includes("/stock") || pathname.includes("/manage-stock"))
    return "stock"
  if (pathname.includes("/services")) return "services"
  return "listings"
}

const PERSONAL_ROUTES: Record<ManageTab, string> = {
  listings: "/market/manage",
  stock: "/market/manage-stock",
  services: "/order/services",
}

export function ManageListingsTabBar({
  title,
  rightAction,
}: ManageListingsTabBarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = getTabForPath(location.pathname)
  // Under /shop/:shopSlug/...: only the tabs the user may open there
  // (canOpenShopSection, as in the sidebar).
  const shop = useOptionalShopRouteContext()?.shop
  const tabs = (["listings", "stock", "services"] as const).filter(
    (tab) => !shop || canOpenShopSection(shop, tab),
  )
  const labels: Record<ManageTab, string> = {
    listings: t("sidebar.manage_listings", "Manage Listings"),
    stock: t("sidebar.manage_stock", "Stock"),
    services: t("sidebar.manage_services", "Manage Services"),
  }

  const handleTabChange = (_: React.SyntheticEvent, tab: ManageTab) => {
    navigate(
      shop
        ? {
            listings: SHOP_PATHS.listings(shop.slug),
            stock: SHOP_PATHS.stock(shop.slug),
            services: SHOP_PATHS.services(shop.slug),
          }[tab]
        : PERSONAL_ROUTES[tab],
    )
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
        flex: "1 1 0",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          minWidth: 0,
          flex: "1 1 auto",
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: "bold", flexShrink: 0 }}
          color="text.secondary"
        >
          {title}
        </Typography>
        {/* Scrollable, like the other tab bars: at phone widths the three
            tabs ran off the screen */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 0, maxWidth: "100%" }}
        >
          {tabs.map((tab) => (
            <Tab key={tab} value={tab} label={labels[tab]} />
          ))}
        </Tabs>
      </Box>
      {rightAction != null && (
        <Box sx={{ flexShrink: 0, ml: "auto" }}>{rightAction}</Box>
      )}
    </Box>
  )
}

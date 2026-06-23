/**
 * Shared tab bar for Manage Listings, Manage Stock, and Manage Services pages.
 * Renders a page title (HeaderTitle style), tabs, and optional right-aligned action.
 * Uses flex space-between so the action button stays right-justified; wraps on mobile.
 */

import React from "react"
import { Box, Tabs, Tab, Typography } from "@mui/material"
import { useNavigate, useLocation, matchPath } from "react-router-dom"
import { useTranslation } from "react-i18next"

export interface ManageListingsTabBarProps {
  /** Page title shown to the left of the tabs (e.g. "Manage Listings", "Manage Stock", "Manage Services") */
  title: string
  /** Optional content to render on the right (e.g. Create Listing / Create Service button) */
  rightAction?: React.ReactNode
}

function getTabForPath(pathname: string): number {
  if (pathname.includes("/stock") || pathname.includes("/manage-stock")) return 1
  if (pathname.includes("/services")) return 2
  return 0
}

export function ManageListingsTabBar({ title, rightAction }: ManageListingsTabBarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = getTabForPath(location.pathname)

  // Resolve shop slug from URL if under /shop/:slug/...
  const shopMatch = matchPath("/shop/:shopSlug/*", location.pathname)
  const shopSlug = (shopMatch?.params as { shopSlug?: string })?.shopSlug

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (shopSlug) {
      const shopRoutes = [`/shop/${shopSlug}/listings`, `/shop/${shopSlug}/stock`, `/shop/${shopSlug}/services`]
      navigate(shopRoutes[newValue])
    } else {
      const fallbackRoutes = ["/market/manage", "/market/manage-stock", "/order/services"]
      navigate(fallbackRoutes[newValue])
    }
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
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ minHeight: 0 }}>
          <Tab label={t("sidebar.manage_listings", "Manage Listings")} />
          <Tab label={t("sidebar.manage_stock", "Manage Inventory")} />
          <Tab label={t("sidebar.manage_services", "Manage Services")} />
        </Tabs>
      </Box>
      {rightAction != null && (
        <Box sx={{ flexShrink: 0, ml: "auto" }}>{rightAction}</Box>
      )}
    </Box>
  )
}

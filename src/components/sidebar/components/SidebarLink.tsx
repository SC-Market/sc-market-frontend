import React, { useCallback } from "react"
import { NavLink } from "react-router-dom"
import { SidebarLinkBody } from "./SidebarLinkBody"
import { SidebarLinkProps } from "../types"
import { prefetchModule } from "../../../util/prefetch"

// Route prefetch map for sidebar links
const routePrefetchMap: Record<
  string,
  { importFn: () => Promise<unknown>; key: string }
> = {
  // Market
  "/market": { importFn: () => import("../../../features/market"), key: "MarketPage" },
  "/bulk": { importFn: () => import("../../../features/market-bulk"), key: "BulkItems" },
  "/buyorders": { importFn: () => import("../../../features/market-buy-orders"), key: "BuyOrders" },
  "/market/me": { importFn: () => import("../../../pages/market/MyMarketListings"), key: "MyListings" },
  "/market/create": { importFn: () => import("../../../pages/market/MarketCreate"), key: "MarketCreate" },
  "/market/cart": { importFn: () => import("../../../pages/market/MarketCart"), key: "MarketCart" },
  "/market/manage": { importFn: () => import("../../../pages/market/ManageStock"), key: "ManageStock" },

  // Contracting
  "/contracts": { importFn: () => import("../../../pages/contracting/Contracts"), key: "Contracts" },
  "/order/services": { importFn: () => import("../../../pages/contracting/Services"), key: "Services" },
  "/orders": { importFn: () => import("../../../pages/contracting/CreateOrder"), key: "CreateOrder" },

  // People & Orgs
  "/contractors": { importFn: () => import("../../../pages/contractor/Contractors"), key: "Contractors" },
  "/recruiting": { importFn: () => import("../../../pages/recruiting/Recruiting"), key: "Recruiting" },
  "/messages": { importFn: () => import("../../../pages/messaging/Messages"), key: "Messages" },
  "/notifications": { importFn: () => import("../../../pages/notifications/NotificationsPage"), key: "Notifications" },
  "/settings": { importFn: () => import("../../../pages/people/SettingsPage"), key: "Settings" },
  "/dashboard": { importFn: () => import("../../../pages/contractor/MemberDashboard"), key: "Dashboard" },

  // Game Data
  "/missions": { importFn: () => import("../../../pages/missions/MissionSearch"), key: "Missions" },
  "/mining": { importFn: () => import("../../../pages/mining/MiningPage"), key: "Mining" },
  "/mining/locations": { importFn: () => import("../../../pages/mining/MiningPage"), key: "MiningLocations" },
  "/blueprints": { importFn: () => import("../../../pages/blueprints/BlueprintBrowser"), key: "Blueprints" },
  "/crafting/calculator": { importFn: () => import("../../../pages/crafting/CraftingCalculator"), key: "CraftingCalc" },
  "/resources": { importFn: () => import("../../../pages/resources/ResourceBrowser"), key: "Resources" },
  "/shopping-lists": { importFn: () => import("../../../pages/wishlists/WishlistManager"), key: "ShoppingLists" },
  "/blueprints/inventory": { importFn: () => import("../../../pages/blueprints/BlueprintInventory"), key: "BPInventory" },

  // Wiki
  "/wiki/items": { importFn: () => import("../../../pages/wiki/WikiItemBrowser"), key: "WikiItems" },
  "/wiki/ships": { importFn: () => import("../../../pages/wiki/WikiShipBrowser"), key: "WikiShips" },
  "/wiki/commodities": { importFn: () => import("../../../pages/wiki/WikiCommodityBrowser"), key: "WikiCommodities" },
  "/wiki/locations": { importFn: () => import("../../../pages/wiki/WikiLocationBrowser"), key: "WikiLocations" },
  "/wiki/manufacturers": { importFn: () => import("../../../pages/wiki/WikiManufacturerList"), key: "WikiManufacturers" },
  "/wiki/refinery": { importFn: () => import("../../../pages/wiki/WikiRefineryPage"), key: "WikiRefinery" },

  // Org management
  "/org/members": { importFn: () => import("../../../pages/people/People"), key: "People" },
  "/org/fleet": { importFn: () => import("../../../pages/fleet/Fleet"), key: "Fleet" },
  "/org/manage": { importFn: () => import("../../../pages/contractor/OrgManage"), key: "OrgManage" },
  "/org/orders": { importFn: () => import("../../../pages/contractor/OrgOrders"), key: "OrgOrders" },
}

/**
 * Sidebar link wrapper with prefetching
 */
export function SidebarLink(props: SidebarLinkProps) {
  const handleMouseEnter = useCallback(() => {
    const matchingRoute = Object.keys(routePrefetchMap).find((route) =>
      props.to.startsWith(route),
    )

    if (matchingRoute) {
      const { importFn, key } = routePrefetchMap[matchingRoute]
      prefetchModule(importFn, key)
    }
  }, [props.to])

  return props.external ? (
    <a
      href={props.to}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={handleMouseEnter}
    >
      <SidebarLinkBody {...props} />
    </a>
  ) : (
    <NavLink
      to={props.to + (props.params ? "?" + props.params : "")}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={handleMouseEnter}
    >
      <SidebarLinkBody {...props} />
    </NavLink>
  )
}

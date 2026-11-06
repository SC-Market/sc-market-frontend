/**
 * The sidebar's destinations per context (admin, shop, org, browse) and the
 * Game Data / Wiki lists. Pure builders: SidebarV2 memoizes them.
 */
import React from "react"
import type { TFunction } from "i18next"
import { canOpenShopSettings } from "../../features/shops/domain/shopPermissions"
import {
  AddRounded,
  BusinessRounded,
  CalculateRounded,
  DashboardRounded,
  DescriptionRounded,
  DesignServicesRounded,
  InventoryRounded,
  ListAltRounded,
  LocalShippingRounded,
  MenuBookRounded,
  MessageRounded,
  PeopleRounded,
  PersonAddRounded,
  RocketLaunchRounded,
  ScienceRounded,
  SearchRounded,
  SettingsRounded,
  ShoppingCartRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import {
  GAME_DATA_PATHS,
  MARKET_PATHS,
  ORG_PATHS,
  PATHS,
  SHOP_PATHS,
  WIKI_PATHS,
} from "../../routes/paths"
import type { ShopResponse } from "../../features/shops/api/shopsApi"
import type { Contractor } from "../../features/contractor/domain/types"
import type { UserProfileState } from "../../hooks/login/UserProfile"
import { canManageOrgOrders } from "../../features/contractor/domain/orgPermissions"
import { canOpenOrgManage } from "../../features/contractor/domain/manageTabs"
export type NavContext = "browse" | "shop" | "org" | "admin"

export interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  badge?: number
  /** Optional subsection grouping label shown above the item */
  group?: string
  /** Key a white-label org can hide it with (Sidebar Tabs settings) */
  whiteLabelKey?: string
}

export function shopNavItems(
  t: TFunction,
  selectedShop: ShopResponse,
  customizableDashboard: boolean | undefined,
  shopPendingOrderCount: number,
): NavItem[] {
  const slug = selectedShop.slug
  const perms = selectedShop.permissions
  const manage = t("nav.groupManage", "Manage")
  const items: NavItem[] = [
    {
      label: t("nav.shopPage", "Shop Page"),
      to: SHOP_PATHS.profile(slug),
      icon: <StorefrontRounded />,
    },
    ...(customizableDashboard
      ? [
          {
            label: t("nav.dashboard", "Dashboard"),
            to: SHOP_PATHS.dashboard(slug),
            icon: <DashboardRounded />,
          },
        ]
      : []),
    {
      label: t("nav.orders", "Orders"),
      to: SHOP_PATHS.orders(slug),
      icon: <LocalShippingRounded />,
      badge: shopPendingOrderCount,
    },
    {
      label: t("nav.listings", "Listings"),
      to: SHOP_PATHS.listings(slug),
      icon: <ListAltRounded />,
    },
    {
      label: t("nav.services", "Services"),
      to: SHOP_PATHS.services(slug),
      icon: <DesignServicesRounded />,
    },
  ]
  if (perms?.manage_market) {
    items.push({
      label: t("nav.createListing", "Create Listing"),
      to: SHOP_PATHS.create(slug),
      icon: <AddRounded />,
    })
  }
  if (perms?.manage_stock || perms?.manage_market) {
    items.push({
      label: t("nav.stock", "Stock"),
      to: SHOP_PATHS.stock(slug),
      icon: <InventoryRounded />,
    })
  }
  if (perms?.can_manage) {
    items.push({
      label: t("nav.customers", "Customers"),
      to: SHOP_PATHS.customers(slug),
      icon: <PeopleRounded />,
      group: manage,
    })
  }
  if (canOpenShopSettings(selectedShop)) {
    items.push({
      label: t("nav.shopSettings", "Settings"),
      to: SHOP_PATHS.settings(slug),
      icon: <SettingsRounded />,
      group: manage,
    })
  }
  return items
}

export function orgNavItems(
  t: TFunction,
  selectedOrgId: string,
  selectedContractor: Contractor | undefined,
  profile: UserProfileState | undefined,
  customizableDashboard: boolean | undefined,
): NavItem[] {
  const canManageOrders = canManageOrgOrders(selectedContractor, profile)
  const items: NavItem[] = [
    {
      label: t("nav.orgPage", "Org Page"),
      to: ORG_PATHS.profile(selectedOrgId),
      icon: <StorefrontRounded />,
    },
    {
      label: t("nav.orgDashboard", "Dashboard"),
      to: customizableDashboard
        ? ORG_PATHS.dashboardOverview(selectedOrgId)
        : ORG_PATHS.dashboard(selectedOrgId),
      icon: <DashboardRounded />,
    },
    {
      label: t("nav.members", "Members"),
      to: ORG_PATHS.members(selectedOrgId),
      icon: <PeopleRounded />,
    },
  ]
  if (canManageOrders) {
    items.push({
      label: t("nav.orgOrders", "Org Orders"),
      to: ORG_PATHS.orders(selectedOrgId),
      icon: <LocalShippingRounded />,
    })
  }
  // Single Manage entry — the manage page has its own tab bar for
  // About/Roles/Invites/Discord/Theme/Settings/Audit. Don't duplicate
  // those sub-destinations in the sidebar. It shows exactly when at least
  // one of those tabs would (same rules as the manage route).
  if (canOpenOrgManage(selectedContractor, profile)) {
    items.push({
      label: t("nav.orgManage", "Manage"),
      to: ORG_PATHS.manage(selectedOrgId),
      icon: <SettingsRounded />,
    })
  }
  return items
}

export function browseNavItems(
  t: TFunction,
  hiddenOnWhiteLabel: ReadonlySet<string>,
  profile: UserProfileState | undefined,
  customizableDashboard: boolean | undefined,
  pendingOrderCount: number,
  unreadChatCount: number,
): NavItem[] {
  const marketplace = t("nav.groupMarketplace", "Marketplace")
  const personal = t("nav.groupPersonal", "Personal")
  const items: NavItem[] = [
    {
      label: t("nav.market", "Market"),
      to: MARKET_PATHS.search,
      icon: <SearchRounded />,
      group: marketplace,
      whiteLabelKey: "market",
    },
    {
      label: t("nav.services", "Services"),
      to: MARKET_PATHS.services,
      icon: <DesignServicesRounded />,
      group: marketplace,
      whiteLabelKey: "services",
    },
    {
      label: t("nav.contracts", "Contracts"),
      to: PATHS.contracts,
      icon: <DescriptionRounded />,
      group: marketplace,
      whiteLabelKey: "contracts",
    },
    {
      label: t("nav.buyOrders", "Buy Orders"),
      to: MARKET_PATHS.buyOrders,
      icon: <ShoppingCartRounded />,
      group: marketplace,
    },
  ].filter(
    (item) =>
      !item.whiteLabelKey || !hiddenOnWhiteLabel.has(item.whiteLabelKey),
  )
  if (profile) {
    if (customizableDashboard) {
      items.push({
        label: t("nav.dashboard", "Dashboard"),
        to: PATHS.dashboardOverview,
        icon: <DashboardRounded />,
        group: personal,
      })
    }
    items.push(
      {
        label: t("nav.myOrders", "My Orders"),
        to: PATHS.myOrders,
        icon: <LocalShippingRounded />,
        badge: pendingOrderCount,
        group: personal,
      },
      {
        label: t("nav.assignedOrders", "Assigned to Me"),
        to: PATHS.dashboard,
        icon: <DashboardRounded />,
        group: personal,
      },
      {
        label: t("nav.messages", "Messages"),
        to: PATHS.messages,
        icon: <MessageRounded />,
        badge: unreadChatCount,
        group: personal,
      },
      {
        label: t("nav.inventory", "My Stock"),
        to: PATHS.inventory,
        icon: <InventoryRounded />,
        group: personal,
      },
      {
        label: t("nav.availability", "Availability"),
        to: PATHS.availability,
        icon: <DescriptionRounded />,
        group: personal,
      },
    )
  }
  return items
}

/** Browse mode: the directories (shops, orgs, recruiting). */
export function browseDirectoryItems(t: TFunction): NavItem[] {
  return [
    {
      label: t("nav.shops", "Shops"),
      to: MARKET_PATHS.shops,
      icon: <StorefrontRounded />,
    },
    {
      label: t("nav.orgs", "Organizations"),
      to: PATHS.contractors,
      icon: <BusinessRounded />,
      whiteLabelKey: "contractors",
    },
    {
      label: t("nav.recruiting", "Recruiting"),
      to: PATHS.recruiting,
      icon: <PersonAddRounded />,
      whiteLabelKey: "recruiting",
    },
  ]
}

/** Game Data destinations (browse mode); Shopping Lists needs an account. */
export function gameDataNavItems(t: TFunction, signedIn: boolean): NavItem[] {
  const gameData: NavItem[] = [
    {
      label: t("sidebar.gameData.missions", "Missions"),
      to: GAME_DATA_PATHS.missions,
      icon: <DescriptionRounded />,
    },
    {
      label: t("sidebar.gameData.mining", "Mining"),
      to: GAME_DATA_PATHS.mining,
      icon: <InventoryRounded />,
    },
    {
      label: t("sidebar.gameData.blueprints", "Blueprints"),
      to: GAME_DATA_PATHS.blueprints,
      icon: <ScienceRounded />,
    },
    {
      label: t("sidebar.gameData.craftingCalculator", "Crafting Calculator"),
      to: GAME_DATA_PATHS.craftingCalculator,
      icon: <CalculateRounded />,
    },
    {
      label: t("sidebar.gameData.resources", "Resources"),
      to: GAME_DATA_PATHS.resources,
      icon: <InventoryRounded />,
    },
  ]
  if (signedIn) {
    gameData.push({
      label: t("sidebar.gameData.shoppingLists", "Shopping Lists"),
      to: PATHS.shoppingLists,
      icon: <ShoppingCartRounded />,
    })
  }
  return gameData
}

export function wikiNavItems(t: TFunction): NavItem[] {
  return [
    {
      label: t("sidebar.wiki.items", "Items"),
      to: WIKI_PATHS.items,
      icon: <MenuBookRounded />,
    },
    {
      label: t("sidebar.wiki.vehicles", "Ships & Vehicles"),
      to: WIKI_PATHS.ships,
      icon: <RocketLaunchRounded />,
    },
    {
      label: t("sidebar.wiki.commodities", "Commodities"),
      to: WIKI_PATHS.commodities,
      icon: <InventoryRounded />,
    },
    {
      label: t("sidebar.wiki.locations", "Locations"),
      to: WIKI_PATHS.locations,
      icon: <DescriptionRounded />,
    },
    {
      label: t("sidebar.wiki.manufacturers", "Manufacturers"),
      to: WIKI_PATHS.manufacturers,
      icon: <StorefrontRounded />,
    },
    {
      label: t("sidebar.wiki.refinery", "Refinery"),
      to: WIKI_PATHS.refinery,
      icon: <ScienceRounded />,
    },
  ]
}

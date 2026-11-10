import React from "react"
import {
  SearchRounded,
  StorefrontRounded,
  LocalShippingRounded,
  PeopleRounded,
  SettingsRounded,
  PriceChangeRounded,
  DashboardRounded,
  DescriptionRounded,
  DesignServicesRounded,
  ShoppingCartRounded,
  MessageRounded,
  InventoryRounded,
  ScienceRounded,
  MenuBookRounded,
  PersonAddRounded,
  BusinessRounded,
  HelpOutlineRounded,
} from "@mui/icons-material"
import { HELP_PATHS, PATHS, SHOP_PATHS } from "../../routes/paths"

import type { TFunction } from "i18next"
import type { ShopResponse } from "../../features/shops/api/shopsApi"
import { canHandleShopOrders } from "../../features/shops/domain/shopPermissions"
export interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  /** The page a navigation item opens. */
  path?: string
  category: "navigation" | "action" | "content"
  keywords?: string[]
}

/**
 * The palette's navigation destinations (more once signed in), only those
 * `served` on this domain (an org's white-label domain doesn't serve SC
 * Market-wide pages: features/storefront/whiteLabelRoutes.ts).
 */
export function navCommandItems(
  t: TFunction,
  go: (path: string) => void,
  signedIn: boolean,
  shops: ShopResponse[],
  served: (path: string) => boolean = () => true,
): CommandItem[] {
  const goTo = (path: string) => ({ path, action: () => go(path) })
  const items: CommandItem[] = [
    {
      id: "market",
      label: t("appUi.commandPalette.items.market"),
      icon: <SearchRounded />,
      ...goTo("/market"),
      category: "navigation",
      keywords: ["browse", "listings", "buy", "shop"],
    },
    {
      id: "services",
      label: t("appUi.commandPalette.items.services"),
      icon: <DesignServicesRounded />,
      ...goTo("/market/services"),
      category: "navigation",
      keywords: ["hire", "contract"],
    },
    {
      id: "contracts",
      label: t("appUi.commandPalette.items.contracts"),
      icon: <DescriptionRounded />,
      ...goTo("/contracts"),
      category: "navigation",
      keywords: ["jobs", "work"],
    },
    {
      id: "buy-orders",
      label: t("appUi.commandPalette.items.buyOrders"),
      icon: <ShoppingCartRounded />,
      ...goTo("/buyorders"),
      category: "navigation",
      keywords: ["demand", "want"],
    },
    {
      id: "shops",
      label: t("appUi.commandPalette.items.shops"),
      icon: <StorefrontRounded />,
      ...goTo("/shops"),
      category: "navigation",
    },
    {
      id: "orgs",
      label: t("appUi.commandPalette.items.orgs"),
      icon: <BusinessRounded />,
      ...goTo("/contractors"),
      category: "navigation",
      keywords: ["contractor", "org"],
    },
    {
      id: "recruiting",
      label: t("appUi.commandPalette.items.recruiting"),
      icon: <PersonAddRounded />,
      ...goTo("/recruiting"),
      category: "navigation",
    },
    {
      id: "missions",
      label: t("appUi.commandPalette.items.missions"),
      icon: <DescriptionRounded />,
      ...goTo("/missions"),
      category: "navigation",
    },
    {
      id: "blueprints",
      label: t("appUi.commandPalette.items.blueprints"),
      icon: <ScienceRounded />,
      ...goTo("/blueprints"),
      category: "navigation",
      keywords: ["crafting"],
    },
    {
      id: "mining",
      label: t("appUi.commandPalette.items.mining"),
      icon: <InventoryRounded />,
      ...goTo("/mining"),
      category: "navigation",
      keywords: ["ore", "resource"],
    },
    {
      id: "wiki",
      label: t("appUi.commandPalette.items.wiki"),
      icon: <MenuBookRounded />,
      ...goTo("/wiki"),
      category: "navigation",
      keywords: ["items", "ships", "database"],
    },
    {
      id: "resources",
      label: t("appUi.commandPalette.items.resources"),
      icon: <InventoryRounded />,
      ...goTo("/resources"),
      category: "navigation",
    },
    {
      id: "help",
      label: t("appUi.commandPalette.items.help"),
      icon: <HelpOutlineRounded />,
      ...goTo(HELP_PATHS.hub),
      category: "navigation",
      keywords: ["help", "guide", "how", "faq", "about", "support"],
    },
  ]

  if (signedIn) {
    items.push(
      {
        id: "orders",
        label: t("appUi.commandPalette.items.orders"),
        icon: <LocalShippingRounded />,
        ...goTo("/orders"),
        category: "navigation",
      },
      {
        id: "messages",
        label: t("appUi.commandPalette.items.messages"),
        icon: <MessageRounded />,
        ...goTo("/messages"),
        category: "navigation",
        keywords: ["chat", "dm"],
      },
      {
        id: "dashboard",
        label: t("appUi.commandPalette.items.dashboard"),
        icon: <DashboardRounded />,
        ...goTo("/dashboard"),
        category: "navigation",
      },
      {
        id: "inventory",
        label: t("nav.inventory"),
        icon: <InventoryRounded />,
        ...goTo("/inventory"),
        category: "navigation",
      },
      {
        id: "settings",
        label: t("appUi.commandPalette.items.settings"),
        icon: <SettingsRounded />,
        ...goTo("/settings"),
        category: "navigation",
      },
      {
        id: "price-alerts",
        label: t("appUi.commandPalette.items.priceAlerts"),
        description: t("appUi.commandPalette.items.priceAlertsDescription"),
        icon: <PriceChangeRounded />,
        ...goTo(PATHS.priceAlerts),
        category: "navigation",
        keywords: [
          "watchlist",
          "watch price",
          "price alert",
          "notify",
          "target price",
        ],
      },
      {
        id: "my-orgs",
        label: t("appUi.commandPalette.items.myOrgs"),
        icon: <PeopleRounded />,
        ...goTo("/my-orgs"),
        category: "navigation",
      },
    )
    // Only shops whose orders the user handles (canHandleShopOrders).
    for (const shop of shops.filter(canHandleShopOrders)) {
      items.push({
        id: `shop-${shop.slug}`,
        label: t("appUi.commandPalette.items.shopOrders", {
          shop: shop.name,
        }),
        icon: <StorefrontRounded />,
        ...goTo(SHOP_PATHS.orders(shop.slug)),
        category: "navigation",
        keywords: [shop.slug],
      })
    }
  }

  return items.filter((item) => !item.path || served(item.path))
}

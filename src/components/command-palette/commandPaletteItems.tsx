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
export interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category: "navigation" | "action" | "content"
  keywords?: string[]
}

/** The palette's navigation destinations (more once signed in). */
export function navCommandItems(
  t: TFunction,
  go: (path: string) => void,
  signedIn: boolean,
  shops: ShopResponse[],
): CommandItem[] {
  const items: CommandItem[] = [
    {
      id: "market",
      label: t("appUi.commandPalette.items.market"),
      icon: <SearchRounded />,
      action: () => go("/market"),
      category: "navigation",
      keywords: ["browse", "listings", "buy", "shop"],
    },
    {
      id: "services",
      label: t("appUi.commandPalette.items.services"),
      icon: <DesignServicesRounded />,
      action: () => go("/market/services"),
      category: "navigation",
      keywords: ["hire", "contract"],
    },
    {
      id: "contracts",
      label: t("appUi.commandPalette.items.contracts"),
      icon: <DescriptionRounded />,
      action: () => go("/contracts"),
      category: "navigation",
      keywords: ["jobs", "work"],
    },
    {
      id: "buy-orders",
      label: t("appUi.commandPalette.items.buyOrders"),
      icon: <ShoppingCartRounded />,
      action: () => go("/buyorders"),
      category: "navigation",
      keywords: ["demand", "want"],
    },
    {
      id: "shops",
      label: t("appUi.commandPalette.items.shops"),
      icon: <StorefrontRounded />,
      action: () => go("/shops"),
      category: "navigation",
    },
    {
      id: "orgs",
      label: t("appUi.commandPalette.items.orgs"),
      icon: <BusinessRounded />,
      action: () => go("/contractors"),
      category: "navigation",
      keywords: ["contractor", "org"],
    },
    {
      id: "recruiting",
      label: t("appUi.commandPalette.items.recruiting"),
      icon: <PersonAddRounded />,
      action: () => go("/recruiting"),
      category: "navigation",
    },
    {
      id: "missions",
      label: t("appUi.commandPalette.items.missions"),
      icon: <DescriptionRounded />,
      action: () => go("/missions"),
      category: "navigation",
    },
    {
      id: "blueprints",
      label: t("appUi.commandPalette.items.blueprints"),
      icon: <ScienceRounded />,
      action: () => go("/blueprints"),
      category: "navigation",
      keywords: ["crafting"],
    },
    {
      id: "mining",
      label: t("appUi.commandPalette.items.mining"),
      icon: <InventoryRounded />,
      action: () => go("/mining"),
      category: "navigation",
      keywords: ["ore", "resource"],
    },
    {
      id: "wiki",
      label: t("appUi.commandPalette.items.wiki"),
      icon: <MenuBookRounded />,
      action: () => go("/wiki"),
      category: "navigation",
      keywords: ["items", "ships", "database"],
    },
    {
      id: "resources",
      label: t("appUi.commandPalette.items.resources"),
      icon: <InventoryRounded />,
      action: () => go("/resources"),
      category: "navigation",
    },
    {
      id: "help",
      label: t("appUi.commandPalette.items.help"),
      icon: <HelpOutlineRounded />,
      action: () => go(HELP_PATHS.hub),
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
        action: () => go("/orders"),
        category: "navigation",
      },
      {
        id: "messages",
        label: t("appUi.commandPalette.items.messages"),
        icon: <MessageRounded />,
        action: () => go("/messages"),
        category: "navigation",
        keywords: ["chat", "dm"],
      },
      {
        id: "dashboard",
        label: t("appUi.commandPalette.items.dashboard"),
        icon: <DashboardRounded />,
        action: () => go("/dashboard"),
        category: "navigation",
      },
      {
        id: "inventory",
        label: t("nav.inventory"),
        icon: <InventoryRounded />,
        action: () => go("/inventory"),
        category: "navigation",
      },
      {
        id: "settings",
        label: t("appUi.commandPalette.items.settings"),
        icon: <SettingsRounded />,
        action: () => go("/settings"),
        category: "navigation",
      },
      {
        id: "price-alerts",
        label: t("appUi.commandPalette.items.priceAlerts"),
        description: t("appUi.commandPalette.items.priceAlertsDescription"),
        icon: <PriceChangeRounded />,
        action: () => go(PATHS.priceAlerts),
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
        action: () => go("/my-orgs"),
        category: "navigation",
      },
    )
    for (const shop of shops) {
      items.push({
        id: `shop-${shop.slug}`,
        label: t("appUi.commandPalette.items.shopOrders", {
          shop: shop.name,
        }),
        icon: <StorefrontRounded />,
        action: () => go(SHOP_PATHS.orders(shop.slug)),
        category: "navigation",
        keywords: [shop.slug],
      })
    }
  }

  return items
}

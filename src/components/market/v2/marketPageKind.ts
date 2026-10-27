import type { TFunction } from "i18next"

/** The three pages MarketPageV2 renders. */
export type MarketPageKind = "items" | "buyorders" | "services"

export function marketPageKind(pathname: string): MarketPageKind {
  // "/services" only redirects to /market/services; its skeleton is the same.
  if (pathname.startsWith("/market/services") || pathname === "/services") {
    return "services"
  }
  if (pathname.startsWith("/buyorders")) return "buyorders"
  return "items"
}

/** Header title; same labels as the sidebar entries for these pages (SidebarV2). */
export function marketPageTitle(kind: MarketPageKind, t: TFunction): string {
  return kind === "services"
    ? t("nav.services", "Services")
    : kind === "buyorders"
      ? t("nav.buyOrders", "Buy Orders")
      : t("nav.market", "Market")
}

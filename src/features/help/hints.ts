import type { GuideLink } from "./guideLinks"

/**
 * Every first-use hint card (FirstUseHint) in the app: its dismissal key and
 * the guide its "Learn more" opens.
 *
 * `key` is what gets stored once the hint is dismissed (on the account via
 * PUT /api/v2/hints/dismissed/{key} when signed in, in localStorage when
 * signed out), so never reuse or rename one: a renamed key shows the hint
 * again to everyone who dismissed it. Keys are lower-case letters, digits,
 * dots and dashes (the backend rejects anything else).
 */
export const HINTS = {
  /** Shop › Stock: what a stock lot is, Listed vs Personal. */
  stockLots: { key: "stock.lots", guide: "stockLots" },
  /** Shop › Listings: the Quantity column is the listing's listed lots. */
  listingQuantity: { key: "listings.quantity", guide: "stockLots" },
  /** My Stock: your personal lots across shops. */
  myStock: { key: "my-stock.lots", guide: "myStock" },
  /** Org › Roles and Members: which permissions run an org shop. */
  shopPermissions: {
    key: "roles.shop-permissions",
    guide: "orgShopPermissions",
  },
  /** Discord Integration: order threads vs alerts. */
  discordThreadsAlerts: {
    key: "discord.threads-alerts",
    guide: "connectDiscordBot",
  },
  /** Shop › Listings › Import from UEX. */
  uexImport: { key: "uex.import", guide: "importFromUex" },
  /** Org › Storefront: free storefront, branding and the subdomain. */
  whiteLabel: { key: "storefront.white-label", guide: "orgWhiteLabel" },
  /** Seller's shop pages: add the SC Market app to your own Discord account. */
  discordUserInstall: { key: "discord.user-install", guide: "discordUserInstall" },
  /** Settings › Price Alerts: what a watch does, pausing. */
  priceAlerts: { key: "price-alerts.watchlist", guide: "priceAlerts" },
  /** Quick List dialog: list an item in seconds, split stock later. */
  quickList: { key: "quick-list.intro", guide: "quickList" },
} as const satisfies Record<string, { key: string; guide: GuideLink }>

export type HintId = keyof typeof HINTS

/** The backend's rule for a hint key (dismissed-hints.service.ts). */
export const HINT_KEY_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/

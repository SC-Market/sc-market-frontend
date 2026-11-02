import { BACKEND_URL } from "../../util/constants"
import { PATHS } from "../../routes/paths"

/**
 * "Add SC Market to Discord" links. Every one goes through the
 * /discord/install route (DiscordInstallPage), which counts the click per
 * install type and surface (POST /discord/install-clicks, shown on Admin ›
 * Market › Seller reachability) and then starts the backend's install flow
 * (GET /auth/discord-install), which signs a state and opens Discord. When
 * Discord sends the browser back, the backend links what it may (the user's
 * Discord account, or the server to a shop or org) and returns to
 * /discord/install?result=… or to the shop's or org's Discord settings.
 */
export type DiscordInstallType = "user" | "server"

/** Where a link is. Must match the backend's INSTALL_SOURCES (services/discord/install-clicks.ts). */
export const DISCORD_INSTALL_SOURCES = [
  "settings_notifications",
  "settings_discord",
  "org_discord",
  "shop_dashboard",
  "shop_settings",
  "shop_hint",
  "guide",
  "faq",
  "footer",
  "other",
] as const
export type DiscordInstallSource = (typeof DISCORD_INSTALL_SOURCES)[number]

/** What a server install links the server to: a shop (by shop id) or an org (by Spectrum ID). */
export type DiscordInstallOwner = { shop: string } | { org: string }

export function isInstallType(v: unknown): v is DiscordInstallType {
  return v === "user" || v === "server"
}

export function installSource(v: unknown): DiscordInstallSource {
  return (DISCORD_INSTALL_SOURCES as readonly unknown[]).includes(v)
    ? (v as DiscordInstallSource)
    : "other"
}

/** The shop or org a server install link names, from its query string. */
export function installOwner(
  params: URLSearchParams,
): DiscordInstallOwner | undefined {
  const shop = params.get("shop")
  const org = params.get("org")
  if (shop && !org) return { shop }
  if (org && !shop) return { org }
  return undefined
}

function installParams(
  type: DiscordInstallType,
  src: DiscordInstallSource,
  owner?: DiscordInstallOwner,
): string {
  const params = new URLSearchParams({ type, src })
  if (type === "server" && owner) {
    if ("shop" in owner) params.set("shop", owner.shop)
    else params.set("org", owner.org)
  }
  return params.toString()
}

/** The site path of an install link: /discord/install?type=…&src=…[&shop=…|&org=…] */
export function discordInstallPath(
  type: DiscordInstallType,
  src: DiscordInstallSource,
  owner?: DiscordInstallOwner,
): string {
  return `${PATHS.discordInstall}?${installParams(type, src, owner)}`
}

/** The backend route that starts the install (it then opens Discord). */
export function discordInstallStartUrl(
  type: DiscordInstallType,
  src: DiscordInstallSource,
  owner?: DiscordInstallOwner,
): string {
  return `${BACKEND_URL}/auth/discord-install?${installParams(type, src, owner)}`
}

/** How an install ended (the backend's InstallResult, services/discord/install-oauth.ts). */
export const DISCORD_INSTALL_RESULTS = [
  "user_linked",
  "user_installed",
  "user_sign_in",
  "user_linked_elsewhere",
  "user_other_discord",
  "server_added",
  "server_sign_in",
  "server_forbidden",
  "cancelled",
  "failed",
] as const
export type DiscordInstallResult = (typeof DISCORD_INSTALL_RESULTS)[number]

export function installResult(v: unknown): DiscordInstallResult | null {
  return (DISCORD_INSTALL_RESULTS as readonly unknown[]).includes(v)
    ? (v as DiscordInstallResult)
    : null
}

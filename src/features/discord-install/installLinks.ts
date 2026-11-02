import { DISCORD_AUTHORIZE_URLS } from "../../util/constants"
import { PATHS } from "../../routes/paths"

/**
 * "Add SC Market to Discord" links. Every one goes through the
 * /discord/install route (DiscordInstallPage), which counts the click per
 * install type and surface (POST /discord/install-clicks, shown on Admin ›
 * Market › Seller reachability) and then opens Discord.
 */
export type DiscordInstallType = keyof typeof DISCORD_AUTHORIZE_URLS

/** Where a link is. Must match the backend's INSTALL_SOURCES (services/discord/install-clicks.ts). */
export const DISCORD_INSTALL_SOURCES = [
  "settings_notifications",
  "settings_discord",
  "org_discord",
  "shop_dashboard",
  "shop_hint",
  "guide",
  "faq",
  "footer",
  "other",
] as const
export type DiscordInstallSource = (typeof DISCORD_INSTALL_SOURCES)[number]

export function isInstallType(v: unknown): v is DiscordInstallType {
  return v === "user" || v === "server"
}

export function installSource(v: unknown): DiscordInstallSource {
  return (DISCORD_INSTALL_SOURCES as readonly unknown[]).includes(v)
    ? (v as DiscordInstallSource)
    : "other"
}

/** The site path of an install link: /discord/install?type=…&src=… */
export function discordInstallPath(
  type: DiscordInstallType,
  src: DiscordInstallSource,
): string {
  return `${PATHS.discordInstall}?type=${type}&src=${src}`
}

/** Discord's own authorize URL for an install type. */
export function discordAuthorizeUrl(type: DiscordInstallType): string {
  return DISCORD_AUTHORIZE_URLS[type]
}

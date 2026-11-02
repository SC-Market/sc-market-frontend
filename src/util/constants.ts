import SCMarketLogo from "../assets/scmarket-logo.png"
import { DEFAULT_FRONTEND_URL, FALLBACK_IMAGE_URL } from "../seo/constants"

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost"
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost"
export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || DEFAULT_FRONTEND_URL
export const VITE_VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ""

/**
 * Feature flag for Citizen iD integration
 * Enabled in development, disabled in production
 */
export const isCitizenIdEnabled = true

export const defaultAvatar = SCMarketLogo

export { FALLBACK_IMAGE_URL }

export const DISCORD_INVITE = "https://discord.com/invite/N4Gy8py8J4"

/** The SC Market Discord application. */
export const DISCORD_CLIENT_ID = "868709691469987860"

/**
 * Discord's authorize URLs. Link to them only through the /discord/install
 * route (features/discord-install), which counts the click first.
 * server: add the bot to a server (guild install).
 * user: add the app to your own Discord account (user install), so the bot
 * can reach you without a shared server.
 */
export const DISCORD_AUTHORIZE_URLS = {
  server: `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=361314126849&integration_type=0&scope=bot`,
  user: `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&integration_type=1&scope=applications.commands`,
} as const

export const PAYMENT_TYPES = [
  { value: "one-time", translationKey: "paymentTypes.one_time" },
  { value: "hourly", translationKey: "paymentTypes.hourly" },
  { value: "daily", translationKey: "paymentTypes.daily" },
  { value: "unit", translationKey: "paymentTypes.unit" },
  { value: "box", translationKey: "paymentTypes.box" },
  { value: "scu", translationKey: "paymentTypes.scu" },
  { value: "cscu", translationKey: "paymentTypes.cscu" },
  { value: "mscu", translationKey: "paymentTypes.mscu" },
] as const

// Map for faster payment type lookups
export const PAYMENT_TYPE_MAP: Map<string, string> = new Map(
  PAYMENT_TYPES.map((pt) => [pt.value, pt.translationKey]),
)

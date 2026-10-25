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

/** OAuth2 URL that adds the SC Market bot to a Discord server. */
export const DISCORD_BOT_INVITE =
  "https://discord.com/oauth2/authorize?client_id=868709691469987860&permissions=361314126849&integration_type=0&scope=bot"

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

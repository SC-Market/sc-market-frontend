import SCMarketLogo from "../assets/scmarket-logo.png"

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost"
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost"

/**
 * Feature flag for Citizen iD integration
 * Enabled in development, disabled in production
 */
export const isCitizenIdEnabled = import.meta.env.DEV

export const defaultAvatar = SCMarketLogo

export const FALLBACK_IMAGE_URL =
  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"

export const DISCORD_INVITE = "https://discord.com/invite/N4Gy8py8J4"

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
export const PAYMENT_TYPE_MAP = new Map(
  PAYMENT_TYPES.map((pt) => [pt.value, pt.translationKey]),
)

/**
 * Branded storefront enquiries: the client-side checks, mirroring the
 * backend's services/storefront/enquiries.ts (the backend has the last
 * word; these only catch typos before sending).
 */
import type { EnquiryStatus } from "../../store/api/v2/market"

export const ENQUIRY_MESSAGE_MAX = 1000

/** Same list as the backend's RESERVED_SUBDOMAINS. */
const RESERVED = new Set([
  "www", "api", "cdn", "app", "admin", "staff", "support", "help", "docs", "status",
  "mail", "email", "smtp", "auth", "login", "account", "accounts", "id", "sso",
  "static", "assets", "media", "img", "images", "files", "uploads",
  "dev", "staging", "beta", "test", "preview", "demo", "sandbox",
  "ws", "socket", "embed", "blog", "news", "wiki", "market", "shop", "shops",
  "store", "storefront", "storefronts", "org", "orgs", "yourorg", "scmarket",
  "sc-market", "discord", "bot", "billing", "pay", "payments", "security",
])

/** What's wrong with a subdomain (one DNS label of sc-market.space), or null. */
export function subdomainProblem(input: string): "length" | "chars" | "reserved" | null {
  const s = input.trim().toLowerCase().replace(/\.sc-market\.space\.?$/, "")
  if (s.length < 2 || s.length > 63) return "length"
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(s) || s.includes("--")) return "chars"
  if (RESERVED.has(s)) return "reserved"
  return null
}

/** The org's spectrum ID or the shop's slug as a subdomain ("" when it can't be one, e.g. "~" orgs). */
export function suggestedSubdomain(handle: string): string {
  const s = handle.trim().toLowerCase().replace(/_/g, "-")
  return subdomainProblem(s) ? "" : s
}

export function isOpenEnquiry(status: EnquiryStatus): boolean {
  return status === "open" || status === "in_progress"
}

export function enquiryStatusColor(status: EnquiryStatus): "info" | "warning" | "success" | "default" {
  switch (status) {
    case "open":
      return "info"
    case "in_progress":
      return "warning"
    case "completed":
      return "success"
    case "declined":
      return "default"
  }
}

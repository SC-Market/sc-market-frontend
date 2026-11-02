/**
 * White-label pages rendered by the SSR Function (the `host` variant,
 * docs/ssr-worker.md): the org's domain answer and theme the server
 * rendered with, on both sides of hydration.
 *
 * - Server: the Function resolves the host (`GET /api/domain/:hostname`, and
 *   the org's theme) before rendering and passes it in the request context;
 *   HookProvider and the custom-domain context read it from there instead
 *   of localStorage (`whiteLabelOrgTheme`, `customDomainFromRequest`).
 * - Browser: the same answer ships with the page's data (PrerenderedData
 *   `whiteLabel`); entry.client seeds the domain and theme caches with it
 *   (`seedRenderedWhiteLabel`) before anything reads them, so the first
 *   render has the server's branding and hydrates.
 */
import type { Theme } from "@mui/material"
import type { SsrWhiteLabel } from "./protocol"
import {
  cacheDomainOrg,
  type CustomDomain,
} from "../hooks/contractor/CustomDomain"
import {
  buildOrgTheme,
  cacheOrgTheme,
  clearCachedOrgTheme,
} from "../hooks/styles/themeCache"

/**
 * Seed the browser's white-label caches with the server's answer, when the
 * page was rendered for this host. Returns whether it did.
 */
export function seedRenderedWhiteLabel(
  whiteLabel: SsrWhiteLabel | undefined,
  hostname: string = window.location.hostname,
): boolean {
  if (!whiteLabel || whiteLabel.hostname !== hostname.toLowerCase()) {
    return false
  }
  cacheDomainOrg(whiteLabel.domain)
  const { spectrum_id } = whiteLabel.domain
  if (whiteLabel.theme) {
    cacheOrgTheme(
      spectrum_id,
      whiteLabel.theme.theme_data as Parameters<typeof cacheOrgTheme>[1],
      whiteLabel.theme.favicon_url,
      whiteLabel.theme.updated_at,
    )
  } else {
    // Rendered with the site theme: an older cached org theme would differ.
    try {
      clearCachedOrgTheme(spectrum_id)
    } catch {
      // localStorage unavailable
    }
  }
  return true
}

/** The custom-domain context of a server render (CustomDomain.ts). */
export function customDomainFromRequest(
  whiteLabel: SsrWhiteLabel | null,
): CustomDomain {
  return whiteLabel
    ? { isCustomDomain: true, customOrg: whiteLabel.domain.spectrum_id }
    : { isCustomDomain: false, customOrg: undefined }
}

/**
 * The org theme a server render uses (the browser's getCachedOrgTheme reads
 * the seeded cache instead): null without one, or when MUI rejects it (the
 * browser drops such a cache entry and uses the site theme too).
 */
export function whiteLabelOrgTheme(
  whiteLabel: SsrWhiteLabel | null,
  mode: "light" | "dark",
): Theme | null {
  if (!whiteLabel?.theme) return null
  try {
    return buildOrgTheme(
      whiteLabel.theme.theme_data as Parameters<typeof buildOrgTheme>[0],
      mode,
    )
  } catch {
    return null
  }
}

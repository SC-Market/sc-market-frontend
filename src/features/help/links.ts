/**
 * Where Help & Guides links point. White-label org domains link out to the
 * official site instead of rendering the guides themselves (owner decision,
 * drafts/help-guides-design.md §16). Tiny on purpose: the sidebar and footer
 * import it eagerly, so it must not pull in any content.
 */
import { DEFAULT_FRONTEND_URL } from "../../seo/constants"
import { isMainSiteHostname } from "../../util/mainSiteHost"
import { isServerRenderWhiteLabel } from "../../util/renderHost"

/**
 * True on sc-market.space (and local dev); false on org custom domains,
 * including a server render for one (util/renderHost.ts).
 */
export function isOfficialSite(): boolean {
  if (typeof window === "undefined") return !isServerRenderWhiteLabel()
  return isMainSiteHostname(window.location.hostname)
}

/** The same help path on the official site, e.g. https://sc-market.space/guides. */
export function officialHelpUrl(path: string): string {
  return `${DEFAULT_FRONTEND_URL}${path}`
}

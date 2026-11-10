/**
 * The SSR switches that the SSR Function and the bridge's per-host files
 * (robots.txt, sitemap.xml on a white-label host: src/bridge/whiteLabelSeo.ts)
 * both read. Framework-free and pure (tested).
 */
import { isMainSiteHostname } from "../util/mainSiteHost"
import { ALL_SSR_VARIANTS, type SsrVariant } from "./protocol"

/** The env vars read here (Pages env, docs/ssr-worker.md "Switches"). */
export interface SsrSwitchEnv {
  SSR_ENABLED?: string
  SSR_VARIANTS?: string
}

/** Where nobody depends on SSR: localhost and preview deployments. */
function isPreviewHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".sc-market-frontend.pages.dev")
  )
}

export function ssrSwitchedOn(env: SsrSwitchEnv, hostname: string): boolean {
  const flag = env.SSR_ENABLED?.trim().toLowerCase()
  if (flag === "false" || flag === "0" || flag === "off") return false
  if (flag === "true" || flag === "1" || flag === "on") return true
  // Unset: only where nobody depends on it (production needs "true").
  return isPreviewHostname(hostname)
}

/** The page variants this request may get (env SSR_VARIANTS). */
export function ssrVariants(
  env: SsrSwitchEnv,
  hostname: string,
): Set<SsrVariant> {
  const list = env.SSR_VARIANTS?.trim().toLowerCase()
  if (list === undefined || list === "") {
    // Unset: only where nobody depends on it, like SSR_ENABLED.
    return new Set(isPreviewHostname(hostname) ? ALL_SSR_VARIANTS : [])
  }
  const named = list.split(",").map((v) => v.trim())
  return new Set(ALL_SSR_VARIANTS.filter((variant) => named.includes(variant)))
}

/** A hostname we may look up as a white-label domain (no ports, IPs, junk). */
const HOSTNAME =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/

export function isWhiteLabelCandidate(hostname: string): boolean {
  return !isMainSiteHostname(hostname) && HOSTNAME.test(hostname)
}

/**
 * Whether this request's host is served as an org's white-label domain by
 * the edge (the `host` variant: org-branded renders, a 302 to sc-market.space
 * for the pages it doesn't serve, its own robots.txt and sitemap).
 */
export function whiteLabelHostServed(
  env: SsrSwitchEnv,
  hostname: string,
): boolean {
  const host = hostname.toLowerCase()
  return (
    isWhiteLabelCandidate(host) &&
    ssrSwitchedOn(env, host) &&
    ssrVariants(env, host).has("host")
  )
}

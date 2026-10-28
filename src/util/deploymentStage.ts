/**
 * Which deployment this page is served from. Pure, so it is unit-tested.
 *
 * - "development": the Vite dev server, or a local build (`vite preview` on
 *   localhost:4174, a LAN IP, ...). Production is never served from these.
 * - "preview": a Cloudflare Pages branch preview (*.pages.dev).
 * - "production": sc-market.space and orgs' white-label custom domains.
 */
export type DeploymentStage = "development" | "preview" | "production"

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/

function isLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "::1" ||
    host === "[::1]" ||
    IPV4.test(host)
  )
}

export function deploymentStage(
  hostname: string,
  isDevBuild: boolean,
): DeploymentStage {
  if (isDevBuild || isLocalHostname(hostname)) return "development"
  if (hostname.toLowerCase().endsWith(".pages.dev")) return "preview"
  return "production"
}

/** The stage of the current page. */
export function currentDeploymentStage(): DeploymentStage {
  return deploymentStage(window.location.hostname, import.meta.env.DEV)
}

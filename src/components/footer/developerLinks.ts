/**
 * The footer's "Developers" group: the public API, its guide and spec, the
 * public price feed and the SDKs (GitHub, and the SC Market and SC Orgs
 * packages on npm). One list for the SPA footer (Footer.tsx,
 * localized) and the edge bridge's HTML (src/bridge/render.ts, English
 * labels), so crawlers without JS see the same links.
 *
 * Pure: no React or browser imports.
 */
import { GUIDE_LINKS } from "../../features/help/guideLinks"

/** public/developers.html: a static page, not an SPA route (link it with a plain href). */
export const DEVELOPERS_PATH = "/developers"
export const PUBLIC_API_SPEC_URL =
  "https://api.sc-market.space/api/public/v1/openapi.json"
export const PRICE_FEED_INDEX_URL =
  "https://api.sc-market.space/api/public/prices/index.json"
export const SDK_REPO_URL = "https://github.com/SC-Market/sc-market-sdk"
export const SDK_NPM_URL = "https://www.npmjs.com/package/@sc-market/sdk"
export const ORGS_SDK_NPM_URL = "https://www.npmjs.com/package/@sc-orgs/sdk"

export interface DeveloperLink {
  href: string
  /** english.json key */
  key: string
  /** English label (the bridge's text; equal to the en locale, a test checks). */
  label: string
}

export const DEVELOPER_LINKS: readonly DeveloperLink[] = [
  {
    href: DEVELOPERS_PATH,
    key: "footer.developersOverview",
    label: "API overview",
  },
  { href: GUIDE_LINKS.apiTokens, key: "footer.apiGuide", label: "API guide" },
  {
    href: PUBLIC_API_SPEC_URL,
    key: "footer.openApiSpec",
    label: "OpenAPI spec",
  },
  {
    href: PRICE_FEED_INDEX_URL,
    key: "footer.priceFeed",
    label: "Price data feed",
  },
  { href: SDK_REPO_URL, key: "footer.sdk", label: "SDK on GitHub" },
  { href: SDK_NPM_URL, key: "footer.sdkNpm", label: "SDK on npm" },
  {
    href: ORGS_SDK_NPM_URL,
    key: "footer.orgsSdkNpm",
    label: "SC Orgs SDK on npm",
  },
]

/** The group's heading key and English text. */
export const DEVELOPERS_HEADING = {
  key: "footer.developers",
  label: "Developers",
} as const

/** The off-site developer links: the only absolute URLs bridge link lists may carry besides SC Orgs. */
export const DEVELOPER_EXTERNAL_HREFS: ReadonlySet<string> = new Set(
  DEVELOPER_LINKS.map((l) => l.href).filter((h) => h.startsWith("https://")),
)

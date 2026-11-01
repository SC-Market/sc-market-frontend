import { AdConfig } from "./types"
import ionImage from "../../assets/ion.webp"
import infernoImage from "../../assets/inferno.webp"
import perseusImage from "../../assets/perseus.webp"

/** SC Orgs links carry where the visit came from. */
function scOrgsLink(path: string, campaign: string): string {
  return `https://sc-orgs.space${path}?utm_source=sc-market&utm_medium=in-universe-ad&utm_campaign=${campaign}`
}

/**
 * The in-universe ads that appear between market listings. None of them pay:
 * the ship posters link to RSI's own pages, the SC Orgs posters to SC
 * Market's sister site. The ship posters keep most of the slots (weight 2
 * each against 1 for each SC Orgs poster: SC Orgs gets a quarter).
 *
 * To add an ad: add an entry here. An "image" ad's picture should match the
 * listing card (300px tall, portrait); a "poster" ad needs its copy under
 * `copyKey` in every locale.
 */
export const MARKET_ADS: AdConfig[] = [
  {
    kind: "image",
    id: "ion",
    title: "Ion",
    imageUrl: ionImage,
    linkUrl:
      "https://robertsspaceindustries.com/en/comm-link/transmission/17379-Crusader-Ares",
    description: "Crusader Industries Ares Series",
    weight: 2,
  },
  {
    kind: "image",
    id: "inferno",
    title: "Inferno",
    imageUrl: infernoImage,
    linkUrl:
      "https://robertsspaceindustries.com/en/comm-link/transmission/17379-Crusader-Ares",
    description: "Crusader Industries Ares Series",
    weight: 2,
  },
  {
    kind: "image",
    id: "perseus",
    title: "Perseus",
    imageUrl: perseusImage,
    linkUrl:
      "https://robertsspaceindustries.com/en/comm-link/transmission/20738-RSI-Perseus",
    description: "RSI Perseus",
    weight: 2,
  },
  {
    kind: "poster",
    id: "sc-orgs-finder",
    copyKey: "ads.scOrgs.finder",
    accent: "#4fd1c5",
    linkUrl: scOrgsLink("/communities", "org-finder"),
    weight: 1,
  },
  {
    kind: "poster",
    id: "sc-orgs-ops-demo",
    copyKey: "ads.scOrgs.demo",
    accent: "#f6ad55",
    linkUrl: scOrgsLink("/demo", "ops-demo"),
    weight: 1,
  },
]

/** Listings between two ads. */
export const AD_FREQUENCY = 24
/** Index of the first ad in a page of listings. */
export const AD_FIRST_POSITION = 12
/** Fewer listings than this get no ads. */
export const AD_MIN_LISTINGS = 10

/**
 * The ads in rotation order: each ad appears `weight` times per cycle, spread
 * out rather than bunched (smooth weighted round robin), so neighbouring ad
 * slots rarely repeat an ad.
 */
export function buildAdRotation(ads: AdConfig[]): AdConfig[] {
  const total = ads.reduce((sum, ad) => sum + ad.weight, 0)
  const current = ads.map(() => 0)
  const rotation: AdConfig[] = []
  for (let n = 0; n < total; n++) {
    let best = 0
    ads.forEach((ad, i) => {
      current[i] += ad.weight
      if (current[i] > current[best]) best = i
    })
    current[best] -= total
    rotation.push(ads[best])
  }
  return rotation
}

const MARKET_AD_ROTATION = buildAdRotation(MARKET_ADS)

/** A small stable string hash (FNV-1a). */
function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export type WithAds<T> = T | { _isAd: true; ad: AdConfig }

/**
 * Splices ads into a page of listings. Where the rotation starts is derived
 * from the page's first listing, so different pages and searches open on
 * different ads, while the same results always get the same ads (no
 * Math.random: server and client render the same grid).
 */
export function insertAds<T>(
  listings: T[],
  keyOf: (listing: T) => string,
  rotation: AdConfig[] = MARKET_AD_ROTATION,
): WithAds<T>[] {
  if (listings.length < AD_MIN_LISTINGS || rotation.length === 0)
    return listings
  const start = hashString(keyOf(listings[0])) % rotation.length
  const result: WithAds<T>[] = [...listings]
  let slot = 0
  for (let i = AD_FIRST_POSITION; i < result.length; i += AD_FREQUENCY + 1) {
    result.splice(i, 0, {
      _isAd: true,
      ad: rotation[(start + slot) % rotation.length],
    })
    slot++
  }
  return result
}

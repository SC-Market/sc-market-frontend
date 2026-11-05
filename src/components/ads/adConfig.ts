import {
  green,
  indigo,
  lightBlue,
  orange,
  pink,
  red,
  teal,
  yellow,
} from "@mui/material/colors"
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
 * Market's sister site (`sisterSite`), one per SC Orgs feature, each with
 * its own utm campaign. Every page that shows ads shows exactly one SC Orgs
 * poster; the ship posters fill the other slots. `weight` is the share
 * within each group (see insertAds). SC Orgs posters only advertise what is
 * live today, and link to a page anyone can open without signing in.
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
    accent: teal[300],
    linkUrl: scOrgsLink("/communities", "org-finder"),
    weight: 1,
    sisterSite: true,
  },
  {
    kind: "poster",
    id: "sc-orgs-ops-demo",
    copyKey: "ads.scOrgs.demo",
    accent: orange[300],
    linkUrl: scOrgsLink("/demo", "ops-demo"),
    weight: 1,
    sisterSite: true,
  },
  // Players' Looking for Org listings, browsable by anyone.
  {
    kind: "poster",
    id: "sc-orgs-lfo",
    copyKey: "ads.scOrgs.lfo",
    accent: pink[200],
    linkUrl: scOrgsLink("/lfo", "looking-for-org"),
    weight: 1,
    sisterSite: true,
  },
  // The public events directory.
  {
    kind: "poster",
    id: "sc-orgs-events",
    copyKey: "ads.scOrgs.events",
    accent: green[300],
    linkUrl: scOrgsLink("/events", "events"),
    weight: 1,
    sisterSite: true,
  },
  // The Discord bot: its public guide (/connect-discord needs a sign-in).
  {
    kind: "poster",
    id: "sc-orgs-discord",
    copyKey: "ads.scOrgs.discord",
    accent: indigo[200],
    linkUrl: scOrgsLink("/guides/connect-discord-server", "discord-bot"),
    weight: 1,
    sisterSite: true,
  },
  // Org operations modules that orgs have today, shown in the public demo.
  {
    kind: "poster",
    id: "sc-orgs-fleet",
    copyKey: "ads.scOrgs.fleet",
    accent: lightBlue[300],
    linkUrl: scOrgsLink("/demo/fleet", "fleet-demo"),
    weight: 1,
    sisterSite: true,
  },
  {
    kind: "poster",
    id: "sc-orgs-treasury",
    copyKey: "ads.scOrgs.treasury",
    accent: yellow[300],
    linkUrl: scOrgsLink("/demo/treasury", "treasury-demo"),
    weight: 1,
    sisterSite: true,
  },
  {
    kind: "poster",
    id: "sc-orgs-dispatch",
    copyKey: "ads.scOrgs.dispatch",
    accent: red[300],
    linkUrl: scOrgsLink("/demo/dispatch", "dispatch-demo"),
    weight: 1,
    sisterSite: true,
  },
]

/** Listings between two ads. */
export const AD_FREQUENCY = 24
/**
 * Index of the first ad in a page of listings. Below the market's default
 * page size (12): at 12 the first slot was past the end of a default page,
 * so no ad ever showed.
 */
export const AD_FIRST_POSITION = 8
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

/** Where the ads go in a page of `count` listings (indexes in the result). */
function adPositions(count: number): number[] {
  const positions: number[] = []
  for (
    let i = AD_FIRST_POSITION;
    i < count + positions.length;
    i += AD_FREQUENCY + 1
  ) {
    positions.push(i)
  }
  return positions
}

/**
 * Splices ads into a page of listings. A page that gets any ads gets exactly
 * one sister-site (SC Orgs) ad: which slot it takes and which poster it is
 * both come from a hash of the page's first listing. The other slots run
 * through the remaining ads' rotation, starting at a point from the same
 * hash, so neighbouring slots don't repeat an ad. A page with one slot shows
 * just the SC Orgs ad. Different pages and searches get different ads, the
 * same results always the same ones (no Math.random: server and client
 * render the same grid).
 *
 * Call it once per page of results: each call places one SC Orgs ad.
 */
export function insertAds<T>(
  listings: T[],
  keyOf: (listing: T) => string,
  ads: AdConfig[] = MARKET_ADS,
): WithAds<T>[] {
  if (listings.length < AD_MIN_LISTINGS || ads.length === 0) return listings
  const sisterRotation = buildAdRotation(ads.filter((ad) => ad.sisterSite))
  const otherRotation = buildAdRotation(ads.filter((ad) => !ad.sisterSite))
  const positions = adPositions(listings.length)
  const hash = hashString(keyOf(listings[0]))
  // A second hash for the poster choice, so it doesn't track the slot choice.
  const posterHash = hashString(`sister:${keyOf(listings[0])}`)
  const sisterSlot = sisterRotation.length > 0 ? hash % positions.length : -1
  const otherStart = otherRotation.length > 0 ? hash % otherRotation.length : 0

  const result: WithAds<T>[] = [...listings]
  let other = 0
  let skipped = 0
  positions.forEach((position, slot) => {
    let ad: AdConfig
    if (slot === sisterSlot) {
      ad = sisterRotation[posterHash % sisterRotation.length]
    } else if (otherRotation.length > 0) {
      ad = otherRotation[(otherStart + other++) % otherRotation.length]
    } else {
      // No other ads: the slot stays a listing.
      skipped++
      return
    }
    result.splice(position - skipped, 0, { _isAd: true, ad })
  })
  return result
}

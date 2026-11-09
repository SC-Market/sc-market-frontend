/**
 * An in-universe market ad. Two kinds of creative:
 * - "image": a poster image with its copy baked in (the RSI/Crusader ships).
 * - "poster": drawn in CSS with translated copy (SC Orgs), so it reads in
 *   every locale. `copyKey` is the i18n prefix: `${copyKey}.kicker`,
 *   `.title`, `.tagline`, `.cta`.
 *
 * `sisterSite` marks an ad for SC Market's own sister site (SC Orgs). Every
 * page that shows ads shows exactly one of them; the other slots go to the
 * remaining ads (see insertAds).
 *
 * `weight` is the ad's share within its group: among the sister-site ads for
 * the one sister slot, among the others for the rest (see buildAdRotation).
 */
interface AdBase {
  /** Unique identifier for the ad */
  id: string
  /** URL to navigate to when the ad is clicked */
  linkUrl: string
  /** Relative share of ad slots, within its group (sister site or not) */
  weight: number
  /** An ad for SC Market's sister site: exactly one per page of ads */
  sisterSite?: boolean
}

export interface ImageAdConfig extends AdBase {
  kind: "image"
  /** Title, for the image's alt text */
  title: string
  /** URL of the ad image */
  imageUrl: string
  description?: string
  /** The image at twice the card's size, for high-density screens */
  imageUrl2x?: string
  /** AVIF copies of the image (1x and 2x), preferred where supported */
  avif?: { x1: string; x2: string }
  /** The alt text's i18n key and values, instead of `appUi.ads.imageAlt` */
  alt?: { key: string; values: Record<string, string> }
}

export interface PosterAdConfig extends AdBase {
  kind: "poster"
  /** i18n key prefix of the poster's copy */
  copyKey: string
  /**
   * Accent colour of the poster (title, frame, call to action): a #rrggbb
   * colour (the poster appends alpha to it), AA-readable on its dark ground
   */
  accent: string
}

export type AdConfig = ImageAdConfig | PosterAdConfig

/**
 * A time-boxed set of image ads (e.g. an in-game event). While it runs, each
 * visitor is shown one creative from the set, the same one for the whole
 * campaign, in at most one ad slot per page (see useCampaignAd, insertAds).
 */
export interface AdCampaign {
  id: string
  /** ISO 8601 instant the campaign starts (inclusive) */
  start: string
  /** ISO 8601 instant the campaign ends (exclusive) */
  end: string
  /** localStorage key holding an anonymous visitor's creative id */
  storageKey: string
  creatives: ImageAdConfig[]
}

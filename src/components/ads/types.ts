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
}

export interface PosterAdConfig extends AdBase {
  kind: "poster"
  /** i18n key prefix of the poster's copy */
  copyKey: string
  /** Accent colour of the poster (title, frame, call to action) */
  accent: string
}

export type AdConfig = ImageAdConfig | PosterAdConfig

/**
 * An in-universe market ad. Two kinds of creative:
 * - "image": a poster image with its copy baked in (the RSI/Crusader ships).
 * - "poster": drawn in CSS with translated copy (SC Orgs), so it reads in
 *   every locale. `copyKey` is the i18n prefix: `${copyKey}.kicker`,
 *   `.title`, `.tagline`, `.cta`.
 *
 * `weight` is the ad's share of the rotation (see buildAdRotation).
 */
interface AdBase {
  /** Unique identifier for the ad */
  id: string
  /** URL to navigate to when the ad is clicked */
  linkUrl: string
  /** Relative share of ad slots */
  weight: number
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

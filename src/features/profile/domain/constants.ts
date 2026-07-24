/**
 * Regex for validating image URLs from allowed external sources (RSI, starcitizen.tools, imgur, etc.).
 * Used by profile image uploads, market listing images, and other photo selectors.
 *
 * Allowed hosts:
 * - robertsspaceindustries.com (+ optional media./cdn./www.)
 * - starcitizen.tools (+ optional media.)
 * - i.imgur.com (direct image links only — page URLs imgur.com/abc won't render)
 * - cstone.space
 *
 * After the hostname the remainder must start with /, ?, or # so that
 * "domain.com.evil.com" can't slip through the path character class.
 */
export const external_resource_regex =
  /^https?:\/\/(www\.)?(((media|cdn)\.)?robertsspaceindustries\.com|(media\.)?starcitizen\.tools|i\.imgur\.com|cstone\.space)([\/?#][-a-zA-Z0-9()@:%_+.~#?&\/=]*)?$/

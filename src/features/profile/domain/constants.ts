/**
 * Regex for validating image URLs from allowed external sources (RSI, starcitizen.tools, imgur, etc.).
 * Used by profile image uploads, market listing images, and other photo selectors.
 */
const external_resource_pattern =
  /^https?:\/\/(www\.)?((((media)|(cdn)\.)?robertsspaceindustries\.com)|((media\.)?starcitizen.tools)|(i\.imgur\.com)|(cstone\.space))\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)$/

export const external_resource_regex = new RegExp(external_resource_pattern)

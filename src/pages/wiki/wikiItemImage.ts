/**
 * Image for a wiki item search result: its own image, else its manufacturer's
 * logo, else the generic fallback.
 */
import type { WikiItemSearchResult } from "../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { getFactionIcon } from "../../util/gameIcons"

/** The image fields of a wiki item (search result or comparison row). */
type WikiItemImageFields = {
  [K in "image_url" | "thumbnail_path" | "manufacturer_code"]?:
    | WikiItemSearchResult[K]
    | null
}

export function wikiItemImage(item: WikiItemImageFields): string {
  // Logos are keyed by manufacturer code ("behr"); `manufacturer` is the
  // display name ("Behring") whenever one resolves, so it never matches.
  return (
    item.image_url ||
    item.thumbnail_path ||
    getFactionIcon(item.manufacturer_code) ||
    FALLBACK_IMAGE_URL
  )
}

import i18n from "./i18n"

/** i18n keys for known crafted_source values (resolved at call time). */
const SOURCE_LABEL_KEYS: Record<string, string> = {
  store: "AllStockLots.storeBought",
  crafted: "AllStockLots.crafted",
  looted: "AllStockLots.looted",
  duped: "CreateListingV2.duped",
}

/** Returns a display label for crafted_source, or empty string for "unknown" */
export function formatCraftedSource(source: string): string {
  if (source === "unknown") return ""
  const key = SOURCE_LABEL_KEYS[source]
  return key ? i18n.t(key) : source.charAt(0).toUpperCase() + source.slice(1)
}

/** Whether this source value should be displayed as a chip */
export function hasDisplayableSource(
  source: string | undefined | null,
): boolean {
  return !!source && source !== "unknown"
}

const SOURCE_LABELS: Record<string, string> = {
  store: "Store-Bought",
  crafted: "Crafted",
  looted: "Looted",
  duped: "Duped",
}

/** Returns a display label for crafted_source, or empty string for "unknown" */
export function formatCraftedSource(source: string): string {
  if (source === "unknown") return ""
  return SOURCE_LABELS[source] ?? source.charAt(0).toUpperCase() + source.slice(1)
}

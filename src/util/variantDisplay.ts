const SOURCE_LABELS: Record<string, string> = {
  store: "Store-Bought",
  crafted: "Crafted",
  looted: "Looted",
  duped: "Duped",
  unknown: "Unknown",
}

export function formatCraftedSource(source: string): string {
  return SOURCE_LABELS[source] ?? source.charAt(0).toUpperCase() + source.slice(1)
}

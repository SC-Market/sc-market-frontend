/**
 * Mission display utilities
 * Formats mission types, descriptions, and credit rewards for display.
 */

/** Map raw p4k mission type codes to human-readable display names */
const MISSION_TYPE_LABELS: Record<string, string> = {
  mercenary: "Mercenary",
  bountyhunter: "Bounty Hunter",
  "missiontype.delivery": "Delivery",
  hauling: "Hauling",
  hauling_planetary: "Planetary Hauling",
  hauling_solar: "Solar Hauling",
  hauling_local: "Local Hauling",
  hauling_interstellar: "Interstellar Hauling",
  investigation: "Investigation",
  priority: "Priority",
  race: "Race",
  salvage: "Salvage",
  maintenance: "Maintenance",
  servicebeacon: "Service Beacon",
  ecn: "Emergency",
  mining: "Mining",
  "missiontype.search": "Search",
  "missiontype.job": "Job",
  "missiontype.research": "Research",
  appointment: "Appointment",
  collector: "Collection",
  courier: "Courier",
  fpsmining: "FPS Mining",
  groundmining: "Ground Mining",
  shipmining: "Ship Mining",
  pvpmission: "PvP",
}

/** Get a display-friendly mission type label */
export function getMissionTypeLabel(type: string | null | undefined): string {
  if (!type) return "Unknown"
  return MISSION_TYPE_LABELS[type.toLowerCase()] || type.replace(/^missiontype\./, "").replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format mission description text:
 * - Replace ~mission(TargetName) style placeholders with readable [Target Name]
 * - Clean up escaped newlines
 */
export function formatMissionDescription(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .replace(/~mission\(([^|)]+)\|?[^)]*\)/g, (_, key) => {
      // Convert camelCase/PascalCase to spaced words
      const label = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_|]/g, " ").trim()
      return `[${label}]`
    })
    .replace(/\\n/g, "\n")
    .replace(/<EM\d*>/g, "")
}

/** Format credit amount with locale-aware commas */
export function formatCredits(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || amount === 0) return "—"
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M aUEC`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K aUEC`
  return `${amount.toLocaleString()} aUEC`
}

/**
 * Mission display utilities
 * Formats mission types, descriptions, and credit rewards for display.
 */

import type { TFunction } from "i18next"

import { formatNumber } from "./format/format"
/** p4k mission type code -> [catalog key under gameTaxonomyUi.missionTypes, English label] */
const MISSION_TYPE_LABELS: Record<string, [string, string]> = {
  mercenary: ["mercenary", "Mercenary"],
  bountyhunter: ["bountyHunter", "Bounty Hunter"],
  "missiontype.delivery": ["delivery", "Delivery"],
  delivery: ["delivery", "Delivery"],
  hauling: ["hauling", "Hauling"],
  hauling_planetary: ["planetaryHauling", "Planetary Hauling"],
  hauling_solar: ["solarHauling", "Solar Hauling"],
  hauling_local: ["localHauling", "Local Hauling"],
  hauling_interstellar: ["interstellarHauling", "Interstellar Hauling"],
  investigation: ["investigation", "Investigation"],
  priority: ["priority", "Priority"],
  race: ["race", "Race"],
  salvage: ["salvage", "Salvage"],
  maintenance: ["maintenance", "Maintenance"],
  servicebeacon: ["serviceBeacon", "Service Beacon"],
  ecn: ["emergency", "Emergency"],
  mining: ["mining", "Mining"],
  "missiontype.search": ["search", "Search"],
  "missiontype.job": ["job", "Job"],
  "missiontype.research": ["research", "Research"],
  appointment: ["appointment", "Appointment"],
  collector: ["collection", "Collection"],
  courier: ["courier", "Courier"],
  fpsmining: ["fpsMining", "FPS Mining"],
  groundmining: ["groundMining", "Ground Mining"],
  shipmining: ["shipMining", "Ship Mining"],
  pvpmission: ["pvp", "PvP"],
}

/**
 * Display-friendly mission type label. Pass `t` for the user's language;
 * without it the English label is returned. Codes are matched case- and
 * space-insensitively ("Bounty Hunter" and "bountyhunter" are the same type).
 */
export function getMissionTypeLabel(
  type: string | null | undefined,
  t?: TFunction,
): string {
  if (!type) return t ? t("missionsUi.unknown") : "Unknown"
  const known = MISSION_TYPE_LABELS[type.toLowerCase().replace(/\s+/g, "")]
  if (known)
    return t ? t(`gameTaxonomyUi.missionTypes.${known[0]}`, known[1]) : known[1]
  return type
    .replace(/^missiontype\./, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format mission name:
 * - Replace ~mission(...) placeholders with styled [PLACEHOLDER] spans
 * Returns plain text (for non-React contexts like table sorting)
 */
export function formatMissionNameText(name: string | null | undefined): string {
  if (!name) return "Unknown Mission"
  return name
    .replace(/<\/?em\d*>/gi, "")
    .replace(/~mission\(([^)]+)\)/g, (_, inner) => {
      if (inner === "Contractor" || inner.startsWith("Contractor|"))
        return "Various"
      const key = inner.split("|").pop() || inner
      const label = key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_]/g, " ")
        .trim()
        .toUpperCase()
      return `[${label}]`
    })
}

/**
 * Format mission description text:
 * - Replace ~mission(TargetName) style placeholders with readable [Target Name]
 * - Clean up escaped newlines
 */
export function formatMissionDescription(
  text: string | null | undefined,
): string {
  if (!text) return ""
  return text
    .replace(/~mission\(([^|)]+)\|?[^)]*\)/g, (_, key) => {
      const label = key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_|]/g, " ")
        .trim()
        .toUpperCase()
      return `[${label}]`
    })
    .replace(/\\n/g, "\n")
    .replace(/<\/?em\d*>/gi, "")
}

/**
 * A mission's credit reward: "—" for none, abbreviated from 1,000 up in the
 * locale's short form ("1.5K aUEC", "10K aUEC", "1.5M aUEC" in English).
 */
export function formatCredits(
  amount: number | null | undefined,
  locale: string,
): string {
  if (amount === null || amount === undefined || amount === 0) return "—"
  if (amount >= 1_000) {
    return `${formatNumber(amount, locale, { notation: "compact", maximumFractionDigits: 1 })} aUEC`
  }
  return `${formatNumber(amount, locale)} aUEC`
}

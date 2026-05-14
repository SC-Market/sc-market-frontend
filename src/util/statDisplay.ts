/**
 * Shared stat/property display utilities for blueprints and crafting.
 */

/** Human-readable property names */
const PROPERTY_LABELS: Record<string, string> = {
  // Armor
  damagemitigation: "Damage Mitigation",
  gpp_armor_damagemitigation: "Damage Mitigation",
  mintemp: "Min Temperature",
  gpp_armor_mintemp: "Min Temperature",
  maxtemp: "Max Temperature",
  gpp_armor_maxtemp: "Max Temperature",
  emreduction: "EM Reduction",
  irreduction: "IR Reduction",
  durability: "Durability",
  weight: "Weight",

  // Weapons
  weapon_damage: "Damage",
  weapon_firerate: "Fire Rate",
  weapon_recoil_handling: "Recoil Control",
  weapon_recoil_kick: "Recoil Kick",
  weapon_recoil_smoothness: "Recoil Smoothness",
  weapon_spread: "Spread",
  weapon_range: "Range",
  weapon_velocity: "Projectile Velocity",
  weapon_ammo_capacity: "Ammo Capacity",

  // General
  health: "Health",
  speed: "Speed",
  capacity: "Capacity",
  power: "Power",
  cooling: "Cooling",
  shielding: "Shield Strength",
}

/** Properties where a lower modifier value is BETTER (e.g., less recoil) */
const LOWER_IS_BETTER = new Set([
  "weapon_recoil_kick",
  "weapon_recoil_handling",
  "weapon_recoil_smoothness",
  "weapon_spread",
  "weight",
  "gpp_weapon_recoil_kick",
  "gpp_weapon_recoil_handling",
  "gpp_weapon_recoil_smoothness",
  "gpp_weapon_spread",
])

export function propertyLabel(prop: string): string {
  const lower = prop.toLowerCase()
  if (PROPERTY_LABELS[lower]) return PROPERTY_LABELS[lower]
  const stripped = lower.replace(/^gpp_armor_/, "").replace(/^gpp_/, "").replace(/^weapon_/, "")
  if (PROPERTY_LABELS[stripped]) return PROPERTY_LABELS[stripped]
  // Fallback: capitalize and space
  return lower
    .replace(/^gpp_armor_/, "")
    .replace(/^gpp_/, "")
    .replace(/^weapon_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, s => s.toUpperCase())
}

/** Is this modifier "good"? Accounts for lower-is-better stats. */
export function isModifierPositive(prop: string, factor: number): boolean {
  const lower = prop.toLowerCase()
  const stripped = lower.replace(/^gpp_armor_/, "").replace(/^gpp_/, "")
  const isLowerBetter = LOWER_IS_BETTER.has(lower) || LOWER_IS_BETTER.has(stripped)
  return isLowerBetter ? factor < 1 : factor > 1
}

/** Interpolate a modifier value based on quality */
export function interpolateModifier(qv: number, startQ: number, endQ: number, modStart: number, modEnd: number): number {
  if (endQ === startQ) return modStart
  const t = Math.max(0, Math.min(1, (qv - startQ) / (endQ - startQ)))
  return modStart + t * (modEnd - modStart)
}

/**
 * Display-mode-aware formatting for modifier values.
 *
 * @param value       The raw modifier value from the API (e.g. 1.12, 0.92, -2, 3.5)
 * @param modifierType "linear" or "additive" -- additive always uses raw display
 * @param def         Optional CraftedPropertyDef with display_mode, scale_factor, unit_label
 * @returns           A formatted string like "+12%", "-2", "0.8x", "+350 W", etc.
 */
export function formatModifierValue(
  value: number,
  modifierType: "linear" | "additive",
  def?: { display_mode: string; scale_factor?: number | null; unit_label?: string | null } | null,
): string {
  // Additive modifiers: always display the raw value with sign
  if (modifierType === "additive") {
    const label = def?.unit_label ? ` ${def.unit_label}` : ""
    const sign = value > 0 ? "+" : ""
    // Show integer if whole, otherwise up to 2 decimals
    const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2)
    return `${sign}${formatted}${label}`
  }

  // No def or unknown display_mode: fall back to multiplier display
  if (!def) {
    return `${value.toFixed(3)}×`
  }

  const label = def.unit_label ? ` ${def.unit_label}` : ""

  switch (def.display_mode) {
    case "raw": {
      const sign = value > 0 ? "+" : ""
      const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2)
      return `${sign}${formatted}${label}`
    }

    case "percent":
    case "percent_of_base": {
      const pct = (value - 1) * 100
      const sign = pct >= 0 ? "+" : ""
      return `${sign}${pct.toFixed(1)}%${label}`
    }

    case "negated_percent": {
      const pct = -(value - 1) * 100
      const sign = pct >= 0 ? "+" : ""
      return `${sign}${pct.toFixed(1)}%${label}`
    }

    case "scale": {
      const factor = def.scale_factor ?? 1
      const scaled = value * factor
      const sign = scaled > 0 ? "+" : ""
      const formatted = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(2)
      return `${sign}${formatted}${label}`
    }

    default: {
      // Unknown display_mode: fall back to multiplier
      return `${value.toFixed(3)}×`
    }
  }
}

/**
 * Build a lookup map from property_key -> CraftedPropertyDef for fast access.
 */
type PropertyDef = { property_key: string; display_name: string | null; display_mode: string; scale_factor?: number | null; unit_label?: string | null }

export function buildPropertyDefMap(
  defs?: PropertyDef[],
): Map<string, PropertyDef> {
  const map = new Map<string, PropertyDef>()
  if (defs) {
    for (const d of defs) {
      map.set(d.property_key, d)
    }
  }
  return map
}

/**
 * Get the display name for a property, preferring CraftedPropertyDef.display_name,
 * falling back to the local propertyLabel() heuristic.
 */
export function propertyDisplayName(
  prop: string,
  def?: { display_name: string | null } | null,
): string {
  if (def?.display_name) return def.display_name
  return propertyLabel(prop)
}

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
  const isLowerBetter = LOWER_IS_BETTER.has(prop.toLowerCase())
  return isLowerBetter ? factor < 1 : factor > 1
}

/** Interpolate a modifier value based on quality */
export function interpolateModifier(qv: number, startQ: number, endQ: number, modStart: number, modEnd: number): number {
  if (endQ === startQ) return modStart
  const t = Math.max(0, Math.min(1, (qv - startQ) / (endQ - startQ)))
  return modStart + t * (modEnd - modStart)
}

/**
 * Quality display mode for game items based on Star Citizen crafting system.
 *
 * - "numeric": Raw materials/commodities — quality is a continuous value (0–1000)
 * - "tiered": Craftable equipment — quality is a tier (1–5) based on blueprint + materials
 * - "none": Cosmetics, flairs, ships — no quality attribute
 *
 * Reference: https://robertsspaceindustries.com/en/comm-link/transmission/19652-Crafting-Gameplay-Guide
 */
export type QualityMode = "numeric" | "tiered" | "none"

const NUMERIC_TYPES = new Set(["Commodity"])

const TIERED_TYPES = new Set([
  "Ranged Weapon", "Melee Weapon", "Thrown Weapon", "Ship Weapon",
  "Helmet", "Torso", "Arms", "Legs", "Gloves", "Footwear", "Undersuit",
  "Backpack", "Backpack (Clothing)",
  "Shield", "Power Plant", "Cooler", "Quantum Drive", "Jump Drive",
  "Mining Head", "Mining Modifier", "Handheld Mining Modifier",
  "Salvage Head", "Salvage Modifier",
  "Ship Module", "Ship Turret or Gimbal", "Ship Component",
  "Missile", "Missile Rack", "Flight Blade",
  "Weapon Attachment", "Weapon Magazine", "Tool Attachment",
  "Tractor Beam", "Towing Beam", "Fuel Nozzle", "Fuel Pod",
  "Bomb", "Bomb Launcher", "FPS Tool", "Medical Pen", "Hacking Chip",
])

export function getQualityMode(itemType: string | null | undefined): QualityMode {
  if (!itemType) return "none"
  if (NUMERIC_TYPES.has(itemType)) return "numeric"
  if (TIERED_TYPES.has(itemType)) return "tiered"
  return "none"
}

/** Format quality for display */
export function formatQuality(
  mode: QualityMode,
  attrs: { quality_tier?: number; quality_value?: number } | undefined,
): string {
  if (!attrs) return "—"
  if (mode === "tiered" && attrs.quality_tier != null) return `Tier ${attrs.quality_tier}`
  if (mode === "numeric" && attrs.quality_value != null) return `Q${attrs.quality_value}`
  return "—"
}

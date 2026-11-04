/**
 * Format raw p4k category codes into human-readable display names.
 * Used for blueprint item_category and game item type fields.
 */

import type { TFunction } from "i18next"

/** p4k code -> [catalog key under gameTaxonomyUi.itemCategories, English label] */
const CATEGORY_LABELS: Record<string, [string, string]> = {
  WeaponGun: ["weapon", "Weapon"],
  WeaponMissile: ["missile", "Missile"],
  Shield: ["shield", "Shield"],
  PowerPlant: ["powerPlant", "Power Plant"],
  Cooler: ["cooler", "Cooler"],
  QuantumDrive: ["quantumDrive", "Quantum Drive"],
  Armor_Helmet: ["helmet", "Helmet"],
  Armor_Torso: ["torsoArmor", "Torso Armor"],
  Armor_Arms: ["armArmor", "Arm Armor"],
  Armor_Legs: ["legArmor", "Leg Armor"],
  Armor_Backpack: ["backpack", "Backpack"],
  Armor_Undersuit: ["undersuit", "Undersuit"],
  FPSWeapon: ["fpsWeapon", "FPS Weapon"],
  FPSArmor: ["fpsArmor", "FPS Armor"],
  ShipWeapon: ["shipWeapon", "Ship Weapon"],
  ShipComponent: ["shipComponent", "Ship Component"],
  MiningHead: ["miningHead", "Mining Head"],
  SalvageHead: ["salvageHead", "Salvage Head"],
  MiningModifier: ["miningModifier", "Mining Modifier"],
  SalvageModifier: ["salvageModifier", "Salvage Modifier"],
  Commodity: ["commodity", "Commodity"],
  Food: ["food", "Food"],
  Drink: ["drink", "Drink"],
  Medical: ["medical", "Medical"],
  Consumable: ["consumable", "Consumable"],
  Component: ["component", "Component"],
  RawMaterial: ["rawMaterial", "Raw Material"],
  RefinedMaterial: ["refinedMaterial", "Refined Material"],
  Ore: ["ore", "Ore"],
  Gas: ["gas", "Gas"],
  Gem: ["gem", "Gem"],
}

/**
 * Display name for a category code. Pass `t` for the user's language; without
 * it the English label is returned. Unknown codes (game data) are prettified.
 */
export function formatCategoryName(
  category: string | null | undefined,
  t?: TFunction,
): string {
  if (!category) return t ? t("gameTaxonomyUi.unknown", "Unknown") : "Unknown"
  const known = CATEGORY_LABELS[category]
  if (known)
    return t
      ? t(`gameTaxonomyUi.itemCategories.${known[0]}`, known[1])
      : known[1]
  // Fallback: split PascalCase/snake_case into words
  return category
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

/** English filter labels (search/sidebar options) -> gameTaxonomyUi.itemCategories keys */
const LABEL_KEYS: Record<string, string> = {
  ...Object.fromEntries(
    Object.values(CATEGORY_LABELS).map(([key, label]) => [label, key]),
  ),
  Armor: "armor",
  Torso: "torso",
  Arms: "arms",
  Legs: "legs",
  "Ranged Weapon": "rangedWeapon",
  "Weapon Attachment": "weaponAttachment",
  "Food/Drink": "foodDrink",
  "Medical Pen": "medicalPen",
  Tool: "tool",
}

/**
 * Translate an item-type filter value: an English label (e.g. "Power Plant")
 * or a p4k code (e.g. "PowerPlant"). Other values (game data) are returned
 * unchanged.
 */
export function translateCategoryLabel(value: string, t: TFunction): string {
  if (CATEGORY_LABELS[value]) return formatCategoryName(value, t)
  const key = LABEL_KEYS[value]
  return key ? t(`gameTaxonomyUi.itemCategories.${key}`, value) : value
}

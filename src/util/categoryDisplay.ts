/**
 * Format raw p4k category codes into human-readable display names.
 * Used for blueprint item_category and game item type fields.
 */

const CATEGORY_LABELS: Record<string, string> = {
  WeaponGun: "Weapon",
  WeaponMissile: "Missile",
  Shield: "Shield",
  PowerPlant: "Power Plant",
  Cooler: "Cooler",
  QuantumDrive: "Quantum Drive",
  Armor_Helmet: "Helmet",
  Armor_Torso: "Torso Armor",
  Armor_Arms: "Arm Armor",
  Armor_Legs: "Leg Armor",
  Armor_Backpack: "Backpack",
  Armor_Undersuit: "Undersuit",
  FPSWeapon: "FPS Weapon",
  FPSArmor: "FPS Armor",
  ShipWeapon: "Ship Weapon",
  ShipComponent: "Ship Component",
  MiningHead: "Mining Head",
  SalvageHead: "Salvage Head",
  MiningModifier: "Mining Modifier",
  SalvageModifier: "Salvage Modifier",
  Commodity: "Commodity",
  Food: "Food",
  Drink: "Drink",
  Medical: "Medical",
  Consumable: "Consumable",
  Component: "Component",
  RawMaterial: "Raw Material",
  RefinedMaterial: "Refined Material",
  Ore: "Ore",
  Gas: "Gas",
  Gem: "Gem",
}

export function formatCategoryName(category: string | null | undefined): string {
  if (!category) return "Unknown"
  if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category]
  // Fallback: split PascalCase/snake_case into words
  return category
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

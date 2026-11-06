import { SearchToken } from "./searchTokenParams"

// === Mission suggestions ===
export const MISSION_TAGS: SearchToken[] = [
  { type: "tag", label: "Illegal", value: "ILLEGAL" },
  { type: "tag", label: "Shareable", value: "shareable" },
  { type: "tag", label: "Unique", value: "unique" },
  { type: "tag", label: "Chain Starter", value: "chain" },
  { type: "tag", label: "Has Blueprints", value: "blueprints" },
]

export const SYSTEMS: SearchToken[] = [
  { type: "system", label: "Stanton", value: "Stanton" },
  { type: "system", label: "Pyro", value: "Pyro" },
  { type: "system", label: "Nyx", value: "Nyx" },
  { type: "system", label: "Terra", value: "Terra" },
  { type: "system", label: "Magnus", value: "Magnus" },
]

export const MISSION_CATEGORIES: SearchToken[] = [
  "Mercenary",
  "Bounty Hunter",
  "Delivery",
  "Hauling",
  "Investigation",
  "Mining",
  "Salvage",
  "Maintenance",
  "Race",
  "Courier",
].map((c) => ({ type: "category" as const, label: c, value: c }))

export const MISSION_GIVERS: SearchToken[] = [
  "Vaughn",
  "Adagio Holdings",
  "Citizens for Prosperity",
  "Reclamation & Disposal Ormond",
  "Miles Eckhart",
  "Twitch Pacheco",
].map((g) => ({ type: "giver" as const, label: g, value: g }))

export const MISSION_FACTIONS: SearchToken[] = [
  "Bounty Hunters Guild",
  "Headhunters",
  "Crusader Security",
  "Hurston Security",
  "MicroTech Security",
  "UEE Navy",
].map((f) => ({ type: "faction" as const, label: f, value: f }))

// === Blueprint suggestions ===
export const BP_CATEGORIES: SearchToken[] = [
  "Helmet",
  "Torso",
  "Arms",
  "Legs",
  "Backpack",
  "Undersuit",
  "Ranged Weapon",
  "Weapon Attachment",
  "Ship Weapon",
].map((c) => ({ type: "category" as const, label: c, value: c }))

export const BP_MATERIALS: SearchToken[] = [
  "Agricium",
  "Aluminum",
  "Aphorite",
  "Aslarite",
  "Copper",
  "Gold",
  "Hephaestanite",
  "Iron",
  "Lindinium",
  "Ouratite",
  "Quartz",
  "Taranite",
  "Titanium",
  "Torite",
  "Tungsten",
].map((m) => ({ type: "material" as const, label: m, value: m }))

export const BP_RARITIES: SearchToken[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
].map((r) => ({ type: "rarity" as const, label: r, value: r }))

export const BP_TAGS: SearchToken[] = [
  { type: "tag", label: "Default", value: "default" },
  { type: "tag", label: "Mission Reward", value: "mission_reward" },
  { type: "tag", label: "Has Mission Source", value: "has_missions" },
  { type: "tag", label: "Owned", value: "owned" },
]

// === Mining suggestions ===
export const MINING_RARITIES: SearchToken[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
].map((r) => ({ type: "rarity" as const, label: r, value: r.toLowerCase() }))

export const MINING_METHODS: SearchToken[] = [
  { type: "category" as const, label: "Ship Mining", value: "ship" },
  { type: "category" as const, label: "Ground Vehicle (ROC)", value: "ground" },
  { type: "category" as const, label: "Hand Mining (FPS)", value: "fps" },
]

// === Location suggestions ===
export const LOCATION_TYPES: SearchToken[] = [
  { type: "category" as const, label: "Surface", value: "surface" },
  {
    type: "category" as const,
    label: "Asteroid Field",
    value: "asteroidfield",
  },
]

export const LOCATION_TAGS: SearchToken[] = [
  { type: "tag" as const, label: "Has Refinery", value: "refinery" },
]

// === Ships suggestions ===
export const SHIP_CAREERS: SearchToken[] = [
  "Combat",
  "Exploration",
  "Industrial",
  "Support",
  "Transporter",
].map((c) => ({ type: "category" as const, label: c, value: c.toLowerCase() }))

export const SHIP_SIZES: SearchToken[] = [
  { type: "tag" as const, label: "Small (1)", value: "1" },
  { type: "tag" as const, label: "Medium (2)", value: "2" },
  { type: "tag" as const, label: "Large (3)", value: "3" },
  { type: "tag" as const, label: "Capital (4+)", value: "4" },
]

export const SHIP_MANUFACTURERS: SearchToken[] = [
  "Aegis Dynamics",
  "Anvil Aerospace",
  "Argo Astronautics",
  "CNOU",
  "Consolidated Outland",
  "Crusader Industries",
  "Drake Interplanetary",
  "Esperia",
  "Gatac",
  "Greycat Industrial",
  "Kruger Intergalactic",
  "MISC",
  "Origin Jumpworks",
  "Roberts Space Industries",
  "Tumbril",
].map((m) => ({ type: "manufacturer" as const, label: m, value: m }))

// === Wiki Items suggestions ===
export const WIKI_ITEM_TYPES: SearchToken[] = [
  "Helmet",
  "Torso",
  "Arms",
  "Legs",
  "Backpack",
  "Undersuit",
  "Ranged Weapon",
  "Weapon Attachment",
  "Ship Weapon",
  "Commodity",
  "Power Plant",
  "Cooler",
  "Shield",
  "Quantum Drive",
  "Mining Head",
  "Mining Modifier",
].map((c) => ({ type: "category" as const, label: c, value: c }))

export const MARKET_CATEGORIES: SearchToken[] = [
  "Helmet",
  "Torso",
  "Arms",
  "Legs",
  "Backpack",
  "Undersuit",
  "Ranged Weapon",
  "Weapon Attachment",
  "Ship Weapon",
  "Commodity",
  "Food/Drink",
  "Medical Pen",
  "Power Plant",
  "Cooler",
  "Shield",
  "Quantum Drive",
].map((c) => ({ type: "category" as const, label: c, value: c }))

export const MARKET_TAGS: SearchToken[] = [
  { type: "tag", label: "Has Photos", value: "has_photos" },
  { type: "tag", label: "In Stock", value: "in_stock" },
  { type: "tag", label: "Bulk Discount", value: "bulk_discount" },
]

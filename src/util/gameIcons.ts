/**
 * Game icon mappings — extracted from Star Citizen Data.p4k
 * Re-extract with: scripts/extract-game-icons.sh
 */

const BASE = "/game-icons"

/** Mission type → icon filename */
const MISSION_ICONS: Record<string, string> = {
  mercenary: "PU_mobiapp_icon_mission_mercenary.svg",
  bountyhunter: "PU_mobiapp_icon_mission_bountyhunter.svg",
  "missiontype.delivery": "PU_mobiapp_icon_mission_delivery.svg",
  hauling: "PU_mobiapp_icon_mission_delivery.svg",
  hauling_planetary: "PU_mobiapp_icon_mission_delivery.svg",
  hauling_solar: "PU_mobiapp_icon_mission_delivery.svg",
  hauling_local: "PU_mobiapp_icon_mission_delivery.svg",
  hauling_interstellar: "PU_mobiapp_icon_mission_delivery.svg",
  courier: "PU_mobiapp_icon_mission_delivery.svg",
  investigation: "PU_mobiapp_icon_mission_investigation.svg",
  priority: "PU_mobiapp_icon_mission_priority.svg",
  race: "PU_mobiapp_icon_mission_race.svg",
  salvage: "PU_mobiapp_icon_mission_salvage.svg",
  maintenance: "PU_mobiapp_icon_mission_maintenance.svg",
  ecn: "PU_mobiapp_icon_mission_ecn.svg",
  mining: "PU_mobiapp_icon_mission_mining.svg",
  fpsmining: "icon_mobiglas_mining_hand.svg",
  groundmining: "icon_mobiglas_mining_groundvehicle.svg",
  shipmining: "icon_mobiglas_mining_spaceship.svg",
  "missiontype.search": "PU_mobiapp_icon_mission_search.svg",
  "missiontype.job": "PU_mobiapp_icon_mission_job.svg",
  "missiontype.research": "PU_mobiapp_icon_mission_research.svg",
  appointment: "PU_mobiapp_icon_mission_appointment.svg",
  servicebeacon: "PU_mobiapp_icon_mission_service_beacon.svg",
  pvpmission: "PU_mobiapp_icon_mission_bountyhunter.svg",
  collection: "PU_mobiapp_icon_mission_collection.svg",
}

/** Manufacturer code → faction logo filename */
const FACTION_ICONS: Record<string, string> = {
  aegs: "icon_brand_aegis.svg",
  anvl: "logo_anvil_aerospace_a.svg",
  aopo: "logo_aopoa_a.svg",
  arcc: "icon_brand_arccorp.svg",
  argo: "icon_brand_argo.svg",
  banu: "icon_brand_banu.svg",
  behr: "icon_brand_behring.svg",
  cnou: "icon_brand_consolidated_outland.svg",
  crlf: "logo_curelife_a.svg",
  crus: "icon_brand_crusader.svg",
  drak: "icon_brand_drake.svg",
  espr: "logo_esperia_a.svg",
  gatc: "icon_brand_gatac.svg",
  grey: "logo_grey_cat_a.svg",
  hrst: "icon_brand_hurston_dynamics.svg",
  krig: "logo_kruger_intergalactic_a.svg",
  mite: "icon_brand_microtech.svg",
  misc: "logo_misc_a.svg",
  mrai: "icon_brand_mirai.svg",
  orig: "icon_brand_origin.svg",
  rsi: "logo_rsi_a.svg",
  shubin: "icon_brand_shubin.svg",
  tmbl: "icon_brand_tumbril.svg",
  uee: "icon_brand_uee.svg",
  vncl: "icon_brand_vanduul.svg",
  xnaa: "logo_aopoa_a.svg",
  regal: "icon_brand_regal.svg",
}

/** Get mission type icon URL */
export function getMissionIcon(missionType: string | null | undefined): string | null {
  if (!missionType) return null
  const file = MISSION_ICONS[missionType.toLowerCase()]
  return file ? `${BASE}/missions/${file}` : null
}

/** Get manufacturer/faction logo URL */
export function getFactionIcon(code: string | null | undefined): string | null {
  if (!code) return null
  const file = FACTION_ICONS[code.toLowerCase()]
  return file ? `${BASE}/factions/${file}` : null
}

/** Get resource category icon URL */
export function getResourceCategoryIcon(category: string | null | undefined): string | null {
  if (!category) return null
  const map: Record<string, string> = {
    gas: "inv_filter_icons_gas.svg",
    metal: "inv_filter_icon_metals.svg",
    metals: "inv_filter_icon_metals.svg",
    mineral: "inv_filter_icon_minerals.svg",
    minerals: "inv_filter_icon_minerals.svg",
    nonmetal: "inv_filter_icon_nonmetals.svg",
    nonmetals: "inv_filter_icon_nonmetals.svg",
    organic: "inv_filter_icon_organics.svg",
    organics: "inv_filter_icon_organics.svg",
    synthetic: "inv_filter_icon_synthetics.svg",
    synthetics: "inv_filter_icon_synthetics.svg",
    liquid: "inv_filter_icon_liquids.svg",
    liquids: "inv_filter_icon_liquids.svg",
    // Common commodity sub_types from p4k
    ore: "inv_filter_icon_minerals.svg",
    raw: "inv_filter_icon_minerals.svg",
    refined: "inv_filter_icon_metals.svg",
    alloy: "inv_filter_icon_metals.svg",
    polymer: "inv_filter_icon_synthetics.svg",
    composite: "inv_filter_icon_synthetics.svg",
    chemical: "inv_filter_icon_liquids.svg",
    agricultural: "inv_filter_icon_organics.svg",
    food: "inv_filter_icon_organics.svg",
    drug: "inv_filter_icon_liquids.svg",
    scrap: "inv_filter_icon_metals.svg",
    waste: "inv_filter_icon_nonmetals.svg",
    commodity: "inv_filter_icon_minerals.svg",
  }
  const file = map[category.toLowerCase()]
  return file ? `${BASE}/items/${file}` : null
}

/** Commodity sub_type → color for chips and avatar backgrounds */
const COMMODITY_COLORS: Record<string, string> = {
  mineral: "#8B6914",
  minerals: "#8B6914",
  ore: "#8B6914",
  metal: "#607D8B",
  metals: "#607D8B",
  refined: "#78909C",
  alloy: "#78909C",
  gas: "#4DB6AC",
  organic: "#66BB6A",
  organics: "#66BB6A",
  agricultural: "#81C784",
  food: "#A5D6A7",
  synthetic: "#AB47BC",
  synthetics: "#AB47BC",
  polymer: "#BA68C8",
  composite: "#CE93D8",
  liquid: "#42A5F5",
  liquids: "#42A5F5",
  chemical: "#29B6F6",
  nonmetal: "#BDBDBD",
  nonmetals: "#BDBDBD",
  scrap: "#8D6E63",
  waste: "#A1887F",
}

export function getCommodityColor(subType: string | null | undefined): string | null {
  if (!subType) return null
  return COMMODITY_COLORS[subType.toLowerCase()] || null
}

/** Mission category → background color for avatars */
const MISSION_CATEGORY_COLORS: Record<string, string> = {
  mercenary: "#C62828",
  bountyhunter: "#AD1457",
  "missiontype.delivery": "#1565C0",
  hauling: "#1565C0",
  hauling_planetary: "#1565C0",
  hauling_solar: "#0D47A1",
  hauling_local: "#1976D2",
  hauling_interstellar: "#0D47A1",
  courier: "#1E88E5",
  investigation: "#6A1B9A",
  priority: "#E65100",
  race: "#F57F17",
  salvage: "#4E342E",
  maintenance: "#546E7A",
  ecn: "#B71C1C",
  mining: "#E65100",
  fpsmining: "#BF360C",
  groundmining: "#D84315",
  shipmining: "#E65100",
  "missiontype.search": "#00695C",
  "missiontype.job": "#37474F",
  "missiontype.research": "#283593",
  appointment: "#4527A0",
  servicebeacon: "#00838F",
  pvpmission: "#880E4F",
  collection: "#2E7D32",
  combat: "#C62828",
  delivery: "#1565C0",
  "bounty hunting": "#AD1457",
  exploration: "#00695C",
  medical: "#1B5E20",
  trading: "#F9A825",
}

export function getMissionCategoryColor(category: string | null | undefined): string {
  if (!category) return "#616161"
  return MISSION_CATEGORY_COLORS[category.toLowerCase()] || "#616161"
}

/** Item category → color for blueprint chips/avatars */
const ITEM_CATEGORY_COLORS: Record<string, string> = {
  weapongun: "#C62828",
  weapon: "#C62828",
  weaponmissile: "#B71C1C",
  shield: "#1565C0",
  powerplant: "#E65100",
  cooler: "#00838F",
  quantumdrive: "#6A1B9A",
  armor: "#37474F",
  armor_helmet: "#455A64",
  armor_torso: "#37474F",
  armor_arms: "#546E7A",
  armor_legs: "#546E7A",
  armor_backpack: "#4E342E",
  armor_undersuit: "#263238",
  fpsweapon: "#AD1457",
  fpsarmor: "#37474F",
  shipweapon: "#C62828",
  shipcomponent: "#1565C0",
  mininghead: "#E65100",
  salvagehead: "#4E342E",
  commodity: "#2E7D32",
  component: "#546E7A",
  consumable: "#00695C",
  medical: "#1B5E20",
  food: "#33691E",
  drink: "#1B5E20",
}

export function getItemCategoryColor(category: string | null | undefined): string {
  if (!category) return "#616161"
  return ITEM_CATEGORY_COLORS[category.toLowerCase().replace(/[\s_-]/g, "")] || "#616161"
}

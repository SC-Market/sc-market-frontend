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
  anvl: "icon_brand_anvil.svg",
  aopo: "icon_brand_aopoa.svg",
  arcc: "icon_brand_arccorp.svg",
  argo: "icon_brand_argo.svg",
  banu: "icon_brand_banu.svg",
  cnou: "icon_brand_consolidated_outland.svg",
  crus: "icon_brand_crusader.svg",
  drak: "icon_brand_drake.svg",
  espr: "icon_brand_esperia.svg",
  gatc: "icon_brand_gatac.svg",
  grey: "icon_brand_grey_cat.svg",
  hrst: "icon_brand_hurston_dynamics.svg",
  krig: "icon_brand_kruger.svg",
  misc: "icon_brand_misc.svg",
  mrai: "icon_brand_mirai.svg",
  orig: "icon_brand_origin.svg",
  rsi: "icon_brand_rsi.svg",
  vncl: "icon_brand_vanduul.svg",
  xnaa: "icon_brand_xian.svg",
  tars: "icon_brand_tarsus.svg",
  behr: "icon_brand_behring.svg",
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
export function getResourceCategoryIcon(category: string): string | null {
  const map: Record<string, string> = {
    gas: "inv_filter_icons_gas.svg",
    metal: "inv_filter_icon_metals.svg",
    metals: "inv_filter_icon_metals.svg",
    mineral: "inv_filter_icon_minerals.svg",
    minerals: "inv_filter_icon_minerals.svg",
    nonmetal: "inv_filter_icon_nonmetals.svg",
    organic: "inv_filter_icon_organics.svg",
    synthetic: "inv_filter_icon_synthetics.svg",
    liquid: "inv_filter_icon_liquids.svg",
  }
  const file = map[category.toLowerCase()]
  return file ? `${BASE}/items/${file}` : null
}

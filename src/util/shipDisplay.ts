import type { TFunction } from "i18next"

/** role code -> [catalog key under gameTaxonomyUi.shipRoles, English label] */
const ROLE_LABELS: Record<string, [string, string]> = {
  // Combat
  lightfighter: ["lightFighter", "Light Fighter"],
  mediumfighter: ["mediumFighter", "Medium Fighter"],
  heavyfighter: ["heavyFighter", "Heavy Fighter"],
  stealthfighter: ["stealthFighter", "Stealth Fighter"],
  stealthbomber: ["stealthBomber", "Stealth Bomber"],
  bomber: ["bomber", "Bomber"],
  interceptor: ["interceptor", "Interceptor"],
  gunship: ["gunship", "Gunship"],
  dropship: ["dropship", "Dropship"],
  corvette: ["corvette", "Corvette"],
  frigate: ["frigate", "Frigate"],
  destroyer: ["destroyer", "Destroyer"],
  carrier: ["carrier", "Carrier"],
  snub: ["snub", "Snub"],
  // Exploration
  pathfinder: ["pathfinder", "Pathfinder"],
  exploration: ["exploration", "Exploration"],
  touring: ["touring", "Touring"],
  reporting: ["reporting", "Reporting"],
  datarunning: ["dataRunning", "Data Running"],
  science: ["science", "Science"],
  scienceship: ["scienceShip", "Science Ship"],
  // Industrial
  lightmining: ["lightMining", "Light Mining"],
  mediummining: ["mediumMining", "Medium Mining"],
  heavymining: ["heavyMining", "Heavy Mining"],
  lightsalvage: ["lightSalvage", "Light Salvage"],
  mediumsalvage: ["mediumSalvage", "Medium Salvage"],
  heavysalvage: ["heavySalvage", "Heavy Salvage"],
  refinery: ["refinery", "Refinery"],
  construction: ["construction", "Construction"],
  constructionship: ["constructionShip", "Construction Ship"],
  // Support
  medical: ["medical", "Medical"],
  repair: ["repair", "Repair"],
  refueling: ["refueling", "Refueling"],
  // Transport
  lightfreight: ["lightFreight", "Light Freight"],
  mediumfreight: ["mediumFreight", "Medium Freight"],
  heavyfreight: ["heavyFreight", "Heavy Freight"],
  // Competition
  racer: ["racer", "Racer"],
  racing: ["racing", "Racing"],
  competition: ["competition", "Competition"],
  // Multi-role
  multirole: ["multiRole", "Multi-Role"],
  ground: ["groundVehicle", "Ground Vehicle"],
  groundvehicle: ["groundVehicle", "Ground Vehicle"],
}

/** career code -> [catalog key under gameTaxonomyUi.shipCareers, English label] */
const CAREER_LABELS: Record<string, [string, string]> = {
  combat: ["combat", "Combat"],
  exploration: ["exploration", "Exploration"],
  industrial: ["industrial", "Industrial"],
  support: ["support", "Support"],
  transporter: ["transport", "Transport"],
  transport: ["transport", "Transport"],
  competition: ["competition", "Competition"],
  multirole: ["multiRole", "Multi-Role"],
}

/**
 * Display label for a ship role. Pass `t` for the user's language; without it
 * the English label is returned. Unknown roles (game data) are prettified as-is.
 */
export function formatShipRole(role?: string, t?: TFunction): string {
  if (!role) return ""
  const key = role.toLowerCase().replace(/[^a-z]/g, "")
  const known = ROLE_LABELS[key]
  if (known)
    return t ? t(`gameTaxonomyUi.shipRoles.${known[0]}`, known[1]) : known[1]
  return role
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
}

/** Display label for a ship career; same `t` contract as formatShipRole. */
export function formatShipCareer(career?: string, t?: TFunction): string {
  if (!career) return ""
  const key = career.toLowerCase()
  const known = CAREER_LABELS[key]
  if (known)
    return t ? t(`gameTaxonomyUi.shipCareers.${known[0]}`, known[1]) : known[1]
  return career.charAt(0).toUpperCase() + career.slice(1)
}

export function getShipRoleColor(
  career?: string,
  role?: string,
  focus?: string,
): "default" | "primary" | "error" | "info" | "success" | "warning" {
  const r = role?.toLowerCase().replace(/[^a-z]/g, "") || ""
  const c = career?.toLowerCase() || ""
  const f = focus?.toLowerCase() || ""

  // Check career first — this is the primary classification
  if (c === "combat" || c.includes("combat")) return "error"
  if (c === "exploration" || c.includes("explor")) return "info"
  if (c === "industrial" || c.includes("industrial")) return "warning"
  if (c === "support") return "success"
  if (c === "transporter" || c === "transport" || c.includes("transport"))
    return "default"
  if (c === "competition") return "primary"

  // Then check role for ships that might not have a career set
  if (
    r.includes("fighter") ||
    r.includes("bomber") ||
    r === "gunship" ||
    r === "interceptor" ||
    r === "dropship" ||
    r === "corvette" ||
    r === "frigate" ||
    r === "destroyer" ||
    r === "carrier" ||
    r === "snub"
  )
    return "error"
  if (
    r === "pathfinder" ||
    r === "exploration" ||
    r === "touring" ||
    r === "reporting" ||
    r === "datarunning" ||
    r === "science" ||
    r === "scienceship"
  )
    return "info"
  if (
    r.includes("mining") ||
    r.includes("salvage") ||
    r === "refinery" ||
    r === "construction" ||
    r === "constructionship"
  )
    return "warning"
  if (r === "medical" || r === "repair" || r === "refueling") return "success"
  if (r.includes("freight")) return "default"
  if (r === "racer" || r === "racing") return "primary"

  // Fallback to focus field
  if (f.includes("combat") || f.includes("fight")) return "error"
  if (f.includes("explor") || f.includes("tour")) return "info"
  if (f.includes("mining") || f.includes("salvag") || f.includes("industrial"))
    return "warning"
  if (f.includes("medical") || f.includes("repair") || f.includes("support"))
    return "success"
  if (f.includes("transport") || f.includes("freight") || f.includes("cargo"))
    return "default"

  return "default"
}

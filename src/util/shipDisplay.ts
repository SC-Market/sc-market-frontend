const ROLE_LABELS: Record<string, string> = {
  // Combat
  lightfighter: "Light Fighter",
  mediumfighter: "Medium Fighter",
  heavyfighter: "Heavy Fighter",
  stealthfighter: "Stealth Fighter",
  stealthbomber: "Stealth Bomber",
  bomber: "Bomber",
  interceptor: "Interceptor",
  gunship: "Gunship",
  dropship: "Dropship",
  corvette: "Corvette",
  frigate: "Frigate",
  destroyer: "Destroyer",
  carrier: "Carrier",
  snub: "Snub",
  // Exploration
  pathfinder: "Pathfinder",
  exploration: "Exploration",
  touring: "Touring",
  reporting: "Reporting",
  datarunning: "Data Running",
  science: "Science",
  scienceship: "Science Ship",
  // Industrial
  lightmining: "Light Mining",
  mediummining: "Medium Mining",
  heavymining: "Heavy Mining",
  lightsalvage: "Light Salvage",
  mediumsalvage: "Medium Salvage",
  heavysalvage: "Heavy Salvage",
  refinery: "Refinery",
  construction: "Construction",
  constructionship: "Construction Ship",
  // Support
  medical: "Medical",
  repair: "Repair",
  refueling: "Refueling",
  // Transport
  lightfreight: "Light Freight",
  mediumfreight: "Medium Freight",
  heavyfreight: "Heavy Freight",
  // Competition
  racer: "Racer",
  racing: "Racing",
  competition: "Competition",
  // Multi-role
  multirole: "Multi-Role",
  ground: "Ground Vehicle",
  groundvehicle: "Ground Vehicle",
}

const CAREER_LABELS: Record<string, string> = {
  combat: "Combat",
  exploration: "Exploration",
  industrial: "Industrial",
  support: "Support",
  transporter: "Transport",
  transport: "Transport",
  competition: "Competition",
  multirole: "Multi-Role",
}

export function formatShipRole(role?: string): string {
  if (!role) return ""
  const key = role.toLowerCase().replace(/[^a-z]/g, "")
  return ROLE_LABELS[key] || role.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase())
}

export function formatShipCareer(career?: string): string {
  if (!career) return ""
  const key = career.toLowerCase()
  return CAREER_LABELS[key] || career.charAt(0).toUpperCase() + career.slice(1)
}

export function getShipRoleColor(career?: string, role?: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
  const r = role?.toLowerCase().replace(/[^a-z]/g, "") || ""
  const c = career?.toLowerCase() || ""

  // Combat — red
  if (c === "combat" || r.includes("fighter") || r.includes("bomber") || r === "gunship"
    || r === "interceptor" || r === "dropship" || r === "corvette" || r === "frigate"
    || r === "destroyer" || r === "carrier" || r === "snub") return "error"
  // Exploration — blue/info
  if (c === "exploration" || r === "pathfinder" || r === "exploration" || r === "touring"
    || r === "reporting" || r === "datarunning" || r === "science" || r === "scienceship") return "info"
  // Industrial — orange/warning
  if (c === "industrial" || r.includes("mining") || r.includes("salvage")
    || r === "refinery" || r === "construction" || r === "constructionship") return "warning"
  // Support — green/success
  if (c === "support" || r === "medical" || r === "repair" || r === "refueling") return "success"
  // Transport — purple/secondary
  if (c === "transporter" || c === "transport" || r.includes("freight")) return "secondary"
  // Competition — cyan/primary
  if (r === "racer" || r === "racing" || c === "competition") return "primary"

  return "default"
}

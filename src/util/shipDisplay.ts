const ROLE_LABELS: Record<string, string> = {
  lightfighter: "Light Fighter",
  mediumfighter: "Medium Fighter",
  heavyfighter: "Heavy Fighter",
  stealthfighter: "Stealth Fighter",
  stealthbomber: "Stealth Bomber",
  lightfreight: "Light Freight",
  mediumfreight: "Medium Freight",
  heavyfreight: "Heavy Freight",
  lightmining: "Light Mining",
  mediummining: "Medium Mining",
  heavymining: "Heavy Mining",
  lightsalvage: "Light Salvage",
  mediumsalvage: "Medium Salvage",
  heavysalvage: "Heavy Salvage",
  pathfinder: "Pathfinder",
  dropship: "Dropship",
  gunship: "Gunship",
  bomber: "Bomber",
  interceptor: "Interceptor",
  racer: "Racer",
  touring: "Touring",
  refueling: "Refueling",
  repair: "Repair",
  medical: "Medical",
  reporting: "Reporting",
  datarunning: "Data Running",
  exploration: "Exploration",
  refinery: "Refinery",
  corvette: "Corvette",
  frigate: "Frigate",
  destroyer: "Destroyer",
  carrier: "Carrier",
  constructionship: "Construction Ship",
  scienceship: "Science Ship",
  racing: "Racing",
  competition: "Competition",
  snub: "Snub",
}

const CAREER_LABELS: Record<string, string> = {
  combat: "Combat",
  exploration: "Exploration",
  industrial: "Industrial",
  support: "Support",
  transporter: "Transport",
  transport: "Transport",
  competition: "Competition",
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

  if (c === "combat" || r.includes("fighter") || r.includes("bomber") || r === "gunship" || r === "interceptor") return "error"
  if (c === "exploration" || r === "pathfinder" || r === "exploration") return "info"
  if (c === "industrial" || r.includes("mining") || r.includes("salvage") || r === "refinery") return "warning"
  if (c === "support" || r === "medical" || r === "repair" || r === "refueling") return "success"
  if (c === "transporter" || c === "transport" || r.includes("freight")) return "secondary"
  if (r === "racer" || r === "racing" || c === "competition") return "primary"
  return "default"
}

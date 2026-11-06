import { getMissionTypeLabel } from "../../util/missionDisplay"
import { formatShipCareer, formatShipRole } from "../../util/shipDisplay"

export interface SearchToken {
  type:
    | "query"
    | "system"
    | "category"
    | "giver"
    | "faction"
    | "tag"
    | "event"
    | "material"
    | "rarity"
    | "manufacturer"
  label: string
  value: string
}

// === Mission param conversion ===
export function missionTokensToParams(
  tokens: SearchToken[],
): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = [],
    categories: string[] = [],
    systems: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query":
        queries.push(t.value)
        break
      case "system":
        systems.push(t.value)
        break
      case "category":
        categories.push(t.value)
        break
      case "giver":
        params.giver = t.value
        break
      case "faction":
        params.faction = t.value
        break
      case "event":
        params.show_events = "true"
        params.event = t.value
        break
      case "tag":
        if (t.value === "ILLEGAL") params.legal = "ILLEGAL"
        else if (t.value === "shareable") params.shareable = "true"
        else if (t.value === "unique") params.unique = "true"
        else if (t.value === "chain") params.chain = "true"
        else if (t.value === "blueprints") params.blueprints = "true"
        break
    }
  }
  if (queries.length) params.q = queries.join(" ")
  if (categories.length) params.category = categories.join(",")
  if (systems.length) params.system = systems.join(",")
  return params
}

export function missionParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("q")
  if (q) tokens.push({ type: "query", label: q, value: q })
  sp.get("category")
    ?.split(",")
    .forEach(
      (c) =>
        c &&
        tokens.push({
          type: "category",
          label: getMissionTypeLabel(c),
          value: c,
        }),
    )
  sp.get("system")
    ?.split(",")
    .forEach((s) => s && tokens.push({ type: "system", label: s, value: s }))
  const giver = sp.get("giver")
  if (giver) tokens.push({ type: "giver", label: giver, value: giver })
  const faction = sp.get("faction")
  if (faction) tokens.push({ type: "faction", label: faction, value: faction })
  if (sp.get("legal") === "ILLEGAL")
    tokens.push({ type: "tag", label: "Illegal", value: "ILLEGAL" })
  if (sp.get("shareable") === "true")
    tokens.push({ type: "tag", label: "Shareable", value: "shareable" })
  if (sp.get("chain") === "true")
    tokens.push({ type: "tag", label: "Chain Starter", value: "chain" })
  if (sp.get("blueprints") === "true")
    tokens.push({ type: "tag", label: "Has Blueprints", value: "blueprints" })
  const event = sp.get("event")
  if (event) tokens.push({ type: "event", label: event, value: event })
  return tokens
}

// === Blueprint param conversion ===
export function blueprintTokensToParams(
  tokens: SearchToken[],
): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query":
        queries.push(t.value)
        break
      case "category":
        params.category = t.value
        break
      case "material":
        params.ingredient = t.value
        break
      case "rarity":
        params.rarity = t.value
        break
      case "manufacturer":
        params.mfr = t.value
        break
      case "tag":
        if (t.value === "default") params.source = "default"
        else if (t.value === "mission_reward") params.source = "mission_reward"
        else if (t.value === "has_missions") params.missions = "true"
        else if (t.value === "owned") params.owned = "true"
        break
    }
  }
  if (queries.length) params.q = queries.join(" ")
  return params
}

export function blueprintParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("q")
  if (q) tokens.push({ type: "query", label: q, value: q })
  const cat = sp.get("category")
  if (cat) tokens.push({ type: "category", label: cat, value: cat })
  const ing = sp.get("ingredient")
  if (ing) tokens.push({ type: "material", label: ing, value: ing })
  const rar = sp.get("rarity")
  if (rar) tokens.push({ type: "rarity", label: rar, value: rar })
  const mfr = sp.get("mfr")
  if (mfr) tokens.push({ type: "manufacturer", label: mfr, value: mfr })
  const src = sp.get("source")
  if (src === "default")
    tokens.push({ type: "tag", label: "Default", value: "default" })
  if (src === "mission_reward")
    tokens.push({
      type: "tag",
      label: "Mission Reward",
      value: "mission_reward",
    })
  if (sp.get("missions") === "true")
    tokens.push({
      type: "tag",
      label: "Has Mission Source",
      value: "has_missions",
    })
  if (sp.get("owned") === "true")
    tokens.push({ type: "tag", label: "Owned", value: "owned" })
  return tokens
}

// === Market param conversion ===
export function marketTokensToParams(
  tokens: SearchToken[],
): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query":
        queries.push(t.value)
        break
      case "category":
        params.type = t.value
        break
      case "tag":
        if (t.value === "has_photos") params.has_photos = "true"
        else if (t.value === "in_stock") params.in_stock = "true"
        else if (t.value === "bulk_discount") params.bulk_discount = "true"
        break
    }
  }
  if (queries.length) params.query = queries.join(" ")
  return params
}

export function marketParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("query") || sp.get("q")
  if (q) tokens.push({ type: "query", label: q, value: q })
  const type = sp.get("type")
  if (type) tokens.push({ type: "category", label: type, value: type })
  if (sp.get("has_photos") === "true")
    tokens.push({ type: "tag", label: "Has Photos", value: "has_photos" })
  if (sp.get("in_stock") === "true")
    tokens.push({ type: "tag", label: "In Stock", value: "in_stock" })
  if (sp.get("bulk_discount") === "true")
    tokens.push({ type: "tag", label: "Bulk Discount", value: "bulk_discount" })
  return tokens
}

// === Mining param conversion ===
export function miningTokensToParams(
  tokens: SearchToken[],
): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query":
        queries.push(t.value)
        break
      case "system":
        params.system = t.value
        break
      case "rarity":
        params.rarity = t.value
        break
      case "category":
        params.mining_method = t.value
        break
    }
  }
  if (queries.length) params.q = queries.join(" ")
  return params
}

export function miningParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("q")
  if (q) tokens.push({ type: "query", label: q, value: q })
  const sys = sp.get("system")
  if (sys) tokens.push({ type: "system", label: sys, value: sys })
  const rar = sp.get("rarity")
  if (rar)
    tokens.push({
      type: "rarity",
      label: rar.charAt(0).toUpperCase() + rar.slice(1),
      value: rar,
    })
  const method = sp.get("mining_method")
  if (method) {
    const label =
      method === "ship"
        ? "Ship Mining"
        : method === "ground"
          ? "Ground Vehicle (ROC)"
          : "Hand Mining (FPS)"
    tokens.push({ type: "category", label, value: method })
  }
  return tokens
}

// === Location param conversion ===
export function locationTokensToParams(
  tokens: SearchToken[],
): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query":
        queries.push(t.value)
        break
      case "system":
        params.system = t.value
        break
      case "category":
        params.location_type = t.value
        break
      case "tag":
        if (t.value === "refinery") params.refinery = "true"
        break
    }
  }
  if (queries.length) params.q = queries.join(" ")
  return params
}

export function locationParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("q")
  if (q) tokens.push({ type: "query", label: q, value: q })
  const sys = sp.get("system")
  if (sys) tokens.push({ type: "system", label: sys, value: sys })
  const lt = sp.get("location_type")
  if (lt) {
    tokens.push({
      type: "category",
      label: lt === "surface" ? "Surface" : "Asteroid Field",
      value: lt,
    })
  }
  if (sp.get("refinery") === "true")
    tokens.push({ type: "tag", label: "Has Refinery", value: "refinery" })
  return tokens
}

// === Wiki Items param conversion ===
export function wikiItemsTokensToParams(
  tokens: SearchToken[],
): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query":
        queries.push(t.value)
        break
      case "category":
        params.type = t.value
        break
      case "manufacturer":
        params.manufacturer = t.value
        break
    }
  }
  if (queries.length) params.q = queries.join(" ")
  return params
}

export function wikiItemsParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("q")
  if (q) tokens.push({ type: "query", label: q, value: q })
  const type = sp.get("type")
  if (type) tokens.push({ type: "category", label: type, value: type })
  const mfr = sp.get("manufacturer")
  if (mfr) tokens.push({ type: "manufacturer", label: mfr, value: mfr })
  return tokens
}

// === Ships param conversion ===
export function shipsTokensToParams(
  tokens: SearchToken[],
): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query":
        queries.push(t.value)
        break
      case "category":
        params.career = t.value
        break
      case "manufacturer":
        params.manufacturer = t.value
        break
      case "faction":
        params.role = t.value
        break
      case "tag":
        params.size = t.value
        break
    }
  }
  if (queries.length) params.q = queries.join(" ")
  return params
}

export function shipsParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("q")
  if (q) tokens.push({ type: "query", label: q, value: q })
  const career = sp.get("career")
  if (career)
    tokens.push({
      type: "category",
      label: formatShipCareer(career),
      value: career,
    })
  const mfr = sp.get("manufacturer")
  if (mfr) tokens.push({ type: "manufacturer", label: mfr, value: mfr })
  const role = sp.get("role")
  if (role)
    tokens.push({ type: "faction", label: formatShipRole(role), value: role })
  // Labels are resolved (translated) at render; see tokenLabel.
  const size = sp.get("size")
  if (size) tokens.push({ type: "tag", label: size, value: size })
  return tokens
}

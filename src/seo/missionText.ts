/**
 * Plain-text mission copy shared by the SPA, the edge bridge and the SSR
 * pages (Phase 4): readable titles, the one-line summary, the /missions
 * capability text and the game-data freshness stamp. Pure: no React, no
 * browser globals, so it runs in Workers and at build time.
 */
import type { GameVersion, Mission, MissionRewardPool } from "../store/api/v2/market"

/** Game placeholder words → readable ones ([TARGET NAME] → "Target"). */
const PLACEHOLDER_WORDS: Record<string, string> = {
  "TARGET NAME": "Target",
  TARGET: "Target",
  CONTRACTOR: "Contractor",
  "CARGO GRADE TOKEN": "Cargo",
  "CARGO GRADE": "Cargo",
  "SYSTEM NAME": "System",
  "SHIP NAME": "Ship",
}

/** "TARGET NAME" / "TargetName" → "Target"; unknown ones title-cased without "Name"/"Token". */
function readablePlaceholder(raw: string): string {
  const spaced = raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_|]+/g, " ")
    .trim()
  const upper = spaced.toUpperCase()
  if (PLACEHOLDER_WORDS[upper]) return PLACEHOLDER_WORDS[upper]
  const words = upper.split(/\s+/).filter((w) => w !== "NAME" && w !== "TOKEN")
  const text = (words.length ? words : upper.split(/\s+/))
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ")
  return text || "Unknown"
}

/**
 * A mission name or description without game markup: `<em>` tags dropped,
 * `~mission(Key|…)` and `[KEY]` placeholders replaced with readable words.
 */
export function readableMissionText(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .replace(/<\/?em\d*>/gi, "")
    .replace(/~mission\(([^|)]+)\|?[^)]*\)/g, (_, key: string) => readablePlaceholder(key))
    .replace(/\[([A-Z][A-Z0-9 _/]*)\]/g, (_, key: string) => readablePlaceholder(key))
    .replace(/\\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim()
}

type MissionNameFields = Pick<
  Mission,
  "mission_name" | "mission_giver_org" | "faction" | "star_system" | "required_rank" | "rank_index" | "min_standing_display"
>

/** "Vaughn, Rank 0, Stanton": what tells same-named missions apart. */
export function missionDisambiguator(m: MissionNameFields): string {
  const rank =
    typeof m.rank_index === "number"
      ? `Rank ${m.rank_index}`
      : typeof m.required_rank === "number"
        ? `Rank ${m.required_rank}`
        : m.min_standing_display || null
  return [m.mission_giver_org || m.faction, rank, m.star_system].filter(Boolean).join(", ")
}

/** "A Chance to Impress — Vaughn, Rank 0, Stanton" (unique across the database). */
export function missionTitle(m: MissionNameFields): string {
  const name = readableMissionText(m.mission_name) || "Unknown mission"
  const extra = missionDisambiguator(m)
  return extra ? `${name} — ${extra}` : name
}

function aUEC(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} aUEC`
}

/** "12,000–25,000 aUEC", "12,000 aUEC" or null. */
export function missionRewardRange(m: Pick<Mission, "credit_reward_min" | "credit_reward_max">): string | null {
  const min = m.credit_reward_min ?? null
  const max = m.credit_reward_max ?? null
  if (min && max && max > min) return `${Math.round(min).toLocaleString("en-US")}–${aUEC(max)}`
  const one = max || min
  return one ? aUEC(one) : null
}

/** The blueprint with the best drop chance, over every reward pool. */
export function bestBlueprintDrop(
  pools: MissionRewardPool[] | undefined,
): { name: string; probability: number; guaranteed: boolean } | null {
  let best: { name: string; probability: number; guaranteed: boolean } | null = null
  for (const pool of pools ?? []) {
    for (const bp of pool.blueprints ?? []) {
      const probability = bp.is_guaranteed ? 100 : dropPercent(bp.drop_probability)
      if (!Number.isFinite(probability)) continue
      if (!best || probability > best.probability) {
        best = { name: bp.output_item_name || bp.blueprint_name, probability, guaranteed: bp.is_guaranteed }
      }
    }
  }
  return best
}

/**
 * A drop probability as a percentage. The data has both forms: 2.5 (a
 * percentage) and 0.25 (a fraction); like the mission page, values below 1
 * are fractions.
 */
export function dropPercent(value: number | null | undefined): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return n >= 1 ? n : n * 100
}

/** "2.5%", "100%", "0.25%". */
export function formatPercent(value: number): string {
  return `${Number(value.toFixed(value < 1 ? 2 : 1))}%`
}

function legality(m: Pick<Mission, "legal_status" | "is_illegal" | "is_lawful">): string | null {
  if (m.legal_status === "ILLEGAL" || m.is_illegal) return "illegal"
  if (m.legal_status === "LEGAL" || m.is_lawful || m.is_illegal === false) return "legal"
  return null
}

/** "bounty hunting", from career_type / category ("BountyHunting" → "bounty hunting"). */
export function missionType(m: Pick<Mission, "career_type" | "category" | "mission_type">): string | null {
  const raw = m.career_type || m.mission_type || m.category
  if (!raw) return null
  return raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .trim()
}

/**
 * The quotable one-liner at the top of a mission page: "<Title> is a legal
 * delivery mission from Covalex in Stanton, paying 12,000–25,000 aUEC, with a
 * 2.5% chance to drop the P8-AR Rifle blueprint."
 */
export function missionSummaryLine(
  m: Mission,
  pools: MissionRewardPool[] | undefined,
): string {
  const name = readableMissionText(m.mission_name) || "This mission"
  const kind = [legality(m), missionType(m)].filter(Boolean).join(" ")
  const giver = m.mission_giver_org || m.faction
  const where = m.star_system || m.planet_moon
  const reward = missionRewardRange(m)
  const drop = bestBlueprintDrop(pools)
  const article = /^[aeiou]/i.test(kind || "mission") ? "an" : "a"
  let line = `${name} is ${article} ${kind ? `${kind} ` : ""}Star Citizen mission`
  if (giver) line += ` from ${giver}`
  if (where) line += ` in ${where}`
  if (reward) line += `, paying ${reward}`
  if (drop) {
    line += drop.guaranteed
      ? `, and always rewards the ${drop.name} blueprint`
      : `, with a ${formatPercent(drop.probability)} chance to drop the ${drop.name} blueprint`
  }
  return `${line}.`
}

/** { number: "4.10.2", type: "LIVE", build: "12881860" } from "4.10.2-LIVE.12881860". */
export function parseGameVersion(v: Pick<GameVersion, "version_number" | "version_type" | "build_number">): {
  number: string
  type: string
  build: string | null
} {
  const match = /^([\d.]+)-(LIVE|PTU|EPTU)\.(\d+)$/.exec(v.version_number)
  return {
    number: match ? match[1] : v.version_number,
    type: match ? match[2] : v.version_type,
    build: v.build_number || (match ? match[3] : null),
  }
}

/**
 * "Data from Star Citizen 4.10.2 LIVE, updated 24 Oct 2026 (build 12881860)."
 * for mission, blueprint and item pages and their hubs. Null without a version.
 */
export function freshnessStamp(v: GameVersion | null | undefined): string | null {
  if (!v) return null
  const { number, type, build } = parseGameVersion(v)
  const date = v.last_data_update ? new Date(v.last_data_update) : null
  const updated =
    date && !Number.isNaN(date.getTime())
      ? `, updated ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`
      : ""
  return `Data from Star Citizen ${number} ${type}${updated}${build ? ` (build ${build})` : ""}.`
}

/** JSON-LD dateModified for game-data pages: the version's last import. */
export function gameDataDateModified(v: GameVersion | null | undefined): string | undefined {
  if (!v?.last_data_update) return undefined
  const date = new Date(v.last_data_update)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/**
 * What /missions lets you do, stated concretely (server-rendered on the hub,
 * so answer engines can describe it). `missionCount` from the search total.
 */
export function missionsCapabilityText(missionCount?: number): string[] {
  const count = missionCount ? `${missionCount.toLocaleString("en-US")} ` : ""
  return [
    `SC Market's mission database lists ${count}Star Citizen missions from the current game files.`,
    "Filter missions by faction, mission giver, star system, legality, required rank and type (bounty hunting, hauling, mercenary, salvage, delivery and more).",
    "Each mission shows its aUEC reward range, the reputation it gives or takes, the standing it requires, time limits, cooldowns and crimestat limits, hauling orders, and ship and NPC encounters.",
    "Only on SC Market: blueprint drop probabilities for every mission reward, community difficulty and satisfaction ratings, and links from rewards to the items on the player market.",
    "The rank calculator works out how many missions take you to the next reputation rank.",
  ]
}

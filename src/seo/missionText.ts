/**
 * Plain-text mission copy shared by the mission page (SPA and SSR), its head
 * (gameDataHeads.ts buildMissionHead, which the edge bridge uses too) and
 * any crawler summary: readable placeholders, a disambiguated title, a
 * quotable one-line summary and the game-data freshness stamp. Pure (no
 * React), so every renderer says the same thing.
 */
import type { Mission, MissionDetailResponse } from "../store/api/v2/market"
import { getMissionTypeLabel } from "../util/missionDisplay"

/** "TargetName" / "target_name" -> "Target Name". */
function words(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** The game's placeholder tokens, as readable words. */
export interface MissionTextPart {
  text: string
  /** A placeholder the game fills in at runtime (render it distinctly). */
  placeholder: boolean
}

/**
 * Split mission text into literal parts and readable placeholders:
 * `~mission(Contractor|…)` is the mission giver (or "Various"),
 * `~mission(TargetName)` and `[TARGET NAME]` become "Target Name".
 * `<em>` tags and literal "\n" escapes are cleaned up.
 */
export function missionTextParts(
  text: string | null | undefined,
  giver?: string | null,
): MissionTextPart[] {
  if (!text) return []
  const cleaned = text.replace(/<\/?em\d*>/gi, "").replace(/\\n/g, "\n")
  const parts: MissionTextPart[] = []
  const token = /~mission\(([^)]+)\)|\[([A-Z][A-Z0-9 _/]*)\]/g
  let last = 0
  for (const match of cleaned.matchAll(token)) {
    if (match.index! > last) {
      parts.push({ text: cleaned.slice(last, match.index), placeholder: false })
    }
    const inner = match[1]
    if (inner !== undefined) {
      const key = inner.split("|")[0]
      parts.push(
        key === "Contractor"
          ? {
              text: usableGiver(giver) ?? "Various",
              placeholder: !usableGiver(giver),
            }
          : { text: words(inner.split("|").pop() || inner), placeholder: true },
      )
    } else {
      parts.push({ text: words(match[2]), placeholder: true })
    }
    last = match.index! + match[0].length
  }
  if (last < cleaned.length) {
    parts.push({ text: cleaned.slice(last), placeholder: false })
  }
  return parts
}

/** Mission text as plain readable text. */
export function readableMissionText(
  text: string | null | undefined,
  giver?: string | null,
): string {
  return missionTextParts(text, giver)
    .map((p) => p.text)
    .join("")
}

/** The giver's name, if it is a real name (not a ~mission token). */
export function usableGiver(giver: string | null | undefined): string | null {
  return giver && !giver.includes("~mission") && !giver.startsWith("@")
    ? giver
    : null
}

/** Who gives the mission: the giver org, else the faction. */
export function missionGiver(
  m: Pick<Mission, "mission_giver_org" | "faction">,
): string | null {
  return usableGiver(m.mission_giver_org) ?? usableGiver(m.faction)
}

/**
 * The mission's name, disambiguated: many missions share a name ("Additional
 * Resources For Research" exists per giver and grade), so the title adds
 * the giver and the mission type, e.g. "Additional Resources For Research
 * (Rayari Incorporated, Collection)".
 */
export function missionDisplayTitle(
  m: Pick<
    Mission,
    | "mission_name"
    | "mission_giver_org"
    | "faction"
    | "category"
    | "star_system"
  >,
): string {
  const name = readableMissionText(m.mission_name, missionGiver(m)) || "Mission"
  const qualifiers = [
    missionGiver(m),
    m.category ? getMissionTypeLabel(m.category) : null,
    m.star_system,
  ].filter((q): q is string => !!q && !name.includes(q))
  return qualifiers.length > 0 ? `${name} (${qualifiers.join(", ")})` : name
}

function percent(p: number): string {
  const value = p >= 1 ? p : p * 100
  return `${Number(value.toFixed(value < 10 ? 1 : 0))}%`
}

/**
 * A quotable one-line summary of the mission: what it is, who gives it,
 * what it pays and the best blueprint odds.
 */
export function missionSummary(data: MissionDetailResponse): string {
  const m = data.mission
  const name =
    readableMissionText(m.mission_name, missionGiver(m)) || "This mission"
  const type = m.category ? getMissionTypeLabel(m.category) : null
  const giver = missionGiver(m)
  const where = [m.star_system, m.planet_moon].filter(Boolean).join(", ")
  let sentence = `${name} is a${type && /^[aeiou]/i.test(type) ? "n" : ""} ${type ? `${type} ` : ""}Star Citizen mission`
  if (giver) sentence += ` from ${giver}`
  if (where) sentence += ` in ${where}`

  const pays: string[] = []
  if (m.credit_reward_max && m.credit_reward_max > 0) {
    pays.push(
      m.credit_reward_min && m.credit_reward_min !== m.credit_reward_max
        ? `${m.credit_reward_min.toLocaleString("en-US")}-${m.credit_reward_max.toLocaleString("en-US")} aUEC`
        : `${m.credit_reward_max.toLocaleString("en-US")} aUEC`,
    )
  }
  if (m.reputation_reward && m.reputation_reward > 0) {
    const faction = usableGiver(m.reputation_reward_faction)
    pays.push(
      `${m.reputation_reward.toLocaleString("en-US")} reputation${faction ? ` with ${faction}` : ""}`,
    )
  }
  if (pays.length > 0) sentence += ` that pays ${pays.join(" and ")}`

  const blueprints = (data.blueprint_rewards ?? []).flatMap((pool) =>
    (pool.blueprints ?? []).map((bp) => ({
      chance:
        (pool.pool_chance ?? 1) *
        (bp.drop_probability >= 1
          ? bp.drop_probability / 100
          : bp.drop_probability),
    })),
  )
  if (blueprints.length > 0) {
    const best = Math.max(...blueprints.map((b) => b.chance))
    sentence += `${pays.length > 0 ? "," : ""} with ${blueprints.length} possible blueprint reward${blueprints.length === 1 ? "" : "s"} (best chance ${percent(best)} per completion)`
  }
  return `${sentence}.`
}

/** The LIVE game version as getActiveVersions returns it. */
export interface LiveVersion {
  version_number?: string
  last_data_update?: string
}

/**
 * "Data from Star Citizen 4.10.2 LIVE, updated 24 Oct 2026, from game
 * files": the build number without its "-LIVE.<changelist>" suffix, and
 * the date of the last game-data import (UTC, so server and browser agree).
 */
export function gameDataFreshness(
  live: LiveVersion | null | undefined,
): string | null {
  if (!live?.version_number) return null
  const build = live.version_number.replace(/-LIVE.*$/i, "")
  const date = live.last_data_update ? new Date(live.last_data_update) : null
  const when =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      : null
  return `Data from Star Citizen ${build} LIVE${when ? `, updated ${when}` : ""}, from game files`
}

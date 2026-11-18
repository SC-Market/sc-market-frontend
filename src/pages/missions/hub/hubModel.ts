/**
 * Mission hub page model: pure functions from the hub response to what the
 * page shows (stat tiles, rank ladder, mission groups, facts, the "filter in
 * mission search" link). No React; tested in __tests__/hubModel.test.ts.
 *
 * The hub's numbers cover all its missions (the API sums them); the list
 * is the page of missions the API returned for the current filters.
 */
import type {
  MissionHubDetailResponse,
  MissionHubKind,
  MissionHubLadder,
  MissionHubMission,
  MissionHubSort,
} from "../../../store/api/v2/market"
import { missionGiver } from "../../../seo/missionText"
import {
  missionHubLadder,
  MISSION_HUB_PAGE_SIZE,
  type HubTranslate,
} from "../../../seo/missionHubs"
import { formatInteger } from "../../../util/format/format"

/** The list's filters (sent to the API, so they span every page). */
export interface HubListFilters {
  /** Type slug, "none" for missions without a type */
  type?: string
  /** Rank index on the hub's main ladder */
  maxRank?: number
  hasBlueprints?: boolean
  sort: MissionHubSort
}

export const DEFAULT_HUB_FILTERS: HubListFilters = { sort: "name" }

/** True when any filter narrows the list. */
export function hasActiveFilters(f: HubListFilters): boolean {
  return f.type !== undefined || f.maxRank !== undefined || !!f.hasBlueprints
}

/**
 * How the list is laid out: grouped by required rank (giver and faction
 * hubs with rank data), by giver (type and system hubs), by type (giver and
 * faction hubs without rank data), or a flat list when the hub doesn't fit
 * on one page (groups split across pages would mislead) or a non-name sort
 * is picked.
 */
export type HubListMode = "rank" | "giver" | "type" | "flat"

export function hubIsPaginated(
  hub: Pick<MissionHubDetailResponse, "mission_count">,
): boolean {
  return hub.mission_count > MISSION_HUB_PAGE_SIZE
}

export function hubListMode(
  hub: Pick<MissionHubDetailResponse, "kind" | "ladders" | "mission_count">,
  sort: MissionHubSort,
): HubListMode {
  if (hubIsPaginated(hub) || sort !== "name") return "flat"
  if (hub.kind === "types" || hub.kind === "systems") return "giver"
  return missionHubLadder(hub) ? "rank" : "type"
}

/**
 * Mission types without a career type, named by category (the API's
 * CATEGORY_TYPE_NAMES in mission-hubs.ts; its type_counts use the same).
 */
const CATEGORY_TYPE_NAMES: Record<string, string> = {
  refueling: "Refueling",
  servicebeacon: "Service Beacon",
}

/** The mission's type name, or null when the game files list none. */
export function missionTypeName(
  m: Pick<MissionHubMission, "career_type" | "category">,
): string | null {
  return m.career_type || CATEGORY_TYPE_NAMES[m.category] || null
}

/** One group of the list. */
export interface HubMissionGroup {
  key: string
  title: string
  /** "800 rep", "Standing, 2,200 rep" */
  subtitle?: string
  missions: MissionHubMission[]
}

/**
 * The page's missions in groups (in the API's order within each). Rank
 * groups: the main ladder's ranks lowest first, then other ladders' ranks,
 * then missions without a rank. Giver and type groups: most missions first,
 * the "not listed" group last.
 */
export function groupHubMissions(
  missions: readonly MissionHubMission[],
  mode: Exclude<HubListMode, "flat">,
  ladder: MissionHubLadder | undefined,
  t: HubTranslate,
  lang: string,
): HubMissionGroup[] {
  if (mode === "rank") {
    const groups = new Map<string, HubMissionGroup & { order: number[] }>()
    for (const m of missions) {
      const scope = m.min_standing_scope
      const idx = m.min_standing_rank_index
      const main = !!ladder && scope === ladder.scope_code
      const ranked = scope !== undefined && idx !== undefined
      const key = ranked ? `${scope}:${idx}` : "none"
      if (!groups.has(key)) {
        const threshold = t("missionHubs.rep", {
          defaultValue: "{{n}} rep",
          n: formatInteger(m.min_standing_threshold ?? 0, lang),
        })
        groups.set(key, {
          key,
          title: ranked
            ? (m.min_standing_display ?? String(idx))
            : t("missionHubs.list.rankNotListed", {
                defaultValue: "Rank not listed",
              }),
          subtitle: ranked
            ? main
              ? threshold
              : t("missionHubs.list.otherLadder", {
                  defaultValue: "another ladder, {{threshold}}",
                  threshold,
                })
            : t("missionHubs.list.rankNotListedHint", {
                defaultValue: "the game data has no standing requirement",
              }),
          missions: [],
          // main ladder by rank; other ladders by scope then rank; no rank last
          order: ranked ? [main ? 0 : 1, idx] : [2, 0],
        })
      }
      groups.get(key)!.missions.push(m)
    }
    return [...groups.values()]
      .sort(
        (a, b) =>
          a.order[0] - b.order[0] ||
          a.key.split(":")[0].localeCompare(b.key.split(":")[0]) ||
          a.order[1] - b.order[1],
      )
      .map((g) => ({
        key: g.key,
        title: g.title,
        subtitle: g.subtitle,
        missions: g.missions,
      }))
  }

  const label = (m: MissionHubMission): string | null =>
    mode === "giver" ? missionGiver(m) : missionTypeName(m)
  const groups = new Map<string, HubMissionGroup>()
  for (const m of missions) {
    const name = label(m)
    const key = name ?? ""
    if (!groups.has(key)) {
      groups.set(key, {
        key: key || "none",
        title:
          name ??
          (mode === "giver"
            ? t("missionHubs.list.giverNotListed", {
                defaultValue: "Giver not listed",
              })
            : t("missionHubs.list.noType", { defaultValue: "No type listed" })),
        missions: [],
      })
    }
    groups.get(key)!.missions.push(m)
  }
  return [...groups.entries()]
    .sort(
      ([ka, a], [kb, b]) =>
        Number(ka === "") - Number(kb === "") ||
        b.missions.length - a.missions.length ||
        a.title.localeCompare(b.title),
    )
    .map(([, g]) => g)
}

/** One rung of the rank ladder. */
export interface LadderRung {
  rankIndex: number
  name: string
  threshold: number
  /** Missions that need exactly this rank */
  missions: number
  /** Blueprint items first rewarded here */
  newBlueprints: number
  /** Missions open at this rank (this and every lower rank) */
  open: number
  /** open / the ladder's missions, 0–1 (the bar) */
  share: number
}

export function ladderRungs(ladder: MissionHubLadder): LadderRung[] {
  let open = 0
  return ladder.ranks.map((r) => {
    open += r.mission_count
    return {
      rankIndex: r.rank_index,
      name: r.display_name,
      threshold: r.threshold,
      missions: r.mission_count,
      newBlueprints: r.new_blueprint_count,
      open,
      share: ladder.mission_count > 0 ? open / ladder.mission_count : 0,
    }
  })
}

/** One stat tile. */
export interface HubStatTile {
  key: string
  label: string
  value: string
  note: string
}

/**
 * The stat tiles. Missions and legality always; reputation, aUEC and
 * blueprints only when the hub's missions list them.
 */
export function hubStatTiles(
  hub: MissionHubDetailResponse,
  t: HubTranslate,
  lang: string,
): HubStatTile[] {
  const n = (v: number) => formatInteger(v, lang)
  const range = (min: number, max: number) =>
    min === max ? n(max) : `${n(min)}–${n(max)}`
  const total = hub.mission_count
  const tiles: HubStatTile[] = []
  const types = hub.type_counts.length
  tiles.push({
    key: "missions",
    label: t("missionHubs.tiles.missions", { defaultValue: "Missions" }),
    value: n(total),
    // A type hub's missions are all one type: no breakdown.
    note:
      hub.kind === "types"
        ? ""
        : hub.untyped_count > 0
          ? t("missionHubs.tiles.typesUntyped", {
              defaultValue:
                types === 1
                  ? "{{n}} type, {{untyped}} untyped"
                  : "{{n}} types, {{untyped}} untyped",
              count: types,
              n: n(types),
              untyped: n(hub.untyped_count),
            })
          : t("missionHubs.tiles.types", {
              defaultValue: types === 1 ? "{{n}} type" : "{{n}} types",
              count: types,
              n: n(types),
            }),
  })
  if (
    hub.reputation_mission_count > 0 &&
    typeof hub.reputation_min === "number" &&
    typeof hub.reputation_max === "number"
  ) {
    tiles.push({
      key: "reputation",
      label: t("missionHubs.tiles.reputation", {
        defaultValue: "Reputation per mission",
      }),
      value: range(hub.reputation_min, hub.reputation_max),
      note: t("missionHubs.tiles.ofMissions", {
        defaultValue: "{{n}} of {{total}} missions",
        n: n(hub.reputation_mission_count),
        total: n(total),
      }),
    })
  }
  if (hub.reward_mission_count > 0 && typeof hub.reward_max === "number") {
    tiles.push({
      key: "payout",
      label: t("missionHubs.tiles.payout", { defaultValue: "aUEC payout" }),
      value: range(hub.reward_min ?? hub.reward_max, hub.reward_max),
      note: t("missionHubs.tiles.listedFor", {
        defaultValue: "listed for {{n}} of {{total}}",
        n: n(hub.reward_mission_count),
        total: n(total),
      }),
    })
  }
  if (hub.blueprint_rewards.length > 0) {
    const items = hub.blueprint_rewards.length
    tiles.push({
      key: "blueprints",
      label: t("missionHubs.tiles.blueprints", {
        defaultValue: "Blueprint rewards",
      }),
      value: t("missionHubs.tiles.items", {
        defaultValue: items === 1 ? "{{n}} item" : "{{n}} items",
        count: items,
        n: n(items),
      }),
      note: t("missionHubs.tiles.fromMissions", {
        defaultValue:
          hub.blueprint_mission_count === 1
            ? "from {{n}} mission"
            : "from {{n}} missions",
        count: hub.blueprint_mission_count,
        n: n(hub.blueprint_mission_count),
      }),
    })
  }
  const allLegal = hub.illegal_count === 0 && hub.legal_count === total
  const allIllegal = hub.legal_count === 0 && hub.illegal_count === total
  tiles.push({
    key: "legality",
    label: t("missionHubs.tiles.legality", { defaultValue: "Legality" }),
    value: allLegal
      ? t("missionHubs.tiles.allLegal", { defaultValue: "All legal" })
      : allIllegal
        ? t("missionHubs.tiles.allIllegal", { defaultValue: "All illegal" })
        : t("missionHubs.tiles.legalN", {
            defaultValue: "{{n}} legal",
            n: n(hub.legal_count),
          }),
    note: allLegal
      ? t("missionHubs.tiles.noneIllegal", { defaultValue: "none illegal" })
      : t("missionHubs.tiles.illegalN", {
          defaultValue: "{{n}} illegal",
          n: n(hub.illegal_count),
        }),
  })
  return tiles
}

/** /missions?giver=… (the search's filter for the hub's value). */
export function missionSearchHref(
  hub: Pick<MissionHubDetailResponse, "kind" | "name">,
): string {
  const params = new URLSearchParams()
  switch (hub.kind as MissionHubKind) {
    case "givers":
      params.set("giver", hub.name)
      break
    case "factions":
      params.set("faction", hub.name)
      break
    case "systems":
      params.set("system", hub.name)
      break
    case "types": {
      const category = Object.entries(CATEGORY_TYPE_NAMES).find(
        ([, name]) => name === hub.name,
      )?.[0]
      if (category) params.set("category", category)
      else params.set("career", hub.name)
      break
    }
  }
  return `/missions?${params.toString()}`
}

/** The mission's aUEC: a payout (positive), a fee (negative) or none. */
export function missionPayout(
  m: Pick<MissionHubMission, "credit_reward_min" | "credit_reward_max">,
): { kind: "payout" | "fee"; min: number; max: number } | null {
  const min = m.credit_reward_min
  const max = m.credit_reward_max
  if (typeof min === "number" && min < 0)
    return { kind: "fee", min: Math.abs(min), max: Math.abs(min) }
  const hi = typeof max === "number" && max > 0 ? max : min
  if (typeof hi !== "number" || hi <= 0) return null
  const lo = typeof min === "number" && min > 0 ? min : hi
  return { kind: "payout", min: lo, max: hi }
}

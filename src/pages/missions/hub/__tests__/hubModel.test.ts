import { describe, expect, it } from "vitest"
import type {
  MissionHubDetailResponse,
  MissionHubLadder,
  MissionHubMission,
} from "../../../../store/api/v2/market"
import { englishT } from "../../../../bridge/englishT"
import {
  groupHubMissions,
  hubListMode,
  hubStatTiles,
  ladderRungs,
  missionPayout,
  missionSearchHref,
  missionTypeName,
} from "../hubModel"

const mission = (
  code: string,
  over: Partial<MissionHubMission> = {},
): MissionHubMission => ({
  mission_id: code,
  mission_code: code,
  mission_name: code,
  category: "mercenary",
  career_type: "Mercenary",
  blueprint_reward_count: 0,
  is_chain_starter: false,
  is_chain_mission: false,
  is_shareable: false,
  is_unique_mission: false,
  ship_encounter_count: 0,
  blueprint_rewards: [],
  ...over,
})

const ranked = (
  code: string,
  idx: number,
  name: string,
  threshold: number,
  scope = "faction",
) =>
  mission(code, {
    min_standing_scope: scope,
    min_standing_rank_index: idx,
    min_standing_display: name,
    min_standing_threshold: threshold,
  })

const LADDER: MissionHubLadder = {
  scope_code: "faction",
  scope_display_name: "Standing",
  mission_count: 4,
  ranks: [
    {
      rank_index: 0,
      standing_code: "r0",
      display_name: "Neutral",
      threshold: 0,
      mission_count: 1,
      new_blueprint_count: 2,
    },
    {
      rank_index: 1,
      standing_code: "r1",
      display_name: "Jr. Contractor",
      threshold: 800,
      mission_count: 3,
      new_blueprint_count: 0,
    },
    {
      rank_index: 2,
      standing_code: "r2",
      display_name: "Contractor",
      threshold: 2200,
      mission_count: 0,
      new_blueprint_count: 0,
    },
  ],
}

const HUB = {
  kind: "givers",
  slug: "intersec",
  name: "InterSec",
  version_id: "v",
  mission_count: 6,
  reward_min: 4000,
  reward_max: 175000,
  legal_count: 6,
  illegal_count: 0,
  blueprint_mission_count: 2,
  givers: [],
  factions: [],
  types: [],
  systems: [],
  reputation_min: 100,
  reputation_max: 300,
  reputation_mission_count: 5,
  reward_mission_count: 2,
  type_counts: [
    { slug: "mercenary", name: "Mercenary", mission_count: 4 },
    { slug: "collection", name: "Collection", mission_count: 1 },
  ],
  untyped_count: 1,
  unlisted_system_count: 0,
  ladders: [LADDER],
  unranked_mission_count: 2,
  blueprint_rewards: [
    {
      blueprint_code: "a",
      blueprint_name: "A",
      game_item_id: "1",
      item_name: "A",
      item_slug: "1--a",
      mission_count: 2,
    },
    {
      blueprint_code: "b",
      blueprint_name: "B",
      game_item_id: "2",
      item_name: "B",
      item_slug: "2--b",
      mission_count: 1,
    },
  ],
  filtered_count: 6,
  sort: "name",
  missions: [],
  page: 1,
  page_size: 100,
} satisfies MissionHubDetailResponse

describe("hubListMode", () => {
  it("groups one-page hubs: by rank with a ladder, by type without, by giver on type/system hubs", () => {
    expect(hubListMode(HUB, "name")).toBe("rank")
    expect(hubListMode({ ...HUB, ladders: [] }, "name")).toBe("type")
    expect(hubListMode({ ...HUB, kind: "types" }, "name")).toBe("giver")
    expect(hubListMode({ ...HUB, kind: "systems" }, "name")).toBe("giver")
  })
  it("is a flat list when the hub is paginated or sorted by something else", () => {
    expect(hubListMode({ ...HUB, mission_count: 957 }, "name")).toBe("flat")
    expect(hubListMode(HUB, "reward")).toBe("flat")
  })
  it("a faction ladder with no ranked missions is no ladder", () => {
    expect(
      hubListMode(
        { ...HUB, ladders: [{ ...LADDER, mission_count: 0 }] },
        "name",
      ),
    ).toBe("type")
  })
})

describe("groupHubMissions", () => {
  it("by rank: main ladder lowest first, other ladders, then no rank", () => {
    const groups = groupHubMissions(
      [
        ranked("b", 1, "Jr. Contractor", 800),
        mission("none"),
        ranked("other", 3, "Junior", 250, "hauling"),
        ranked("a", 0, "Neutral", 0),
        ranked("c", 1, "Jr. Contractor", 800),
      ],
      "rank",
      LADDER,
      englishT,
      "en",
    )
    expect(
      groups.map((g) => [
        g.title,
        g.subtitle,
        g.missions.map((m) => m.mission_code),
      ]),
    ).toEqual([
      ["Neutral", "0 rep", ["a"]],
      ["Jr. Contractor", "800 rep", ["b", "c"]],
      ["Junior", "another ladder, 250 rep", ["other"]],
      [
        "Rank not listed",
        "the game data has no standing requirement",
        ["none"],
      ],
    ])
  })
  it("by giver: most missions first, unlisted givers last", () => {
    const groups = groupHubMissions(
      [
        mission("1", { mission_giver_org: "Vaughn" }),
        mission("2", { mission_giver_org: "~mission(Contractor)" }),
        mission("3", { mission_giver_org: "Headhunters" }),
        mission("4", { mission_giver_org: "Headhunters" }),
      ],
      "giver",
      undefined,
      englishT,
      "en",
    )
    expect(groups.map((g) => [g.title, g.missions.length])).toEqual([
      ["Headhunters", 2],
      ["Vaughn", 1],
      ["Giver not listed", 1],
    ])
  })
  it("by type: category-named types count as typed", () => {
    const groups = groupHubMissions(
      [
        mission("1", { career_type: undefined, category: "refueling" }),
        mission("2", { career_type: undefined, category: "other" }),
        mission("3"),
      ],
      "type",
      undefined,
      englishT,
      "en",
    )
    expect(groups.map((g) => g.title)).toEqual([
      "Mercenary",
      "Refueling",
      "No type listed",
    ])
  })
})

describe("ladderRungs", () => {
  it("counts missions open at each rank and the bar share of ranked missions", () => {
    expect(
      ladderRungs(LADDER).map((r) => [
        r.name,
        r.missions,
        r.open,
        r.share,
        r.newBlueprints,
      ]),
    ).toEqual([
      ["Neutral", 1, 1, 0.25, 2],
      ["Jr. Contractor", 3, 4, 1, 0],
      ["Contractor", 0, 4, 1, 0],
    ])
  })
})

describe("hubStatTiles", () => {
  it("full hub: missions, reputation, aUEC, blueprints, legality", () => {
    expect(
      hubStatTiles(HUB, englishT, "en").map((t) => [t.label, t.value, t.note]),
    ).toEqual([
      ["Missions", "6", "2 types, 1 untyped"],
      ["Reputation per mission", "100–300", "5 of 6 missions"],
      ["aUEC payout", "4,000–175,000", "listed for 2 of 6"],
      ["Blueprint rewards", "2 items", "from 2 missions"],
      ["Legality", "All legal", "none illegal"],
    ])
  })
  it("sparse hub: tiles without data disappear", () => {
    const tiles = hubStatTiles(
      {
        ...HUB,
        reputation_mission_count: 0,
        reward_mission_count: 0,
        blueprint_rewards: [],
        untyped_count: 0,
        type_counts: [HUB.type_counts[0]],
        legal_count: 4,
        illegal_count: 2,
      },
      englishT,
      "en",
    )
    expect(tiles.map((t) => [t.key, t.value, t.note])).toEqual([
      ["missions", "6", "1 type"],
      ["legality", "4 legal", "2 illegal"],
    ])
  })
})

describe("missionSearchHref / missionPayout / missionTypeName", () => {
  it("links the mission search's filter for the hub", () => {
    expect(
      missionSearchHref({ kind: "givers", name: "InterSec Defense Solutions" }),
    ).toBe("/missions?giver=InterSec+Defense+Solutions")
    expect(missionSearchHref({ kind: "types", name: "Mercenary" })).toBe(
      "/missions?career=Mercenary",
    )
    expect(missionSearchHref({ kind: "types", name: "Refueling" })).toBe(
      "/missions?category=refueling",
    )
    expect(missionSearchHref({ kind: "systems", name: "Nyx" })).toBe(
      "/missions?system=Nyx",
    )
    expect(missionSearchHref({ kind: "factions", name: "Covalex" })).toBe(
      "/missions?faction=Covalex",
    )
  })
  it("tells payouts from fees", () => {
    expect(
      missionPayout({ credit_reward_min: 4000, credit_reward_max: 6000 }),
    ).toEqual({ kind: "payout", min: 4000, max: 6000 })
    expect(
      missionPayout({ credit_reward_min: undefined, credit_reward_max: 500 }),
    ).toEqual({ kind: "payout", min: 500, max: 500 })
    expect(
      missionPayout({ credit_reward_min: -2000, credit_reward_max: undefined }),
    ).toEqual({ kind: "fee", min: 2000, max: 2000 })
    expect(missionPayout({})).toBeNull()
  })
  it("names a mission's type like the API", () => {
    expect(missionTypeName({ career_type: "Delivery", category: "x" })).toBe(
      "Delivery",
    )
    expect(
      missionTypeName({ career_type: undefined, category: "servicebeacon" }),
    ).toBe("Service Beacon")
    expect(
      missionTypeName({ career_type: undefined, category: "x" }),
    ).toBeNull()
  })
})

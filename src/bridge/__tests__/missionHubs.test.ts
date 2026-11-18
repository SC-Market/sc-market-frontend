import { describe, expect, it, vi } from "vitest"
import i18next from "i18next"
import en from "../../locales/en/english.json"
import { BRIDGE_PAGES, type PageContext, type SummaryBlock } from "../pages"
import { englishT } from "../englishT"
import { matchBridgeRoute } from "../routes"
import type {
  MissionHubDetailResponse,
  MissionHubMission,
  MissionHubsResponse,
} from "../../store/api/v2/market"
import {
  missionCountText,
  missionHubIndexText,
  missionHubIntro,
  missionHubText,
} from "../../seo/missionHubs"
import { isPaginatedPath } from "../../seo/queryIndexing"
import * as f from "./fixtures"

const ORIGIN = "https://sc-market.space"
const VERSION = {
  version_id: "v",
  version_number: "4.3.2-LIVE.11111",
  version_type: "LIVE",
  is_active: true,
  last_data_update: "2026-10-24T00:00:00.000Z",
} as never

function ctx(
  params: Record<string, string>,
  pageNumber = 1,
  related: Record<string, unknown> = { versions: { LIVE: VERSION } },
): PageContext {
  return { params, origin: ORIGIN, pathname: "/x", pageNumber, related }
}

function mission(code: string, name: string): MissionHubMission {
  return {
    mission_id: code,
    mission_code: code,
    mission_name: name,
    category: "mercenary",
    career_type: "Mercenary",
    star_system: "Pyro",
    mission_giver_org: "Headhunters",
    faction: "Headhunters",
    credit_reward_min: 3000,
    credit_reward_max: 12000,
    blueprint_reward_count: 0,
    is_chain_starter: false,
    is_chain_mission: false,
    is_shareable: false,
    is_unique_mission: false,
    is_illegal: true,
    ship_encounter_count: 0,
    blueprint_rewards: [],
  }
}

const HUB: MissionHubDetailResponse = {
  kind: "givers",
  slug: "headhunters",
  name: "Headhunters",
  version_id: "v",
  mission_count: 456,
  reward_min: 3000,
  reward_max: 175000,
  legal_count: 135,
  illegal_count: 321,
  blueprint_mission_count: 12,
  givers: [],
  factions: [{ slug: "headhunters", name: "Headhunters", mission_count: 450 }],
  types: [
    { slug: "mercenary", name: "Mercenary", mission_count: 308 },
    { slug: "bounty-hunter", name: "Bounty Hunter", mission_count: 46 },
    { slug: "investigation", name: "Investigation", mission_count: 40 },
    { slug: "priority", name: "Priority", mission_count: 21 },
  ],
  systems: [
    { slug: "pyro", name: "Pyro", mission_count: 320 },
    { slug: "nyx", name: "Nyx", mission_count: 56 },
    { slug: "stanton", name: "Stanton", mission_count: 54 },
  ],
  reputation_min: 1000,
  reputation_max: 5000,
  reputation_mission_count: 400,
  reward_mission_count: 300,
  type_counts: [
    { slug: "mercenary", name: "Mercenary", mission_count: 308 },
    { slug: "bounty-hunter", name: "Bounty Hunter", mission_count: 46 },
    { slug: "investigation", name: "Investigation", mission_count: 40 },
    { slug: "priority", name: "Priority", mission_count: 21 },
    { slug: "delivery", name: "Delivery", mission_count: 12 },
  ],
  untyped_count: 29,
  unlisted_system_count: 26,
  ladders: [
    {
      scope_code: "factionreputationscope",
      scope_display_name: "Standing",
      mission_count: 300,
      ranks: [
        {
          rank_index: 0,
          standing_code: "r0",
          display_name: "Neutral",
          threshold: 0,
          mission_count: 100,
          new_blueprint_count: 0,
        },
        {
          rank_index: 1,
          standing_code: "r1",
          display_name: "Jr. Contractor",
          threshold: 800,
          mission_count: 150,
          new_blueprint_count: 1,
        },
        {
          rank_index: 2,
          standing_code: "r2",
          display_name: "Contractor",
          threshold: 2200,
          mission_count: 50,
          new_blueprint_count: 0,
        },
        {
          rank_index: 3,
          standing_code: "r3",
          display_name: "Sr. Contractor",
          threshold: 5800,
          mission_count: 0,
          new_blueprint_count: 0,
        },
      ],
    },
  ],
  unranked_mission_count: 156,
  blueprint_rewards: [
    {
      blueprint_code: "c",
      blueprint_name: "BP_CRAFT_pistol",
      game_item_id: "8bb2fca8-0000-0000-0000-000000000000",
      item_name: "Volt Pistol",
      item_slug: "8bb2fca8--volt-pistol",
      mission_count: 12,
      min_rank_index: 1,
    },
  ],
  filtered_count: 456,
  sort: "name",
  missions: [
    mission("HH_A", "Finish the job"),
    mission("HH B/2", "Sweep and Clear"),
  ],
  page: 1,
  page_size: 100,
}

const HUBS: MissionHubsResponse = {
  version_id: "v",
  total_missions: 3237,
  givers: [
    {
      slug: "covalex-independent-contractors",
      name: "Covalex Independent Contractors",
      mission_count: 639,
    },
    { slug: "headhunters", name: "Headhunters", mission_count: 456 },
    {
      slug: "citizens-for-prosperity",
      name: "Citizens for Prosperity",
      mission_count: 338,
    },
    {
      slug: "red-wind-linehaul",
      name: "Red Wind Linehaul",
      mission_count: 258,
    },
  ],
  factions: [],
  types: [],
  systems: [{ slug: "stanton", name: "Stanton", mission_count: 1318 }],
}

const texts = (summary: SummaryBlock[]) =>
  summary.map((b) => ("text" in b ? b.text : ""))
const links = (summary: SummaryBlock[]) =>
  summary.flatMap((b) => (b.tag === "ul" ? b.links : []))

describe("mission hub text", () => {
  const i18n = i18next.createInstance()
  i18n.init({
    lng: "en",
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
    initAsync: false,
  })
  const t = i18n.t.bind(i18n)

  it("englishT renders it exactly like the SPA's i18next", () => {
    expect(missionHubIntro(HUB, englishT, "en")).toEqual(
      missionHubIntro(HUB, t, "en"),
    )
    expect(missionHubText(HUB, englishT)).toEqual(missionHubText(HUB, t))
    expect(missionHubIndexText("givers", HUBS.givers, englishT, "en")).toEqual(
      missionHubIndexText("givers", HUBS.givers, t, "en"),
    )
    expect(missionCountText(1, englishT, "en")).toBe("1 mission")
    expect(missionCountText(1, t, "en")).toBe("1 mission")
    expect(missionCountText(2, englishT, "en")).toBe("2 missions")
  })

  it("summary: only data — lead (systems, types, legality), then reputation, aUEC, blueprints and ranks", () => {
    expect(missionHubIntro(HUB, englishT, "en")).toEqual([
      "Headhunters is a Star Citizen mission giver in Pyro, Nyx, and Stanton. It offers 456 missions. By type: 308 Mercenary, 46 Bounty Hunter, 40 Investigation, and 33 of other types, plus 29 with no listed type. 321 of them are illegal.",
      "400 missions pay 1,000 to 5,000 reputation with Headhunters.",
      "300 missions list a payout of 3,000 to 175,000 aUEC.",
      "12 missions can reward a crafting blueprint (1 item in all).",
      "100 missions are open at Neutral standing.",
      "200 more unlock as your standing rises, the last at Contractor (2,200 reputation).",
      "156 missions list no required rank in the game data.",
    ])
    const allLegal = {
      ...HUB,
      kind: "types" as const,
      name: "Delivery",
      legal_count: 456,
      illegal_count: 0,
      givers: HUB.factions,
      types: [],
      systems: [],
      blueprint_mission_count: 0,
      blueprint_rewards: [],
      reward_mission_count: 0,
      reputation_mission_count: 0,
    }
    const lines = missionHubIntro(allLegal, englishT, "en")
    expect(lines[0]).toBe(
      "Delivery is a Star Citizen mission type with 456 missions. All 456 are legal.",
    )
    // Type hubs have no ladder; their top givers close the summary.
    expect(lines.slice(1)).toEqual(["Mission givers: Headhunters (450)."])
  })

  it("summary leaves out what the data doesn't list", () => {
    const sparse = {
      ...HUB,
      reputation_min: undefined,
      reputation_max: undefined,
      reputation_mission_count: 0,
      reward_mission_count: 0,
      blueprint_mission_count: 0,
      blueprint_rewards: [],
      ladders: [],
      legal_count: 400,
      illegal_count: 0,
    }
    const lines = missionHubIntro(sparse, englishT, "en")
    expect(lines).toHaveLength(1)
    expect(lines[0]).not.toMatch(/legal/)
  })

  it("titles: '<Giver> Missions in Star Citizen (<n>) | SC Market'; factions say reputation", () => {
    expect(missionHubText(HUB, englishT).title).toBe(
      "Headhunters Missions in Star Citizen (456) | SC Market",
    )
    expect(missionHubText({ ...HUB, kind: "factions" }, englishT).title).toBe(
      "Headhunters Reputation Missions in Star Citizen (456) | SC Market",
    )
    expect(
      missionHubText({ ...HUB, kind: "systems", name: "Pyro" }, englishT)
        .heading,
    ).toBe("Missions in Pyro")
  })
})

describe("mission hub bridge pages", () => {
  it("route the hub paths ahead of /missions/:slug", () => {
    expect(matchBridgeRoute("/missions/givers")?.route.kind).toBe(
      "missionGivers",
    )
    expect(matchBridgeRoute("/missions/systems")?.route.kind).toBe(
      "missionSystems",
    )
    expect(matchBridgeRoute("/missions/givers/headhunters")).toEqual({
      route: { path: "/missions/givers/:slug", kind: "missionGiver" },
      params: { slug: "headhunters" },
    })
    expect(matchBridgeRoute("/missions/types/bounty-hunter")?.route.kind).toBe(
      "missionType",
    )
    expect(
      matchBridgeRoute("/missions/PU_Station_WasteDisposal_Lawful")?.route.kind,
    ).toBe("mission")
  })

  it("request the hub (100 missions a page) and the index", () => {
    expect(
      BRIDGE_PAGES.missionGiver.primary?.({ slug: "headhunters" }, 1)?.path,
    ).toBe(
      "/api/v2/game-data/missions/hubs/givers/headhunters?page=1&page_size=100",
    )
    expect(
      BRIDGE_PAGES.missionFaction.primary?.({ slug: "a b" }, 3)?.path,
    ).toBe(
      "/api/v2/game-data/missions/hubs/factions/a%20b?page=3&page_size=100",
    )
    expect(
      BRIDGE_PAGES.missionGiver.primary?.({ slug: "x" })?.notFoundStatuses,
    ).toEqual([404])
    expect(BRIDGE_PAGES.missionTypes.primary?.({})?.path).toBe(
      "/api/v2/game-data/missions/hubs",
    )
    expect(BRIDGE_PAGES.missionGiver.paginated).toBe(true)
    expect(isPaginatedPath("/missions/givers/headhunters")).toBe(true)
    expect(isPaginatedPath("/missions/givers")).toBe(false)
  })

  it("hub page: title, intro, mission links, related hubs, CollectionPage + ItemList + BreadcrumbList with dateModified", () => {
    const doc = BRIDGE_PAGES.missionGiver.build(
      HUB,
      undefined,
      ctx({ slug: "headhunters" }),
    )
    expect(doc.title).toBe(
      "Headhunters Missions in Star Citizen (456) | SC Market",
    )
    expect(doc.canonical).toBe(`${ORIGIN}/missions/givers/headhunters`)
    expect(texts(doc.summary)).toContain("Headhunters missions")
    expect(texts(doc.summary)[1]).toMatch(
      /^Headhunters is a Star Citizen mission giver in Pyro/,
    )
    expect(texts(doc.summary)[2]).toMatch(/^400 missions pay 1,000 to 5,000/)
    const textItems = doc.summary.flatMap((b) =>
      b.tag === "ul-text" ? b.items : [],
    )
    expect(textItems).toContain("Giver: Headhunters")
    expect(textItems).toContain("Reputation: Standing, 4 ranks (0–5,800 rep)")
    expect(textItems).toContain("Jr. Contractor (800 rep): 150 missions")
    expect(
      texts(doc.summary).some((s) =>
        s.startsWith("Data from Star Citizen 4.3.2 LIVE,"),
      ),
    ).toBe(true)
    const hrefs = links(doc.summary).map((l) => l.href)
    expect(hrefs).toContain("/missions/HH_A")
    expect(hrefs).toContain("/missions/HH%20B%2F2")
    expect(hrefs).toContain("/missions/systems/pyro")
    expect(hrefs).toContain("/missions/types/mercenary")
    expect(hrefs).toContain("/missions/factions/headhunters")
    expect(hrefs).toContain("/missions/givers")
    expect(hrefs).toContain("/missions/types")
    // 456 missions: 5 pages, linked from page 1.
    expect(hrefs).toContain("/missions/givers/headhunters?page=2")
    expect(hrefs).toContain("/wiki/items/8bb2fca8--volt-pistol")

    const types = doc.head.jsonLd.map(
      (j) => (j as { "@type": string })["@type"],
    )
    expect(types).toEqual(["BreadcrumbList", "CollectionPage"])
    const [crumbs, page] = doc.head.jsonLd as [
      { itemListElement: { name: string; item: string }[] },
      {
        dateModified: string
        mainEntity: { "@type": string; itemListElement: { url: string }[] }
      },
    ]
    expect(crumbs.itemListElement.map((c) => c.item)).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/missions`,
      `${ORIGIN}/missions/givers`,
      `${ORIGIN}/missions/givers/headhunters`,
    ])
    expect(page.dateModified).toBe("2026-10-24T00:00:00.000Z")
    expect(page.mainEntity["@type"]).toBe("ItemList")
    expect(page.mainEntity.itemListElement[0].url).toBe(
      `${ORIGIN}/missions/HH_A`,
    )
  })

  it("page N is self-canonical; past the end is a 404", () => {
    const page2 = BRIDGE_PAGES.missionGiver.build(
      { ...HUB, page: 2 },
      undefined,
      ctx({ slug: "headhunters" }, 2),
    )
    expect(page2.canonical).toBe(`${ORIGIN}/missions/givers/headhunters?page=2`)
    expect(page2.title).toBe(
      "Headhunters Missions in Star Citizen (456) — Page 2 | SC Market",
    )
    expect(
      BRIDGE_PAGES.missionGiver.build(
        HUB,
        undefined,
        ctx({ slug: "headhunters" }, 6),
      ).status,
    ).toBe(404)
  })

  it("index page: every hub with its count, the other indexes", () => {
    const doc = BRIDGE_PAGES.missionGivers.build(HUBS, undefined, ctx({}))
    expect(doc.title).toBe("Star Citizen Mission Givers (4) | SC Market")
    expect(doc.canonical).toBe(`${ORIGIN}/missions/givers`)
    expect(texts(doc.summary)[1]).toBe(
      "Every Star Citizen mission giver in the current game files and how many missions each one offers: Covalex Independent Contractors, Headhunters, Citizens for Prosperity and more.",
    )
    const l = links(doc.summary)
    expect(l[0]).toEqual({
      href: "/missions/givers/covalex-independent-contractors",
      text: "Covalex Independent Contractors — 639 missions",
    })
    expect(l.map((x) => x.href)).toEqual(
      expect.arrayContaining([
        "/missions/factions",
        "/missions/types",
        "/missions/systems",
        "/missions",
      ]),
    )
    expect(
      doc.head.jsonLd.map((j) => (j as { "@type": string })["@type"]),
    ).toEqual(["BreadcrumbList", "CollectionPage"])
  })

  it("the mission page links its hubs and the giver hub is in its breadcrumb", () => {
    const data = {
      ...f.mission,
      hubs: {
        giver: { slug: "headhunters", name: "Headhunters", mission_count: 456 },
        faction: {
          slug: "headhunters",
          name: "Headhunters",
          mission_count: 450,
        },
        type: { slug: "mercenary", name: "Mercenary", mission_count: 935 },
        system: { slug: "pyro", name: "Pyro", mission_count: 1072 },
      },
    }
    const doc = BRIDGE_PAGES.mission.build(
      data,
      undefined,
      ctx({ slug: "PU_X" }, 1, {}),
    )
    expect(
      links(doc.summary).filter(
        (l) =>
          l.href.startsWith("/missions/") && l.href.split("/").length === 4,
      ),
    ).toEqual([
      { href: "/missions/givers/headhunters", text: "Headhunters missions" },
      {
        href: "/missions/factions/headhunters",
        text: "Headhunters reputation missions",
      },
      { href: "/missions/types/mercenary", text: "Mercenary missions" },
      { href: "/missions/systems/pyro", text: "Missions in Pyro" },
    ])
    const crumbs = (
      doc.head.jsonLd[1] as { itemListElement: { item: string }[] }
    ).itemListElement.map((c) => c.item)
    expect(crumbs).toContain(`${ORIGIN}/missions/givers/headhunters`)
  })

  it("/missions links the hub indexes", () => {
    const doc = BRIDGE_PAGES.missions.build(
      { missions: [], total: 0, page: 1, page_size: 50 },
      undefined,
      ctx({}),
    )
    expect(links(doc.summary).map((l) => l.href)).toEqual(
      expect.arrayContaining([
        "/missions/givers",
        "/missions/factions",
        "/missions/types",
        "/missions/systems",
      ]),
    )
  })
})

describe("mission hub prerender paths", () => {
  it("one path per hub, plus a placeholder per hub route that the build drops", async () => {
    const { missionHubPaths, MISSION_HUB_ROUTE_PLACEHOLDERS } =
      await import("../../prerender/paths")
    const { isSsrPlaceholderPath } = await import("../../ssr/routePlaceholders")
    expect(missionHubPaths(HUBS)).toEqual([
      "/missions/givers/covalex-independent-contractors",
      "/missions/givers/headhunters",
      "/missions/givers/citizens-for-prosperity",
      "/missions/givers/red-wind-linehaul",
      "/missions/systems/stanton",
    ])
    expect(MISSION_HUB_ROUTE_PLACEHOLDERS).toHaveLength(4)
    for (const path of MISSION_HUB_ROUTE_PLACEHOLDERS) {
      expect(isSsrPlaceholderPath(path), path).toBe(true)
      expect(matchBridgeRoute(path)?.route.kind, path).toMatch(
        /^mission(Giver|Faction|Type|System)$/,
      )
    }
  })
})

describe("mission hub list at build time", () => {
  it("skips local and CI mock backends without fetching; only a Pages build fails on API errors", async () => {
    const { isRealBackend, missionHubPathsFromApi } =
      await import("../../prerender/missionHubPaths.node")
    expect(isRealBackend(undefined)).toBe(false)
    expect(isRealBackend("http://localhost:4173")).toBe(false)
    expect(isRealBackend("http://localhost")).toBe(false)
    expect(isRealBackend("http://127.0.0.1:8080")).toBe(false)
    expect(isRealBackend("https://api.sc-market.space")).toBe(true)

    const fetchSpy = vi.spyOn(globalThis, "fetch")
    expect(
      await missionHubPathsFromApi("http://localhost:4173", { CF_PAGES: "1" }),
    ).toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()

    vi.useFakeTimers()
    try {
      fetchSpy.mockRejectedValue(new TypeError("fetch failed"))
      const ci = missionHubPathsFromApi("https://api.example", {})
      await vi.runAllTimersAsync()
      expect(await ci).toEqual([])
      const pages = missionHubPathsFromApi("https://api.example", {
        CF_PAGES: "1",
      })
      const rejected = expect(pages).rejects.toThrow(
        /could not fetch the mission hubs/,
      )
      await vi.runAllTimersAsync()
      await rejected
    } finally {
      vi.useRealTimers()
      fetchSpy.mockRestore()
    }
  })
})

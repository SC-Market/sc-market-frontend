/**
 * Mission hubs (/missions/givers, /missions/givers/<slug>, and the same for
 * factions, types and systems): titles, the data-driven intro, related-hub
 * links and the head (CollectionPage + ItemList + BreadcrumbList JSON-LD,
 * dateModified from the game data import). Shared by the SPA pages, the edge
 * bridge and the build-time prerender, so all three say the same thing.
 * Pure: no React, no browser globals.
 *
 * Text comes from the `missionHubs` locale keys (the SPA's t, the bridge's
 * englishT); numbers in the same language (`lang`: the page's, "en" for the
 * bridge and the prerender).
 */
import type {
  GameVersion,
  MissionHubDetailResponse,
  MissionHubKind,
  MissionHubSummary,
  MissionHubsResponse,
  MissionSearchResult,
} from "../store/api/v2/market"
import { GAME_DATA_PATHS } from "../routes/paths"
import { buildHubHead, MAX_HUB_LINKS, type HubCrumb } from "./hubHeads"
import { gameDataDateModified, missionTitle } from "./missionText"
import type { PageHead } from "./pageHead"
import type { SeoLink } from "./siteHeads"

import { formatInteger } from "../util/format/format"
/** i18next's t (and the bridge's englishT): defaults and interpolation values. */
export interface HubTranslate {
  (
    key: string,
    options: { defaultValue: string } & Record<string, unknown>,
  ): string
}

export const MISSION_HUB_KINDS: readonly MissionHubKind[] = [
  "givers",
  "factions",
  "types",
  "systems",
]

/** Missions per hub page (the API's maximum page size). */
export const MISSION_HUB_PAGE_SIZE = 100

export function isMissionHubKind(
  value: string | undefined,
): value is MissionHubKind {
  return !!value && (MISSION_HUB_KINDS as readonly string[]).includes(value)
}

const KIND_LABELS: Record<MissionHubKind, string> = {
  givers: "Mission givers",
  factions: "Factions",
  types: "Mission types",
  systems: "Star systems",
}

/** "Mission givers", "Factions", "Mission types", "Star systems". */
export function missionHubKindLabel(
  kind: MissionHubKind,
  t: HubTranslate,
): string {
  return t(`missionHubs.kinds.${kind}`, { defaultValue: KIND_LABELS[kind] })
}

const INDEX_TEXT: Record<
  MissionHubKind,
  { title: string; heading: string; description: string }
> = {
  givers: {
    title: "Star Citizen Mission Givers ({{count}}) | SC Market",
    heading: "Star Citizen mission givers",
    description:
      "Every Star Citizen mission giver in the current game files and how many missions each one offers: {{top}} and more.",
  },
  factions: {
    title:
      "Star Citizen Factions and Reputation Missions ({{count}}) | SC Market",
    heading: "Star Citizen factions",
    description:
      "Every Star Citizen faction you earn reputation with through missions, and how many missions raise it: {{top}} and more.",
  },
  types: {
    title: "Star Citizen Mission Types ({{count}}) | SC Market",
    heading: "Star Citizen mission types",
    description:
      "Every Star Citizen mission type, from bounty hunting and mercenary work to hauling, salvage and mining, with how many missions of each: {{top}} and more.",
  },
  systems: {
    title: "Star Citizen Missions by Star System | SC Market",
    heading: "Star Citizen missions by star system",
    description: "Star Citizen missions in each star system: {{top}}.",
  },
}

const HUB_TEXT: Record<
  MissionHubKind,
  { title: string; heading: string; lead: string }
> = {
  givers: {
    title: "{{name}} Missions in Star Citizen ({{count}}) | SC Market",
    heading: "{{name}} missions",
    lead: "{{name}} offers {{missions}} in Star Citizen.",
  },
  factions: {
    title:
      "{{name}} Reputation Missions in Star Citizen ({{count}}) | SC Market",
    heading: "{{name}} reputation missions",
    lead: "{{missions}} in Star Citizen raise your reputation with {{name}}.",
  },
  types: {
    title: "{{name}} Missions in Star Citizen ({{count}}) | SC Market",
    heading: "{{name}} missions",
    lead: "Star Citizen has {{missions}} of the {{name}} type.",
  },
  systems: {
    title: "{{name}} Missions in Star Citizen ({{count}}) | SC Market",
    heading: "Missions in {{name}}",
    lead: "Star Citizen has {{missions}} in the {{name}} system.",
  },
}

/** "1,234" ("1.234" in de). */
function num(value: number, lang: string): string {
  return formatInteger(value, lang)
}

/** "1,318 missions" (plural-aware: missionHubs.missionCount_one/_other). */
export function missionCountText(
  count: number,
  t: HubTranslate,
  lang: string,
): string {
  // `count` picks the plural form; `n` is the formatted number ("1,318").
  return t("missionHubs.missionCount", {
    defaultValue: count === 1 ? "{{n}} mission" : "{{n}} missions",
    count,
    n: num(count, lang),
  })
}

/** "A, B and C" in the page's language. */
function listText(items: string[], lang: string): string {
  if (items.length <= 1) return items[0] ?? ""
  return new Intl.ListFormat(lang, {
    style: "long",
    type: "conjunction",
  }).format(items)
}

/** Index page: title, h1 and description. */
export function missionHubIndexText(
  kind: MissionHubKind,
  hubs: readonly MissionHubSummary[] | undefined,
  t: HubTranslate,
  lang: string,
): { title: string; heading: string; description: string } {
  const text = INDEX_TEXT[kind]
  // Systems: all of them ("Stanton, Pyro, and Nyx."); the others: the top
  // three, followed by "and more".
  const names = (hubs ?? []).map((h) => h.name)
  const top =
    kind === "systems" ? listText(names, lang) : names.slice(0, 3).join(", ")
  return {
    title: t(`missionHubs.index.${kind}.title`, {
      defaultValue: text.title,
      count: hubs?.length ?? "",
    }),
    heading: t(`missionHubs.index.${kind}.heading`, {
      defaultValue: text.heading,
    }),
    description: t(`missionHubs.index.${kind}.description`, {
      defaultValue: text.description,
      top,
    }),
  }
}

/** Hub page: title and h1. */
export function missionHubText(
  hub: Pick<MissionHubDetailResponse, "kind" | "name" | "mission_count">,
  t: HubTranslate,
): { title: string; heading: string } {
  const text = HUB_TEXT[hub.kind]
  return {
    title: t(`missionHubs.hub.${hub.kind}.title`, {
      defaultValue: text.title,
      name: hub.name,
      count: hub.mission_count,
    }),
    heading: t(`missionHubs.hub.${hub.kind}.heading`, {
      defaultValue: text.heading,
      name: hub.name,
    }),
  }
}

/** "Mercenary (308), Bounty Hunter (46) and Investigation (40)". */
function topHubs(
  hubs: readonly MissionHubSummary[],
  lang: string,
  max = 3,
): string {
  return listText(
    hubs.slice(0, max).map((h) => `${h.name} (${num(h.mission_count, lang)})`),
    lang,
  )
}

/** The related kinds a hub's intro names, in order. */
const INTRO_RELATED: Record<MissionHubKind, MissionHubKind[]> = {
  givers: ["types"],
  factions: ["givers", "types"],
  types: ["givers"],
  systems: ["givers", "types"],
}

/**
 * The hub's intro, generated from its data: how many missions, where, what
 * they pay, the legal mix, blueprint rewards and the main givers or types.
 * "Headhunters offers 456 missions in Star Citizen. They are offered in
 * Pyro, Nyx and Stanton. They pay 3,000 to 175,000 aUEC. Legal: 135,
 * illegal: 321. Mission types: Mercenary (308), …".
 */
export function missionHubIntro(
  hub: MissionHubDetailResponse,
  t: HubTranslate,
  lang: string,
): string[] {
  const text = HUB_TEXT[hub.kind]
  const lines = [
    t(`missionHubs.hub.${hub.kind}.lead`, {
      defaultValue: text.lead,
      name: hub.name,
      missions: missionCountText(hub.mission_count, t, lang),
    }),
  ]
  if (hub.kind !== "systems" && hub.systems.length > 0) {
    lines.push(
      t("missionHubs.where", {
        defaultValue: "They are offered in {{systems}}.",
        systems: listText(
          hub.systems.map((s) => s.name),
          lang,
        ),
      }),
    )
  }
  const min = hub.reward_min
  const max = hub.reward_max
  if (typeof max === "number" && max > 0) {
    lines.push(
      typeof min === "number" && min > 0 && min < max
        ? t("missionHubs.rewardRange", {
            defaultValue: "They pay {{min}} to {{max}} aUEC.",
            min: num(min, lang),
            max: num(max, lang),
          })
        : t("missionHubs.rewardUpTo", {
            defaultValue: "They pay up to {{max}} aUEC.",
            max: num(max, lang),
          }),
    )
  }
  const known = hub.legal_count + hub.illegal_count
  if (known > 0) {
    lines.push(
      hub.illegal_count === 0 && hub.legal_count === hub.mission_count
        ? t("missionHubs.allLegal", { defaultValue: "All of them are legal." })
        : hub.legal_count === 0 && hub.illegal_count === hub.mission_count
          ? t("missionHubs.allIllegal", {
              defaultValue: "All of them are illegal.",
            })
          : t("missionHubs.legalMix", {
              defaultValue: "Legal: {{legal}}, illegal: {{illegal}}.",
              legal: num(hub.legal_count, lang),
              illegal: num(hub.illegal_count, lang),
            }),
    )
  }
  if (hub.blueprint_mission_count > 0) {
    lines.push(
      t("missionHubs.blueprints", {
        defaultValue:
          "Missions that can reward a crafting blueprint: {{count}}.",
        count: num(hub.blueprint_mission_count, lang),
      }),
    )
  }
  for (const kind of INTRO_RELATED[hub.kind]) {
    const related = hub[kind]
    if (related.length === 0) continue
    lines.push(
      t("missionHubs.topRelated", {
        defaultValue: "{{kind}}: {{list}}.",
        kind: missionHubKindLabel(kind, t),
        list: topHubs(related, lang),
      }),
    )
  }
  return lines
}

/** Description: the intro's first sentences, at most ~160 characters. */
function shortDescription(lines: string[]): string {
  let out = ""
  for (const line of lines) {
    const next = out ? `${out} ${line}` : line
    if (out && next.length > 160) break
    out = next
  }
  return out.length > 160 ? `${out.slice(0, 159).trimEnd()}…` : out
}

export function missionHubDescription(
  hub: MissionHubDetailResponse,
  t: HubTranslate,
  lang: string,
): string {
  return shortDescription(missionHubIntro(hub, t, lang))
}

/** A mission in a hub list: "A Chance to Impress — Vaughn, Rank 0, Stanton". */
export function missionHubMissionLink(m: MissionSearchResult): SeoLink {
  return {
    href: GAME_DATA_PATHS.mission(encodeURIComponent(m.mission_code)),
    text: missionTitle(m),
  }
}

/** Link to a hub. */
export function missionHubLink(
  kind: MissionHubKind,
  hub: MissionHubSummary,
): SeoLink {
  return { href: GAME_DATA_PATHS.missionHub(kind, hub.slug), text: hub.name }
}

/** Breadcrumb steps above a hub page: Missions › Mission givers. */
export function missionHubCrumbs(
  kind: MissionHubKind | null,
  t: HubTranslate,
): HubCrumb[] {
  const missions = {
    name: t("missionHubs.missions", { defaultValue: "Missions" }),
    path: GAME_DATA_PATHS.missions,
  }
  return kind
    ? [
        missions,
        {
          name: missionHubKindLabel(kind, t),
          path: GAME_DATA_PATHS.missionHubs(kind),
        },
      ]
    : [missions]
}

/** Adds dateModified (the game data import) to the CollectionPage node. */
function withDateModified(
  head: PageHead,
  version: GameVersion | null | undefined,
): PageHead {
  const modified = gameDataDateModified(version)
  if (!modified) return head
  return {
    ...head,
    jsonLd: head.jsonLd.map((node) =>
      (node as { "@type"?: string })["@type"] === "CollectionPage"
        ? { ...node, dateModified: modified }
        : node,
    ),
  }
}

/** /missions/<kind>: CollectionPage of the hubs, BreadcrumbList, dateModified. */
export function buildMissionHubIndexHead(
  kind: MissionHubKind,
  data: MissionHubsResponse,
  origin: string,
  t: HubTranslate,
  lang: string,
  version: GameVersion | null | undefined,
): PageHead {
  const hubs = data[kind]
  const text = missionHubIndexText(kind, hubs, t, lang)
  const head = buildHubHead(
    {
      text: { title: text.title, description: text.description },
      path: GAME_DATA_PATHS.missionHubs(kind),
      name: missionHubKindLabel(kind, t),
      parents: missionHubCrumbs(null, t),
      links: hubs
        .slice(0, MAX_HUB_LINKS)
        .map((hub) => missionHubLink(kind, hub)),
    },
    origin,
  )
  return withDateModified(head, version)
}

/** /missions/<kind>/<slug>: CollectionPage + ItemList of this page's missions, BreadcrumbList, dateModified. */
export function buildMissionHubHead(
  hub: MissionHubDetailResponse,
  origin: string,
  t: HubTranslate,
  lang: string,
  version: GameVersion | null | undefined,
): PageHead {
  const text = missionHubText(hub, t)
  const head = buildHubHead(
    {
      text: {
        title: text.title,
        description: missionHubDescription(hub, t, lang),
      },
      path: GAME_DATA_PATHS.missionHub(hub.kind, hub.slug),
      name: text.heading,
      parents: missionHubCrumbs(hub.kind, t),
      links: hub.missions.slice(0, MAX_HUB_LINKS).map(missionHubMissionLink),
    },
    origin,
  )
  return withDateModified(head, version)
}

/** Pages of a hub's mission list. */
export function missionHubPageCount(
  hub: Pick<MissionHubDetailResponse, "mission_count">,
): number {
  return Math.max(1, Math.ceil(hub.mission_count / MISSION_HUB_PAGE_SIZE))
}

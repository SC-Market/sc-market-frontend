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
  MissionHubLadder,
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

const HUB_TEXT: Record<MissionHubKind, { title: string; heading: string }> = {
  givers: {
    title: "{{name}} Missions in Star Citizen ({{count}}) | SC Market",
    heading: "{{name}} missions",
  },
  factions: {
    title:
      "{{name}} Reputation Missions in Star Citizen ({{count}}) | SC Market",
    heading: "{{name}} reputation missions",
  },
  types: {
    title: "{{name}} Missions in Star Citizen ({{count}}) | SC Market",
    heading: "{{name}} missions",
  },
  systems: {
    title: "{{name}} Missions in Star Citizen ({{count}}) | SC Market",
    heading: "Missions in {{name}}",
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

/** The related kind a hub's summary names its top hubs of (none for givers: their types are listed). */
const SUMMARY_RELATED: Partial<Record<MissionHubKind, MissionHubKind>> = {
  factions: "givers",
  types: "givers",
  systems: "givers",
}

/**
 * The hub's reputation ladder: its missions' main ladder, on giver and
 * faction hubs whose missions list a required rank. Undefined otherwise.
 */
export function missionHubLadder(
  hub: Pick<MissionHubDetailResponse, "kind" | "ladders">,
): MissionHubLadder | undefined {
  if (hub.kind !== "givers" && hub.kind !== "factions") return undefined
  const ladder = hub.ladders[0]
  return ladder && ladder.mission_count > 0 && ladder.ranks.length > 0
    ? ladder
    : undefined
}

/** The faction a hub's reputation is with, when the data says so for all of it. */
export function missionHubReputationFaction(
  hub: Pick<
    MissionHubDetailResponse,
    "kind" | "name" | "factions" | "reputation_mission_count"
  >,
): MissionHubSummary | undefined {
  if (hub.kind === "factions")
    return { slug: "", name: hub.name, mission_count: 0 }
  if (hub.kind !== "givers" || hub.factions.length !== 1) return undefined
  const faction = hub.factions[0]
  return faction.mission_count >= hub.reputation_mission_count
    ? faction
    : undefined
}

/** "4,000 to 175,000", or "4,000" when both ends are the same. */
function rangeText(
  min: number,
  max: number,
  t: HubTranslate,
  lang: string,
): string {
  return min === max
    ? num(max, lang)
    : t("missionHubs.summary.range", {
        defaultValue: "{{min}} to {{max}}",
        min: num(min, lang),
        max: num(max, lang),
      })
}

/** At most this many types are listed one by one; the rest are summed. */
const MAX_LISTED_TYPES = 4

/** "30 Mercenary, 3 Collection and 2 Investigation" (or the top 3 and "605 of other types"). */
function typeBreakdown(
  hub: Pick<MissionHubDetailResponse, "type_counts">,
  t: HubTranslate,
  lang: string,
): string {
  const types = hub.type_counts
  const item = (n: number, name: string) => `${num(n, lang)} ${name}`
  if (types.length <= MAX_LISTED_TYPES)
    return listText(
      types.map((ty) => item(ty.mission_count, ty.name)),
      lang,
    )
  const top = types.slice(0, MAX_LISTED_TYPES - 1)
  const rest = types
    .slice(MAX_LISTED_TYPES - 1)
    .reduce((sum, ty) => sum + ty.mission_count, 0)
  return listText(
    [
      ...top.map((ty) => item(ty.mission_count, ty.name)),
      t("missionHubs.summary.otherTypes", {
        defaultValue: "{{n}} of other types",
        n: num(rest, lang),
      }),
    ],
    lang,
  )
}

/** Plural-aware sentence: `count` picks the form, `n` is the formatted number. */
function counted(
  t: HubTranslate,
  key: string,
  count: number,
  lang: string,
  one: string,
  other: string,
  values: Record<string, unknown> = {},
): string {
  return t(key, {
    defaultValue: count === 1 ? one : other,
    count,
    n: num(count, lang),
    ...values,
  })
}

/** The lead sentence: what the hub is and how many missions it has. */
function leadSentence(
  hub: MissionHubDetailResponse,
  t: HubTranslate,
  lang: string,
): string {
  const missions = missionCountText(hub.mission_count, t, lang)
  const systems =
    hub.kind === "systems"
      ? ""
      : listText(
          hub.systems.map((s) => s.name),
          lang,
        )
  const values = { name: hub.name, missions, systems }
  switch (hub.kind) {
    case "givers":
      return systems
        ? t("missionHubs.summary.lead.giversIn", {
            defaultValue:
              "{{name}} is a Star Citizen mission giver in {{systems}}. It offers {{missions}}.",
            ...values,
          })
        : t("missionHubs.summary.lead.givers", {
            defaultValue:
              "{{name}} is a Star Citizen mission giver. It offers {{missions}}.",
            ...values,
          })
    case "factions":
      return systems
        ? t("missionHubs.summary.lead.factionsIn", {
            defaultValue:
              "{{name}} is a Star Citizen faction: {{missions}} in {{systems}} raise your reputation with it.",
            ...values,
          })
        : t("missionHubs.summary.lead.factions", {
            defaultValue:
              "{{name}} is a Star Citizen faction: {{missions}} raise your reputation with it.",
            ...values,
          })
    case "types":
      return systems
        ? t("missionHubs.summary.lead.typesIn", {
            defaultValue:
              "{{name}} is a Star Citizen mission type with {{missions}} in {{systems}}.",
            ...values,
          })
        : t("missionHubs.summary.lead.types", {
            defaultValue:
              "{{name}} is a Star Citizen mission type with {{missions}}.",
            ...values,
          })
    case "systems":
      return t("missionHubs.summary.lead.systems", {
        defaultValue: "Star Citizen has {{missions}} in the {{name}} system.",
        ...values,
      })
  }
}

/** The hub's summary: a lead paragraph and a paragraph of details. */
export interface MissionHubSummaryText {
  /** What the hub is, its missions by type, their legality */
  lead: string
  /** Reputation, aUEC, blueprints, ranks, top givers (sentences) */
  details: string[]
}

/**
 * The hub's plain-language summary, built only from its data (counts and
 * ranges over all its missions). "InterSec Defense Solutions is a Star
 * Citizen mission giver in Nyx. It offers 36 missions. By type: 30
 * Mercenary, 3 Collection and 2 Investigation, plus 1 with no listed type.
 * All 36 are legal." then "33 missions pay 200 to 3,000 reputation with
 * InterSec Defense Solutions. 10 missions list a payout of …".
 */
export function missionHubSummary(
  hub: MissionHubDetailResponse,
  t: HubTranslate,
  lang: string,
): MissionHubSummaryText {
  const lead = [leadSentence(hub, t, lang)]
  if (hub.kind !== "types" && hub.type_counts.length > 0) {
    const list = typeBreakdown(hub, t, lang)
    lead.push(
      hub.untyped_count > 0
        ? t("missionHubs.summary.byTypeUntyped", {
            defaultValue: "By type: {{list}}, plus {{n}} with no listed type.",
            list,
            n: num(hub.untyped_count, lang),
          })
        : t("missionHubs.summary.byType", {
            defaultValue: "By type: {{list}}.",
            list,
          }),
    )
  }
  if (hub.illegal_count === 0 && hub.legal_count === hub.mission_count) {
    lead.push(
      t("missionHubs.summary.allLegal", {
        defaultValue: "All {{n}} are legal.",
        n: num(hub.mission_count, lang),
      }),
    )
  } else if (hub.legal_count === 0 && hub.illegal_count === hub.mission_count) {
    lead.push(
      t("missionHubs.summary.allIllegal", {
        defaultValue: "All {{n}} are illegal.",
        n: num(hub.mission_count, lang),
      }),
    )
  } else if (hub.illegal_count > 0) {
    lead.push(
      counted(
        t,
        "missionHubs.summary.someIllegal",
        hub.illegal_count,
        lang,
        "{{n}} of them is illegal.",
        "{{n}} of them are illegal.",
      ),
    )
  }

  const details: string[] = []
  const repMin = hub.reputation_min
  const repMax = hub.reputation_max
  if (
    hub.reputation_mission_count > 0 &&
    typeof repMin === "number" &&
    typeof repMax === "number"
  ) {
    const faction = missionHubReputationFaction(hub)
    const range = rangeText(repMin, repMax, t, lang)
    details.push(
      faction
        ? counted(
            t,
            "missionHubs.summary.reputationWith",
            hub.reputation_mission_count,
            lang,
            "{{n}} mission pays {{range}} reputation with {{faction}}.",
            "{{n}} missions pay {{range}} reputation with {{faction}}.",
            { range, faction: faction.name },
          )
        : counted(
            t,
            "missionHubs.summary.reputation",
            hub.reputation_mission_count,
            lang,
            "{{n}} mission pays {{range}} reputation.",
            "{{n}} missions pay {{range}} reputation.",
            { range },
          ),
    )
  }
  const payMin = hub.reward_min
  const payMax = hub.reward_max
  if (hub.reward_mission_count > 0 && typeof payMax === "number") {
    details.push(
      counted(
        t,
        "missionHubs.summary.payout",
        hub.reward_mission_count,
        lang,
        "{{n}} mission lists a payout of {{range}} aUEC.",
        "{{n}} missions list a payout of {{range}} aUEC.",
        {
          range: rangeText(
            typeof payMin === "number" ? payMin : payMax,
            payMax,
            t,
            lang,
          ),
        },
      ),
    )
  }
  if (hub.blueprint_mission_count > 0 && hub.blueprint_rewards.length > 0) {
    details.push(
      counted(
        t,
        "missionHubs.summary.blueprints",
        hub.blueprint_mission_count,
        lang,
        "{{n}} mission can reward a crafting blueprint ({{items}}).",
        "{{n}} missions can reward a crafting blueprint ({{items}}).",
        {
          items: counted(
            t,
            "missionHubs.summary.blueprintItems",
            hub.blueprint_rewards.length,
            lang,
            "{{n}} item in all",
            "{{n}} different items in all",
          ),
        },
      ),
    )
  }
  const ladder = missionHubLadder(hub)
  if (ladder) {
    const first = ladder.ranks[0]
    const open = first.mission_count
    details.push(
      counted(
        t,
        "missionHubs.summary.ranksOpen",
        open,
        lang,
        "{{n}} mission is open at {{rank}} standing.",
        "{{n}} missions are open at {{rank}} standing.",
        { rank: first.display_name },
      ),
    )
    const later = ladder.mission_count - open
    const last = [...ladder.ranks].reverse().find((r) => r.mission_count > 0)
    if (later > 0 && last && last.rank_index !== first.rank_index) {
      details.push(
        counted(
          t,
          "missionHubs.summary.ranksLater",
          later,
          lang,
          "{{n}} more unlocks as your standing rises, the last at {{rank}} ({{threshold}} reputation).",
          "{{n}} more unlock as your standing rises, the last at {{rank}} ({{threshold}} reputation).",
          { rank: last.display_name, threshold: num(last.threshold, lang) },
        ),
      )
    }
    const otherLadders = hub.ladders
      .slice(1)
      .reduce((sum, l) => sum + l.mission_count, 0)
    if (otherLadders > 0) {
      details.push(
        counted(
          t,
          "missionHubs.summary.otherLadders",
          otherLadders,
          lang,
          "{{n}} mission needs a rank on another reputation ladder.",
          "{{n}} missions need a rank on another reputation ladder.",
        ),
      )
    }
    if (hub.unranked_mission_count > 0) {
      details.push(
        counted(
          t,
          "missionHubs.summary.unranked",
          hub.unranked_mission_count,
          lang,
          "{{n}} mission lists no required rank in the game data.",
          "{{n}} missions list no required rank in the game data.",
        ),
      )
    }
  }
  const relatedKind = SUMMARY_RELATED[hub.kind]
  if (relatedKind && hub[relatedKind].length > 0) {
    details.push(
      t("missionHubs.topRelated", {
        defaultValue: "{{kind}}: {{list}}.",
        kind: missionHubKindLabel(relatedKind, t),
        list: topHubs(hub[relatedKind], lang),
      }),
    )
  }
  return { lead: lead.join(" "), details }
}

/** The summary as lines (the head's description, the bridge): the lead, then each detail. */
export function missionHubIntro(
  hub: MissionHubDetailResponse,
  t: HubTranslate,
  lang: string,
): string[] {
  const summary = missionHubSummary(hub, t, lang)
  return [summary.lead, ...summary.details]
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

/** One value of a hub fact: text, an optional link and a quiet note ("(33 missions)"). */
export interface MissionHubFactItem {
  text: string
  href?: string
  note?: string
}

/** One row of a hub's facts panel. */
export interface MissionHubFactRow {
  key: string
  label: string
  items: MissionHubFactItem[]
  /** A quiet line under the items ("3 missions list no system") */
  note?: string
}

/** Related hubs shown one by one in a fact; the rest are "+N more". */
const MAX_FACT_LINKS = 4

/**
 * The hub's facts (the aside's panel and the bridge): what it is, its
 * faction (on a giver hub, only when the name differs), givers, systems,
 * types, its reputation ladder and legality. Rows without data are left out.
 */
export function missionHubFactRows(
  hub: MissionHubDetailResponse,
  t: HubTranslate,
  lang: string,
): MissionHubFactRow[] {
  const rows: MissionHubFactRow[] = []
  const related = (
    kind: MissionHubKind,
    label: string,
    note?: string,
  ): MissionHubFactRow | null => {
    const hubs = hub[kind]
    if (hubs.length === 0) return null
    const shown = hubs.slice(0, MAX_FACT_LINKS)
    const items: MissionHubFactItem[] = shown.map((h) => ({
      text: h.name,
      href: GAME_DATA_PATHS.missionHub(kind, h.slug),
      note: `(${num(h.mission_count, lang)})`,
    }))
    if (hubs.length > shown.length) {
      items.push({
        text: t("missionHubs.facts.more", {
          defaultValue: "+{{n}} more",
          n: num(hubs.length - shown.length, lang),
        }),
      })
    }
    return { key: kind, label, items, note }
  }
  const kindLabel = t(`missionHubs.facts.self.${hub.kind}`, {
    defaultValue: FACT_SELF[hub.kind],
  })
  rows.push({ key: "self", label: kindLabel, items: [{ text: hub.name }] })

  const faction =
    hub.kind === "givers" &&
    !(hub.factions.length === 1 && hub.factions[0].name === hub.name)
      ? related(
          "factions",
          t("missionHubs.facts.faction", { defaultValue: "Faction" }),
        )
      : null
  if (faction) rows.push(faction)
  if (hub.kind !== "givers") {
    const givers = related(
      "givers",
      t("missionHubs.facts.givers", { defaultValue: "Mission givers" }),
    )
    if (givers) rows.push(givers)
  }
  if (hub.kind !== "systems") {
    const systems = related(
      "systems",
      t("missionHubs.facts.systems", { defaultValue: "Star system" }),
      hub.unlisted_system_count > 0
        ? t("missionHubs.facts.noSystem", {
            defaultValue:
              hub.unlisted_system_count === 1
                ? "{{n}} mission lists no system"
                : "{{n}} missions list no system",
            count: hub.unlisted_system_count,
            n: num(hub.unlisted_system_count, lang),
          })
        : undefined,
    )
    if (systems) rows.push(systems)
  }
  if (hub.kind !== "types" && hub.type_counts.length > 0) {
    const shown = hub.type_counts.slice(0, MAX_FACT_LINKS)
    const typeHubs = new Set(hub.types.map((ty) => ty.slug))
    const items: MissionHubFactItem[] = shown.map((ty) => ({
      text: ty.name,
      href: typeHubs.has(ty.slug)
        ? GAME_DATA_PATHS.missionHub("types", ty.slug)
        : undefined,
      note: `(${num(ty.mission_count, lang)})`,
    }))
    if (hub.type_counts.length > shown.length) {
      items.push({
        text: t("missionHubs.facts.more", {
          defaultValue: "+{{n}} more",
          n: num(hub.type_counts.length - shown.length, lang),
        }),
      })
    }
    rows.push({
      key: "types",
      label: t("missionHubs.facts.types", { defaultValue: "Mission types" }),
      items,
    })
  }
  const ladder = missionHubLadder(hub)
  if (ladder) {
    const first = ladder.ranks[0]
    const last = ladder.ranks[ladder.ranks.length - 1]
    rows.push({
      key: "reputation",
      label: t("missionHubs.facts.reputation", { defaultValue: "Reputation" }),
      items: [
        {
          text: t("missionHubs.facts.ladder", {
            defaultValue: "{{ladder}}, {{n}} ranks ({{min}}–{{max}} rep)",
            ladder: ladder.scope_display_name,
            n: num(ladder.ranks.length, lang),
            min: num(first.threshold, lang),
            max: num(last.threshold, lang),
          }),
        },
      ],
    })
  }
  const allLegal =
    hub.illegal_count === 0 && hub.legal_count === hub.mission_count
  const allIllegal =
    hub.legal_count === 0 && hub.illegal_count === hub.mission_count
  rows.push({
    key: "legality",
    label: t("missionHubs.facts.legality", { defaultValue: "Legality" }),
    items: [
      {
        text: allLegal
          ? t("missionHubs.tiles.allLegal", { defaultValue: "All legal" })
          : allIllegal
            ? t("missionHubs.tiles.allIllegal", { defaultValue: "All illegal" })
            : t("missionHubs.facts.legalMix", {
                defaultValue: "{{legal}} legal, {{illegal}} illegal",
                legal: num(hub.legal_count, lang),
                illegal: num(hub.illegal_count, lang),
              }),
      },
    ],
  })
  return rows
}

const FACT_SELF: Record<MissionHubKind, string> = {
  givers: "Giver",
  factions: "Faction",
  types: "Mission type",
  systems: "Star system",
}

/** "Jr. Contractor (800 rep): 6 missions": the bridge's rank lines. */
export function missionHubRankLines(
  hub: MissionHubDetailResponse,
  t: HubTranslate,
  lang: string,
): string[] {
  const ladder = missionHubLadder(hub)
  if (!ladder) return []
  return ladder.ranks.map((r) =>
    t("missionHubs.ladder.line", {
      defaultValue: "{{rank}} ({{threshold}} rep): {{missions}}",
      rank: r.display_name,
      threshold: num(r.threshold, lang),
      missions: missionCountText(r.mission_count, t, lang),
    }),
  )
}

const FACTS_TITLES: Record<MissionHubKind, string> = {
  givers: "Giver facts",
  factions: "Faction facts",
  types: "Mission type facts",
  systems: "Star system facts",
}

/** "Giver facts", "Faction facts", …: the facts panel's heading. */
export function missionHubFactsTitle(
  kind: MissionHubKind,
  t: HubTranslate,
): string {
  return t(`missionHubs.facts.title.${kind}`, {
    defaultValue: FACTS_TITLES[kind],
  })
}

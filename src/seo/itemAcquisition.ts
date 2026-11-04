/**
 * "How to get <item>" copy shared by the game item page (SPA and SSR) and
 * the edge bridge, from the item acquisition document
 * (`GET /api/v2/game-items/{id}/acquisition`; the public feed
 * `/api/public/items/{slug}.json` is the same document without listings).
 *
 * Pure: no React, no browser globals, so it runs in Workers and at build
 * time. UI strings go through `t` (the SPA's i18next, the bridge's
 * englishT), so the bridge's English matches the SPA's.
 */
import type {
  ItemAcquisitionBlueprint,
  ItemAcquisitionDocument,
  ItemAcquisitionIngredient,
  ItemAcquisitionMission,
} from "../store/api/v2/market"
import { GAME_DATA_PATHS, WIKI_PATHS } from "../routes/paths"
import { formatCraftingTime } from "../constants/crafting"
import { formatPercent, readableMissionText, usableGiver } from "./missionText"
import type { AnswerTranslate } from "../util/answerContent"

import { formatInteger, formatNumber } from "../util/format/format"
/** Which subsections have anything to show (empty ones are hidden). */
export interface AcquisitionSections {
  buy: boolean
  missions: boolean
  blueprints: boolean
  shops: boolean
  resource: boolean
}

export function acquisitionSections(
  doc: ItemAcquisitionDocument,
): AcquisitionSections {
  const r = doc.resource
  return {
    buy: doc.listings.count > 0,
    missions: doc.missions.top.length > 0,
    blueprints: doc.blueprints.items.length > 0,
    shops: doc.in_game_shops.shops.length > 0,
    resource:
      !!r &&
      (r.can_be_mined ||
        r.can_be_purchased ||
        r.can_be_salvaged ||
        r.can_be_looted),
  }
}

/** True when at least one subsection has content. */
export function hasAcquisitionInfo(doc: ItemAcquisitionDocument): boolean {
  return Object.values(acquisitionSections(doc)).some(Boolean)
}

/** "450,000" (aUEC amounts and counts; `locale` is the page language, "en" for the bridge). */
export function formatAmount(value: number, locale: string): string {
  return formatInteger(value, locale)
}

/** The mission's page (missions are linked by code everywhere else). */
export function acquisitionMissionPath(m: ItemAcquisitionMission): string {
  return GAME_DATA_PATHS.mission(encodeURIComponent(m.mission_code))
}

/** The blueprint's page (the detail route takes the blueprint name or id). */
export function acquisitionBlueprintPath(bp: ItemAcquisitionBlueprint): string {
  return GAME_DATA_PATHS.blueprint(
    encodeURIComponent(bp.blueprint_name || bp.blueprint_id),
  )
}

/** An ingredient's item page (the document gives its short slug). */
export function ingredientPath(ing: ItemAcquisitionIngredient): string {
  return WIKI_PATHS.item(ing.slug)
}

/** The giver's name, if it is a real one. */
export function acquisitionGiver(m: ItemAcquisitionMission): string | null {
  return usableGiver(m.mission_giver_org) ?? usableGiver(m.faction)
}

/** The mission name without game markup. */
export function acquisitionMissionName(m: ItemAcquisitionMission): string {
  return (
    readableMissionText(m.mission_name, acquisitionGiver(m)) || m.mission_code
  )
}

/** "Item reward" / "Blueprint reward". */
export function missionRewardKind(
  m: ItemAcquisitionMission,
  t: AnswerTranslate,
): string {
  return m.reward_kind === "item"
    ? t("itemAcquisition.rewardItem", "Item reward")
    : t("itemAcquisition.rewardBlueprint", "Blueprint reward")
}

/** "3.57% drop chance", "Guaranteed", or null when the game data gives none. */
export function missionChance(
  m: ItemAcquisitionMission,
  t: AnswerTranslate,
): string | null {
  if (m.is_guaranteed) return t("itemAcquisition.guaranteed", "Guaranteed")
  if (
    typeof m.drop_probability !== "number" ||
    !Number.isFinite(m.drop_probability) ||
    m.drop_probability <= 0
  ) {
    return null
  }
  return t("itemAcquisition.dropChance", {
    defaultValue: "{{percent}} drop chance",
    percent: formatPercent(m.drop_probability),
  })
}

/** "Wikelo Navy F7 — Item reward — Giver: Wikelo". */
export function missionLine(
  m: ItemAcquisitionMission,
  t: AnswerTranslate,
): string {
  const giver = acquisitionGiver(m)
  return [
    acquisitionMissionName(m),
    missionRewardKind(m, t),
    missionChance(m, t),
    giver
      ? t("itemAcquisition.giver", { defaultValue: "Giver: {{giver}}", giver })
      : null,
  ]
    .filter(Boolean)
    .join(" — ")
}

/** "Siebe Helmet blueprint" (blueprint names are game codes; the output is this item). */
export function blueprintLabel(itemName: string, t: AnswerTranslate): string {
  return t("itemAcquisition.blueprintName", {
    defaultValue: "{{name}} blueprint",
    name: itemName,
  })
}

/** "Tier 2 — Crafting time: 6m 30s — Missions that award this blueprint: 1". */
export function blueprintFacts(
  bp: ItemAcquisitionBlueprint,
  t: AnswerTranslate,
): string[] {
  return [
    typeof bp.tier === "number"
      ? t("itemAcquisition.tier", {
          defaultValue: "Tier {{tier}}",
          tier: bp.tier,
        })
      : null,
    bp.rarity || null,
    bp.crafting_time_seconds
      ? t("itemAcquisition.craftTime", {
          defaultValue: "Crafting time: {{time}}",
          time: formatCraftingTime(bp.crafting_time_seconds),
        })
      : null,
    bp.mission_count > 0
      ? t("itemAcquisition.awardedBy", {
          defaultValue: "Missions that award this blueprint: {{missions}}",
          missions: bp.mission_count,
        })
      : null,
  ].filter((v): v is string => !!v)
}

/** "0.08 SCU" or "×2", plus the slot and minimum quality. */
export function ingredientAmount(
  ing: ItemAcquisitionIngredient,
  t: AnswerTranslate,
  locale: string,
): string {
  const amount =
    typeof ing.quantity_scu === "number"
      ? `${formatNumber(ing.quantity_scu, locale, { maximumFractionDigits: 3 })} SCU`
      : `×${formatNumber(ing.quantity, locale, { maximumFractionDigits: 3 })}`
  return [
    amount,
    ing.slot_display_name || null,
    typeof ing.min_quality === "number" && ing.min_quality > 0
      ? t("itemAcquisition.minQuality", {
          defaultValue: "min. quality {{quality}}",
          quality: ing.min_quality,
        })
      : null,
  ]
    .filter(Boolean)
    .join(", ")
}

/** "Stanton: Aberdeen, Daymar" for a location map from the document. */
export function locationLines(
  map: Record<string, string[]> | null | undefined,
): string[] {
  return Object.entries(map ?? {})
    .map(([group, places]) => {
      const list = (Array.isArray(places) ? places : []).filter(Boolean)
      return list.length ? `${group}: ${list.join(", ")}` : group
    })
    .filter((line) => line.trim() !== "")
}

/** "Can be mined", "Can be salvaged"… for a resource. */
export function resourceMethods(
  doc: ItemAcquisitionDocument,
  t: AnswerTranslate,
): string[] {
  const r = doc.resource
  if (!r) return []
  return [
    r.can_be_mined && t("itemAcquisition.canBeMined", "Can be mined"),
    r.can_be_purchased && t("itemAcquisition.canBePurchased", "Can be bought"),
    r.can_be_salvaged && t("itemAcquisition.canBeSalvaged", "Can be salvaged"),
    r.can_be_looted && t("itemAcquisition.canBeLooted", "Can be looted"),
  ].filter((v): v is string => !!v)
}

// English sentences (the answer text below), so English digits.
function plural(n: number, one: string, many: string): string {
  return `${formatNumber(n, "en")} ${n === 1 ? one : many}`
}

/** The page <title> (English, like every head): the "how to get" query. */
export function itemSeoTitle(name: string): string {
  return `How to Get ${name} in Star Citizen | SC Market`
}

/**
 * Meta description (English, ≤160 chars): the ways to get the item, with
 * the numbers. Without the document: the generic line.
 */
export function itemSeoDescription(
  item: { name: string; type?: string | null; manufacturer?: string | null },
  doc?: ItemAcquisitionDocument | null,
): string {
  const lead = `How to get ${item.name} in Star Citizen`
  const ways: string[] = []
  if (doc) {
    const l = doc.listings
    if (l.count > 0) {
      ways.push(
        `buy it from ${plural(l.seller_count, "player seller", "player sellers")}` +
          (typeof l.lowest_ask === "number"
            ? ` from ${formatAmount(l.lowest_ask, "en")} aUEC`
            : ""),
      )
    }
    if (doc.missions.total > 0)
      ways.push(
        `earn it from ${plural(doc.missions.total, "mission", "missions")}`,
      )
    if (doc.blueprints.total > 0)
      ways.push(
        `craft it from ${plural(doc.blueprints.total, "blueprint", "blueprints")}`,
      )
    if (doc.in_game_shops.total > 0)
      ways.push(
        `buy it in ${plural(doc.in_game_shops.total, "in-game shop", "in-game shops")}`,
      )
  }
  const text =
    ways.length > 0
      ? `${lead}: ${ways.length > 1 ? `${ways.slice(0, -1).join(", ")} or ${ways[ways.length - 1]}` : ways[0]}. Stats and prices on SC Market.`
      : `${lead}: player listings, missions, crafting and stats for this ${item.type || "item"}${item.manufacturer ? ` by ${item.manufacturer}` : ""}.`
  return text.length > 160 ? `${text.slice(0, 159).trimEnd()}…` : text
}

/**
 * Answer-first content for game-data detail pages.
 *
 * Builds a short plain-language summary and question/answer pairs from the
 * page's data, so search and AI answer engines can quote a direct answer
 * ("Where can I mine X?") instead of reconstructing it from tables.
 */
import type { TFunction } from "i18next"
import type {
  OreDetailResponse,
  ResourceDetailResponse,
  WikiItemDetail,
  WikiShipDetail,
} from "../store/api/v2/market"
import { formatPrice } from "./formatPrice"

export interface AnswerFaq {
  question: string
  answer: string
}

export interface AnswerContent {
  summary: string
  faqs: AnswerFaq[]
}

/** How many locations/items to name in a sentence before it gets unwieldy. */
const MAX_LISTED = 3

function list(items: string[], lang: string): string {
  return new Intl.ListFormat(lang, { style: "long", type: "conjunction" }).format(
    items,
  )
}

function disjunction(items: string[], lang: string): string {
  return new Intl.ListFormat(lang, { style: "long", type: "disjunction" }).format(
    items,
  )
}

export function buildCommodityAnswers(
  data: ResourceDetailResponse,
  t: TFunction,
  lang: string,
): AnswerContent {
  const r = data.resource
  const name = r.resource_name
  const sentences: string[] = [
    t("seoAnswers.commodity.intro", {
      defaultValue: "{{name}} is a Star Citizen commodity in the {{category}} category.",
      name,
      category: r.resource_category,
    }),
  ]
  const faqs: AnswerFaq[] = []

  const methods = [
    r.can_be_mined && t("seoAnswers.methods.mining", "mining"),
    r.can_be_purchased && t("seoAnswers.methods.purchasing", "purchasing"),
    r.can_be_salvaged && t("seoAnswers.methods.salvaging", "salvaging"),
    r.can_be_looted && t("seoAnswers.methods.looting", "looting"),
  ].filter((m): m is string => !!m)
  if (methods.length > 0) {
    sentences.push(
      t("seoAnswers.commodity.methods", {
        defaultValue: "It can be obtained by {{methods}}.",
        methods: disjunction(methods, lang),
      }),
    )
  }

  const priced = (r.purchase_locations ?? [])
    .filter((l) => l.average_price != null && (l.station || l.planet_moon))
    .sort((a, b) => a.average_price! - b.average_price!)
  if (priced.length > 0) {
    const cheapest = priced[0]
    sentences.push(
      t("seoAnswers.commodity.cheapest", {
        defaultValue:
          "The cheapest known place to buy it is {{location}}, at about {{price}}.",
        location: cheapest.station || cheapest.planet_moon,
        price: formatPrice(cheapest.average_price),
      }),
    )
    faqs.push({
      question: t("seoAnswers.commodity.faqBuyQ", {
        defaultValue: "Where can I buy {{name}} in Star Citizen?",
        name,
      }),
      answer: t("seoAnswers.commodity.faqBuyA", {
        defaultValue: "{{name}} can be bought at {{locations}}.",
        name,
        locations: list(
          priced
            .slice(0, MAX_LISTED)
            .map(
              (l) =>
                `${l.station || l.planet_moon} (${formatPrice(l.average_price)})`,
            ),
          lang,
        ),
      }),
    })
  }

  const mined = (r.mining_locations ?? [])
    .map((l) => l.location_detail || l.planet_moon)
    .filter((l): l is string => !!l)
  if (mined.length > 0) {
    const locations = list(mined.slice(0, MAX_LISTED), lang)
    sentences.push(
      t("seoAnswers.commodity.mined", {
        defaultValue: "Known mining locations include {{locations}}.",
        locations,
      }),
    )
    faqs.push({
      question: t("seoAnswers.commodity.faqMineQ", {
        defaultValue: "Where can I mine {{name}} in Star Citizen?",
        name,
      }),
      answer: t("seoAnswers.commodity.faqMineA", {
        defaultValue: "{{name}} can be mined at {{locations}}.",
        name,
        locations,
      }),
    })
  }

  const price = data.market_price
  if (price?.min_price && price?.max_price) {
    sentences.push(
      t("seoAnswers.commodity.price", {
        defaultValue: "Market prices currently range from {{min}} to {{max}}.",
        min: formatPrice(price.min_price),
        max: formatPrice(price.max_price),
      }),
    )
  }

  const uses = data.blueprints_requiring
    .map((bp) => bp.output_item_name || bp.blueprint_name)
    .filter((n): n is string => !!n)
  if (uses.length > 0) {
    faqs.push({
      question: t("seoAnswers.commodity.faqUsesQ", {
        defaultValue: "What is {{name}} used for in Star Citizen?",
        name,
      }),
      answer: t("seoAnswers.commodity.faqUsesA", {
        defaultValue: "{{name}} is a crafting ingredient for items such as {{items}}.",
        name,
        items: list(uses.slice(0, MAX_LISTED), lang),
      }),
    })
  }

  return { summary: sentences.join(" "), faqs }
}

export function buildOreAnswers(
  ore: OreDetailResponse,
  t: TFunction,
  lang: string,
): AnswerContent {
  const name = ore.displayName
  const sentences: string[] = [
    t("seoAnswers.ore.intro", {
      defaultValue: "{{name}} is a mineable ore in Star Citizen (rarity: {{rarity}}).",
      name,
      rarity: ore.rarity,
    }),
  ]
  const faqs: AnswerFaq[] = []

  const best = [...ore.locations]
    .sort((a, b) => b.relativeProbability - a.relativeProbability)
    .slice(0, MAX_LISTED)
    .map((l) => `${l.locationName} (${l.system})`)
  if (best.length > 0) {
    const locations = list(best, lang)
    sentences.push(
      t("seoAnswers.ore.best", {
        defaultValue: "Known locations include {{locations}}.",
        locations,
      }),
    )
    faqs.push({
      question: t("seoAnswers.ore.faqWhereQ", {
        defaultValue: "Where can I mine {{name}} in Star Citizen?",
        name,
      }),
      answer: t("seoAnswers.ore.faqWhereA", {
        defaultValue: "{{name}} can be found at {{locations}}, among other locations.",
        name,
        locations,
      }),
    })
  }

  return { summary: sentences.join(" "), faqs }
}

export function buildShipSummary(ship: WikiShipDetail, t: TFunction): string {
  const sentences: string[] = [
    t("seoAnswers.ship.intro", {
      defaultValue: "The {{name}} is a ship in Star Citizen.",
      name: ship.name,
    }),
  ]
  const role = ship.focus || ship.role
  if (role) {
    sentences.push(
      t("seoAnswers.ship.role", { defaultValue: "Role: {{role}}.", role }),
    )
  }
  if (ship.crew_size) {
    sentences.push(
      t("seoAnswers.ship.crew", {
        defaultValue: "Maximum crew: {{crew}}.",
        crew: ship.crew_size,
      }),
    )
  }
  if (ship.length_m) {
    sentences.push(
      t("seoAnswers.ship.length", {
        defaultValue: "Length: {{length}} m.",
        length: ship.length_m,
      }),
    )
  }
  return sentences.join(" ")
}

export function buildItemSummary(item: WikiItemDetail, t: TFunction): string {
  const sentences: string[] = [
    t("seoAnswers.item.intro", {
      defaultValue: "{{name}} is an item in Star Citizen.",
      name: item.name,
    }),
  ]
  if (item.type) {
    sentences.push(
      t("seoAnswers.item.type", { defaultValue: "Type: {{type}}.", type: item.type }),
    )
  }

  const stats = item.market_stats
  if (stats.listing_count > 0 && stats.min_price && stats.max_price) {
    sentences.push(
      t("seoAnswers.item.listings", {
        defaultValue:
          "Players sell it on SC Market for {{min}} to {{max}} (active listings: {{total}}).",
        min: formatPrice(stats.min_price),
        max: formatPrice(stats.max_price),
        total: stats.listing_count,
      }),
    )
  }

  return sentences.join(" ")
}

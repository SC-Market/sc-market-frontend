/**
 * Site-wide and homepage head content, shared by the SPA (Footer,
 * FAQSection, LandingPage) and the edge bridge's "/" page. Pure: no React,
 * no browser globals.
 */
import {
  GAME_DATA_PATHS,
  HELP_PATHS,
  MARKET_PATHS,
  PATHS,
  WIKI_PATHS,
} from "../routes/paths"
import { DEFAULT_FRONTEND_URL } from "./constants"
import { faqPageJsonLd, PageHead, socialMeta } from "./pageHead"

/** Translate function shape the head builders need (i18next's t fits). */
export interface SeoTranslate {
  (key: string): string
  (key: string, defaultValue: string): string
}

const SITE = DEFAULT_FRONTEND_URL

/** @id of the WebSite node, for other JSON-LD to reference (isPartOf). */
export const WEBSITE_JSON_LD_ID = `${SITE}/#website`

const SITE_DESCRIPTION =
  "SC Market is the Star Citizen marketplace where players buy, sell, and trade in-game items and hire orgs for services like hauling, escort, medical, and salvage — all in aUEC."

/**
 * Organization + WebSite nodes. The WebSite node's SearchAction is the
 * "sitelinks searchbox": it tells Google (and AI answer engines) how to run a
 * search directly against the marketplace. The target must match the real
 * market search route — /market?text=<query> (ListingSearchV2 reads the
 * "text" search param). {search_term_string} is Google's required token.
 *
 * Uses the production origin on purpose: the @ids are stable identifiers.
 */
export function siteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "SC Market",
        url: SITE,
        logo: `${SITE}/scmarket-logo.png`,
        description: SITE_DESCRIPTION,
        sameAs: ["https://discord.gg/scmarket", "https://github.com/SC-Market"],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_JSON_LD_ID,
        name: "SC Market",
        url: SITE,
        publisher: { "@id": `${SITE}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE}/market?text={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }
}

/** The landing page FAQ (FAQSection), in display order. */
export function landingFaqs(t: SeoTranslate): { question: string; answer: string }[] {
  return [
    { question: t("landing.faqSellItemsQ"), answer: t("landing.faqSellItemsA") },
    { question: t("landing.faqBuyQ"), answer: t("landing.faqBuyA") },
    { question: t("landing.faqSafeQ"), answer: t("landing.faqSafeA") },
    { question: t("landing.faqOfficialQ"), answer: t("landing.faqOfficialA") },
    { question: t("landing.faqListThingsQ"), answer: t("landing.faqListThingsA") },
    { question: t("landing.faqOrgsQ"), answer: t("landing.faqOrgsA") },
    { question: t("landing.faqFeeQ"), answer: t("landing.faqFeeA") },
    { question: t("landing.faqRealMoneyQ"), answer: t("landing.faqRealMoneyA") },
  ]
}

/** Landing page <title> (before the titleTemplate) and meta description. */
export function homeSeoText(t: SeoTranslate): { title: string; description: string } {
  return {
    title: t(
      "landing.seoTitle",
      "SC Market — Star Citizen Marketplace: Buy, Sell & Trade Items in aUEC",
    ),
    description: t("landing.seoDescription", SITE_DESCRIPTION),
  }
}

/** A plain same-site link for crawlable link lists. */
export interface SeoLink {
  /** Site-relative path, e.g. "/wiki/ships". */
  href: string
  text: string
}

/** The main public hub pages, linked from the homepage for discovery. */
export const MAIN_HUB_LINKS: readonly SeoLink[] = [
  { href: MARKET_PATHS.search, text: "Marketplace — items for sale" },
  { href: MARKET_PATHS.shops, text: "Shops" },
  { href: MARKET_PATHS.services, text: "Services" },
  { href: PATHS.contractors, text: "Contractors and organizations" },
  { href: PATHS.recruiting, text: "Recruiting" },
  { href: WIKI_PATHS.hub, text: "Game database" },
  { href: WIKI_PATHS.items, text: "Items" },
  { href: WIKI_PATHS.ships, text: "Ships and vehicles" },
  { href: WIKI_PATHS.commodities, text: "Commodities" },
  { href: WIKI_PATHS.locations, text: "Star map and locations" },
  { href: WIKI_PATHS.manufacturers, text: "Manufacturers" },
  { href: GAME_DATA_PATHS.mining, text: "Mining ores" },
  { href: GAME_DATA_PATHS.miningLocations, text: "Mining locations" },
  { href: GAME_DATA_PATHS.blueprints, text: "Crafting blueprints" },
  { href: GAME_DATA_PATHS.missions, text: "Missions" },
  { href: GAME_DATA_PATHS.resources, text: "Resources" },
  { href: HELP_PATHS.hub, text: "Help & Guides" },
  { href: HELP_PATHS.about, text: "About SC Market" },
]

/** "/" (LandingPage). */
export function buildHomeHead(t: SeoTranslate, origin: string): PageHead {
  const { title, description } = homeSeoText(t)
  const canonical = `${origin}/`
  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image: `${origin}/homepage-preview.webp`,
        ogType: "website",
        twitterCard: "summary_large_image",
      }),
    ],
    jsonLd: [siteJsonLd(), faqPageJsonLd(landingFaqs(t))],
  }
}

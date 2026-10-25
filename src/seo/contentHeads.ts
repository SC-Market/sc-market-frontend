/**
 * Heads for Help & Guides and About, shared by the SPA pages and the edge
 * bridge (src/bridge/pages.ts) so the two can't drift. Pure: no React, no
 * browser globals. English only, like the content itself.
 */
import { HELP_PATHS } from "../routes/paths"
import type {
  AboutMeta,
  CategoryMeta,
  ContentIndex,
  GuideMeta,
} from "../features/help/domain/types"
import { buildHubHead, type HubCrumb, type SeoText } from "./hubHeads"
import { breadcrumbJsonLd, PageHead, socialMeta } from "./pageHead"
import { WEBSITE_JSON_LD_ID, type SeoLink } from "./siteHeads"
import { DEFAULT_FRONTEND_URL } from "./constants"

/** @id of the site's Organization node (siteJsonLd). */
const ORGANIZATION_JSON_LD_ID = `${DEFAULT_FRONTEND_URL}/#organization`

export const HELP_HUB_NAME = "Help & Guides"
export const HELP_CRUMB: HubCrumb = { name: HELP_HUB_NAME, path: HELP_PATHS.hub }

export const helpHubSeoText: SeoText = {
  title: "Help & Guides — How to Use SC Market",
  description:
    "Step-by-step guides for SC Market, the Star Citizen marketplace: create an account, buy and sell items for aUEC, and follow an order from start to finish.",
}

export function guideCategorySeoText(category: CategoryMeta): SeoText {
  return {
    title: `${category.title} — SC Market Help & Guides`,
    description: category.description,
  }
}

/** Guide <title> (contains "SC Market", so the titleTemplate leaves it). */
export function guideTitle(guide: GuideMeta): string {
  return `${guide.title} — SC Market Guides`
}

export function guideLink(guide: GuideMeta): SeoLink {
  return { href: HELP_PATHS.guide(guide.category, guide.slug), text: guide.title }
}

export function buildGuidesHubHead(index: ContentIndex, origin: string): PageHead {
  return buildHubHead(
    {
      text: helpHubSeoText,
      path: HELP_PATHS.hub,
      name: HELP_HUB_NAME,
      links: index.guides.map(guideLink),
    },
    origin,
  )
}

export function buildGuideCategoryHead(
  category: CategoryMeta,
  guides: readonly GuideMeta[],
  origin: string,
): PageHead {
  return buildHubHead(
    {
      text: guideCategorySeoText(category),
      path: HELP_PATHS.category(category.id),
      name: category.title,
      parents: [HELP_CRUMB],
      links: guides.map(guideLink),
    },
    origin,
  )
}

/**
 * A guide: BreadcrumbList (SC Market › Help & Guides › Category › Guide),
 * TechArticle, and HowTo when the guide opts in and has a Steps list.
 */
export function buildGuideHead(
  guide: GuideMeta,
  category: CategoryMeta,
  steps: readonly string[],
  origin: string,
): PageHead {
  const title = guideTitle(guide)
  const canonical = `${origin}${HELP_PATHS.guide(guide.category, guide.slug)}`
  const author = { "@type": "Person", name: guide.author }
  const jsonLd: object[] = [
    breadcrumbJsonLd([
      { name: "SC Market", url: `${origin}/` },
      { name: HELP_HUB_NAME, url: `${origin}${HELP_PATHS.hub}` },
      { name: category.title, url: `${origin}${HELP_PATHS.category(category.id)}` },
      { name: guide.title, url: canonical },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: guide.title,
      description: guide.description,
      url: canonical,
      mainEntityOfPage: canonical,
      dateModified: guide.updated,
      inLanguage: "en",
      author,
      publisher: { "@id": ORGANIZATION_JSON_LD_ID },
      isPartOf: { "@id": WEBSITE_JSON_LD_ID },
      articleSection: category.title,
      ...(guide.keywords.length > 0 && { keywords: guide.keywords.join(", ") }),
    },
  ]
  if (guide.howto && steps.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: guide.title,
      description: guide.description,
      url: canonical,
      step: steps.map((text, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: text.length > 110 ? `${text.slice(0, 109).trimEnd()}…` : text,
        text,
      })),
    })
  }
  return {
    title,
    canonical,
    meta: [
      { name: "description", content: guide.description },
      { name: "author", content: guide.author },
      ...socialMeta({
        title,
        description: guide.description,
        url: canonical,
        ogType: "article",
        twitterCard: "summary",
      }),
      { property: "article:modified_time", content: guide.updated },
    ],
    jsonLd,
  }
}

export function aboutTitle(about: AboutMeta): string {
  return `${about.title} — SC Market`
}

/** /about: AboutPage about the site's Organization, plus breadcrumbs. */
export function buildAboutHead(about: AboutMeta, origin: string): PageHead {
  const title = aboutTitle(about)
  const canonical = `${origin}${HELP_PATHS.about}`
  return {
    title,
    canonical,
    meta: [
      { name: "description", content: about.description },
      ...socialMeta({
        title,
        description: about.description,
        url: canonical,
        ogType: "website",
        twitterCard: "summary",
      }),
    ],
    jsonLd: [
      breadcrumbJsonLd([
        { name: "SC Market", url: `${origin}/` },
        { name: about.title, url: canonical },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: about.title,
        description: about.description,
        url: canonical,
        dateModified: about.updated,
        inLanguage: "en",
        mainEntity: { "@id": ORGANIZATION_JSON_LD_ID },
        isPartOf: { "@id": WEBSITE_JSON_LD_ID },
      },
    ],
  }
}

/**
 * Heads for Help & Guides, About and the changelog, shared by the SPA pages and the edge
 * bridge (src/bridge/pages.ts) so the two can't drift. Pure: no React, no
 * browser globals. English, except a guide's translations (buildGuideHead).
 */
import { CHANGELOG_PATHS, HELP_PATHS } from "../routes/paths"
import type {
  AboutMeta,
  CategoryMeta,
  ChangelogMeta,
  ContentIndex,
  GuideMeta,
  GuideTranslationMeta,
} from "../features/help/domain/types"
import {
  localizedGuideMeta,
  localizedGuidePath,
} from "../features/help/domain/locales"
import { buildHubHead, type HubCrumb, type SeoText } from "./hubHeads"
import { breadcrumbJsonLd, PageHead, socialMeta } from "./pageHead"
import { WEBSITE_JSON_LD_ID, type SeoLink } from "./siteHeads"
import { DEFAULT_FRONTEND_URL } from "./constants"
import { formatDate } from "../util/format/format"

/** @id of the site's Organization node (siteJsonLd). */
const ORGANIZATION_JSON_LD_ID = `${DEFAULT_FRONTEND_URL}/#organization`

export const HELP_HUB_NAME = "Help & Guides"
export const HELP_CRUMB: HubCrumb = {
  name: HELP_HUB_NAME,
  path: HELP_PATHS.hub,
}

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
  return {
    href: HELP_PATHS.guide(guide.category, guide.slug),
    text: guide.title,
  }
}

export function buildGuidesHubHead(
  index: ContentIndex,
  origin: string,
): PageHead {
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
 *
 * With `translation` (a published one, domain/locales.ts) the head is the
 * translated page's: its title and description, canonical `<path>?lng=<locale>`
 * and `inLanguage`. A guide with published translations lists every language
 * version as hreflang alternates (plus x-default, the English page) on each
 * of them; an English-only guide has none.
 */
export function buildGuideHead(
  english: GuideMeta,
  category: CategoryMeta,
  steps: readonly string[],
  origin: string,
  translation?: GuideTranslationMeta,
): PageHead {
  const guide = localizedGuideMeta(english, translation)
  const locale = translation?.locale ?? "en"
  const title = guideTitle(guide)
  const path = HELP_PATHS.guide(guide.category, guide.slug)
  const canonical = `${origin}${localizedGuidePath(path, locale)}`
  const alternates =
    english.translations.length > 0
      ? [
          { hreflang: "en", href: `${origin}${path}` },
          ...english.translations.map((t) => ({
            hreflang: t.locale,
            href: `${origin}${localizedGuidePath(path, t.locale)}`,
          })),
          { hreflang: "x-default", href: `${origin}${path}` },
        ]
      : undefined
  const author = { "@type": "Person", name: guide.author }
  const jsonLd: object[] = [
    breadcrumbJsonLd([
      { name: "SC Market", url: `${origin}/` },
      { name: HELP_HUB_NAME, url: `${origin}${HELP_PATHS.hub}` },
      {
        name: category.title,
        url: `${origin}${HELP_PATHS.category(category.id)}`,
      },
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
      inLanguage: locale,
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
    lang: locale,
    ...(alternates && { alternates }),
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

export const CHANGELOG_NAME = "Changelog"

export const changelogSeoText: SeoText = {
  title: "Changelog — What's New on SC Market",
  description:
    "What's new on SC Market, the Star Citizen marketplace: new features, improvements and fixes, week by week.",
}

/** "Oct 26, 2026" (dates are UTC calendar days; content is English). */
export function formatChangelogDate(date: string): string {
  // English, like the changelog's content.
  return formatDate(`${date}T00:00:00Z`, "en", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Entry <title> (contains "SC Market", so the titleTemplate leaves it). */
export function changelogEntryTitle(entry: ChangelogMeta): string {
  return `${entry.title} — SC Market Changelog`
}

/**
 * /changelog: BreadcrumbList and CollectionPage with an ItemList of the
 * entries. Until an entry is published the page is an empty state: noindex.
 */
export function buildChangelogIndexHead(
  entries: readonly ChangelogMeta[],
  origin: string,
): PageHead {
  const head = buildHubHead(
    {
      text: changelogSeoText,
      path: CHANGELOG_PATHS.index,
      name: CHANGELOG_NAME,
      links: entries.map((e) => ({
        href: CHANGELOG_PATHS.entry(e.slug),
        text: e.title,
      })),
    },
    origin,
  )
  if (entries.length > 0) return head
  return {
    ...head,
    meta: [{ name: "robots", content: "noindex" }, ...head.meta],
  }
}

/** /changelog/<date>: BreadcrumbList and BlogPosting. */
export function buildChangelogEntryHead(
  entry: ChangelogMeta,
  origin: string,
): PageHead {
  const title = changelogEntryTitle(entry)
  const canonical = `${origin}${CHANGELOG_PATHS.entry(entry.slug)}`
  return {
    title,
    canonical,
    meta: [
      { name: "description", content: entry.summary },
      ...socialMeta({
        title,
        description: entry.summary,
        url: canonical,
        ogType: "article",
        twitterCard: "summary",
      }),
      { property: "article:published_time", content: entry.date },
    ],
    jsonLd: [
      breadcrumbJsonLd([
        { name: "SC Market", url: `${origin}/` },
        { name: CHANGELOG_NAME, url: `${origin}${CHANGELOG_PATHS.index}` },
        { name: entry.title, url: canonical },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: entry.title,
        description: entry.summary,
        url: canonical,
        mainEntityOfPage: canonical,
        datePublished: entry.date,
        dateModified: entry.date,
        inLanguage: "en",
        author: { "@id": ORGANIZATION_JSON_LD_ID },
        publisher: { "@id": ORGANIZATION_JSON_LD_ID },
        isPartOf: { "@id": WEBSITE_JSON_LD_ID },
        articleSection: CHANGELOG_NAME,
        ...(entry.tags.length > 0 && { keywords: entry.tags.join(", ") }),
      },
    ],
  }
}

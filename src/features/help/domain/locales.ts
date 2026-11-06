/**
 * Guide translations (content/guides/<category>/<slug>.<locale>.md next to
 * the English source, see content/STYLE.md "Translations"). Pure: shared by
 * the SPA, the edge bridge and the content build.
 *
 * A translated guide lives on the guide's own URL with `?lng=<locale>`, the
 * same query the rest of the site reads the language from (util/i18n.ts
 * detection, src/ssr/protocol.ts). Only translations that are up to date
 * with the English text (their `source_hash`) are published: a missing or
 * stale one falls back to English.
 */
import { SUPPORTED_LOCALES, toSupportedLocale } from "../../../util/locales"
import type { GuideMeta, GuideTranslationMeta } from "./types"

/** Locales a guide can be translated into: every shipped locale but English. */
export const GUIDE_LOCALES: readonly string[] = SUPPORTED_LOCALES.filter(
  (l) => l !== "en",
)

export function isGuideLocale(locale: string): boolean {
  return GUIDE_LOCALES.includes(locale)
}

/** Body key of a guide in a language (content.ts `bodies`): English is the bare id. */
export function guideBodyKey(id: string, locale: string): string {
  return locale === "en" ? id : `${id}@${locale}`
}

/** A guide path in a language: English is the clean path, others add `?lng=`. */
export function localizedGuidePath(path: string, locale: string): string {
  return locale === "en" ? path : `${path}?lng=${encodeURIComponent(locale)}`
}

/** The published translation of a guide for a language tag, if there is one. */
export function guideTranslation(
  guide: GuideMeta,
  language: string | undefined,
): GuideTranslationMeta | undefined {
  const locale = toSupportedLocale(language || "en")
  if (locale === "en") return undefined
  return guide.translations.find((t) => t.locale === locale)
}

/** The guide's metadata in a translation's language (or the English guide). */
export function localizedGuideMeta(
  guide: GuideMeta,
  translation: GuideTranslationMeta | undefined,
): GuideMeta {
  if (!translation) return guide
  return {
    ...guide,
    title: translation.title,
    description: translation.description,
    keywords: translation.keywords,
    updated: translation.updated,
  }
}

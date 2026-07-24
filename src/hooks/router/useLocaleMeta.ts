import { useTranslation } from "react-i18next"
import { useHead } from "@unhead/react"
import { SUPPORTED_LOCALES } from "../../util/i18n"

// Map our i18next/BCP-47 language tags to the underscored region-qualified form
// Open Graph expects for og:locale (language_TERRITORY). Social + AI preview
// crawlers read og:locale to label the content's language even though the SPA
// itself serves every language from the same URL (language is chosen at runtime
// by i18next-browser-languagedetector: ?lng= → cookie → localStorage → browser).
//
// True per-language <link rel="alternate" hreflang> is intentionally NOT emitted
// here: hreflang requires distinct, crawlable URLs per language, and until the
// prerendering project serves per-language HTML to bots those URLs would be
// byte-identical duplicates. hreflang belongs to that phase; this hook covers
// the language-declaration wins that are safe today.
const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  ja: "ja_JP",
  uk: "uk_UA",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
}

/**
 * Declares the active language to crawlers: sets <html lang> to the current
 * i18next language and emits og:locale (+ og:locale:alternate for the other
 * shipped locales). Reactive to language changes via useTranslation's i18n.
 */
export function useLocaleMeta() {
  const { i18n } = useTranslation()

  // i18n.language can be a resolved tag like "en-US"; normalize to the base tag
  // we ship (e.g. "en"), keeping the zh-CN/zh-TW script tags intact.
  const raw = i18n.language || "en"
  const current = SUPPORTED_LOCALES.includes(raw)
    ? raw
    : SUPPORTED_LOCALES.find((l) => raw.startsWith(l.split("-")[0])) || "en"

  const ogCurrent = OG_LOCALE[current] || "en_US"
  const alternates = SUPPORTED_LOCALES.filter((l) => l !== current).map(
    (l) => ({
      property: "og:locale:alternate",
      content: OG_LOCALE[l],
    }),
  )

  useHead({
    htmlAttrs: { lang: current },
    meta: [{ property: "og:locale", content: ogCurrent }, ...alternates],
  })
}

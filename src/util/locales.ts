/**
 * The locales SC Market ships, and how a language tag maps onto them. Pure
 * (no i18next), so the SSR Pages Function can pick a page's language from
 * the request without loading the app (src/ssr/protocol.ts).
 */

// Every locale we ship translation files for. `code` is the i18next/BCP-47
// language tag; `endonym` is the language's own native name (shown in the
// switcher). Keys missing from a locale fall back to English (fallbackLng),
// so partially-translated locales degrade gracefully rather than showing blanks.
export const languages = [
  { code: "en", endonym: "English" },
  { code: "de", endonym: "Deutsch" },
  { code: "es", endonym: "Español" },
  { code: "fr", endonym: "Français" },
  { code: "ja", endonym: "日本語" },
  { code: "uk", endonym: "Українська" },
  { code: "zh-CN", endonym: "简体中文" },
  { code: "zh-TW", endonym: "繁體中文" },
]

export const SUPPORTED_LOCALES = languages.map((l) => l.code)

/**
 * The shipped locale code for a language tag: "de-DE" -> "de", "zh" ->
 * "zh-CN", "en-GB" -> "en". Detected languages are often regional tags, and a
 * bundle has to be added under the shipped code for i18next to find it.
 */
export function toSupportedLocale(tag: string): string {
  if (SUPPORTED_LOCALES.includes(tag)) return tag
  const base = tag.split("-")[0]
  return SUPPORTED_LOCALES.find((l) => l.split("-")[0] === base) || "en"
}

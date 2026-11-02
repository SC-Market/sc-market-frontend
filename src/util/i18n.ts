import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import en from "../locales/en/english.json"
import { useEffect, useState } from "react"
import { toSupportedLocale } from "./locales"

import {
  enUS as coreEnUS,
  deDE as coreDeDE,
  esES as coreEsES,
  frFR as coreFrFR,
  jaJP as coreJaJP,
  zhCN as coreZhCN,
  zhTW as coreZhTW,
  ukUA as coreUkUA,
} from "@mui/material/locale"

export { languages, SUPPORTED_LOCALES, toSupportedLocale } from "./locales"

export async function loadLocale(requested: string): Promise<void> {
  const locale = toSupportedLocale(requested)
  if (i18n.hasResourceBundle(locale, "translation")) {
    return
  }

  if (locale === "en") {
    return
  }

  try {
    let translation: Record<string, unknown>

    switch (locale) {
      case "de":
        translation = (await import("../locales/de/de.json")).default
        break
      case "es":
        translation = (await import("../locales/es/es.json")).default
        break
      case "fr":
        translation = (await import("../locales/fr/fr.json")).default
        break
      case "ja":
        translation = (await import("../locales/ja/ja.json")).default
        break
      case "uk":
        translation = (await import("../locales/uk/ukrainian.json")).default
        break
      case "zh-CN":
        translation = (await import("../locales/zh/zh_Hans.json")).default
        break
      case "zh-TW":
        translation = (await import("../locales/zh/zh_Hant.json")).default
        break
      default:
        return
    }

    i18n.addResourceBundle(locale, "translation", translation, true, true)
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error)
    i18n.changeLanguage("en")
  }
}

export async function preloadLocales(locales: string[]): Promise<void> {
  await Promise.all(locales.map((locale) => loadLocale(locale)))
}

/** MUI's own strings (pagination, breadcrumbs, ...) for a language. */
export function muiCoreLocale(languageCode: string): typeof coreEnUS {
  const coreByLocale: Record<string, typeof coreEnUS> = {
    de: coreDeDE,
    es: coreEsES,
    fr: coreFrFR,
    ja: coreJaJP,
    uk: coreUkUA,
    "zh-CN": coreZhCN,
    "zh-TW": coreZhTW,
  }
  return coreByLocale[toSupportedLocale(languageCode)] ?? coreEnUS
}

export async function getMuiLocales(languageCode: string) {
  const pickers = await import("@mui/x-date-pickers/locales").then((m) => {
    switch (languageCode) {
      case "de":
        return m.deDE
      case "es":
        return m.esES
      case "fr":
        return m.frFR
      case "ja":
        return m.jaJP
      case "uk":
        return m.ukUA
      case "zh-CN":
        return m.zhCN
      case "zh-TW":
        return m.zhTW
      default:
        return m.enUS
    }
  })

  return { core: muiCoreLocale(languageCode), pickers }
}

export async function getMuiDataGridLocale(languageCode: string) {
  return import("@mui/x-data-grid/locales").then((m) => {
    switch (languageCode) {
      case "de":
        return m.deDE
      case "es":
        return m.esES
      case "fr":
        return m.frFR
      case "ja":
        return m.jaJP
      case "uk":
        return m.ukUA
      case "zh-CN":
        return m.zhCN
      case "zh-TW":
        return m.zhTW
      default:
        return m.enUS
    }
  })
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV,
    // The default order (?lng, i18next cookie, localStorage, browser), and
    // the choice is also kept in a cookie: the SSR Function renders the
    // page in that language (src/ssr/protocol.ts). Lax so it is sent on
    // arrivals from search results and chat links too.
    detection: {
      caches: ["localStorage", "cookie"],
      cookieOptions: { path: "/", sameSite: "lax" },
      cookieMinutes: 60 * 24 * 365,
    },
    // "zh" too: with nonExplicitSupportedLngs i18next checks a regional tag
    // by its language part, so without it "zh-TW" and "zh-CN" (a saved
    // choice, or the browser's language) were rejected and the visitor got
    // their next language instead (usually English) on every load. A bare
    // or other "zh-*" tag becomes a shipped one in initialLocaleReady.
    supportedLngs: ["en", "de", "es", "fr", "ja", "uk", "zh", "zh-CN", "zh-TW"],
    fallbackLng: "en",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    // Re-render when a locale bundle arrives. Bundles other than English load
    // on demand (loadLocale), sometimes after the language is already set
    // (the detected language at startup); without this, components kept
    // showing the English fallback until something else re-rendered them.
    react: {
      bindI18nStore: "added",
    },
    resources: {
      en: { translation: en },
    },
  })

i18n.on("languageChanged", async (lng) => {
  await loadLocale(lng)
})

/** Longest the first render waits for a non-English locale's strings. */
const INITIAL_LOCALE_WAIT_MS = 2500

/**
 * Resolves when the detected language's strings are loaded (or after
 * INITIAL_LOCALE_WAIT_MS, so a slow network never blocks the app). index.tsx
 * waits for it before the first render, so a German visitor's first paint is
 * already German: rendering English first and swapping the strings in ~2 s
 * later reflowed the hero, navbar and cookie bar (CLS ~0.05). Until then the
 * edge bridge's HTML stays on screen. English resolves at once.
 *
 * Other locales are NOT warmed in the background: that downloaded and
 * evaluated ~1.5 MB of JSON 1 s after every page load. Switching language
 * loads the one bundle it needs (changeLocale awaits it).
 */
export const initialLocaleReady: Promise<void> = (() => {
  if (typeof window === "undefined") return Promise.resolve()
  const detected = toSupportedLocale(i18n.language || "en")
  if (detected === "en") return Promise.resolve()
  const load = loadLocale(detected).then(() => {
    // e.g. detected "zh" -> bundle under "zh-CN": switch to the shipped code
    if (
      i18n.language !== detected &&
      toSupportedLocale(i18n.language) === detected
    )
      return i18n.changeLanguage(detected).then(() => undefined)
  })
  return Promise.race([
    load,
    new Promise<void>((resolve) =>
      window.setTimeout(resolve, INITIAL_LOCALE_WAIT_MS),
    ),
  ]).catch(() => undefined)
})()

/** Load a locale's strings, then switch to it (no English flash). */
export async function changeLocale(locale: string): Promise<void> {
  await loadLocale(locale)
  await i18n.changeLanguage(toSupportedLocale(locale))
}

export function useLocaleManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentLocale, setCurrentLocale] = useState(i18n.language)

  const changeLocale = async (locale: string) => {
    setIsLoading(true)
    try {
      await changeLocale(locale)
      setCurrentLocale(locale)
    } catch (error) {
      console.error("Failed to change locale:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const preloadLocale = async (locale: string) => {
    await loadLocale(locale)
  }

  return {
    currentLocale,
    changeLocale,
    preloadLocale,
    isLoading,
  }
}

export default i18n

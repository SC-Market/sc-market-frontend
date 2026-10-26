import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import en from "../locales/en/english.json"
import { useEffect, useState } from "react"

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

export async function loadLocale(locale: string): Promise<void> {
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

  const coreByLocale: Record<string, typeof coreEnUS> = {
    de: coreDeDE,
    es: coreEsES,
    fr: coreFrFR,
    ja: coreJaJP,
    uk: coreUkUA,
    "zh-CN": coreZhCN,
    "zh-TW": coreZhTW,
  }
  const core = coreByLocale[languageCode] ?? coreEnUS

  return { core, pickers }
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
    supportedLngs: ["en", "de", "es", "fr", "ja", "uk", "zh-CN", "zh-TW"],
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

if (typeof window !== "undefined") {
  const detectedLang = i18n.language || "en"

  if (detectedLang !== "en") {
    loadLocale(detectedLang)
  }

  // Other locales are NOT warmed in the background: that downloaded and
  // evaluated ~1.5 MB of JSON 1 s after every page load. Switching language
  // loads the one bundle it needs (changeLocale / PreferencesControls await it
  // before changing language).
}

/** Load a locale's strings, then switch to it (no English flash). */
export async function changeLocale(locale: string): Promise<void> {
  await loadLocale(locale)
  await i18n.changeLanguage(locale)
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

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import moment from "moment"

// Only import English as the fallback language
import en from "../locales/en/english.json"
import { useEffect, useState } from "react"

// MUI locale bundles (centralized mapping here)
import {
  enUS as coreEnUS,
  zhCN as coreZhCN,
  ukUA as coreUkUA,
} from "@mui/material/locale"
import {
  enUS as pickersEnUS,
  zhCN as pickersZhCN,
  ukUA as pickersUkUA,
} from "@mui/x-date-pickers/locales"
import {
  enUS as gridEnUS,
  zhCN as gridZhCN,
  ukUA as gridUkUA,
} from "@mui/x-data-grid/locales"

// Language configuration with endonyms
export const languages = [
  { code: "en", endonym: "English" },
  { code: "uk", endonym: "Українська" },
  { code: "zh-CN", endonym: "简体中文" },
]

// Dynamic locale loading function
export async function loadLocale(locale: string): Promise<void> {
  // Skip if already loaded
  if (i18n.hasResourceBundle(locale, "translation")) {
    return
  }

  // Skip English as it's already loaded
  if (locale === "en") {
    return
  }

  try {
    let translation: Record<string, unknown>

    switch (locale) {
      case "uk":
        translation = (await import("../locales/uk/ukrainian.json")).default
        break
      case "zh-CN":
        translation = (await import("../locales/zh/zh_Hans.json")).default
        break
      default:
        return // Unknown locale
    }

    // Add the locale to i18n
    i18n.addResourceBundle(locale, "translation", translation, true, true)

    // Update moment locale
    moment.locale(locale)
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error)
    // Fallback to English if locale loading fails
    i18n.changeLanguage("en")
  }
}

// Preload specific locales (useful for common languages)
export async function preloadLocales(locales: string[]): Promise<void> {
  await Promise.all(locales.map((locale) => loadLocale(locale)))
}

export function getMuiLocales(languageCode: string): {
  core: typeof coreEnUS
  pickers: typeof pickersEnUS
  grid: typeof gridEnUS
} {
  switch (languageCode) {
    case "uk":
      return { core: coreUkUA, pickers: pickersUkUA, grid: gridUkUA }
    case "zh-CN":
      return { core: coreZhCN, pickers: pickersZhCN, grid: gridZhCN }
    case "en":
    default:
      return { core: coreEnUS, pickers: pickersEnUS, grid: gridEnUS }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV,
    supportedLngs: ["en", "uk", "zh-CN"],
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en }, // Only English is loaded initially
    },
  })

// Language change handler that automatically loads locales
i18n.on("languageChanged", async (lng) => {
  // Load the locale if it's not already loaded
  await loadLocale(lng)
})

// Preload common locales on app startup (optional)
if (typeof window !== "undefined") {
  // Preload the detected language and common fallbacks
  const detectedLang = i18n.language || "en"
  const commonLocales = ["uk", "zh-CN"] // Most commonly used after English

  if (detectedLang !== "en") {
    loadLocale(detectedLang)
  }

  // Preload common locales in the background
  setTimeout(() => {
    preloadLocales(commonLocales)
  }, 1000)
}

// React hook for locale management
export function useLocaleManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentLocale, setCurrentLocale] = useState(i18n.language)

  const changeLocale = async (locale: string) => {
    setIsLoading(true)
    try {
      await loadLocale(locale)
      await i18n.changeLanguage(locale)
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

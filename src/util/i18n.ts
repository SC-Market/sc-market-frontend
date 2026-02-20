import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import en from "../locales/en/english.json"
import { useEffect, useState } from "react"

import {
  enUS as coreEnUS,
  zhCN as coreZhCN,
  ukUA as coreUkUA,
} from "@mui/material/locale"

export const languages = [
  { code: "en", endonym: "English" },
  { code: "uk", endonym: "Українська" },
  { code: "zh-CN", endonym: "简体中文" },
]

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
      case "uk":
        translation = (await import("../locales/uk/ukrainian.json")).default
        break
      case "zh-CN":
        translation = (await import("../locales/zh/zh_Hans.json")).default
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
      case "uk":
        return m.ukUA
      case "zh-CN":
        return m.zhCN
      default:
        return m.enUS
    }
  })

  const core =
    languageCode === "uk"
      ? coreUkUA
      : languageCode === "zh-CN"
        ? coreZhCN
        : coreEnUS

  return { core, pickers }
}

export async function getMuiDataGridLocale(languageCode: string) {
  return import("@mui/x-data-grid/locales").then((m) => {
    switch (languageCode) {
      case "uk":
        return m.ukUA
      case "zh-CN":
        return m.zhCN
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
    supportedLngs: ["en", "uk", "zh-CN"],
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
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
  const commonLocales = ["uk", "zh-CN"]

  if (detectedLang !== "en") {
    loadLocale(detectedLang)
  }

  setTimeout(() => {
    preloadLocales(commonLocales)
  }, 1000)
}

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

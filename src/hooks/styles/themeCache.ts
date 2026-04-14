import {
  createTheme,
  responsiveFontSizes,
  type Theme,
  type ThemeOptions,
} from "@mui/material"
import { themeBase, mainThemeOptions, lightThemeOptions } from "./Theme"

const CACHE_PREFIX = "sc-market-org-theme-"
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface OrgThemeData {
  light: ThemeOptions
  dark: ThemeOptions
}

interface CachedTheme {
  theme_data: OrgThemeData
  favicon_url: string | null
  updated_at: string
  fetched_at: number
}

function getCached(orgId: string): CachedTheme | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + orgId)
    if (!raw) return null
    const cached: CachedTheme = JSON.parse(raw)
    if (Date.now() - cached.fetched_at > MAX_AGE_MS) {
      localStorage.removeItem(CACHE_PREFIX + orgId)
      return null
    }
    return cached
  } catch {
    return null
  }
}

export function getCachedOrgTheme(
  orgId: string,
  mode: "light" | "dark",
): Theme | null {
  const cached = getCached(orgId)
  if (!cached) return null
  return buildOrgTheme(cached.theme_data, mode)
}

export function getCachedFaviconUrl(orgId: string): string | null {
  return getCached(orgId)?.favicon_url ?? null
}

export function getCachedUpdatedAt(orgId: string): string | null {
  return getCached(orgId)?.updated_at ?? null
}

export function cacheOrgTheme(
  orgId: string,
  themeData: OrgThemeData,
  faviconUrl: string | null,
  updatedAt: string,
): void {
  try {
    const entry: CachedTheme = {
      theme_data: themeData,
      favicon_url: faviconUrl,
      updated_at: updatedAt,
      fetched_at: Date.now(),
    }
    localStorage.setItem(CACHE_PREFIX + orgId, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function clearCachedOrgTheme(orgId: string): void {
  localStorage.removeItem(CACHE_PREFIX + orgId)
}

export function buildOrgTheme(
  themeData: OrgThemeData,
  mode: "light" | "dark",
): Theme {
  const base =
    mode === "light"
      ? [themeBase, mainThemeOptions, lightThemeOptions, themeData.light]
      : [themeBase, mainThemeOptions, themeData.dark]
  return responsiveFontSizes(createTheme(...base))
}

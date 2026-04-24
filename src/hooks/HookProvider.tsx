import React, { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  CssBaseline,
  Snackbar,
  ThemeProvider,
  Typography,
  useMediaQuery,
  createTheme,
  responsiveFontSizes,
} from "@mui/material"
import { DrawerOpenContext } from "./layout/Drawer"
import {
  CurrentChatIDContext,
  CurrentChatMessagesContext,
  CurrentChatContext,
  type Chat,
  type Message,
} from "../features/chats"
import { lightTheme, mainTheme } from "./styles/Theme"
import { CLEAN_theme } from "./styles/themes/CLEAN"
import { CLEAN_DARK_theme } from "./styles/themes/CLEAN_DARK"
import { CurrentOrgProvider } from "./login/CurrentOrg"
import { Provider } from "react-redux"
import { store } from "../store/store"
import { AlertInterface } from "../datatypes/Alert"
import { AlertHookContext } from "./alert/AlertHook"
import { ServiceSearchContext } from "../features/contracting/hooks/ServiceSearch"
import { LightThemeContext, ThemeChoice } from "./styles/LightTheme"
import { useCookies, CookiesProvider } from "react-cookie"
import { CURRENT_CUSTOM_ORG, IS_CUSTOM_DOMAIN, cacheDomainOrg } from "./contractor/CustomDomain"
import { setSidebarConfig } from "../components/sidebar/utils/sidebarFilters"
import { contractorsApi } from "../store/api/contractors"
import { CUSTOM_THEMES } from "./styles/custom_themes"
import {
  getCachedOrgTheme,
  getCachedFaviconUrl,
  getCachedUpdatedAt,
  cacheOrgTheme,
  buildOrgTheme,
} from "./styles/themeCache"
import { useLocation, useSearchParams } from "react-router-dom"
import { isCitizenIdEnabled, BACKEND_URL } from "../util/constants"
import { useGetUserProfileQuery } from "../features/profile/api/profileApi"
import { startProactiveRefresh } from "../store/proactiveRefresh"

import { getMuiLocales } from "../util/i18n"
import { useTranslation } from "react-i18next"

function ThemeProviderWrapper(props: { children: React.ReactElement }) {
  const [cookies, setCookie, removeCookie] = useCookies(["theme"])
  const prefersLight = useMediaQuery("(prefers-color-scheme: light)")
  const isDev = import.meta.env.DEV || import.meta.env.MODE === "development"
  const [useLightTheme, setUseLightTheme] = useState<ThemeChoice>(
    cookies.theme || "system",
  )
  const location = useLocation()
  const { i18n } = useTranslation()

  const mightBeCustomTheme =
    useLightTheme !== "light" &&
    useLightTheme !== "dark" &&
    useLightTheme !== "system" &&
    CUSTOM_THEMES.has(useLightTheme)
  const { data: userProfile } = useGetUserProfileQuery(undefined, {
    skip: isDev || !mightBeCustomTheme,
  })
  const isAdmin = userProfile?.role === "admin"

  // Determine the actual theme to use (resolves "system" to light/dark)
  const actualTheme = useMemo(() => {
    if (useLightTheme === "system") {
      return prefersLight ? "light" : "dark"
    }
    // If it's a custom theme name, return it as-is (for dev mode or admins)
    if ((isDev || isAdmin || useLightTheme === "CLEAN_DARK") && CUSTOM_THEMES.has(useLightTheme)) {
      return useLightTheme
    }
    return useLightTheme
  }, [useLightTheme, prefersLight, isDev, isAdmin])

  // Track dynamically-fetched org theme (populated by background revalidation)
  const [dynamicOrgTheme, setDynamicOrgTheme] = useState<ReturnType<typeof getCachedOrgTheme>>(null)

  const resolvedMode = actualTheme === "light" ? ("light" as const) : ("dark" as const)

  const baseTheme = useMemo(() => {
    // In dev mode or for admins, check if a custom theme is selected
    if ((isDev || isAdmin || useLightTheme === "CLEAN_DARK") && CUSTOM_THEMES.has(useLightTheme)) {
      const customTheme = CUSTOM_THEMES.get(useLightTheme)
      if (customTheme) return customTheme
    }

    // Dynamic org theme (fetched from API)
    if (dynamicOrgTheme) return dynamicOrgTheme

    // Cached org theme from localStorage
    if (CURRENT_CUSTOM_ORG) {
      const cached = getCachedOrgTheme(CURRENT_CUSTOM_ORG, resolvedMode)
      if (cached) return cached
    }
    return actualTheme === "light" ? CLEAN_theme : mainTheme
  }, [actualTheme, location.pathname, isDev, isAdmin, useLightTheme, dynamicOrgTheme, resolvedMode])

  // Start proactive JWT refresh (every 13 min + on tab visibility change)
  useEffect(() => { startProactiveRefresh() }, [])

  // Background: resolve domain + fetch theme for white-label sites
  useEffect(() => {
    if (!IS_CUSTOM_DOMAIN) return
    const hostname = window.location.hostname

    async function resolveAndFetchTheme() {
      try {
        // Step 1: Resolve domain → spectrum_id
        const domainResult = await store.dispatch(
          contractorsApi.endpoints.resolveDomain.initiate(hostname),
        )
        if (!domainResult.data?.data) return
        const { spectrum_id } = domainResult.data.data
        if (!spectrum_id) return
        cacheDomainOrg(domainResult.data.data)

        // Step 2: Fetch org theme
        const themeResult = await store.dispatch(
          contractorsApi.endpoints.getOrgTheme.initiate(spectrum_id),
        )
        if (!themeResult.data) return
        const themeData = (themeResult.data as any).data || themeResult.data
        const { theme_data, favicon_url, updated_at } = themeData

        // Step 3: Check if newer than cache
        const cachedUpdatedAt = getCachedUpdatedAt(spectrum_id)
        if (!cachedUpdatedAt || updated_at > cachedUpdatedAt) {
          cacheOrgTheme(spectrum_id, theme_data, favicon_url, updated_at)
        }

        // Step 4: Build and apply theme
        const built = buildOrgTheme(theme_data, resolvedMode)
        setDynamicOrgTheme(built)

        // Step 5: Fetch sidebar config for tab filtering + custom tabs
        try {
          const sidebarResult = await store.dispatch(
            contractorsApi.endpoints.getWhitelabelSidebar.initiate(spectrum_id),
          )
          if (sidebarResult.data) {
            const items = (sidebarResult.data as any).data || sidebarResult.data || []
            setSidebarConfig(items)
          }
        } catch { /* sidebar config is optional */ }
      } catch {
        // API unavailable — cached/hardcoded theme continues to work
      }
    }

    resolveAndFetchTheme()
  }, [resolvedMode])

  // Build a localized theme when language changes
  const [localizedTheme, setLocalizedTheme] = useState(() =>
    responsiveFontSizes(createTheme(baseTheme)),
  )

  useEffect(() => {
    getMuiLocales(i18n.language).then(({ core, pickers }) => {
      setLocalizedTheme(
        responsiveFontSizes(createTheme(baseTheme, core, pickers)),
      )
    })
  }, [baseTheme, i18n.language])

  // Sync <meta name="theme-color"> and favicon with active theme
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", localizedTheme.palette.background.navbar)
    if (CURRENT_CUSTOM_ORG) {
      const favicon = getCachedFaviconUrl(CURRENT_CUSTOM_ORG)
      if (favicon) {
        document
          .querySelector('link[rel="icon"]')
          ?.setAttribute("href", favicon)
      }
    }
  }, [localizedTheme])

  useEffect(() => {
    if (useLightTheme === "system") {
      // Remove cookie when system is selected
      removeCookie("theme", { path: "/" })
    } else {
      // Save preference when light or dark is selected
      setCookie("theme", useLightTheme, {
        path: "/",
        sameSite: "strict",
        maxAge: 31536000, // 1 year in seconds
      })
    }
  }, [useLightTheme, setCookie, removeCookie])

  const xs = useMediaQuery(localizedTheme.breakpoints.down("sm"))
  const drawerWidthState = useState(!xs)

  return (
    <LightThemeContext.Provider value={[useLightTheme, setUseLightTheme]}>
      <ThemeProvider theme={localizedTheme}>
        <DrawerOpenContext.Provider value={drawerWidthState}>
          {props.children}
        </DrawerOpenContext.Provider>
      </ThemeProvider>
    </LightThemeContext.Provider>
  )
}

export function HookProvider(props: { children: React.ReactElement }) {
  const [alert, issueAlert] = useState<AlertInterface | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()

  // Surface authentication errors coming back via query params
  useEffect(() => {
    const error = searchParams.get("error")
    if (!error) return

    let errorMessage: string | null = null

    // Handle specific error codes
    if (error === "account_not_found") {
      errorMessage =
        searchParams.get("error_description") ||
        t("auth.accountNotFound", "No account found with this login method. Please sign up or try a different login method.")
    } else if (error === "account_already_exists") {
      errorMessage =
        searchParams.get("error_description") ||
        t(
          "auth.accountAlreadyExists",
          "An account already exists with this identity. Please sign in with your original login method.",
        )
    } else if (
      isCitizenIdEnabled &&
      error === "citizenid_account_not_verified"
    ) {
      errorMessage =
        searchParams.get("error_description") ||
        t(
          "auth.citizenidAccountNotVerified",
          "Your Citizen iD account must be verified to sign up or log in.",
        )
    } else if (isCitizenIdEnabled && error === "citizenid_auth_failed") {
      errorMessage =
        searchParams.get("error_description") ||
        t("auth.authFailed", "Citizen iD authentication failed. Please try again or use a different login method.")
    } else if (isCitizenIdEnabled && error === "citizenid_login_failed") {
      errorMessage =
        searchParams.get("error_description") ||
        t("auth.loginFailed", "Failed to sign in with Citizen iD. Please try again or use a different login method.")
    } else if (isCitizenIdEnabled && error === "citizenid_oauth_error") {
      errorMessage =
        searchParams.get("error_description") ||
        t(
          "auth.oauthError",
          "An error occurred during authentication. Please try again.",
        )
    } else {
      // Fallback for any unhandled errors - show the error description if available, or a generic message
      const errorDescription = searchParams.get("error_description")
      if (errorDescription) {
        errorMessage = errorDescription
      } else {
        // Try to provide a user-friendly message based on error code
        if (error.startsWith("citizenid_")) {
          errorMessage = t(
            "auth.genericAuthError",
            "An authentication error occurred. Please try again or contact support if the problem persists.",
          )
        } else {
          errorMessage = t(
            "auth.genericError",
            "An error occurred. Please try again.",
          )
        }
      }
    }

    if (errorMessage) {
      issueAlert({
        severity: "error",
        message: errorMessage,
      })

      searchParams.delete("error")
      searchParams.delete("error_description")
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, issueAlert, t, isCitizenIdEnabled])

  return (
    <CookiesProvider>
    <Provider store={store}>
      <ThemeProviderWrapper>
        <AlertHookContext.Provider value={[alert, issueAlert]}>
          <CurrentOrgProvider>
            <ServiceSearchContext.Provider value={useState({ query: "" })}>
              <CurrentChatIDContext.Provider
                value={useState<string | null | undefined>(undefined)}
              >
                <CurrentChatContext.Provider
                  value={useState<Chat | null | undefined>(undefined)}
                >
                  <CurrentChatMessagesContext.Provider
                    value={useState<Message[]>([])}
                  >
                    <CssBaseline key="css-baseline" />
                    {props.children}
                    <Snackbar
                      open={!!alert}
                      autoHideDuration={6000}
                      onClose={() => issueAlert(null)}
                    >
                      <Alert
                        onClose={() => issueAlert(null)}
                        severity={alert?.severity}
                        sx={{ width: "100%" }}
                        variant={"filled"}
                      >
                        {alert?.message}
                      </Alert>
                    </Snackbar>
                  </CurrentChatMessagesContext.Provider>
                </CurrentChatContext.Provider>
              </CurrentChatIDContext.Provider>
            </ServiceSearchContext.Provider>
          </CurrentOrgProvider>
        </AlertHookContext.Provider>
      </ThemeProviderWrapper>
    </Provider>
    </CookiesProvider>
  )
}

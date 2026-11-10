import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
  createTheme,
  responsiveFontSizes,
} from "@mui/material"
import { DrawerOpenContext } from "./layout/Drawer"
import { useBreakpointDown } from "./layout/useBreakpoint"
import { useHydratedInitialState } from "./ssr/useHydratedInitialState"
import { useHydrated } from "./ssr/useHydrated"
// Direct imports, not the features/chats barrel: the barrel also re-exports
// the chat views, which drags socket.io and the chat UI into the entry bundle.
import { CurrentChatIDContext } from "../features/chats/hooks/CurrentChatID"
import { CurrentChatMessagesContext } from "../features/chats/hooks/CurrentChatMessages"
import { CurrentChatContext } from "../features/chats/hooks/CurrentChat"
import type { Chat, Message } from "../features/chats/domain/types"
import { mainTheme } from "./styles/Theme"
import { CLEAN_theme } from "./styles/themes/CLEAN"
import { CurrentOrgProvider } from "./login/CurrentOrg"
import { useAppDispatch } from "../store/hooks"
import { AlertInterface } from "../datatypes/Alert"
import { AlertHookContext } from "./alert/AlertHook"
import { AlertSnackbar } from "../components/alert/AlertSnackbar"
import { ServiceSearchContext } from "../features/contracting/hooks/ServiceSearch"
import { LightThemeContext, ThemeChoice } from "./styles/LightTheme"
import { useCookies, CookiesProvider } from "react-cookie"
import {
  CustomDomainContext,
  resolveBrowserCustomDomain,
  useCustomDomain,
} from "./contractor/CustomDomain"
import { useResolvedCustomDomain } from "./contractor/useResolvedCustomDomain"
import { contractorsApi } from "../store/api/contractors"
import { CUSTOM_THEMES } from "./styles/custom_themes"
import {
  getCachedOrgTheme,
  getCachedFaviconUrl,
  getCachedUpdatedAt,
  cacheOrgTheme,
  buildOrgTheme,
} from "./styles/themeCache"
import { useSearchParams } from "react-router-dom"
import { isCitizenIdEnabled } from "../util/constants"
import { useGetUserProfileQuery } from "../features/profile/api/profileApi"
import { startProactiveRefresh } from "../store/proactiveRefresh"

import { getMuiLocales, muiCoreLocale } from "../util/i18n"
import { useTranslation } from "react-i18next"
import { isSiteAdmin } from "../util/siteRole"
import { AdminMfaHost } from "../features/mfa/components/AdminMfaHost"
import { useRequestContext } from "../ssr/requestContext"
import { customDomainFromRequest, whiteLabelOrgTheme } from "../ssr/whiteLabel"

function ThemeProviderWrapper(props: { children: React.ReactElement }) {
  const [cookies, setCookie, removeCookie] = useCookies(["theme"])
  const prefersLight = useMediaQuery("(prefers-color-scheme: light)")
  const isDev = import.meta.env.DEV || import.meta.env.MODE === "development"
  // Hydration-safe: a prerendered page was rendered with the default theme
  // (no cookie at build time), so hydrate with that and switch to the
  // visitor's theme right after (useHydratedInitialState). In the SPA the
  // first render already has the cookie's theme.
  // A server-rendered page (SSR Function) may have been rendered in the
  // visitor's light theme (src/ssr/protocol.ts): hydrate with the theme the
  // HTML has (useRequestContext: the request on the server, the HTML's mark
  // in the browser).
  const hydrated = useHydrated()
  const { theme: renderedTheme, whiteLabel: requestWhiteLabel } =
    useRequestContext()
  const [useLightTheme, setUseLightTheme] =
    useHydratedInitialState<ThemeChoice>(
      hydrated ? cookies.theme || "system" : renderedTheme,
    )
  const { i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const { customOrg } = useCustomDomain()

  const mightBeCustomTheme =
    useLightTheme !== "light" &&
    useLightTheme !== "dark" &&
    useLightTheme !== "system" &&
    CUSTOM_THEMES.has(useLightTheme)
  const { data: userProfile } = useGetUserProfileQuery(undefined, {
    skip: isDev || !mightBeCustomTheme,
  })
  const isAdmin = isSiteAdmin(userProfile)

  // Determine the actual theme to use (resolves "system" to light/dark)
  const actualTheme = useMemo(() => {
    if (useLightTheme === "system") {
      return prefersLight ? "light" : "dark"
    }
    // If it's a custom theme name, return it as-is (for dev mode or admins)
    if (
      (isDev || isAdmin || useLightTheme === "CLEAN_DARK") &&
      CUSTOM_THEMES.has(useLightTheme)
    ) {
      return useLightTheme
    }
    return useLightTheme
  }, [useLightTheme, prefersLight, isDev, isAdmin])

  // Track dynamically-fetched org theme (populated by background revalidation)
  const [dynamicOrgTheme, setDynamicOrgTheme] =
    useState<ReturnType<typeof getCachedOrgTheme>>(null)

  const resolvedMode =
    actualTheme === "light" ? ("light" as const) : ("dark" as const)

  const baseTheme = useMemo(() => {
    // In dev mode or for admins, check if a custom theme is selected
    if (
      (isDev || isAdmin || useLightTheme === "CLEAN_DARK") &&
      CUSTOM_THEMES.has(useLightTheme)
    ) {
      const customTheme = CUSTOM_THEMES.get(useLightTheme)
      if (customTheme) return customTheme
    }

    // Dynamic org theme (fetched from API)
    if (dynamicOrgTheme) return dynamicOrgTheme

    // Cached org theme from localStorage; on a server render, the theme the
    // SSR Function resolved for the host (the browser's cache is seeded with
    // the same one before hydrating: src/ssr/whiteLabel.ts)
    if (customOrg) {
      const cached =
        typeof window === "undefined"
          ? whiteLabelOrgTheme(requestWhiteLabel, resolvedMode)
          : getCachedOrgTheme(customOrg, resolvedMode)
      if (cached) return cached
    }
    return actualTheme === "light" ? CLEAN_theme : mainTheme
  }, [
    actualTheme,
    isDev,
    isAdmin,
    useLightTheme,
    dynamicOrgTheme,
    resolvedMode,
    customOrg,
    requestWhiteLabel,
  ])

  // Start proactive JWT refresh (every 13 min + on tab visibility change)
  useEffect(() => {
    startProactiveRefresh()
  }, [])

  // Background: fetch the theme of the white-label org (the domain itself is
  // resolved by useResolvedCustomDomain, which provides customOrg)
  useEffect(() => {
    if (!customOrg) {
      setDynamicOrgTheme(null)
      return
    }
    const spectrum_id = customOrg

    async function fetchTheme() {
      try {
        const themeResult = await dispatch(
          contractorsApi.endpoints.getOrgTheme.initiate(spectrum_id),
        )
        if (!themeResult.data) return
        const themeData = themeResult.data.data
        const { theme_data, favicon_url, updated_at } = themeData

        // Newer than the cache?
        const cachedUpdatedAt = getCachedUpdatedAt(spectrum_id)
        if (!cachedUpdatedAt || updated_at > cachedUpdatedAt) {
          cacheOrgTheme(spectrum_id, theme_data, favicon_url, updated_at)
        }

        // Build and apply it
        const built = buildOrgTheme(theme_data, resolvedMode)
        setDynamicOrgTheme(built)
      } catch {
        // API unavailable — cached/hardcoded theme continues to work
      }
    }

    fetchTheme()
  }, [resolvedMode, dispatch, customOrg])

  // Build a localized theme when language changes. The first render already
  // has MUI's own strings (pagination, ...) in the page's language: a server
  // render does too, and parts of the page that hydrate after the effect
  // below would otherwise render other text than the server's HTML.
  const [localizedTheme, setLocalizedTheme] = useState(() =>
    responsiveFontSizes(createTheme(baseTheme, muiCoreLocale(i18n.language))),
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
    if (customOrg) {
      const favicon = getCachedFaviconUrl(customOrg)
      if (favicon) {
        document
          .querySelector('link[rel="icon"]')
          ?.setAttribute("href", favicon)
      }
    }
  }, [localizedTheme, customOrg])

  // Persist the visitor's choice when they make it (PreferencesControls),
  // not from an effect on the state: while a prerendered page hydrates, the
  // state is the build's default ("system") until useHydratedInitialState
  // re-seeds it from the cookie, and an effect on it removed the stored
  // "dark" (or custom) theme before the re-seed could read it.
  const themeRef = useRef(useLightTheme)
  themeRef.current = useLightTheme
  const setTheme = useCallback<
    React.Dispatch<React.SetStateAction<ThemeChoice>>
  >(
    (next) => {
      const value = typeof next === "function" ? next(themeRef.current) : next
      if (value === "system") {
        removeCookie("theme", { path: "/" })
      } else {
        setCookie("theme", value, {
          path: "/",
          sameSite: "strict",
          maxAge: 31536000, // 1 year in seconds
        })
      }
      setUseLightTheme(value)
    },
    [setCookie, removeCookie, setUseLightTheme],
  )
  const themeContext = useMemo(
    (): [ThemeChoice, React.Dispatch<React.SetStateAction<ThemeChoice>>] => [
      useLightTheme,
      setTheme,
    ],
    [useLightTheme, setTheme],
  )

  return (
    <LightThemeContext.Provider value={themeContext}>
      <ThemeProvider theme={localizedTheme}>
        <DrawerOpenProvider>{props.children}</DrawerOpenProvider>
      </ThemeProvider>
    </LightThemeContext.Provider>
  )
}

/** Sidebar drawer state: starts open except on phones. */
function DrawerOpenProvider(props: { children: React.ReactElement }) {
  const xs = useBreakpointDown("sm")
  const drawerOpenState = useHydratedInitialState(!xs)

  return (
    <DrawerOpenContext.Provider value={drawerOpenState}>
      {props.children}
    </DrawerOpenContext.Provider>
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
        t(
          "auth.accountNotFound",
          "No account found with this login method. Please sign up or try a different login method.",
        )
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
        t(
          "auth.authFailed",
          "Citizen iD authentication failed. Please try again or use a different login method.",
        )
    } else if (isCitizenIdEnabled && error === "citizenid_login_failed") {
      errorMessage =
        searchParams.get("error_description") ||
        t(
          "auth.loginFailed",
          "Failed to sign in with Citizen iD. Please try again or use a different login method.",
        )
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
  }, [searchParams, setSearchParams, issueAlert, t])

  // The white-label domain: resolved from the request on a server render
  // (the SSR Function's `host` variant), from the page and its cache in the
  // browser.
  // The browser then asks the API and applies its answer to this page.
  const requestWhiteLabel = useRequestContext().whiteLabel
  const customDomain = useResolvedCustomDomain(() =>
    typeof window === "undefined"
      ? customDomainFromRequest(requestWhiteLabel)
      : resolveBrowserCustomDomain(),
  )

  return (
    <CustomDomainContext.Provider value={customDomain}>
      <CookiesProvider>
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
                      <AdminMfaHost />
                      <AlertSnackbar
                        alert={alert}
                        onClose={() => issueAlert(null)}
                      />
                    </CurrentChatMessagesContext.Provider>
                  </CurrentChatContext.Provider>
                </CurrentChatIDContext.Provider>
              </ServiceSearchContext.Provider>
            </CurrentOrgProvider>
          </AlertHookContext.Provider>
        </ThemeProviderWrapper>
      </CookiesProvider>
    </CustomDomainContext.Provider>
  )
}

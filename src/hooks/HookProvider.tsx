import React, { useEffect, useMemo, useState } from "react"
import {
  Alert,
  CssBaseline,
  Snackbar,
  ThemeProvider,
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
import { CurrentOrgProvider } from "./login/CurrentOrg"
import { Provider } from "react-redux"
import { store } from "../store/store"
import { AlertInterface } from "../datatypes/Alert"
import { AlertHookContext } from "./alert/AlertHook"
import { ServiceSearchContext } from "./contract/ServiceSearch"
import { LightThemeContext, ThemeChoice } from "./styles/LightTheme"
import { useCookies } from "react-cookie"
import { CURRENT_CUSTOM_ORG } from "./contractor/CustomDomain"
import { CUSTOM_THEMES } from "./styles/custom_themes"
import { useLocation, useSearchParams } from "react-router-dom"
import { isCitizenIdEnabled } from "../util/constants"
import { useGetUserProfileQuery } from "../store/profile"

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
    if ((isDev || isAdmin) && CUSTOM_THEMES.has(useLightTheme)) {
      return useLightTheme
    }
    return useLightTheme
  }, [useLightTheme, prefersLight, isDev, isAdmin])

  const baseTheme = useMemo(() => {
    // In dev mode or for admins, check if a custom theme is selected
    if ((isDev || isAdmin) && CUSTOM_THEMES.has(useLightTheme)) {
      const customTheme = CUSTOM_THEMES.get(useLightTheme)
      if (customTheme) return customTheme
    }

    // Normal theme selection logic
    if (CURRENT_CUSTOM_ORG) {
      const theme = CUSTOM_THEMES.get(CURRENT_CUSTOM_ORG)
      if (theme) return theme
    }
    return actualTheme === "light" ? lightTheme : mainTheme
  }, [actualTheme, location.pathname, isDev, isAdmin, useLightTheme])

  // Build a localized theme when language changes
  const [localizedTheme, setLocalizedTheme] = useState(() => 
    responsiveFontSizes(createTheme(baseTheme))
  )

  useEffect(() => {
    getMuiLocales(i18n.language).then(({ core, pickers, grid }) => {
      setLocalizedTheme(responsiveFontSizes(createTheme(baseTheme, core, pickers, grid)))
    })
  }, [baseTheme, i18n.language])

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
        t("auth.accountNotFound", "No account found. Please sign up first.")
    } else if (error === "account_already_exists") {
      errorMessage =
        searchParams.get("error_description") ||
        t(
          "auth.accountAlreadyExists",
          "An account already exists. Please sign in instead.",
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
        t("auth.authFailed", "Authentication failed. Please try again.")
    } else if (isCitizenIdEnabled && error === "citizenid_login_failed") {
      errorMessage =
        searchParams.get("error_description") ||
        t("auth.loginFailed", "Failed to sign in. Please try again.")
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
  )
}

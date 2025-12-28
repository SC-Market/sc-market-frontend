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
import { CurrentChatIDContext } from "./messaging/CurrentChatID"
import { lightTheme, mainTheme } from "./styles/Theme"
import { Chat, Message } from "../datatypes/Chat"
import { CurrentOrgProvider } from "./login/CurrentOrg"
import { CurrentChatMessagesContext } from "./messaging/CurrentChatMessages"
import { CurrentChatContext } from "./messaging/CurrentChat"
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"
import { isCitizenIdEnabled } from "../util/constants"

// Add moment and locale import + i18n
import moment from "moment"
import { getMuiLocales } from "../util/i18n"
import { useTranslation } from "react-i18next"

export function HookProvider(props: { children: React.ReactElement }) {
  const [alert, issueAlert] = useState<AlertInterface | null>(null)

  const [cookies, setCookie, removeCookie] = useCookies(["theme"])
  const prefersLight = useMediaQuery("(prefers-color-scheme: light)")
  const isDev = import.meta.env.DEV || import.meta.env.MODE === "development"
  const [useLightTheme, setUseLightTheme] = useState<ThemeChoice>(
    cookies.theme || "system",
  )
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { i18n, t } = useTranslation()

  // Determine the actual theme to use (resolves "system" to light/dark)
  const actualTheme = useMemo(() => {
    if (useLightTheme === "system") {
      return prefersLight ? "light" : "dark"
    }
    // If it's a custom theme name, return it as-is
    if (isDev && CUSTOM_THEMES.has(useLightTheme)) {
      return useLightTheme
    }
    return useLightTheme
  }, [useLightTheme, prefersLight, isDev])

  const baseTheme = useMemo(() => {
    // In dev mode, check if a custom theme is selected
    if (isDev && CUSTOM_THEMES.has(useLightTheme)) {
      const customTheme = CUSTOM_THEMES.get(useLightTheme)
      if (customTheme) return customTheme
    }
    
    // Normal theme selection logic
    if (CURRENT_CUSTOM_ORG) {
      const theme = CUSTOM_THEMES.get(CURRENT_CUSTOM_ORG)
      if (theme) return theme
    }
    return actualTheme === "light" ? lightTheme : mainTheme
  }, [actualTheme, location.pathname, isDev, useLightTheme])

  // Build a localized theme when language changes
  const localizedTheme = useMemo(() => {
    const { core, pickers, grid } = getMuiLocales(i18n.language)
    // Merge locale bundles into the current base theme
    return responsiveFontSizes(createTheme(baseTheme, core, pickers, grid))
  }, [baseTheme, i18n.language])

  useEffect(() => {
    if (useLightTheme === "system") {
      // Remove cookie when system is selected
      removeCookie("theme", { path: "/" })
    } else {
      // Save preference when light or dark is selected
      setCookie("theme", useLightTheme, { path: "/", sameSite: "strict" })
    }
  }, [useLightTheme, setCookie, removeCookie])

  // Surface Citizen iD login/link errors coming back via query params
  // Only show if feature is enabled
  useEffect(() => {
    const error = searchParams.get("error")
    if (!error) return

    if (isCitizenIdEnabled && error === "citizenid_account_not_verified") {
      const errorDescription =
        searchParams.get("error_description") ||
        t(
          "auth.citizenidAccountNotVerified",
          "Your Citizen iD account must be verified to sign up or log in.",
        )

      issueAlert({
        severity: "error",
        message: errorDescription,
      })

      searchParams.delete("error")
      searchParams.delete("error_description")
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, issueAlert, t])

  // Add useEffect to support the moment.js language
  useEffect(() => {
    // Set moment.js locale according to current i18n language
    moment.locale(i18n.language)
    const handler = () => {
      moment.locale(i18n.language)
    }
    i18n.on("languageChanged", handler)
    return () => i18n.off("languageChanged", handler)
  }, [])

  const xs = useMediaQuery(localizedTheme.breakpoints.down("sm"))
  const drawerWidthState = useState(!xs)

  return (
    <Provider store={store}>
      <LightThemeContext.Provider value={[useLightTheme, setUseLightTheme]}>
        <ThemeProvider theme={localizedTheme}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <AlertHookContext.Provider value={[alert, issueAlert]}>
              <CurrentOrgProvider>
                <DrawerOpenContext.Provider value={drawerWidthState}>
                  <ServiceSearchContext.Provider
                    value={useState({ query: "" })}
                  >
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
                </DrawerOpenContext.Provider>
              </CurrentOrgProvider>
            </AlertHookContext.Provider>
          </LocalizationProvider>
        </ThemeProvider>
      </LightThemeContext.Provider>
    </Provider>
  )
}

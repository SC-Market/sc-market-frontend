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

// Add moment and locale import + i18n
import moment from "moment"
import { getMuiLocales } from "../util/i18n"
import { useTranslation } from "react-i18next"

export function HookProvider(props: { children: React.ReactElement }) {
  const [alert, issueAlert] = useState<AlertInterface | null>(null)

  const [cookies, setCookie] = useCookies(["theme"])
  const prefersLight = useMediaQuery("(prefers-color-scheme: light)")
  const [useLightTheme, setUseLightTheme] = useState<ThemeChoice>(
    cookies.theme || (prefersLight ? "light" : "dark"),
  )
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { i18n, t } = useTranslation()

  const baseTheme = useMemo(() => {
    if (CURRENT_CUSTOM_ORG) {
      const theme = CUSTOM_THEMES.get(CURRENT_CUSTOM_ORG)
      if (theme) return theme
    }
    return useLightTheme === "light" ? lightTheme : mainTheme
  }, [useLightTheme, location.pathname])

  // Build a localized theme when language changes
  const localizedTheme = useMemo(() => {
    const { core, pickers, grid } = getMuiLocales(i18n.language)
    // Merge locale bundles into the current base theme
    return responsiveFontSizes(createTheme(baseTheme, core, pickers, grid))
  }, [baseTheme, i18n.language])

  useEffect(() => {
    setCookie("theme", useLightTheme, { path: "/", sameSite: "strict" })
  }, [useLightTheme, setCookie])

  // Surface Citizen ID login/link errors coming back via query params
  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "citizenid_account_not_verified") {
      const errorDescription =
        searchParams.get("error_description") ||
        t(
          "auth.citizenidAccountNotVerified",
          "Your Citizen ID account must be verified to sign up or log in.",
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

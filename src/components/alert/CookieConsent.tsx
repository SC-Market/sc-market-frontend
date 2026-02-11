import React, { useEffect } from "react"
import { Alert, AlertTitle, Box, Button, Grid, Snackbar } from "@mui/material"
import { useCookies } from "react-cookie"
import { CookieRounded } from "@mui/icons-material"
import ReactGA from "react-ga4"
import { useLocation } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { onPageInteractive } from "../../util/scripts/delayedScriptLoader"

const TRACKING_ID = "G-KT8SEND6F2" // OUR_TRACKING_ID

export function CookieConsent() {
  const [cookies, setCookie] = useCookies(["cookie_consent"])

  const location = useLocation()

  const { t } = useTranslation()

  useEffect(() => {
    // Delay analytics initialization until page is interactive
    // This prevents analytics from blocking critical rendering path
    onPageInteractive(() => {
      // Initialize Google Analytics with async loading
      // react-ga4 automatically loads the gtag script asynchronously
      if (cookies.cookie_consent === "all") {
        ReactGA.initialize(TRACKING_ID, {
          gtagOptions: {
            analytics_storage: "granted",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
          },
          // Ensure gtag script is loaded with async attribute
          gaOptions: {
            // react-ga4 loads scripts asynchronously by default
          },
        })
      } else {
        ReactGA.initialize(TRACKING_ID, {
          gtagOptions: {
            analytics_storage: "denied",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
          },
        })
      }
    })
  }, [cookies.cookie_consent])

  useEffect(() => {
    if (location) {
      // track pageview with gtag / react-ga / react-ga4, for example:
      ReactGA.set({
        hitType: "page",
        page: location.pathname + location.search,
      })
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
      })
    }
  }, [location, cookies.cookie_consent])

  const theme = useTheme<ExtendedTheme>()

  return (
    <Snackbar
      open={cookies.cookie_consent === undefined}
      autoHideDuration={undefined}
      onClose={() => null}
    >
      <Alert
        severity={"info"}
        icon={<CookieRounded fontSize="inherit" />}
        variant={"filled"}
        sx={{
          backgroundColor: theme.palette.secondary.dark,
        }}
        action={
          <Grid container spacing={theme.layoutSpacing.compact}>
            <Grid item>
              <Button
                size="small"
                variant={"contained"}
                onClick={() =>
                  setCookie("cookie_consent", "all", {
                    path: "/",
                    sameSite: "strict",
                    maxAge: 31536000, // 1 year in seconds
                  })
                }
              >
                {t("cookie_consent.accept_all")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                size="small"
                variant={"contained"}
                onClick={() =>
                  setCookie("cookie_consent", "necessary", {
                    path: "/",
                    sameSite: "strict",
                    maxAge: 31536000, // 1 year in seconds
                  })
                }
              >
                {t("cookie_consent.accept_necessary")}
              </Button>
            </Grid>
          </Grid>
        }
      >
        <AlertTitle>{t("cookie_consent.title")}</AlertTitle>
        <Box maxWidth={500}>{t("cookie_consent.description")}</Box>
      </Alert>
    </Snackbar>
  )
}

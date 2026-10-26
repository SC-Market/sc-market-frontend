import React from "react"
import { Button, Grid, Stack, Typography } from "@mui/material"
import { useCookies } from "react-cookie"
import { useTranslation } from "react-i18next"
import {
  CONSENT_COOKIE,
  CONSENT_COOKIE_OPTIONS,
  revokeAnalytics,
} from "../../util/consent/analyticsConsent"

/**
 * Settings > Privacy: change the cookie-bar choice. "Accept" starts Google
 * Analytics and BugSnag Performance (components/alert/CookieConsent.tsx);
 * "Necessary only" stops GA, deletes its cookies and reloads the page.
 */
export function CookiePreferences() {
  const { t } = useTranslation()
  const [cookies, setCookie] = useCookies([CONSENT_COOKIE])
  const allowed = cookies[CONSENT_COOKIE] === "all"

  return (
    <>
      <Grid item>
        <Typography variant={"subtitle1"} color={"text.secondary"}>
          {t("privacy_settings.cookie_title", "Cookie preferences")}
        </Typography>
        <Typography variant={"body2"}>
          {t(
            "privacy_settings.cookie_description",
            "Sign-in cookies and anonymous error reports are always on. Analytics (Google Analytics and page-speed measurement) only run if you allow them.",
          )}
        </Typography>
        <Typography variant={"body2"} color={"text.secondary"} sx={{ mt: 1 }}>
          {allowed
            ? t(
                "privacy_settings.cookie_status_all",
                "Current choice: analytics allowed.",
              )
            : t(
                "privacy_settings.cookie_status_necessary",
                "Current choice: necessary only.",
              )}
        </Typography>
      </Grid>
      <Grid item>
        <Stack direction={"row"} spacing={1}>
          <Button
            variant={allowed ? "contained" : "outlined"}
            disabled={allowed}
            onClick={() =>
              setCookie(CONSENT_COOKIE, "all", CONSENT_COOKIE_OPTIONS)
            }
          >
            {t("cookie_consent.accept_all")}
          </Button>
          <Button
            variant={allowed ? "outlined" : "contained"}
            disabled={!allowed}
            onClick={() => {
              setCookie(CONSENT_COOKIE, "necessary", CONSENT_COOKIE_OPTIONS)
              revokeAnalytics()
            }}
          >
            {t("cookie_consent.accept_necessary")}
          </Button>
        </Stack>
      </Grid>
    </>
  )
}

import React, { useCallback, useEffect, useRef } from "react"
import { Box, Button, Link, Paper, Typography } from "@mui/material"
import { useCookies } from "react-cookie"
import { useHydrated } from "../../hooks/ssr/useHydrated"
import { CookieRounded } from "@mui/icons-material"
import ReactGA from "react-ga4"
import { type Location, useLocation } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { onPageInteractive } from "../../util/scripts/delayedScriptLoader"
import { startPerformanceMonitoring } from "../../util/monitoring/bugsnagLoader"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { LEGAL_PATHS } from "../../routes/paths"
import {
  CONSENT_COOKIE,
  CONSENT_COOKIE_OPTIONS,
  GA_TRACKING_ID,
  revokeAnalytics,
  setGoogleAnalyticsDisabled,
  type ConsentChoice,
} from "../../util/consent/analyticsConsent"

export function CookieConsent() {
  const [cookies, setCookie] = useCookies(["cookie_consent"])

  const location = useLocation()

  const { t } = useTranslation()

  // Analytics (Google Analytics and BugSnag Performance) only load after
  // "Accept" (cookie_consent=all). Anonymous error reporting (util/monitoring/bugsnagLoader.ts)
  // is essential and does not depend on this choice. The banner text, this
  // gate and public/privacy.html must say the same thing.
  const analyticsAllowed = cookies.cookie_consent === "all"

  // One page_view per pathname. Filters and search write the query string
  // with replaceState (/market -> /market?...), which must not count as a new
  // page; the full URL still goes in page_location so real pageviews keep
  // their filter context. gtag's own page_view on config is turned off
  // (send_page_view: false) so this is the only source and nothing doubles.
  const latestLocation = useRef<Location>(location)
  latestLocation.current = location
  const lastSentPathname = useRef<string | null>(null)

  const sendPageview = useCallback((loc: Location) => {
    if (!ReactGA.isInitialized) return
    if (lastSentPathname.current === loc.pathname) return
    lastSentPathname.current = loc.pathname
    ReactGA.send({
      hitType: "pageview",
      page: loc.pathname + loc.search,
      page_location: window.location.origin + loc.pathname + loc.search,
    })
  }, [])

  useEffect(() => {
    if (!analyticsAllowed) return
    // Delay analytics initialization until page is interactive
    // This prevents analytics from blocking critical rendering path
    onPageInteractive(() => {
      setGoogleAnalyticsDisabled(false)
      if (!ReactGA.isInitialized) {
        ReactGA.initialize(GA_TRACKING_ID, {
          gtagOptions: {
            send_page_view: false,
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
          },
        })
      }
      // The landing page: the location effect below ran before GA existed.
      sendPageview(latestLocation.current)
      startPerformanceMonitoring(import.meta.env.VITE_BUGSNAG_API_KEY || "")
    })
  }, [analyticsAllowed, sendPageview])

  useEffect(() => {
    if (analyticsAllowed) sendPageview(location)
  }, [location, analyticsAllowed, sendPageview])

  const theme = useTheme<ExtendedTheme>()
  // Sit just above the mobile bottom navigation (64px on phones, 0 otherwise)
  const bottomNavHeight = useBottomNavHeight()

  // Hydration-safe: a prerendered page was rendered without the cookie, so
  // it has the bar; hydrate with it (document.html hides it by CSS when the
  // visitor already chose) and drop it right after.
  const hydrated = useHydrated()
  if (hydrated && cookies.cookie_consent !== undefined) return null

  const choose = (value: ConsentChoice) => {
    setCookie(CONSENT_COOKIE, value, CONSENT_COOKIE_OPTIONS)
    // Reopened from the footer after an earlier "Accept": stop what is running
    if (value === "necessary" && ReactGA.isInitialized) revokeAnalytics()
  }

  // A slim fixed bar: an overlay, so it reserves no layout space (no CLS),
  // and short enough not to cover the page's primary actions on phones.
  return (
    <Paper
      role="region"
      data-cookie-consent-bar=""
      aria-label={t("cookie_consent.title")}
      elevation={6}
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: `calc(${bottomNavHeight}px + env(safe-area-inset-bottom))`,
        zIndex: theme.zIndex.drawer + 2,
        borderRadius: 0,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary,
        px: { xs: 1.5, sm: 2 },
        py: 0.75,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: 1, sm: 2 },
      }}
    >
      <CookieRounded
        fontSize="small"
        sx={{ display: { xs: "none", sm: "block" } }}
      />
      <Typography
        variant="body2"
        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, minWidth: 0 }}
      >
        {t("cookie_consent.description")}{" "}
        <Link href={LEGAL_PATHS.privacy} color="inherit" underline="always">
          {t("cookie_consent.privacy")}
        </Link>
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => choose("all")}
          sx={{ py: 0.25, whiteSpace: "nowrap" }}
        >
          {t("cookie_consent.accept_all")}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="neutral"
          onClick={() => choose("necessary")}
          sx={{ py: 0.25, whiteSpace: "nowrap" }}
        >
          {t("cookie_consent.accept_necessary")}
        </Button>
      </Box>
    </Paper>
  )
}

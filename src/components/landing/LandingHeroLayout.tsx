import React, { useState } from "react"
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import logo from "../../assets/scmarket-logo.webp"
import logo96 from "../../assets/scmarket-logo-96.webp"
import { LandingImg } from "./LandingImage"
import { MARKET_PATHS } from "../../routes/paths"
import { formatCompactAmount } from "../../util/formatCompactAmount"

/**
 * All-time totals from the market stats endpoint: undefined while loading
 * (same-size skeletons), null when the request failed (the row is left out).
 */
export interface LandingHeroStats {
  totalOrders: number
  totalOrderValue: number
}

/** The hero logo's rendered size (px); the image carries it as width/height. */
const LOGO_SIZE = 48

/**
 * One all-time stat. The number line is always there: while loading it holds
 * a text skeleton in the same Typography, so the row keeps its height.
 */
function HeroStat(props: {
  value: string | undefined
  label: string
  testId: string
}) {
  return (
    <Box data-testid={props.testId}>
      <Typography
        variant="h4"
        component="p"
        color="text.secondary"
        sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
      >
        {props.value ?? <Skeleton width="5ch" />}
      </Typography>
      <Typography variant="body1" color="text.primary">
        {props.label}
      </Typography>
    </Box>
  )
}

/** Market search: submits to the market page's own `text` filter. */
function HeroSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const label = t("landing.heroSearchLabel")

  return (
    <Box
      component="form"
      role="search"
      aria-label={label}
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault()
        const text = query.trim()
        navigate(
          text
            ? `${MARKET_PATHS.search}?text=${encodeURIComponent(text)}`
            : MARKET_PATHS.search,
        )
      }}
      sx={{ width: "100%", maxWidth: 560 }}
    >
      <TextField
        fullWidth
        type="search"
        label={label}
        placeholder={t("landing.heroSearchPlaceholder")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  edge="end"
                  aria-label={t("landing.heroSearchSubmit")}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  )
}

/*
 * Text colours follow the site theme, where text.secondary is the brighter
 * one: the <h1> and the stat numbers use it, the intro line and the stat
 * labels use the duller text.primary (as MetricSection does).
 */

/**
 * The homepage hero, shared by the page and its skeletons so the loading
 * state has the loaded layout at every breakpoint. Everything is static text
 * except the two all-time stats, whose numbers hold a same-line skeleton.
 *
 * Signed-in and signed-out visitors get the same hero: sign-in lives in the
 * navbar and sidebar, so the hero spends its space on the market itself.
 * `sellHref` is the "Start selling" target (the login page with a redirect
 * for signed-out visitors), so the label and layout never change.
 */
export function LandingHeroLayout(props: {
  stats: LandingHeroStats | null | undefined
  sellHref: string
}) {
  const { t, i18n } = useTranslation()
  const { stats } = props

  return (
    <Box
      component="section"
      aria-labelledby="landing-hero-title"
      sx={{ pb: { xs: 4, md: 6 } }}
    >
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 2.5, md: 3 }} alignItems="flex-start">
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Decorative: the brand name is right next to it. Not the LCP
                (the <h1> is), so a 96px file covers 1x/2x screens. */}
            <LandingImg
              src={logo96}
              srcSet={`${logo96} 2x, ${logo} 3x`}
              alt=""
              width={LOGO_SIZE}
              height={LOGO_SIZE}
              decoding="async"
              sx={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: "50%" }}
            />
            <Typography
              color="secondary"
              variant="h5"
              component="p"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              SC MARKET
            </Typography>
          </Stack>

          <Box>
            <Typography
              id="landing-hero-title"
              variant="h2"
              component="h1"
              color="text.secondary"
              sx={{ fontWeight: "bold", maxWidth: 900 }}
            >
              {t("landing.heroTitle")}
            </Typography>
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ mt: 1.5, maxWidth: 640 }}
            >
              {t("landing.heroText")}
            </Typography>
          </Box>

          {stats !== null && (
            <Stack
              direction="row"
              spacing={{ xs: 3, sm: 6 }}
              data-testid="landing-hero-stats"
              aria-busy={stats ? undefined : true}
            >
              <HeroStat
                testId="landing-total-orders"
                value={
                  stats &&
                  new Intl.NumberFormat(i18n.language).format(stats.totalOrders)
                }
                label={t("landing.heroOrdersLabel")}
              />
              <HeroStat
                testId="landing-total-value"
                value={
                  stats &&
                  formatCompactAmount(stats.totalOrderValue, i18n.language)
                }
                label={t("landing.heroValueLabel")}
              />
            </Stack>
          )}

          {/* Search and the two CTAs: one row on desktop, stacked on phones. */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2.5, md: 2 }}
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{ width: "100%" }}
          >
            <HeroSearch />
            <Stack
              direction="row"
              spacing={1.5}
              useFlexGap
              flexWrap="wrap"
              sx={{ flexShrink: 0 }}
            >
              <Button
                component={Link}
                to={MARKET_PATHS.search}
                variant="contained"
                color="primary"
                size="medium"
              >
                {t("landing.heroBrowse")}
              </Button>
              <Button
                component={Link}
                to={props.sellHref}
                variant="outlined"
                color="secondary"
                size="medium"
              >
                {t("landing.heroSell")}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

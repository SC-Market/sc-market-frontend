import React, { useState } from "react"
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
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
 * Totals from the market stats endpoint: undefined while loading (same-size
 * skeletons), null when the request failed (the cells stay empty, the row
 * keeps its size).
 */
export interface LandingHeroStats {
  totalOrders: number
  totalOrderValue: number
  weekOrders: number
  weekOrderValue: number
}

/**
 * The weekly stats show only from this many orders in the week. The backend
 * floors the public weekly numbers (about 23-27 orders, ~12M aUEC) on
 * purpose; below this threshold they stay hidden.
 */
export const WEEKLY_STATS_MIN_ORDERS = 40

export function showWeeklyStats(
  stats: LandingHeroStats | null | undefined,
): boolean {
  return !!stats && stats.weekOrders >= WEEKLY_STATS_MIN_ORDERS
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
  /** Laid out but invisible and hidden from assistive tech (keeps the grid). */
  hidden?: boolean
}) {
  return (
    <Box
      data-testid={props.testId}
      {...(props.hidden
        ? { "aria-hidden": true, inert: true, sx: { visibility: "hidden" } }
        : {})}
    >
      <Typography
        variant="h4"
        component="p"
        color="text.secondary"
        // One line always (h5 size on phones so "1,6 Billionen" fits half
        // the width); labels may wrap, and hidden cells carry the same
        // labels, so a row is the same height shown or hidden.
        sx={{
          typography: { xs: "h5", md: "h4" },
          fontWeight: "bold",
          whiteSpace: "nowrap",
        }}
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
      sx={{ width: "100%" }}
    >
      <TextField
        fullWidth
        type="search"
        label={label}
        placeholder={t("landing.heroSearchPlaceholder")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        // The label stays floated so the placeholder is always visible; at
        // 0.8 opacity it reads 6:1 on the Paper (MUI's dark default, 0.5,
        // is about 3:1).
        sx={{ "& .MuiInputBase-input::placeholder": { opacity: 0.8 } }}
        slotProps={{
          inputLabel: { shrink: true },
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
 * except the stats, whose numbers hold a same-line skeleton while loading.
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
  const showWeekly = showWeeklyStats(stats)

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

          {/* Four cells, always: 2x2 on phones, one row from md. The weekly
              cells are only visible from WEEKLY_STATS_MIN_ORDERS; otherwise
              (and while loading) they are laid out invisibly, so the hero is
              the same height whether they show or not. */}
          <Box
            data-testid="landing-hero-stats"
            aria-busy={stats === undefined ? true : undefined}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, max-content)",
              },
              columnGap: { xs: 3, sm: 6 },
              rowGap: 2,
            }}
          >
            <HeroStat
              testId="landing-total-orders"
              hidden={stats === null}
              value={
                stats
                  ? new Intl.NumberFormat(i18n.language).format(
                      stats.totalOrders,
                    )
                  : undefined
              }
              label={t("landing.heroOrdersLabel")}
            />
            <HeroStat
              testId="landing-total-value"
              hidden={stats === null}
              value={
                stats
                  ? formatCompactAmount(stats.totalOrderValue, i18n.language)
                  : undefined
              }
              label={t("landing.heroValueLabel")}
            />
            <HeroStat
              testId="landing-week-orders"
              hidden={!showWeekly}
              value={
                stats && showWeekly
                  ? new Intl.NumberFormat(i18n.language).format(
                      stats.weekOrders,
                    )
                  : "0"
              }
              label={t("landing.heroWeekOrdersLabel")}
            />
            <HeroStat
              testId="landing-week-value"
              hidden={!showWeekly}
              value={
                stats && showWeekly
                  ? formatCompactAmount(stats.weekOrderValue, i18n.language)
                  : "0"
              }
              label={t("landing.heroWeekValueLabel")}
            />
          </Box>

          {/* The search field on a Paper surface (contrast against the
              gradient), then the two CTAs in their own full-width row:
              side by side from sm, stacked on phones. */}
          <Paper
            data-testid="landing-hero-search"
            sx={{ width: "100%", p: { xs: 1.5, md: 2 } }}
          >
            <HeroSearch />
          </Paper>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <Button
              component={Link}
              to={MARKET_PATHS.search}
              variant="contained"
              color="primary"
              size="large"
              sx={{ flex: 1, whiteSpace: "nowrap" }}
            >
              {t("landing.heroBrowse")}
            </Button>
            <Button
              component={Link}
              to={props.sellHref}
              variant="outlined"
              color="secondary"
              size="large"
              sx={{ flex: 1, whiteSpace: "nowrap" }}
            >
              {t("landing.heroSell")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

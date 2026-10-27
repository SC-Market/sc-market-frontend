import React, { useState } from "react"
import {
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { Link, useNavigate } from "react-router-dom"
import logo from "../../assets/scmarket-logo.webp"
import logo96 from "../../assets/scmarket-logo-96.webp"
import { LandingImg } from "./LandingImage"
import { MARKET_PATHS } from "../../routes/paths"
import { formatCompactAmount } from "../../util/formatCompactAmount"
import type { StandingBuyOrder } from "../../store/api/v2/market"
import { LANDING_CATEGORIES } from "./landingLinks"
import { LandingIntents } from "./LandingIntents"
import { WantedNowTable } from "./WantedNowTable"

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
const LOGO_SIZE = 56

/**
 * One stat. The number line is always there: while loading it holds a text
 * skeleton in the same Typography, so the row keeps its height.
 *
 * `minEm` sizes the cell: the number is `contain: inline-size`, so its own
 * width never feeds the grid's column widths. The columns come from the
 * static label and this minimum only, the same before and after the
 * numbers load, so a loading number can't move its neighbours.
 */
function HeroStat(props: {
  value: string | undefined
  label: string
  testId: string
  /** The number line's minimum width, in em of the number font. */
  minEm: number
  /** Laid out but invisible and hidden from assistive tech (keeps the grid). */
  hidden?: boolean
  /** With `hidden`: take no space at all (the weekly cells). */
  collapse?: boolean
}) {
  return (
    <Box
      data-testid={props.testId}
      {...(props.hidden
        ? {
            "aria-hidden": true,
            inert: true,
            sx: {
              visibility: "hidden",
              ...(props.collapse ? { display: "none" } : {}),
            },
          }
        : {})}
    >
      <Typography
        variant="h4"
        component="p"
        color="text.secondary"
        sx={{
          fontSize: { xs: "1.35rem", md: "1.75rem" },
          lineHeight: 1.2,
          fontWeight: 400,
          whiteSpace: "nowrap",
          contain: "inline-size",
          minWidth: `${props.minEm}em`,
        }}
      >
        {props.value ?? <Skeleton width="4ch" />}
      </Typography>
      <Typography
        variant="body2"
        color="text.primary"
        sx={{ fontSize: { xs: "0.875rem", md: "0.95rem" } }}
      >
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
      data-testid="landing-hero-search"
      sx={{ display: "flex", gap: 1.5, width: "100%" }}
    >
      <TextField
        fullWidth
        type="search"
        placeholder={t("landing.heroSearchPlaceholder")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        // The field itself is the contrasting surface (background.paper).
        // No visible label (the form and the input are named "Search the
        // market"), so the placeholder always shows; at 0.8 opacity it reads
        // 6:1 on the Paper (MUI's dark default, 0.5, is about 3:1).
        sx={{
          "& .MuiOutlinedInput-root": { backgroundColor: "background.paper" },
          "& .MuiInputBase-input::placeholder": { opacity: 0.8 },
        }}
        slotProps={{
          htmlInput: { "aria-label": label },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      {/* Phones submit with the keyboard's search key; the field takes the
          row (the approved mockup). */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        sx={{
          display: { xs: "none", sm: "inline-flex" },
          flexShrink: 0,
          minHeight: 56,
          px: 3,
        }}
      >
        {t("landing.heroSearchSubmit")}
      </Button>
    </Box>
  )
}

function categoryLabels(t: TFunction): Record<string, string> {
  return {
    weapons: t("landing.categoryWeapons"),
    armor: t("landing.categoryArmor"),
    components: t("landing.categoryComponents"),
    cargo: t("landing.categoryCargo"),
    mining: t("landing.categoryMining"),
    salvage: t("landing.categorySalvage"),
    medical: t("landing.categoryMedical"),
    vehicles: t("landing.categoryVehicles"),
    services: t("landing.categoryServices"),
  }
}

/** The /shops category chips. One scrolling row on phones, wrapped above. */
function HeroCategories() {
  const { t } = useTranslation()
  const labels = categoryLabels(t)
  return (
    <Box
      component="nav"
      aria-label={t("landing.categoriesLabel")}
      sx={{
        display: "flex",
        gap: 1,
        flexWrap: { xs: "nowrap", sm: "wrap" },
        overflowX: { xs: "auto", sm: "visible" },
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 0 },
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {LANDING_CATEGORIES.map((category) => (
        <Chip
          key={category.key}
          component={Link}
          to={category.to}
          clickable
          label={labels[category.key]}
          variant="outlined"
          color="primary"
          sx={{ flexShrink: 0 }}
        />
      ))}
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
 * except the stats (same-line skeletons while loading) and the "Wanted
 * now" buy-order table (fixed-height skeleton rows).
 *
 * Desktop (lg): headline, stats, search and categories on the left, the
 * newest buy orders on the right, the four intent cards across both. Below
 * lg one column, the intents straight under the search (DOM order, so the
 * tab order matches), then the table. Layout is CSS only (sx breakpoints),
 * so the markup is the same at every width.
 *
 * Signed-in and signed-out visitors get the same hero: sign-in lives in the
 * navbar and sidebar. `signedIn` only changes the Sell / Wanted targets.
 */
export function LandingHeroLayout(props: {
  stats: LandingHeroStats | null | undefined
  /** Live listings total: undefined while loading, null when it failed. */
  liveListings: number | null | undefined
  /** The newest open buy orders: undefined while loading, null when it failed. */
  buyOrders: StandingBuyOrder[] | null | undefined
  signedIn: boolean
}) {
  const { t, i18n } = useTranslation()
  const { stats, liveListings } = props
  const showWeekly = showWeeklyStats(stats)
  const number = (n: number) => new Intl.NumberFormat(i18n.language).format(n)

  return (
    <Box
      component="section"
      aria-labelledby="landing-hero-title"
      sx={{ pt: { xs: 1, md: 3 }, pb: { xs: 2, md: 3 } }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
            },
            columnGap: 4,
            rowGap: { xs: 3, lg: 4 },
            alignItems: "start",
          }}
        >
          <Box sx={{ gridColumn: { lg: 1 }, gridRow: { lg: 1 }, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 1.75 },
                mb: { xs: 1.5, sm: 2.25 },
              }}
            >
              {/* Decorative: the brand name is right next to it. Not the LCP
                  (the <h1> is). */}
              <LandingImg
                src={logo96}
                srcSet={`${logo96} 1x, ${logo} 2x`}
                alt=""
                width={LOGO_SIZE}
                height={LOGO_SIZE}
                decoding="async"
                sx={{
                  width: { xs: 44, sm: LOGO_SIZE },
                  height: { xs: 44, sm: LOGO_SIZE },
                  borderRadius: "50%",
                }}
              />
              <Typography
                color="secondary"
                component="p"
                sx={{
                  fontSize: { xs: "1.3rem", sm: "1.6rem" },
                  letterSpacing: "0.06em",
                  lineHeight: 1.3,
                }}
              >
                SC MARKET
              </Typography>
            </Box>

            <Typography
              id="landing-hero-title"
              variant="h2"
              component="h1"
              color="text.secondary"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.9rem", sm: "2.3rem", md: "2.6rem" },
                lineHeight: 1.15,
                mb: 1.5,
              }}
            >
              {t("landing.heroTitle")}
            </Typography>
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ fontSize: "1.05rem", mb: 2.5, maxWidth: 640 }}
            >
              {t("landing.heroText")}
            </Typography>

            {/* All-time totals in one row. The weekly pair sits on a second
                row and only exists from WEEKLY_STATS_MIN_ORDERS; when it
                shows, it adds that row (the one accepted shift). */}
            <Box
              data-testid="landing-hero-stats"
              aria-busy={
                stats === undefined || liveListings === undefined
                  ? true
                  : undefined
              }
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, auto)",
                justifyContent: "start",
                columnGap: { xs: 3, sm: 5 },
                rowGap: 1.5,
                mb: 3,
              }}
            >
              <HeroStat
                testId="landing-total-orders"
                minEm={3.4}
                hidden={stats === null}
                value={stats ? number(stats.totalOrders) : undefined}
                label={t("landing.heroOrdersLabel")}
              />
              <HeroStat
                testId="landing-total-value"
                minEm={4.8}
                hidden={stats === null}
                value={
                  stats
                    ? formatCompactAmount(stats.totalOrderValue, i18n.language)
                    : undefined
                }
                label={t("landing.heroValueLabel")}
              />
              <HeroStat
                testId="landing-live-listings"
                minEm={2.4}
                hidden={liveListings === null}
                value={
                  typeof liveListings === "number"
                    ? number(liveListings)
                    : undefined
                }
                label={t("landing.heroListingsLabel")}
              />
              <HeroStat
                testId="landing-week-orders"
                minEm={3.4}
                hidden={!showWeekly}
                collapse
                value={stats && showWeekly ? number(stats.weekOrders) : "0"}
                label={t("landing.heroWeekOrdersLabel")}
              />
              <HeroStat
                testId="landing-week-value"
                minEm={4.8}
                hidden={!showWeekly}
                collapse
                value={
                  stats && showWeekly
                    ? formatCompactAmount(stats.weekOrderValue, i18n.language)
                    : "0"
                }
                label={t("landing.heroWeekValueLabel")}
              />
            </Box>

            <HeroSearch />
            <Box sx={{ mt: 1.75 }}>
              <HeroCategories />
            </Box>
          </Box>

          <Box sx={{ gridColumn: { lg: "1 / -1" }, gridRow: { lg: 2 } }}>
            <LandingIntents signedIn={props.signedIn} />
          </Box>

          <Box sx={{ gridColumn: { lg: 2 }, gridRow: { lg: 1 }, minWidth: 0 }}>
            <WantedNowTable orders={props.buyOrders} />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

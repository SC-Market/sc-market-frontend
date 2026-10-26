import { Box, Container, Divider, Grid, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { MarketPageLayout } from "../layout/MarketPageLayout"
import {
  marketPageKind,
  marketPageTitle,
  type MarketPageKind,
} from "../market/v2/marketPageKind"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { BaseSkeleton } from "./BaseSkeleton"
import {
  FilterPanelBoxSkeleton,
  MarketSearchSkeleton,
  ServiceMarketSkeleton,
} from "./MarketSearchSkeleton"
import { ContractListingSkeleton } from "./ContractListingSkeleton"

/**
 * Header action buttons of the MarketPageLayout pages, as placeholders of the
 * same size (large buttons from sm up, medium and full-row below). The real
 * action components aren't used here because MarketActions pulls in the
 * whole market feature, which must stay out of the entry bundle.
 */
export function HeaderActionsSkeleton({ widths }: { widths: number[] }) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useBreakpointDown("sm")
  const single = widths.length === 1

  return (
    <Grid
      container
      spacing={single ? 0 : theme.layoutSpacing.component}
      justifyContent={{ xs: "stretch", sm: "flex-end" }}
    >
      {widths.map((width, i) => (
        <Grid item key={i} xs={single ? 12 : 6} sm="auto">
          <BaseSkeleton
            variant="rectangular"
            width={isMobile ? "100%" : width}
            height={isMobile ? 36.5 : 42.25}
            sx={{ borderRadius: 1 }}
          />
        </Grid>
      ))}
    </Grid>
  )
}

/** Widths of each page's header buttons at the large size (English labels). */
const ACTION_WIDTHS: Record<MarketPageKind, number[]> = {
  // Create Listing, Create Buy Order, My Cart
  items: [191, 187, 137],
  // Create Buy Order
  buyorders: [196],
  // Create Service
  services: [184],
}

/**
 * Whole-page skeleton for /market, /market/category/*, /buyorders and
 * /market/services: the real MarketPageLayout (title, actions row, divider)
 * around the body skeleton MarketPageV2 itself shows while its content loads.
 */
export function MarketPageSkeleton() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const kind = marketPageKind(pathname)

  return (
    <MarketPageLayout
      noFooter
      title={marketPageTitle(kind, t)}
      headerActions={<HeaderActionsSkeleton widths={ACTION_WIDTHS[kind]} />}
    >
      {kind === "services" ? (
        <ServiceMarketSkeleton />
      ) : (
        <MarketSearchSkeleton
          kind={kind === "buyorders" ? "buyorders" : "listings"}
        />
      )}
    </MarketPageLayout>
  )
}

/**
 * Whole-page skeleton for /contracts, mirroring pages/contracting/Contracts:
 * MarketPageLayout header, then the filter panel beside a two-column grid of
 * contract cards (from lg up), or the cards alone below lg.
 */
export function ContractsListSkeleton() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const showMobileSidebar = useBreakpointDown("lg")

  const cards = (
    <Grid container spacing={theme.layoutSpacing.layout}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ContractListingSkeleton key={i} index={i} />
      ))}
    </Grid>
  )

  return (
    <MarketPageLayout
      noFooter
      title={t("nav.contracts", "Contracts")}
      // Create Contract
      headerActions={<HeaderActionsSkeleton widths={[196]} />}
    >
      <Container maxWidth="xxxl" sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              {/* ContractSidebar is a closed bottom sheet here */}
              <Grid item xs={12} />
              <Grid item xs={12}>
                {cards}
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              <FilterPanelBoxSkeleton />
              <Box sx={{ flex: 1, minWidth: 0 }}>{cards}</Box>
            </Stack>
          )}
        </Box>
      </Container>
    </MarketPageLayout>
  )
}

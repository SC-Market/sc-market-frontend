/**
 * MarketAggregateViewV2Admin
 *
 * Admin-preview redesign of the aggregate market page.
 * Exchange terminal layout: compact header, stats strip, quality-tier tabs,
 * market depth mini-chart, split order book, create buy order, price chart.
 *
 * Gated to admin role via MarketAggregateViewV2 — not visible to regular users.
 *
 * Standard components used:
 * - ListingNameAndRating  — seller/buyer name + rating badges
 * - QualityBadge          — quality tier chips
 * - CreateBuyOrderV2      — buy order form
 * - AggregateChartV2      — price history
 * - AggregateBuySellWallV2 — order depth charts
 */

import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material"
import { Section } from "../../../components/paper/Section"
import type { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CreateBuyOrderV2 } from "./components/CreateBuyOrderV2"
import { AggregateBuySellWallV2 } from "./AggregateChartsV2"
import { PriceComparisonTable } from "./PriceComparisonTable"
import { type GameItemAggregateV2 } from "./aggregateV2Types"
import { QualityHistogram } from "../../../components/market/v2/QualityHistogram"
import { MARKET_PATHS } from "../../../routes/paths"
import { QuickListProvider, SellYoursButton } from "../quick-list/SellYours"
import { WatchPriceButton } from "../../price-alerts/components/WatchPriceButton"
import AddRounded from "@mui/icons-material/AddRounded"
import { SellOrdersPanel } from "./AggregateAdminSellOrdersPanel"
import { BuyOrdersPanel } from "./AggregateAdminBuyOrdersPanel"
import { StatStrip, QualityTabs, AnalyticsCard } from "./AggregateAdminStats"
import { MISSING_IMAGE_URL } from "../../../util/constants"

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface MarketAggregateViewV2AdminProps {
  complete: GameItemAggregateV2
  gameItemId: string
}

export function MarketAggregateViewV2Admin({
  complete,
  gameItemId,
}: MarketAggregateViewV2AdminProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { game_item, quality_distribution, listings, buy_orders } = complete
  const [selectedTier, setSelectedTier] = useState<number | null>(null)

  const histogramData = useMemo(() => {
    const total = quality_distribution.reduce((s, i) => s + i.listing_count, 0)
    return quality_distribution.map((item) => ({
      tier: item.quality_tier,
      count: item.listing_count,
      percentage: total > 0 ? (item.listing_count / total) * 100 : 0,
      averagePrice: item.avg_price,
    }))
  }, [quality_distribution])

  const filteredListings = useMemo(() => {
    if (!selectedTier) return listings
    return listings.filter(
      (l) =>
        l.quality_tier_min != null &&
        l.quality_tier_max != null &&
        l.quality_tier_min <= selectedTier &&
        l.quality_tier_max >= selectedTier,
    )
  }, [listings, selectedTier])

  // Lowest listed price: prefills a new price alert's target.
  const lowestPrice = useMemo(() => {
    const prices = listings.map((l) => l.price_min).filter((p) => p > 1)
    return prices.length ? Math.min(...prices) : null
  }, [listings])

  // "Sell yours" opens Quick List with this item (game_item.id is the UUID;
  // the route param may be a short slug)
  const quickListItem =
    game_item.id && game_item.name
      ? { id: game_item.id, name: game_item.name, type: game_item.type || null }
      : null
  const activeListingCount = listings.filter(
    (l) => l.quantity_available > 0,
  ).length

  return (
    <QuickListProvider item={quickListItem}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {/* Item image */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                borderRadius: (t) => t.spacing(theme.borderRadius.image),
                backgroundColor: theme.palette.background.default,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300,
                height: 300,
                width: "100%",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={game_item.image_url || MISSING_IMAGE_URL}
                alt={game_item.name}
                sx={{
                  display: "block",
                  maxHeight: "100%",
                  maxWidth: "100%",
                  margin: "auto",
                  objectFit: "contain",
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = MISSING_IMAGE_URL
                }}
              />
            </Paper>
          </Grid>

          {/* Market overview: stat strip + action buttons */}
          <Grid item xs={12} lg={8}>
            <Paper
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                flexWrap="wrap"
                useFlexGap
                gap={1}
                sx={{ px: 2, pt: 1.5, pb: 1 }}
              >
                {/* game_item.id is the UUID; the route param may be a short slug */}
                {game_item.id && game_item.name && (
                  <WatchPriceButton
                    gameItemId={game_item.id}
                    itemName={game_item.name}
                    currentPrice={lowestPrice}
                    qualityRelevant={quality_distribution.length > 0}
                  />
                )}
                <SellYoursButton
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Button
                  component={Link}
                  to={`${MARKET_PATHS.buyOrderCreate}?game_item_id=${encodeURIComponent(gameItemId)}&game_item_name=${encodeURIComponent(game_item.name)}`}
                  variant="outlined"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 600 }}
                  startIcon={<AddRounded />}
                >
                  {t("marketUi.aggregateAdmin.createBuyOrder")}
                </Button>
              </Stack>
              <Divider />
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <StatStrip complete={complete} selectedTier={selectedTier} />
              </Box>
            </Paper>
          </Grid>

          {/* Quality tier filter tabs */}
          {quality_distribution.length > 0 && (
            <Grid item xs={12}>
              <Paper>
                <QualityTabs
                  distribution={quality_distribution}
                  selectedTier={selectedTier}
                  onSelect={setSelectedTier}
                />
              </Paper>
            </Grid>
          )}

          {/* Quality distribution + price by tier */}
          {quality_distribution.some((d) => d.listing_count > 0) && (
            <>
              <Grid item xs={12} lg={6}>
                <QualityHistogram
                  distribution={histogramData}
                  title={t("marketUi.aggregateAdmin.qualityDistribution")}
                  showPrices
                />
              </Grid>
              <Section
                xs={12}
                lg={6}
                title={t("marketUi.aggregateAdmin.priceByQualityTier")}
              >
                <Grid item xs={12}>
                  <PriceComparisonTable distribution={quality_distribution} />
                </Grid>
              </Section>
            </>
          )}

          {/* Sell orders */}
          <Section
            xs={12}
            lg={6}
            title={t("MarketAggregateView.sellOrders", "Sell Orders")}
            subtitle={
              activeListingCount > 0 ? (
                <SellYoursButton size="small" />
              ) : undefined
            }
            disablePadding
          >
            <Grid item xs={12}>
              <SellOrdersPanel
                listings={filteredListings}
                totalCount={activeListingCount}
              />
            </Grid>
          </Section>

          {/* Buy orders */}
          <Section
            xs={12}
            lg={6}
            title={t("MarketAggregateView.buyOrders", "Buy Orders")}
            disablePadding
          >
            <Grid item xs={12}>
              <BuyOrdersPanel buyOrders={buy_orders} />
            </Grid>
          </Section>

          {/* Market depth — compact order density bar chart */}
          <Grid item xs={12}>
            <Paper sx={{ overflow: "hidden", pb: 1 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  display: "block",
                  px: 2.5,
                  pt: 2,
                  pb: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "text.secondary",
                }}
              >
                {t("marketUi.aggregateAdmin.orderDepth")}
              </Typography>
              <AggregateBuySellWallV2 aggregate={complete} compact />
            </Paper>
          </Grid>

          {/* Place buy order form */}
          <Grid item xs={12}>
            <CreateBuyOrderV2 gameItem={game_item} />
          </Grid>

          {/* Analytics: tabbed Price History / Order Depth with quality filter */}
          <Grid item xs={12}>
            <AnalyticsCard
              complete={complete}
              selectedTier={selectedTier}
              onTierSelect={setSelectedTier}
            />
          </Grid>
        </Grid>
      </Grid>
    </QuickListProvider>
  )
}

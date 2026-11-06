import { useMemo, useState } from "react"
import { Box, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { AggregateChartV2, AggregateBuySellWallV2 } from "./AggregateChartsV2"
import { type GameItemAggregateV2 } from "./aggregateV2Types"
import { totalRemainingQuantity } from "../domain/buyOrders"
import { useFormatters } from "../../../util/format"

// ---------------------------------------------------------------------------
// Stats strip
// ---------------------------------------------------------------------------

export function StatStrip({
  complete,
  selectedTier,
}: {
  complete: GameItemAggregateV2
  selectedTier: number | null
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { listings, buy_orders } = complete

  const filtered = useMemo(
    () =>
      selectedTier
        ? listings.filter(
            (l) =>
              l.quality_tier_min != null &&
              l.quality_tier_max != null &&
              l.quality_tier_min <= selectedTier &&
              l.quality_tier_max >= selectedTier,
          )
        : listings,
    [listings, selectedTier],
  )

  const activeBuys = useMemo(
    () => buy_orders.filter((o) => o.status === "active"),
    [buy_orders],
  )

  const bestAsk = filtered.length
    ? Math.min(...filtered.map((l) => l.price_min))
    : null
  const bestBid = activeBuys.length
    ? Math.max(...activeBuys.map((o) => o.price_per_unit))
    : null
  const spread = bestAsk != null && bestBid != null ? bestAsk - bestBid : null
  const totalWanted = totalRemainingQuantity(activeBuys)
  const totalStock = filtered.reduce((s, l) => s + l.quantity_available, 0)
  const sellerCount = new Set(filtered.map((l) => l.shop_id)).size

  const cells: Array<{
    label: string
    value: string
    sub?: string
    color?: string
  }> = [
    {
      label: t("marketUi.aggregateAdmin.bestAsk"),
      value: bestAsk != null ? fmt.number(bestAsk) : "—",
      sub: t("marketUi.aggregateAdmin.auecPerUnit"),
      color: "success.main",
    },
    {
      label: t("marketUi.aggregateAdmin.bestBid"),
      value: bestBid != null ? fmt.number(bestBid) : "—",
      sub: t("marketUi.aggregateAdmin.auecPerUnit"),
      color: "warning.main",
    },
    {
      label: t("marketUi.aggregateAdmin.spread"),
      value: spread != null ? fmt.compact(spread) : "—",
      sub:
        spread != null && bestAsk
          ? t("marketUi.aggregateAdmin.spreadPercentMid", {
              percent: ((spread / bestAsk) * 100).toFixed(1),
            })
          : undefined,
    },
    {
      label: t("marketUi.aggregateAdmin.listings"),
      value: filtered.length.toString(),
      sub: t("marketUi.aggregateAdmin.sellerCount", { count: sellerCount }),
    },
    {
      label: t("marketUi.aggregateAdmin.buyOrders"),
      value: activeBuys.length.toString(),
      sub: t("marketUi.aggregateAdmin.unitsWanted", {
        count: totalWanted,
        formatted: fmt.number(totalWanted),
      }),
    },
    {
      label: t("marketUi.aggregateAdmin.totalStock"),
      value: fmt.compact(totalStock),
      sub: t("marketUi.aggregateAdmin.unitsAvailable"),
    },
  ]

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: "1px",
        bgcolor: "divider",
        height: "100%",
      }}
    >
      {cells.map((c) => (
        <Box key={c.label} sx={{ bgcolor: "background.paper", px: 2.5, py: 2 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "text.secondary",
              mb: 0.25,
            }}
          >
            {c.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "17px",
              fontWeight: 500,
              lineHeight: 1.2,
              color: c.color ?? "text.primary",
            }}
          >
            {c.value}
          </Typography>
          {c.sub && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: "monospace" }}
            >
              {c.sub}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Quality tier tabs
// ---------------------------------------------------------------------------

export function QualityTabs({
  distribution,
  selectedTier,
  onSelect,
}: {
  distribution: GameItemAggregateV2["quality_distribution"]
  selectedTier: number | null
  onSelect: (tier: number | null) => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  if (distribution.length === 0) return null

  return (
    <Box sx={{ px: 2 }}>
      <Tabs
        value={selectedTier ?? 0}
        onChange={(_, v) => onSelect(v === 0 ? null : v)}
        textColor="inherit"
        TabIndicatorProps={{ sx: { bgcolor: "primary.main" } }}
        sx={{ minHeight: 0 }}
      >
        <Tab
          value={0}
          label={
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              {t("marketUi.aggregateAdmin.all")}
            </Typography>
          }
          sx={{ minHeight: 48, py: 1 }}
        />
        {distribution.map((d) => (
          <Tab
            key={d.quality_tier}
            value={d.quality_tier}
            label={
              <Stack alignItems="flex-start" spacing={0.25}>
                <QualityBadge tier={d.quality_tier} size="small" />
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{ fontFamily: "monospace", fontSize: "11px" }}
                >
                  {fmt.number(d.min_price)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "10px" }}
                >
                  {t("marketUi.aggregateAdmin.listingCount", {
                    count: d.listing_count,
                  })}
                </Typography>
              </Stack>
            }
            sx={{ minHeight: 48, py: 0.75, alignItems: "flex-start" }}
          />
        ))}
      </Tabs>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Analytics card — tabbed Price History / Order Depth with quality filter
// ---------------------------------------------------------------------------

export function AnalyticsCard({
  complete,
  selectedTier,
  onTierSelect,
}: {
  complete: GameItemAggregateV2
  selectedTier: number | null
  onTierSelect: (tier: number | null) => void
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"price" | "depth">("price")
  const { quality_distribution } = complete
  const hasMultiTier = quality_distribution.length > 1

  return (
    <Paper>
      {/* Card header: label + quality chip filter */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          pt: 1.5,
          pb: 0,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "text.secondary",
          }}
        >
          {t("marketUi.aggregateAdmin.analytics")}
        </Typography>

        {hasMultiTier && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              onClick={() => onTierSelect(null)}
              sx={{
                cursor: "pointer",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: "1px solid",
                borderColor: selectedTier === null ? "primary.main" : "divider",
                bgcolor: selectedTier === null ? "primary.main" : "transparent",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color:
                    selectedTier === null
                      ? "primary.contrastText"
                      : "text.secondary",
                  fontSize: "10px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {t("marketUi.aggregateAdmin.all")}
              </Typography>
            </Box>
            {quality_distribution.map((d) => (
              <Box
                key={d.quality_tier}
                onClick={() => onTierSelect(d.quality_tier)}
                sx={{
                  cursor: "pointer",
                  opacity: selectedTier === d.quality_tier ? 1 : 0.5,
                  transition: "opacity 0.15s",
                  "&:hover": { opacity: 1 },
                  outline: (t) =>
                    selectedTier === d.quality_tier
                      ? `${t.borderWidth.emphasis}px solid`
                      : "none",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                  borderRadius: 0.5,
                }}
              >
                <QualityBadge tier={d.quality_tier} size="small" />
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Tab strip */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        textColor="inherit"
        TabIndicatorProps={{ sx: { bgcolor: "primary.main" } }}
        sx={{
          px: 2,
          minHeight: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tab
          value="price"
          label={t("marketUi.aggregateAdmin.priceHistory")}
          sx={{ minHeight: 40, py: 0.5, fontSize: "12px", fontWeight: 600 }}
        />
        <Tab
          value="depth"
          label={t("marketUi.aggregateAdmin.orderDepth")}
          sx={{ minHeight: 40, py: 0.5, fontSize: "12px", fontWeight: 600 }}
        />
      </Tabs>

      {/* Chart content — wrap in Grid container since chart components use Section (Grid item) */}
      <Grid container>
        {activeTab === "price" && (
          <AggregateChartV2 aggregate={complete} qualityTier={selectedTier} />
        )}
        {activeTab === "depth" && (
          <AggregateBuySellWallV2
            aggregate={complete}
            qualityTier={selectedTier}
          />
        )}
      </Grid>
    </Paper>
  )
}

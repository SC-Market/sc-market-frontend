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

import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Section } from "../../../components/paper/Section";
import type { ExtendedTheme } from "../../../hooks/styles/Theme";
import { NumericFormat } from "react-number-format";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAlertHook } from "../../../hooks/alert/AlertHook";
import { useCookies } from "react-cookie";
import {
  useFulfillBuyOrderMutation,
  useCancelBuyOrderMutation,
  type StandingBuyOrder,
} from "../../../store/api/v2/market";
import { useGetUserProfileQuery } from "../../profile/api/profileApi";
import { QualityBadge } from "../../../components/market/v2/QualityBadge";
import { ListingNameAndRating } from "../../../components/rating/ListingRating";
import type { Cart } from "../../../datatypes/Cart";
import { CreateBuyOrderV2 } from "./components/CreateBuyOrderV2";
import {
  AggregateChartV2,
  AggregateBuySellWallV2,
  PriceComparisonTable,
  type AggregateListingV2Row,
  type GameItemAggregateV2,
} from "./MarketAggregateViewV2";
import { QualityHistogram } from "../../../components/market/v2/QualityHistogram";
import { MARKET_PATHS, ORDER_PATHS } from "../../../routes/paths";
import { WatchPriceButton } from "../../price-alerts/components/WatchPriceButton";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAuec(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return n.toLocaleString();
}

// ---------------------------------------------------------------------------
// Stats strip
// ---------------------------------------------------------------------------

function StatStrip({
  complete,
  selectedTier,
}: {
  complete: GameItemAggregateV2;
  selectedTier: number | null;
}) {
  const { t } = useTranslation();
  const { listings, buy_orders } = complete;

  const filtered = useMemo(
    () =>
      selectedTier
        ? listings.filter(
            (l) =>
              l.quality_tier_min != null &&
              l.quality_tier_max != null &&
              l.quality_tier_min <= selectedTier &&
              l.quality_tier_max >= selectedTier
          )
        : listings,
    [listings, selectedTier]
  );

  const activeBuys = useMemo(
    () => buy_orders.filter((o) => o.status === "active"),
    [buy_orders]
  );

  const bestAsk = filtered.length
    ? Math.min(...filtered.map((l) => l.price_min))
    : null;
  const bestBid = activeBuys.length
    ? Math.max(...activeBuys.map((o) => o.price_per_unit))
    : null;
  const spread =
    bestAsk != null && bestBid != null ? bestAsk - bestBid : null;
  const totalWanted = activeBuys.reduce(
    (s, o) => s + (o.quantity - o.quantity_fulfilled),
    0
  );
  const totalStock = filtered.reduce((s, l) => s + l.quantity_available, 0);
  const sellerCount = new Set(filtered.map((l) => l.shop_id)).size;

  const cells: Array<{
    label: string;
    value: string;
    sub?: string;
    color?: string;
  }> = [
    {
      label: t("marketUi.aggregateAdmin.bestAsk"),
      value: bestAsk != null ? bestAsk.toLocaleString() : "—",
      sub: t("marketUi.aggregateAdmin.auecPerUnit"),
      color: "success.main",
    },
    {
      label: t("marketUi.aggregateAdmin.bestBid"),
      value: bestBid != null ? bestBid.toLocaleString() : "—",
      sub: t("marketUi.aggregateAdmin.auecPerUnit"),
      color: "warning.main",
    },
    {
      label: t("marketUi.aggregateAdmin.spread"),
      value: spread != null ? formatAuec(spread) : "—",
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
        formatted: totalWanted.toLocaleString(),
      }),
    },
    {
      label: t("marketUi.aggregateAdmin.totalStock"),
      value: formatAuec(totalStock),
      sub: t("marketUi.aggregateAdmin.unitsAvailable"),
    },
  ];

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
  );
}

// ---------------------------------------------------------------------------
// Quality tier tabs
// ---------------------------------------------------------------------------

function QualityTabs({
  distribution,
  selectedTier,
  onSelect,
}: {
  distribution: GameItemAggregateV2["quality_distribution"];
  selectedTier: number | null;
  onSelect: (tier: number | null) => void;
}) {
  const { t } = useTranslation();
  if (distribution.length === 0) return null;

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
                  {d.min_price.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "10px" }}>
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
  );
}

// ---------------------------------------------------------------------------
// Market depth mini-chart (computed from real data)
// ---------------------------------------------------------------------------

const DEPTH_BARS = 6;

function DepthChart({
  listings,
  buyOrders,
}: {
  listings: AggregateListingV2Row[];
  buyOrders: StandingBuyOrder[];
}) {
  const { t } = useTranslation();
  const { bidBars, askBars, midPrice, bestBid, bestAsk, spread } =
    useMemo(() => {
      const activeBuys = buyOrders.filter(
        (o) => o.status === "active" && o.price_per_unit > 0
      );
      const activeSells = listings.filter((l) => l.quantity_available > 0);

      if (!activeBuys.length && !activeSells.length)
        return {
          bidBars: [] as number[],
          askBars: [] as number[],
          midPrice: null,
          bestBid: null,
          bestAsk: null,
          spread: null,
        };

      const bestBid = activeBuys.length
        ? Math.max(...activeBuys.map((o) => o.price_per_unit))
        : null;
      const bestAsk = activeSells.length
        ? Math.min(...activeSells.map((l) => l.price_min))
        : null;
      const midPrice =
        bestBid != null && bestAsk != null
          ? (bestBid + bestAsk) / 2
          : bestBid ?? bestAsk;
      const spread =
        bestBid != null && bestAsk != null ? bestAsk - bestBid : null;

      const bidStep = bestBid ? bestBid * 0.025 : 1;
      const bidBuckets = Array.from({ length: DEPTH_BARS }, () => 0);
      activeBuys.forEach((o) => {
        const idx = Math.min(
          Math.floor((bestBid! - o.price_per_unit) / bidStep),
          DEPTH_BARS - 1
        );
        if (idx >= 0) bidBuckets[idx] += o.quantity;
      });

      const askStep = bestAsk ? bestAsk * 0.025 : 1;
      const askBuckets = Array.from({ length: DEPTH_BARS }, () => 0);
      activeSells.forEach((l) => {
        const idx = Math.min(
          Math.floor((l.price_min - bestAsk!) / askStep),
          DEPTH_BARS - 1
        );
        if (idx >= 0) askBuckets[idx] += l.quantity_available;
      });

      const maxQty = Math.max(...bidBuckets, ...askBuckets, 1);
      const bidBars = bidBuckets.map((q) => Math.round((q / maxQty) * 72) + 8);
      const askBars = askBuckets.map((q) => Math.round((q / maxQty) * 72) + 8);

      return { bidBars, askBars, midPrice, bestBid, bestAsk, spread };
    }, [listings, buyOrders]);

  if (!bidBars.length && !askBars.length) return null;

  return (
    <Box sx={{ px: 2.5, py: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.5}
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
          {t("marketUi.aggregateAdmin.marketDepth")}
        </Typography>
        {spread != null && midPrice != null && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: "monospace" }}
          >
            {t("marketUi.aggregateAdmin.spread")}{" "}
            <Typography
              component="span"
              variant="caption"
              color="text.primary"
              sx={{ fontFamily: "monospace" }}
            >
              {formatAuec(spread)} aUEC
            </Typography>
            {" · "}
            {t("marketUi.aggregateAdmin.mid")}{" "}
            <Typography
              component="span"
              variant="caption"
              color="text.primary"
              sx={{ fontFamily: "monospace" }}
            >
              {formatAuec(midPrice)}
            </Typography>
          </Typography>
        )}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 56px 1fr",
          height: 72,
          alignItems: "flex-end",
        }}
      >
        {/* Bid bars — right aligned, closest to mid first */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="flex-end"
          spacing="2px"
          sx={{ height: "100%" }}
        >
          {[...bidBars].reverse().map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 14,
                height: `${h}px`,
                borderRadius: "2px 2px 0 0",
                bgcolor: "warning.main",
                opacity: 0.7 + i * 0.05,
                transition: "opacity 0.15s",
                "&:hover": { opacity: 1 },
              }}
            />
          ))}
        </Stack>

        {/* Mid label */}
        <Stack
          alignItems="center"
          justifyContent="flex-end"
          pb={0.5}
          spacing={0.25}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: "monospace", fontSize: "9px" }}
          >
            {t("marketUi.aggregateAdmin.midLower")}
          </Typography>
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "11px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {midPrice ? formatAuec(midPrice) : "—"}
          </Typography>
          <Box
            sx={{ width: 1, height: 10, bgcolor: "divider", mt: 0.25 }}
          />
        </Stack>

        {/* Ask bars — left aligned, closest to mid first */}
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-end"
          spacing="2px"
          sx={{ height: "100%" }}
        >
          {askBars.map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 14,
                height: `${h}px`,
                borderRadius: "2px 2px 0 0",
                bgcolor: "success.main",
                opacity: 0.9 - i * 0.1,
                transition: "opacity 0.15s",
                "&:hover": { opacity: 1 },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Axis price labels */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 56px 1fr",
          mt: 0.5,
        }}
      >
        <Stack direction="row" justifyContent="flex-end" spacing={2} pr={0.5}>
          {bestBid &&
            [0.95, 0.975, 1].map((f) => (
              <Typography
                key={f}
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: "monospace", fontSize: "9px" }}
              >
                {formatAuec(bestBid * f)}
              </Typography>
            ))}
        </Stack>
        <Box />
        <Stack direction="row" spacing={2} pl={0.5}>
          {bestAsk &&
            [1, 1.025, 1.05].map((f) => (
              <Typography
                key={f}
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: "monospace", fontSize: "9px" }}
              >
                {formatAuec(bestAsk * f)}
              </Typography>
            ))}
        </Stack>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Add-to-cart dialog (sell orders)
// ---------------------------------------------------------------------------

function BuyDialog({
  listing,
  open,
  onClose,
}: {
  listing: AggregateListingV2Row | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const issueAlert = useAlertHook();
  const [cookies, setCookie] = useCookies(["market_cart"]);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCallback(() => {
    if (!listing) return;
    const cart: Cart = cookies.market_cart || [];
    let found = false;
    for (const seller of cart) {
      const matches = seller.shop_id && seller.shop_id === listing.shop_id;
      if (matches) {
        seller.items.push({
          listing_id: listing.listing_id,
          aggregate_id: listing.listing_id,
          quantity,
          type: "aggregate_composite",
        });
        found = true;
        break;
      }
    }
    if (!found) {
      cart.push({
        shop_id: listing.shop_id,
        items: [
          {
            listing_id: listing.listing_id,
            aggregate_id: listing.listing_id,
            quantity,
            type: "aggregate_composite",
          },
        ],
      });
    }
    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000,
    });
    issueAlert({
      message: t("MarketAggregateView.addedToCart"),
      severity: "success",
    });
    onClose();
  }, [listing, cookies, quantity, setCookie, issueAlert, t, onClose]);

  if (!listing) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t("marketUi.aggregateAdmin.buyFrom", { shop: listing.shop_name })}
      </DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t("marketUi.aggregateAdmin.priceAndAvailable", {
            price: listing.price_min.toLocaleString(),
            available: listing.quantity_available.toLocaleString(),
          })}
        </Typography>
        <NumericFormat
          decimalScale={0}
          allowNegative={false}
          customInput={TextField}
          thousandSeparator
          fullWidth
          label={t("MarketAggregateView.quantityToBuy")}
          value={quantity}
          onValueChange={(v) => setQuantity(v.floatValue || 1)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {t("marketUi.aggregateAdmin.ofMax", {
                  max: listing.quantity_available.toLocaleString(),
                })}
              </InputAdornment>
            ),
          }}
          isAllowed={({ floatValue }) =>
            !floatValue ||
            (floatValue >= 1 && floatValue <= listing.quantity_available)
          }
          sx={{ mb: 1.5 }}
        />
        <Typography
          variant="body2"
          color="primary"
          sx={{ fontFamily: "monospace" }}
        >
          {t("marketUi.aggregateAdmin.totalAuec", {
            total: (listing.price_min * quantity).toLocaleString(),
          })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel", "Cancel")}</Button>
        <Button variant="contained" color="success" onClick={addToCart}>
          {t("MarketAggregateView.addToCart", "Add to Cart")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sell orders panel
// ---------------------------------------------------------------------------

function SellOrdersPanel({
  listings,
  totalCount,
}: {
  listings: AggregateListingV2Row[];
  totalCount: number;
}) {
  const { t } = useTranslation();
  const [buyTarget, setBuyTarget] = useState<AggregateListingV2Row | null>(
    null
  );
  const sorted = useMemo(
    () =>
      [...listings]
        .filter((l) => l.quantity_available > 0)
        .sort((a, b) => a.price_min - b.price_min),
    [listings]
  );
  const bestAsk = sorted[0]?.price_min;

  return (
    <Box>
      {/* Column headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 80px 80px",
          px: 3,
          py: 0.75,
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {[
          t("marketUi.aggregateAdmin.colSeller"),
          t("marketUi.aggregateAdmin.colQuality"),
          t("marketUi.aggregateAdmin.colPricePerUnit"),
          t("marketUi.aggregateAdmin.colStock"),
          "",
        ].map((h, i) => (
          <Typography
            key={i}
            variant="caption"
            fontWeight={700}
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "text.secondary",
              textAlign: i >= 2 ? "right" : "left",
            }}
          >
            {h}
          </Typography>
        ))}
      </Box>

      {sorted.length === 0 ? (
        <Box sx={{ px: 3, py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t("marketUi.aggregateAdmin.noSellOrders")}
          </Typography>
        </Box>
      ) : (
        sorted.slice(0, 10).map((listing) => {
          const isBest = listing.price_min === bestAsk;
          return (
            <Box
              key={listing.listing_id}
              onClick={() => setBuyTarget(listing)}
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 80px 80px",
                px: 3,
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                borderLeft: "2px solid",
                borderLeftColor: isBest ? "success.main" : "transparent",
                cursor: "pointer",
                transition: "background 0.1s",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {/* Seller — use ListingNameAndRating */}
              <ListingNameAndRating
                shop={{
                  name: listing.shop_name,
                  slug: listing.shop_slug,
                  rating: listing.shop_rating,
                }}
              />

              {/* Quality — use QualityBadge */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {listing.quality_tier_min || listing.quality_tier_max ? (
                  <>
                    <QualityBadge tier={listing.quality_tier_min} size="small" />
                    {listing.quality_tier_min !== listing.quality_tier_max &&
                      listing.quality_tier_max && (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            –
                          </Typography>
                          <QualityBadge
                            tier={listing.quality_tier_max}
                            size="small"
                          />
                        </>
                      )}
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {t("marketUi.aggregateAdmin.anyQuality")}
                  </Typography>
                )}
              </Box>

              {/* Price */}
              <Stack alignItems="flex-end">
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "success.main",
                  }}
                >
                  {listing.price_min.toLocaleString()}
                </Typography>
                {isBest && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "monospace", fontSize: "10px" }}
                  >
                    {t("marketUi.aggregateAdmin.bestAskLower")}
                  </Typography>
                )}
              </Stack>

              {/* Stock */}
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  textAlign: "right",
                  alignSelf: "center",
                }}
              >
                {listing.quantity_available.toLocaleString()}
              </Typography>

              {/* Action */}
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setBuyTarget(listing);
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  sx={{
                    fontSize: "10px",
                    fontWeight: 700,
                    minWidth: 0,
                    px: 1.5,
                    py: 0.25,
                    letterSpacing: "0.05em",
                  }}
                >
                  {t("marketUi.aggregateAdmin.buy")}
                </Button>
              </Box>
            </Box>
          );
        })
      )}

      {totalCount > 10 && (
        <Box
          sx={{
            px: 3,
            py: 1.25,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("marketUi.aggregateAdmin.showingOf", {
              shown: 10,
              total: totalCount,
            })}
          </Typography>
          <Button size="small" color="inherit" sx={{ fontSize: "11px" }}>
            {t("marketUi.aggregateAdmin.loadMore")}
          </Button>
        </Box>
      )}

      <BuyDialog
        listing={buyTarget}
        open={!!buyTarget}
        onClose={() => setBuyTarget(null)}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Fulfill dialog (buy orders)
// ---------------------------------------------------------------------------

function FulfillDialog({
  buyOrder,
  open,
  onClose,
}: {
  buyOrder: StandingBuyOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const issueAlert = useAlertHook();
  const navigate = useNavigate();
  const [fulfillBuyOrderMut, { isLoading }] = useFulfillBuyOrderMutation();
  const [agreedPrice, setAgreedPrice] = useState(0);
  const remaining = buyOrder
    ? buyOrder.quantity - (buyOrder.quantity_fulfilled || 0)
    : 0;
  const [fulfillQty, setFulfillQty] = useState(remaining);

  React.useEffect(() => {
    if (buyOrder) {
      setAgreedPrice(0);
      setFulfillQty(buyOrder.quantity - (buyOrder.quantity_fulfilled || 0));
    }
  }, [buyOrder]);

  const doFulfill = useCallback(() => {
    if (!buyOrder) return;
    if (buyOrder.negotiable && agreedPrice < 1) {
      issueAlert({
        message: t(
          "buyorder.agreedPriceRequired",
          "Please enter an agreed price per unit."
        ),
        severity: "error",
      });
      return;
    }
    if (fulfillQty < 1 || fulfillQty > remaining) {
      issueAlert({
        message: t("marketUi.aggregateAdmin.quantityRange", {
          max: remaining,
        }),
        severity: "error",
      });
      return;
    }
    fulfillBuyOrderMut({
      id: buyOrder.buy_order_id,
      fulfillBuyOrderRequest: {
        variant_id: "",
        listing_id: "",
        quantity: fulfillQty < remaining ? fulfillQty : undefined,
      },
    })
      .unwrap()
      .then((result) => {
        issueAlert({
          message: t("MarketAggregateView.submitted"),
          severity: "success",
        });
        if (result.order_id) navigate(ORDER_PATHS.detail(result.order_id));
        onClose();
      })
      .catch((err) =>
        issueAlert({
          message:
            err?.data?.message || t("marketUi.aggregateAdmin.fulfillFailed"),
          severity: "error",
        })
      );
  }, [
    buyOrder,
    agreedPrice,
    fulfillQty,
    remaining,
    fulfillBuyOrderMut,
    issueAlert,
    navigate,
    t,
    onClose,
  ]);

  if (!buyOrder) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>
        {t("buyorder.fulfillTitle", "Fulfill Buy Order")}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}
      >
        {buyOrder.negotiable && (
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            fullWidth
            label={t("buyorder.price_per_unit", "Agreed price per unit (aUEC)")}
            value={agreedPrice}
            onValueChange={(v) => setAgreedPrice(v.floatValue ?? 0)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">aUEC</InputAdornment>
              ),
            }}
          />
        )}
        <NumericFormat
          decimalScale={0}
          allowNegative={false}
          customInput={TextField}
          thousandSeparator
          fullWidth
          label={t("buyorder.fulfillQuantity", "Quantity to fulfill")}
          value={fulfillQty}
          onValueChange={(v) => setFulfillQty(v.floatValue ?? remaining)}
          helperText={`${remaining.toLocaleString()} ${t(
            "buyorder.remaining",
            "remaining"
          )}`}
          isAllowed={({ floatValue }) =>
            !floatValue || (floatValue >= 1 && floatValue <= remaining)
          }
        />
        {buyOrder.price_per_unit > 0 && (
          <Typography
            variant="body2"
            color="primary"
            sx={{ fontFamily: "monospace" }}
          >
            {t("marketUi.aggregateAdmin.totalAuec", {
              total:
                buyOrder.negotiable && agreedPrice > 0
                  ? (agreedPrice * fulfillQty).toLocaleString()
                  : (buyOrder.price_per_unit * fulfillQty).toLocaleString(),
            })}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel", "Cancel")}</Button>
        <Button
          variant="contained"
          color="warning"
          onClick={doFulfill}
          disabled={isLoading}
        >
          {t("MarketAggregateView.fulfill", "Fulfill")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Buy orders panel
// ---------------------------------------------------------------------------

function BuyOrdersPanel({ buyOrders }: { buyOrders: StandingBuyOrder[] }) {
  const { data: profile } = useGetUserProfileQuery();
  const [cancelBuyOrderMut] = useCancelBuyOrderMutation();
  const issueAlert = useAlertHook();
  const { t } = useTranslation();
  const [fulfillTarget, setFulfillTarget] =
    useState<StandingBuyOrder | null>(null);

  const active = useMemo(
    () =>
      [...buyOrders.filter((o) => o.status === "active")].sort(
        (a, b) => b.price_per_unit - a.price_per_unit
      ),
    [buyOrders]
  );
  const bestBid = active[0]?.price_per_unit;

  const doCancel = useCallback(
    (orderId: string) => {
      cancelBuyOrderMut({ id: orderId })
        .unwrap()
        .then(() =>
          issueAlert({
            message: t("MarketAggregateView.cancelled"),
            severity: "success",
          })
        )
        .catch((err) =>
          issueAlert({
            message:
              err?.data?.message || t("marketUi.aggregateAdmin.cancelFailed"),
            severity: "error",
          })
        );
    },
    [cancelBuyOrderMut, issueAlert, t]
  );

  return (
    <Box>
      {/* Column headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 64px 72px 64px",
          px: 2.5,
          py: 0.75,
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {[
          t("marketUi.aggregateAdmin.colBuyer"),
          t("marketUi.aggregateAdmin.colQuality"),
          t("marketUi.aggregateAdmin.colBidPerUnit"),
          t("marketUi.aggregateAdmin.colQty"),
          t("marketUi.aggregateAdmin.colTotal"),
          "",
        ].map((h, i) => (
          <Typography
            key={i}
            variant="caption"
            fontWeight={700}
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "text.secondary",
              textAlign: i >= 2 ? "right" : "left",
            }}
          >
            {h}
          </Typography>
        ))}
      </Box>

      {active.length === 0 ? (
        <Box sx={{ px: 2.5, py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t("marketUi.aggregateAdmin.noActiveBuyOrders")}
          </Typography>
        </Box>
      ) : (
        active.slice(0, 10).map((order) => {
          const remaining = order.quantity - (order.quantity_fulfilled || 0);
          const total = order.negotiable
            ? null
            : order.price_per_unit * remaining;
          const isBest = order.price_per_unit === bestBid;
          const isOwn = order.buyer_id === profile?.username;

          return (
            <Box
              key={order.buy_order_id}
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 64px 72px 64px",
                px: 2.5,
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                borderLeft: "2px solid",
                borderLeftColor: isBest ? "warning.main" : "transparent",
                transition: "background 0.1s",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {/* Buyer — use ListingNameAndRating */}
              <ListingNameAndRating
                user={{
                  username: order.buyer_name,
                  display_name: order.buyer_name,
                  avatar: "",
                  rating: {
                    avg_rating: 0,
                    rating_count: 0,
                    total_rating: 0,
                    streak: 0,
                    total_orders: 0,
                  },
                }}
              />

              {/* Quality — use QualityBadge */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {order.quality_tier_min || order.quality_tier_max ? (
                  <>
                    <QualityBadge
                      tier={order.quality_tier_min ?? order.quality_tier_max}
                      size="small"
                    />
                    {order.quality_tier_min !== order.quality_tier_max &&
                      order.quality_tier_max && (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            –
                          </Typography>
                          <QualityBadge
                            tier={order.quality_tier_max}
                            size="small"
                          />
                        </>
                      )}
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {t("marketUi.aggregateAdmin.anyQuality")}
                  </Typography>
                )}
              </Box>

              {/* Bid price */}
              <Stack alignItems="flex-end">
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "warning.main",
                  }}
                >
                  {order.negotiable && !order.price_per_unit
                    ? t("buyorder.status.negotiable", "Negotiable")
                    : order.price_per_unit.toLocaleString()}
                </Typography>
                {order.negotiable && (
                  <Chip
                    label={t("buyorder.status.negotiable", "Negotiable")}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 16, fontSize: "9px", mt: 0.25 }}
                  />
                )}
                {isBest && !order.negotiable && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "monospace", fontSize: "10px" }}
                  >
                    {t("marketUi.aggregateAdmin.bestBidLower")}
                  </Typography>
                )}
              </Stack>

              {/* Quantity */}
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  textAlign: "right",
                  alignSelf: "center",
                }}
              >
                {remaining.toLocaleString()}
              </Typography>

              {/* Total */}
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  textAlign: "right",
                  alignSelf: "center",
                  color: "warning.main",
                }}
              >
                {total != null ? formatAuec(total) : "—"}
              </Typography>

              {/* Actions */}
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={0.5}
              >
                <Tooltip
                  title={
                    order.negotiable
                      ? t("buyorder.openOffer", "Open offer negotiation")
                      : t("MarketAggregateView.fulfill", "Fill this buy order")
                  }
                >
                  <Button
                    size="small"
                    variant="outlined"
                    color={order.negotiable ? "primary" : "warning"}
                    sx={{
                      fontSize: "10px",
                      fontWeight: 700,
                      minWidth: 0,
                      px: 1.25,
                      py: 0.25,
                      letterSpacing: "0.04em",
                    }}
                    onClick={() => setFulfillTarget(order)}
                  >
                    {order.negotiable
                      ? t("buyorder.offer", "Offer")
                      : t("MarketAggregateView.fulfill", "Fill")}
                  </Button>
                </Tooltip>
                {isOwn && (
                  <Tooltip title={t("MarketAggregateView.cancel", "Cancel your buy order")}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      sx={{
                        fontSize: "10px",
                        minWidth: 0,
                        px: 0.75,
                        py: 0.25,
                      }}
                      onClick={() => doCancel(order.buy_order_id)}
                    >
                      ✕
                    </Button>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          );
        })
      )}

      <FulfillDialog
        buyOrder={fulfillTarget}
        open={!!fulfillTarget}
        onClose={() => setFulfillTarget(null)}
      />
    </Box>
  );
}


// ---------------------------------------------------------------------------
// Analytics card — tabbed Price History / Order Depth with quality filter
// ---------------------------------------------------------------------------

function AnalyticsCard({
  complete,
  selectedTier,
  onTierSelect,
}: {
  complete: GameItemAggregateV2;
  selectedTier: number | null;
  onTierSelect: (tier: number | null) => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"price" | "depth">("price");
  const { quality_distribution } = complete;
  const hasMultiTier = quality_distribution.length > 1;

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
                  color: selectedTier === null ? "primary.contrastText" : "text.secondary",
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
                  outline: selectedTier === d.quality_tier ? "2px solid" : "none",
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
          <AggregateBuySellWallV2 aggregate={complete} qualityTier={selectedTier} />
        )}
      </Grid>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface MarketAggregateViewV2AdminProps {
  complete: GameItemAggregateV2;
  gameItemId: string;
}

export function MarketAggregateViewV2Admin({
  complete,
  gameItemId,
}: MarketAggregateViewV2AdminProps) {
  const { t } = useTranslation();
  const theme = useTheme<ExtendedTheme>();
  const { game_item, quality_distribution, listings, buy_orders } = complete;
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const histogramData = useMemo(() => {
    const total = quality_distribution.reduce((s, i) => s + i.listing_count, 0);
    return quality_distribution.map((item) => ({
      tier: item.quality_tier,
      count: item.listing_count,
      percentage: total > 0 ? (item.listing_count / total) * 100 : 0,
      averagePrice: item.avg_price,
    }));
  }, [quality_distribution]);

  const filteredListings = useMemo(() => {
    if (!selectedTier) return listings;
    return listings.filter(
      (l) =>
        l.quality_tier_min != null &&
        l.quality_tier_max != null &&
        l.quality_tier_min <= selectedTier &&
        l.quality_tier_max >= selectedTier
    );
  }, [listings, selectedTier]);

  // Lowest listed price: prefills a new price alert's target.
  const lowestPrice = useMemo(() => {
    const prices = listings.map((l) => l.price_min).filter((p) => p > 1);
    return prices.length ? Math.min(...prices) : null;
  }, [listings]);

  const createListingUrl = [
    MARKET_PATHS.create,
    `?game_item_id=${encodeURIComponent(gameItemId)}`,
    `&game_item_name=${encodeURIComponent(game_item.name)}`,
    `&game_item_type=${encodeURIComponent(game_item.type || "")}`,
  ].join("");

  return (
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
              src={game_item.image_url || "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"}
              alt={game_item.name}
              sx={{
                display: "block",
                maxHeight: "100%",
                maxWidth: "100%",
                margin: "auto",
                objectFit: "contain",
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src =
                  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png";
              }}
            />
          </Paper>
        </Grid>

        {/* Market overview: stat strip + action buttons */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              spacing={1}
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
              <Button
                component={Link}
                to={createListingUrl}
                variant="outlined"
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              >
                {t("marketUi.aggregateAdmin.createListing")}
              </Button>
              <Button
                component={Link}
                to={`${MARKET_PATHS.buyOrderCreate}?game_item_id=${encodeURIComponent(gameItemId)}&game_item_name=${encodeURIComponent(game_item.name)}`}
                variant="outlined"
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
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
            <Section xs={12} lg={6} title={t("marketUi.aggregateAdmin.priceByQualityTier")}>
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
          disablePadding
        >
          <Grid item xs={12}>
            <SellOrdersPanel
              listings={filteredListings}
              totalCount={listings.filter((l) => l.quantity_available > 0).length}
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
  );
}

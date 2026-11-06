import { useCallback, useMemo, useState } from "react"
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { type StandingBuyOrder } from "../../../store/api/v2/market"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { ListingNameAndRating } from "../../../components/rating/ListingRating"
import { FulfillBuyOrderDialog } from "./components/FulfillBuyOrderDialog"
import { remainingQuantity } from "../domain/buyOrders"
import { useFormatters } from "../../../util/format"
import { useCancelBuyOrder } from "../hooks/useBuyOrderActions"
import DeleteRounded from "@mui/icons-material/DeleteRounded"

// ---------------------------------------------------------------------------
// Buy orders panel
// ---------------------------------------------------------------------------

export function BuyOrdersPanel({
  buyOrders,
}: {
  buyOrders: StandingBuyOrder[]
}) {
  const fmt = useFormatters()
  const { data: profile } = useGetUserProfileQuery()
  const { t } = useTranslation()
  const { cancel: cancelBuyOrder } = useCancelBuyOrder(
    t("marketUi.aggregateAdmin.cancelFailed"),
  )
  const [fulfillTarget, setFulfillTarget] = useState<StandingBuyOrder | null>(
    null,
  )

  const active = useMemo(
    () =>
      [...buyOrders.filter((o) => o.status === "active")].sort(
        (a, b) => b.price_per_unit - a.price_per_unit,
      ),
    [buyOrders],
  )
  const bestBid = active[0]?.price_per_unit

  const doCancel = useCallback(
    (orderId: string) => void cancelBuyOrder(orderId),
    [cancelBuyOrder],
  )

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
          const remaining = remainingQuantity(order)
          const total = order.negotiable
            ? null
            : order.price_per_unit * remaining
          const isBest = order.price_per_unit === bestBid
          const isOwn = order.buyer_id === profile?.username

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
                    : fmt.number(order.price_per_unit)}
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
                {fmt.number(remaining)}
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
                {total != null ? fmt.compact(total) : "—"}
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
                  <Tooltip
                    title={t(
                      "MarketAggregateView.cancel",
                      "Cancel your buy order",
                    )}
                  >
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={t(
                        "MarketAggregateView.cancel",
                        "Cancel your buy order",
                      )}
                      onClick={() => doCancel(order.buy_order_id)}
                    >
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          )
        })
      )}

      {fulfillTarget && (
        <FulfillBuyOrderDialog
          buyOrder={fulfillTarget}
          open
          onClose={() => setFulfillTarget(null)}
        />
      )}
    </Box>
  )
}

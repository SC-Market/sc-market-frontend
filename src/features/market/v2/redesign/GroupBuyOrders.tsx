import { Box, Chip, Divider, Stack, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useSearchBuyOrdersQuery } from "../../../../store/api/v2/market"
import { remainingQuantity } from "../../domain/buyOrders"
import { useFormatters } from "../../../../util/format"
import { NUMERIC_SX } from "../../../../hooks/styles/theme/fonts"

/**
 * GroupBuyOrders — the DEMAND side of an item's market depth (EVE-style: bids
 * shown alongside asks). Lists active standing buy orders for this game_item so
 * buyers see going rates and sellers see existing demand. Fetched lazily when a
 * group expands (the panel only mounts on open). Fails soft: renders nothing if
 * there are no buy orders or the query errors — it's supplementary, never blocks
 * the sell-side view.
 */
export function GroupBuyOrders({ gameItemId }: { gameItemId: string }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { data, isLoading } = useSearchBuyOrdersQuery({
    gameItemId,
    sortBy: "price_per_unit",
    sortOrder: "desc", // highest bid first — most attractive to a seller
    pageSize: 20,
  })

  const orders = data?.buy_orders ?? []
  if (isLoading || orders.length === 0) return null // supplementary; stay quiet when empty

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="overline"
        sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}
      >
        {t("MarketRedesign.wantedBy", "Wanted by {{count}} buyers", {
          count: orders.length,
        })}
      </Typography>
      <Box
        sx={{
          maxHeight: 240,
          overflowY: orders.length > 5 ? "auto" : "visible",
        }}
      >
        <Stack divider={<Divider />}>
          {orders.map((o, i) => (
            <Stack
              key={o.buy_order_id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ py: 1 }}
            >
              <Typography
                variant="body2"
                sx={{ flex: 1, color: "text.secondary" }}
                noWrap
              >
                {o.buyer_name}
              </Typography>
              {i === 0 && (
                <Chip
                  label={t("MarketRedesign.topBid", "Top bid")}
                  size="small"
                  color="secondary"
                  sx={{ height: 20 }}
                />
              )}
              {o.negotiable && (
                <Chip
                  label={t("MarketRedesign.negotiable", "Negotiable")}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20 }}
                />
              )}
              <Typography
                variant="body2"
                sx={{
                  ...NUMERIC_SX,
                  color: "text.primary",
                  width: 90,
                  textAlign: "right",
                }}
              >
                {fmt.number(remainingQuantity(o))}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  ...NUMERIC_SX,
                  // A bid price: the buy side's colour
                  color: "secondary.main",
                  fontWeight: 700,
                  width: 120,
                  textAlign: "right",
                }}
              >
                {fmt.price(o.price_per_unit)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

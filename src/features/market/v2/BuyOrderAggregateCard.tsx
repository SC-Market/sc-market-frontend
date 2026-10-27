import React, { useMemo } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Fade,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme, cardFadeGradient } from "../../../hooks/styles/Theme"
import type { StandingBuyOrder } from "../../../store/api/v2/market"
import { ListingWrapper } from "../components/listings/ListingWrapper"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { MARKET_PATHS } from "../../../routes/paths"

/** A game item with its active buy orders (one card on /buyorders). */
export interface BuyOrderAggregate {
  item_id: string
  item_name: string
  orders: StandingBuyOrder[]
}

/** The orders grouped by game item, in the order each item first appears. */
export function groupBuyOrdersByItem(
  orders: StandingBuyOrder[],
): BuyOrderAggregate[] {
  const grouped = new Map<string, BuyOrderAggregate>()
  for (const bo of orders) {
    const existing = grouped.get(bo.game_item_id)
    if (existing) {
      existing.orders.push(bo)
    } else {
      grouped.set(bo.game_item_id, {
        item_id: bo.game_item_id,
        item_name: bo.game_item_name,
        orders: [bo],
      })
    }
  }
  return Array.from(grouped.values())
}

/**
 * Lowest and highest price among an item's buy orders, ignoring orders posted
 * without a price (price_per_unit 0: negotiable, taking offers). Null when no
 * order names a price. Counting the 0s gave "∞ – 0 aUEC".
 */
export function buyOrderPriceRange(
  orders: Pick<StandingBuyOrder, "price_per_unit">[],
): { min: number; max: number } | null {
  const prices = orders.map((o) => o.price_per_unit).filter((p) => p > 0)
  if (!prices.length) return null
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/** Card for a game item with active buy orders (/buyorders). */
export function BuyOrderAggregateCard({
  aggregate,
  index,
}: {
  aggregate: BuyOrderAggregate
  index: number
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t, i18n } = useTranslation()

  const priceRange = useMemo(
    () => buyOrderPriceRange(aggregate.orders),
    [aggregate.orders],
  )
  const totalQty = useMemo(
    () =>
      aggregate.orders.reduce(
        (sum, o) => sum + (o.quantity - (o.quantity_fulfilled || 0)),
        0,
      ),
    [aggregate.orders],
  )
  const imageUrl = useMemo(
    () =>
      aggregate.orders.find((o) => o.photos && o.photos.length > 0)?.photos?.[0]
        ?.url || FALLBACK_IMAGE_URL,
    [aggregate.orders],
  )

  // Orders posted without a price (negotiable, price_per_unit 0) take offers
  const priceDisplay = !priceRange
    ? t("BuyOrdersRedesign.priceNegotiable", "Make an offer")
    : priceRange.min === priceRange.max
      ? `${priceRange.max.toLocaleString(i18n.language)} aUEC`
      : `${priceRange.min.toLocaleString(i18n.language)} – ${priceRange.max.toLocaleString(i18n.language)} aUEC`

  const isDark = theme.palette.mode === "dark"

  return (
    <ListingWrapper
      useFixedWidth={false}
      data-testid="buy-order-card"
      data-id={aggregate.item_id}
    >
      <Fade in timeout={500} style={{ transitionDelay: `${50 + 50 * index}ms` }}>
        <Link
          to={MARKET_PATHS.aggregate(aggregate.item_id)}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <CardActionArea
            sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
          >
            <Card sx={{ height: 300, position: "relative" }}>
              <CardMedia
                component="img"
                loading="lazy"
                image={imageUrl}
                sx={{
                  width: "100%",
                  objectFit: "cover",
                  ...(isDark
                    ? { height: "100%", aspectRatio: "16/9" }
                    : { height: 180, aspectRatio: "16/9" }),
                  overflow: "hidden",
                }}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null
                  currentTarget.src = FALLBACK_IMAGE_URL
                }}
                alt={`Image of ${aggregate.item_name}`}
              />
              <Box
                sx={{
                  ...(theme.palette.mode === "light" ? { display: "none" } : {}),
                  position: "absolute",
                  zIndex: 3,
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%",
                  borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  background: cardFadeGradient(theme, 50, 60),
                }}
              />
              <CardContent
                sx={{
                  ...(isDark
                    ? { position: "absolute", bottom: 0, zIndex: 4 }
                    : {}),
                  maxWidth: "100%",
                  padding: "8px 12px !important",
                }}
              >
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  noWrap
                  sx={{ fontSize: "0.95rem", mb: 0.5 }}
                >
                  {priceDisplay}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.75rem",
                    lineHeight: 1.3,
                    maxHeight: 36,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    mb: 0.5,
                  }}
                >
                  {aggregate.item_name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem", lineHeight: 1 }}
                >
                  {totalQty.toLocaleString(i18n.language)}{" "}
                  {t("market.requested", "requested")}
                  {" · "}
                  {aggregate.orders.length} {t("market.buyOrders", "buy orders")}
                </Typography>
              </CardContent>
            </Card>
          </CardActionArea>
        </Link>
      </Fade>
    </ListingWrapper>
  )
}

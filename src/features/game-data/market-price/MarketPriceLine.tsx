/**
 * "Lowest on SC Market: 1.5M aUEC · 3 sellers", linking to the item's market
 * page (every listing of the item). Nothing when nobody sells the item.
 *
 * Sellers are distinct shops and the price is the lowest fixed-price ask
 * (backend services/market-prices). See useMarketPrices for why the line
 * only appears after hydration.
 */
import { Link, Typography, type SxProps, type Theme } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { GameItemMarketPrice } from "../../../store/api/v2/market"
import { MARKET_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"

/** Whether there is anything to show: somebody sells the item. */
export function hasMarketPrice(
  price: GameItemMarketPrice | undefined | null,
): price is GameItemMarketPrice {
  return !!price && price.seller_count > 0
}

/** The text of the line ("full") or of a card's caption ("compact"). */
export function useMarketPriceText() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  return (price: GameItemMarketPrice, form: "full" | "compact"): string => {
    const count = price.seller_count
    if (price.lowest_price === null) {
      return form === "full"
        ? t("marketPrice.sellersLine", { count })
        : t("marketPrice.sellersCompact", { count })
    }
    const value = fmt.price(price.lowest_price)
    return form === "full"
      ? t("marketPrice.lowestLine", { count, price: value })
      : t("marketPrice.lowestCompact", { count, price: value })
  }
}

export function MarketPriceLine({
  price,
  gameItemId,
  itemName,
  sx,
}: {
  price: GameItemMarketPrice | undefined
  gameItemId: string
  itemName: string
  sx?: SxProps<Theme>
}) {
  const text = useMarketPriceText()
  if (!hasMarketPrice(price)) return null
  return (
    <Typography variant="body2" sx={sx} data-testid="market-price-line">
      <Link
        component={RouterLink}
        to={MARKET_PATHS.aggregate(gameItemId, itemName)}
        underline="hover"
        fontWeight={600}
      >
        {text(price, "full")}
      </Link>
    </Typography>
  )
}

/** A card's caption: no link (the card itself is one). */
export function MarketPriceCaption({
  price,
}: {
  price: GameItemMarketPrice | undefined
}) {
  const text = useMarketPriceText()
  if (!hasMarketPrice(price)) return null
  return (
    <Typography
      variant="caption"
      color="primary"
      noWrap
      sx={{ display: "block", fontWeight: 600 }}
      data-testid="market-price-caption"
    >
      {text(price, "compact")}
    </Typography>
  )
}

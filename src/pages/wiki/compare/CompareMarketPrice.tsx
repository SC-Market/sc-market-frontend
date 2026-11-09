/**
 * A comparison row's SC Market price: lowest ask and sellers, linking to the
 * item's market page; a dash when nobody sells it.
 */
import { Link } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import type { WikiCompareRow } from "../../../store/api/v2/market"
import { MARKET_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import {
  hasMarketPrice,
  useMarketPriceText,
} from "../../../features/game-data/market-price/MarketPriceLine"

export function CompareMarketPrice({ row }: { row: WikiCompareRow }) {
  const text = useMarketPriceText()
  const fmt = useFormatters()
  if (!hasMarketPrice(row.market)) return <>—</>
  return (
    <Link
      component={RouterLink}
      to={MARKET_PATHS.aggregate(row.id, row.name)}
      underline="hover"
      title={fmt.exactPrice(row.market.lowest_price)}
    >
      {text(row.market, "compact")}
    </Link>
  )
}

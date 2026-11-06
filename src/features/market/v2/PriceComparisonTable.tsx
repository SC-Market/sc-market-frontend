import { Box, Typography, useTheme } from "@mui/material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { useFormatters } from "../../../util/format"

/**
 * PriceComparisonTable - Shows price ranges by quality tier
 *
 * Requirements: 41.5
 */
export function PriceComparisonTable({
  distribution,
}: {
  distribution: Array<{
    quality_tier: number
    listing_count: number
    total_quantity: number
    min_price: number
    avg_price: number
    max_price: number
    shop_count: number
  }>
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  if (distribution.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {t("market.noPriceData", "No price data available")}
      </Typography>
    )
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.qualityTier", "Quality Tier")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.sellers", "Sellers")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.minPrice", "Min Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.avgPrice", "Avg Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.maxPrice", "Max Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.totalQuantity", "Total Qty")}
              </Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {distribution.map((item) => (
            <tr key={item.quality_tier}>
              <td style={{ padding: theme.spacing(1) }}>
                <QualityBadge tier={item.quality_tier} size="small" />
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">{item.shop_count}</Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2" color="primary">
                  {fmt.number(item.min_price)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {fmt.number(item.avg_price)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {fmt.number(item.max_price)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {fmt.number(item.total_quantity)}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}

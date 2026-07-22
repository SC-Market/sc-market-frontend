/**
 * ListingAnalyticsWidget — per-listing views → conversion funnel for a shop,
 * backed by GET /v2/analytics/listing-stats. Shows a totals summary and a table
 * of top listings ranked by views, with a conversion rate (fulfilled sales ÷
 * views). Shop-scoped like the seller-analytics widget.
 */

import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import type { TFunction } from "i18next"
import { useGetListingStatsQuery } from "../../../store/api/v2/market"
import type { ResolvedScope } from "../useResolveScope"
import type { DashboardWidget } from "../types"

function readLimit(settings: DashboardWidget["settings"]): number {
  const value = settings?.limit
  return typeof value === "number" && value > 0 && value <= 100 ? value : 10
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack spacing={0} sx={{ minWidth: 80 }}>
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  )
}

export function ListingAnalyticsWidget({
  scope,
  settings,
  t,
}: {
  scope: ResolvedScope
  settings?: DashboardWidget["settings"]
  t: TFunction
}) {
  const { data, isLoading, isError } = useGetListingStatsQuery(
    { shopId: scope.shopId, limit: readLimit(settings) },
    { skip: !scope.shopId },
  )

  if (!scope.shopId) {
    return (
      <Alert severity="info" variant="outlined">
        {t(
          "dashboard.listingAnalytics.noShop",
          "Pin this widget to a shop to see its listing analytics.",
        )}
      </Alert>
    )
  }
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (isError || !data) {
    return (
      <Alert severity="error" variant="outlined">
        {t(
          "dashboard.listingAnalytics.error",
          "Couldn't load listing analytics.",
        )}
      </Alert>
    )
  }
  if (data.listings.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        {t(
          "dashboard.listingAnalytics.empty",
          "No views or orders recorded yet.",
        )}
      </Alert>
    )
  }

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Metric
          label={t("dashboard.listingAnalytics.views", "Views")}
          value={data.totals.views.toLocaleString()}
        />
        <Metric
          label={t("dashboard.listingAnalytics.cartAdds", "Cart adds")}
          value={data.totals.cart_adds.toLocaleString()}
        />
        <Metric
          label={t("dashboard.listingAnalytics.orders", "Orders")}
          value={data.totals.orders.toLocaleString()}
        />
        <Metric
          label={t("dashboard.listingAnalytics.sales", "Sales")}
          value={data.totals.sales.toLocaleString()}
        />
        <Metric
          label={t("dashboard.listingAnalytics.conversion", "Conversion")}
          value={`${data.totals.conversion_rate}%`}
        />
      </Box>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t("dashboard.listingAnalytics.listing", "Listing")}
              </TableCell>
              <TableCell align="right">
                {t("dashboard.listingAnalytics.views", "Views")}
              </TableCell>
              <TableCell align="right">
                {t("dashboard.listingAnalytics.cartAdds", "Cart adds")}
              </TableCell>
              <TableCell align="right">
                {t("dashboard.listingAnalytics.orders", "Orders")}
              </TableCell>
              <TableCell align="right">
                {t("dashboard.listingAnalytics.sales", "Sales")}
              </TableCell>
              <TableCell align="right">
                {t("dashboard.listingAnalytics.conversion", "Conversion")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.listings.map((row) => (
              <TableRow key={row.listing_id}>
                <TableCell
                  sx={{
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={row.title}
                >
                  {row.title}
                </TableCell>
                <TableCell align="right">
                  {row.views.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {row.cart_adds.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {row.orders.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {row.sales.toLocaleString()}
                </TableCell>
                <TableCell align="right">{row.conversion_rate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  )
}

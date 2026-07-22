/**
 * MarketOverviewWidget — a market-wide "top items" table driven by
 * /v2/game-items/aggregates. Scope-independent (the market is global), so it
 * only supports the `me` binding in the registry. Settings let the author pick
 * the sort dimension and how many rows to show.
 */

import { Alert, Box, CircularProgress } from "@mui/material"
import type { TFunction } from "i18next"
import { useSearchGameItemAggregatesQuery } from "../../../store/api/v2/market"
import { BulkItemsTableV2 } from "../../market/v2/components/BulkItemsTableV2"
import type { DashboardWidget } from "../types"

type SortBy = "price" | "quantity" | "name" | "shop_count"

const VALID_SORTS: SortBy[] = ["price", "quantity", "name", "shop_count"]

function readSort(settings: DashboardWidget["settings"]): SortBy {
  const value = settings?.sortBy
  return typeof value === "string" && VALID_SORTS.includes(value as SortBy)
    ? (value as SortBy)
    : "quantity"
}

function readPageSize(settings: DashboardWidget["settings"]): number {
  const value = settings?.pageSize
  return typeof value === "number" && value > 0 && value <= 50 ? value : 10
}

export function MarketOverviewWidget({
  settings,
  t,
}: {
  settings?: DashboardWidget["settings"]
  t: TFunction
}) {
  const { data, isLoading, isError } = useSearchGameItemAggregatesQuery({
    sortBy: readSort(settings),
    sortOrder: "desc",
    pageSize: readPageSize(settings),
  })

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
        {t("dashboard.marketOverviewError", "Couldn't load market data.")}
      </Alert>
    )
  }
  if (data.items.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        {t("dashboard.marketOverviewEmpty", "No market listings to show.")}
      </Alert>
    )
  }

  return <BulkItemsTableV2 items={data.items} />
}

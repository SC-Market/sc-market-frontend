/**
 * PriceHistoryWidget — price trend for one game item, pinned at add time via the
 * item picker (stored as settings.gameItemId / settings.gameItemName). Wraps the
 * existing PriceHistoryChartV2, which handles fetch/loading/error/quality-tier
 * filtering itself. Personal-only (`me` scope) — the market is global.
 */

import { Alert, Box, Typography } from "@mui/material"
import type { TFunction } from "i18next"
import { PriceHistoryChartV2 } from "../../market/v2/components/PriceHistoryChartV2"
import type { DashboardWidget } from "../types"

export function PriceHistoryWidget({
  settings,
  t,
}: {
  settings?: DashboardWidget["settings"]
  t: TFunction
}) {
  const gameItemId =
    typeof settings?.gameItemId === "string" ? settings.gameItemId : ""
  const gameItemName =
    typeof settings?.gameItemName === "string" ? settings.gameItemName : ""

  if (!gameItemId) {
    return (
      <Alert severity="info" variant="outlined">
        {t(
          "dashboard.priceHistoryNoItem",
          "No item selected. Remove this widget and add it again to pick an item.",
        )}
      </Alert>
    )
  }

  return (
    <Box>
      {gameItemName && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {gameItemName}
        </Typography>
      )}
      <PriceHistoryChartV2 gameItemId={gameItemId} height={280} />
    </Box>
  )
}

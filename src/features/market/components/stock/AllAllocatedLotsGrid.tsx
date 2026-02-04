/**
 * AllAllocatedLotsGrid Component
 * 
 * Shows info about allocated stock with link to order allocation view
 */

import { Paper, Typography, Box, Alert } from "@mui/material"
import { useTranslation } from "react-i18next"

export function AllAllocatedLotsGrid() {
  const { t } = useTranslation()

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          {t("stock.allocatedStock", "Allocated Stock")}
        </Typography>
      </Box>
      <Alert severity="info">
        {t(
          "stock.allocatedStockInfo",
          "View and manage allocated stock for specific orders in the order details page under the 'Stock Allocation' tab.",
        )}
      </Alert>
    </Paper>
  )
}

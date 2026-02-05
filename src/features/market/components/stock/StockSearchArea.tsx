/**
 * Stock Search Area
 *
 * Sidebar for filtering stock lots
 */

import React from "react"
import { Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

export function StockSearchArea() {
  const { t } = useTranslation()

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("stock.filters", "Filters")}
      </Typography>
      {/* Placeholder for future filters */}
    </Box>
  )
}

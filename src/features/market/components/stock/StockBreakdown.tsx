/**
 * Stock Breakdown Component
 * 
 * Displays aggregate stock information: total, available, and reserved quantities.
 * 
 * Requirements: 2.1, 2.5, 3.3, 3.4, 4.4, 5.1
 */

import React from "react"
import { Box, Stack, Typography, Chip } from "@mui/material"
import { useTranslation } from "react-i18next"

export interface StockBreakdownProps {
  total: number
  available: number
  reserved: number
}

/**
 * StockBreakdown Component
 * 
 * Shows total stock, available stock, and reserved stock with visual indicators.
 */
export function StockBreakdown({ total, available, reserved }: StockBreakdownProps) {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {t("StockBreakdown.total", "Total Stock")}
        </Typography>
        <Typography variant="h5" fontWeight="medium">
          {total.toLocaleString()}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {t("StockBreakdown.available", "Available")}
        </Typography>
        <Typography variant="h5" fontWeight="medium" color="success.main">
          {available.toLocaleString()}
        </Typography>
      </Box>

      {reserved > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {t("StockBreakdown.reserved", "Reserved")}
          </Typography>
          <Typography variant="h5" fontWeight="medium" color="warning.main">
            {reserved.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* Visual indicator chips */}
      <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
        <Chip
          label={`${available} ${t("StockBreakdown.availableShort", "available")}`}
          color="success"
          size="small"
          variant="outlined"
        />
        {reserved > 0 && (
          <Chip
            label={`${reserved} ${t("StockBreakdown.reservedShort", "reserved")}`}
            color="warning"
            size="small"
            variant="outlined"
          />
        )}
      </Stack>
    </Stack>
  )
}

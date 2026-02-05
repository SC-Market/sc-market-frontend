/**
 * Manage Stock Page
 *
 * Tabbed interface for managing stock across all listings
 */

import React, { useState } from "react"
import { Box, Paper, Tabs, Tab } from "@mui/material"
import { useTranslation } from "react-i18next"
import { AllStockLotsGrid } from "./stock/AllStockLotsGrid"
import { AllAllocatedLotsGrid } from "./stock/AllAllocatedLotsGrid"

export function ManageStockPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label={t("stock.allStock", "All Stock")} />
          <Tab label={t("stock.allocatedStock", "Allocated Stock")} />
        </Tabs>
      </Paper>

      {tab === 0 && <AllStockLotsGrid />}
      {tab === 1 && <AllAllocatedLotsGrid />}
    </Box>
  )
}

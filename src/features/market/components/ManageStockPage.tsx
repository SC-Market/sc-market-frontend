/**
 * Manage Stock Page
 *
 * Interface for managing stock lots and allocations with search sidebar
 */

import React, { useState } from "react"
import {
  Box,
  Grid,
  Paper,
  Tabs,
  Button,
  useMediaQuery,
} from "@mui/material"
import { HapticTab } from "../../../components/haptic"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ContainerGrid } from "../../../components/layout/ContainerGrid"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { AllStockLotsGrid } from "./stock/AllStockLotsGrid"
import { AllAllocatedLotsGrid } from "./stock/AllAllocatedLotsGrid"
import { StockSearchArea } from "./stock/StockSearchArea"
import { StockSearchProvider } from "./stock/StockSearchContext"

export function ManageStockPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  const currentTab = location.pathname === "/market/manage" ? 0 : 1

  const handleTabChange = (_: any, newValue: number) => {
    if (newValue === 0) {
      navigate("/market/manage")
    } else {
      navigate("/market/manage-stock")
    }
  }

  return (
    <StockSearchProvider>
      {isMobile && (
        <BottomSheet
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          title={t("stock.filters", "Filters")}
          maxHeight="90vh"
        >
          <Box sx={{ overflowY: "auto", overflowX: "hidden", pb: 2 }}>
            <StockSearchArea />
          </Box>
        </BottomSheet>
      )}

      <ContainerGrid maxWidth="xl" sidebarOpen={true}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<FilterListIcon />}
                onClick={() => setSidebarOpen((prev) => !prev)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                {t("market.filters", "Filters")}
              </Button>
            )}
            <Tabs value={currentTab} onChange={handleTabChange}>
              <HapticTab label={t("sidebar.manage_listings", "Manage Listings")} />
              <HapticTab label={t("sidebar.manage_stock", "Manage Stock")} />
            </Tabs>
          </Box>
        </Grid>

        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper>
              <StockSearchArea />
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={isMobile ? 12 : 9}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <AllStockLotsGrid />
            </Grid>

            <Grid item xs={12}>
              <AllAllocatedLotsGrid />
            </Grid>
          </Grid>
        </Grid>
      </ContainerGrid>
    </StockSearchProvider>
  )
}

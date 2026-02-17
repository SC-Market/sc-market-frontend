import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Grid, Paper } from "@mui/material"
import { ArrowBack } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { StockManager } from "../../features/market/components/stock/StockManager"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageManageListingStock } from "../../features/market/hooks/usePageManageListingStock"

export function ManageListingStock() {
  const { listingId } = useParams<{ listingId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const pageData = usePageManageListingStock(listingId)

  return (
    <StandardPageLayout
      title={t("ItemStock.manageStock", "Manage Stock")}
      sidebarOpen={true}
      maxWidth="lg"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      {pageData.data && (
        <Grid item xs={12} container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/market/manage")}
              sx={{ mb: 2 }}
            >
              {t("common.back", "Back to Manage Listings")}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <StockManager
                listingId={pageData.data.listingId}
                onClose={() => navigate("/market/manage")}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </StandardPageLayout>
  )
}

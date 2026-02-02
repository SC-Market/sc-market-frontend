import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material"
import { ArrowBack } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { Page } from "../../components/metadata/Page"
import { StockManager } from "../../features/market/components/stock/StockManager"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function ManageListingStock() {
  const { listingId } = useParams<{ listingId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  if (!listingId) {
    return (
      <Page title={t("ItemStock.manageStock", "Manage Stock")}>
        <Container maxWidth="lg">
          <Typography variant="h5" color="error">
            {t("common.error", "Error")}: No listing ID provided
          </Typography>
        </Container>
      </Page>
    )
  }

  return (
    <Page title={t("ItemStock.manageStock", "Manage Stock")}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={theme.layoutSpacing.layout}>
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
                listingId={listingId}
                onClose={() => navigate("/market/manage")}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}

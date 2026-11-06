import { Alert, Box, Grid, Link, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { PATHS } from "../../routes/paths"
import { FlatSection } from "../paper/Section"

/**
 * Order Settings › Stock Management: where the per-shop stock settings
 * (subtraction timing, allocation mode) now live.
 */
export function OrderStockNotices() {
  const { t } = useTranslation()
  return (
    <FlatSection title={t("OrderSettings.stockTitle", "Stock Management")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t(
            "OrderSettings.stockDescription",
            "Configure when stock is subtracted from your inventory.",
          )}
        </Typography>
      </Grid>

      {/* Stock subtraction timing is a per-shop setting (Shop Settings ›
            Stock Management); orders read the shop's value. */}
      <Grid item xs={12}>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            {t("OrderSettings.stockSubtractionTiming")}
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              {t(
                "OrderSettings.stockSubtractionMoved",
                "Stock subtraction timing is set per shop: open your shop's Settings, under Stock Management › Stock subtraction timing.",
              )}{" "}
              <Link component={RouterLink} to={PATHS.dashboardShops}>
                {t("OrderSettings.allocationModeShops", "Your shops")}
              </Link>
            </Typography>
          </Alert>
        </Box>
      </Grid>

      {/* Allocation mode is a per-shop setting (Shop Settings › Orders);
            the org/user value here was never the one orders used. */}
      <Grid item xs={12}>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            {t("OrderSettings.allocationMode", "Stock Allocation Mode")}
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              {t(
                "OrderSettings.allocationModeMoved",
                "Stock allocation mode is set per shop: open your shop's Settings, under Stock Management › Allocation mode.",
              )}{" "}
              <Link component={RouterLink} to={PATHS.dashboardShops}>
                {t("OrderSettings.allocationModeShops", "Your shops")}
              </Link>
            </Typography>
          </Alert>
        </Box>
      </Grid>
    </FlatSection>
  )
}

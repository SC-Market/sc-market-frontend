import {
  Button,
  Chip,
  Collapse,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"
import { type OrderSearchResult } from "../../features/orders/hooks/useOrderSearch"

/** Collapsible filter panel (usernames, listing/service toggles, active chips) of the order list. */
export function OrderFiltersPanel({
  search,
  mine,
}: {
  search: OrderSearchResult
  mine?: boolean
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const {
    filtersOpen,
    buyerUsername,
    setBuyerUsername,
    sellerUsername,
    setSellerUsername,
    hasMarketListings,
    setHasMarketListings,
    hasService,
    setHasService,
    debouncedBuyerUsername,
    debouncedSellerUsername,
    activeFiltersCount,
    clearFilters,
  } = search
  return (
    <Collapse in={filtersOpen}>
      <Paper sx={{ p: 1, m: 1, bgcolor: "background.default" }}>
        <Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle2">
              {t("orders.filter_orders", "Filter Orders")}
            </Typography>
            {activeFiltersCount > 0 && (
              <Button size="small" onClick={clearFilters}>
                {t("orders.clear_filters", "Clear All")}
              </Button>
            )}
          </Stack>

          <Grid container spacing={theme.layoutSpacing.compact}>
            {/* Buyer/Seller Username Filter */}
            {!mine ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("orders.buyer_username", "Buyer Username")}
                  value={buyerUsername}
                  onChange={(e) => setBuyerUsername(e.target.value)}
                  size="small"
                  placeholder={t(
                    "orders.buyer_username_placeholder",
                    "Enter buyer username",
                  )}
                />
              </Grid>
            ) : (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("orders.seller_username", "Seller Username")}
                  value={sellerUsername}
                  onChange={(e) => setSellerUsername(e.target.value)}
                  size="small"
                  placeholder={t(
                    "orders.seller_username_placeholder",
                    "Enter seller username or spectrum ID",
                  )}
                />
              </Grid>
            )}

            {/* Has Market Listings Toggle */}
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={hasMarketListings === true}
                    onChange={(e) =>
                      setHasMarketListings(e.target.checked ? true : undefined)
                    }
                  />
                }
                label={t("orders.has_market_listings", "Has Market Listings")}
              />
            </Grid>

            {/* Has Service Toggle */}
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={hasService === true}
                    onChange={(e) =>
                      setHasService(e.target.checked ? true : undefined)
                    }
                  />
                }
                label={t("orders.has_service", "Has Service")}
              />
            </Grid>
          </Grid>

          {/* Active Filters Chips */}
          {activeFiltersCount > 0 && (
            <Stack
              direction="row"
              spacing={theme.layoutSpacing.compact}
              flexWrap="wrap"
              gap={theme.layoutSpacing.compact}
            >
              {debouncedBuyerUsername && (
                <Chip
                  label={`${t("orders.buyer", "Buyer")}: ${debouncedBuyerUsername}`}
                  onDelete={() => setBuyerUsername("")}
                  size="small"
                />
              )}
              {debouncedSellerUsername && (
                <Chip
                  label={`${t("orders.seller", "Seller")}: ${debouncedSellerUsername}`}
                  onDelete={() => setSellerUsername("")}
                  size="small"
                />
              )}
              {hasMarketListings !== undefined && (
                <Chip
                  label={t("orders.has_market_listings", "Has Market Listings")}
                  onDelete={() => setHasMarketListings(undefined)}
                  size="small"
                />
              )}
              {hasService !== undefined && (
                <Chip
                  label={t("orders.has_service", "Has Service")}
                  onDelete={() => setHasService(undefined)}
                  size="small"
                />
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Collapse>
  )
}

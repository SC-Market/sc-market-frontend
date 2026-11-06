/**
 * BulkStockManagementV2: the shop's Stock page (/shop/:slug/stock). Lists the
 * shop's stock lots ("All Stock Lots", editable in place) and the lots with
 * stock reserved for open orders ("Allocated Stock").
 *
 * Naming: user-facing text says "Stock" for a shop's lots and "My Stock" for
 * your own lots across shops (pages/inventory); in code a lot is a
 * listing_item_lot, and "inventory" is the v2 API for your own lots.
 */

import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useHydratedInitialState } from "../../../hooks/ssr/useHydratedInitialState"
import FilterListIcon from "@mui/icons-material/FilterListRounded"
import SearchIcon from "@mui/icons-material/SearchRounded"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { useGetMyListingsQuery } from "../../../store/api/v2/market"
import { MARKET_PATHS } from "../../../routes/paths"
import { HelpLink } from "../../help/components/HelpLink"
import { FirstUseHint } from "../../help/components/FirstUseHint"
import { ShopManageAccessNotice } from "../../shops/components/ShopManageAccessNotice"
import {
  useStockShop,
  StockFilterProvider,
  useStockFilter,
} from "./stockLotFilters"
import { AllStockLotsGridV2 } from "./AllStockLotsGridV2"
import { AllocatedStockGridV2 } from "./AllocatedStockGridV2"

/* ── Main page component ── */

export function BulkStockManagementV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useHydratedInitialState(!isMobile)
  const { canEditLots } = useStockShop()

  return (
    <StandardPageLayout
      title={t("sidebar.manage_stock", "Stock")}
      headerActions={<HelpLink guide="stockLots" />}
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
        { label: t("sidebar.manage_stock", "Stock") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <StockFilterProvider>
        <Grid item xs={12}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {isMobile && (
                  <Button
                    variant="outlined"
                    color="neutral"
                    startIcon={<FilterListIcon />}
                    onClick={() => setSidebarOpen((p) => !p)}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    {t("market.filters", "Filters")}
                  </Button>
                )}
                <ManageListingsTabBar
                  title={t("sidebar.manage_stock", "Stock")}
                />
              </Box>
            </Grid>

            {!canEditLots && (
              <Grid item xs={12}>
                <ShopManageAccessNotice area="stock" />
              </Grid>
            )}

            <Grid item xs={12} sx={{ "&:empty": { display: "none" } }}>
              <FirstUseHint hint="stockLots" title={t("hints.stockLots.title")}>
                {t("hints.stockLots.body")}
              </FirstUseHint>
            </Grid>

            {/* Mobile bottom sheet */}
            {isMobile && (
              <BottomSheet
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                title={t("stock.filters", "Filters")}
                maxHeight="90vh"
              >
                <Box sx={{ overflowY: "auto", overflowX: "hidden", pb: 2 }}>
                  <StockSearchAreaV2 />
                </Box>
              </BottomSheet>
            )}

            {/* Desktop sidebar */}
            {!isMobile && (
              <Grid item xs={12} md={3}>
                <Paper>
                  <StockSearchAreaV2 />
                </Paper>
              </Grid>
            )}

            {/* Content: two grids */}
            <Grid item xs={12} md={isMobile ? 12 : 9}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Grid item xs={12}>
                  <AllStockLotsGridV2 />
                </Grid>
                <Grid item xs={12}>
                  <AllocatedStockGridV2 />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </StockFilterProvider>
    </StandardPageLayout>
  )
}

/* ── Sidebar ── */

function StockSearchAreaV2() {
  const { t } = useTranslation()
  const { filters, setSearch, setListingId } = useStockFilter()
  const { shopId } = useStockShop()
  const { data: listingsData } = useGetMyListingsQuery({
    pageSize: 100,
    sortBy: "updated_at",
    sortOrder: "desc",
    shopId,
  })
  const listings = listingsData?.listings ?? []

  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      <Typography variant="h6">{t("stock.filters", "Filters")}</Typography>

      <TextField
        fullWidth
        size="small"
        placeholder={t("stock.searchLots", "Search lots")}
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        select
        fullWidth
        size="small"
        label={t("stock.listing", "Listing")}
        value={filters.listingId ?? ""}
        onChange={(e) => setListingId(e.target.value || null)}
      >
        <MenuItem value="">{t("common.all", "All")}</MenuItem>
        {listings.map((l) => (
          <MenuItem key={l.listing_id} value={l.listing_id}>
            {l.title}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  )
}

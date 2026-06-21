import React, { useMemo, useCallback } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Link as RouterLink, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useSearchGameItemAggregatesQuery, type GameItemAggregate, type SearchGameItemAggregatesApiArg } from "../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { HideOnScroll, MarketNavArea } from "../components/MarketNavArea"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { useMarketSidebar } from "../hooks/MarketSidebar"
import { LanguageFilter } from "../../../components/search/LanguageFilter"
import { EmptyListings } from "../../../components/empty-states"
import { ListingSkeleton } from "../../../components/skeletons"
import { useViewMode, ViewModeToggle } from "../../../hooks/market/useViewMode"
import { BulkItemsTableV2 } from "./components/BulkItemsTableV2"

// ── Sidebar Filter ─────────────────────────────────────────────────────

function BulkSearchArea() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("page", "1")
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={1.5}>
        <Grid item xs={12}>
          <TextField
            size="small" fullWidth
            label={t("bulk.search", "Search items")}
            value={searchParams.get("text") || ""}
            onChange={(e) => updateParam("text", e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField select size="small" fullWidth
            label={t("bulk.sortBy", "Sort by")}
            value={searchParams.get("sort_by") || "quantity"}
            onChange={(e) => updateParam("sort_by", e.target.value)}
          >
            <MenuItem value="quantity">Quantity</MenuItem>
            <MenuItem value="price">Lowest Price</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="shop_count">Most Shops</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField select size="small" fullWidth
            label={t("bulk.order", "Order")}
            value={searchParams.get("sort_order") || "desc"}
            onChange={(e) => updateParam("sort_order", e.target.value)}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={6}>
          <TextField size="small" fullWidth type="number"
            label={t("bulk.minPrice", "Min Price")}
            value={searchParams.get("price_min") || ""}
            onChange={(e) => updateParam("price_min", e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField size="small" fullWidth type="number"
            label={t("bulk.maxPrice", "Max Price")}
            value={searchParams.get("price_max") || ""}
            onChange={(e) => updateParam("price_max", e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField size="small" fullWidth type="number"
            label={t("bulk.minQty", "Min Quantity")}
            value={searchParams.get("quantity_min") || ""}
            onChange={(e) => updateParam("quantity_min", e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField size="small" fullWidth type="number"
            label={t("bulk.maxQty", "Max Quantity")}
            value={searchParams.get("quantity_max") || ""}
            onChange={(e) => updateParam("quantity_max", e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField size="small" fullWidth
            label={t("bulk.itemType", "Item Type")}
            value={searchParams.get("item_type") || ""}
            onChange={(e) => updateParam("item_type", e.target.value)}
            placeholder="e.g. Commodity"
          />
        </Grid>
      </Grid>
    </Box>
  )
}

function BulkMobileSidebar() {
  const [open, setOpen] = useMarketSidebar()
  const { t } = useTranslation()
  return (
    <BottomSheet open={open} onClose={() => setOpen(false)} title={t("market.filters", "Filters")}>
      <BulkSearchArea />
    </BottomSheet>
  )
}

// ── Aggregate Card ─────────────────────────────────────────────────────

function AggregateCard({ item }: { item: GameItemAggregate }) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Card sx={{
      height: "100%",
      transition: "transform 0.15s",
      "&:hover": { transform: "translateY(-2px)" },
    }}>
      <CardActionArea
        component={RouterLink}
        to={`/market/aggregate/${item.game_item_id}`}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", textDecoration: "none", color: "inherit" }}
      >
        <CardMedia
          component="img"
          image={item.image_url || FALLBACK_IMAGE_URL}
          alt={item.name}
          sx={{ height: 120, objectFit: "contain", bgcolor: "background.default", p: 1 }}
        />
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flex: 1 }}>
          <Typography variant="body2" fontWeight="bold" noWrap>{item.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{item.type}</Typography>

          <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>
            {item.min_price === item.max_price
              ? `${item.min_price.toLocaleString()} aUEC`
              : `${item.min_price.toLocaleString()} – ${item.max_price.toLocaleString()} aUEC`}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
            <Chip label={`${item.total_quantity.toLocaleString()} avail.`} size="small" variant="outlined" />
            <Chip label={`${item.shop_count} seller${item.shop_count !== 1 ? "s" : ""}`} size="small" variant="outlined" />
          </Stack>

          {(item.quality_tier_min || item.quality_tier_max) && (
            <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.25 }}>
              <QualityBadge tier={item.quality_tier_min || item.quality_tier_max || 1} size="small" />
              {item.quality_tier_min !== item.quality_tier_max && item.quality_tier_max && (
                <>
                  <Typography variant="caption" sx={{ mx: 0.25 }}>–</Typography>
                  <QualityBadge tier={item.quality_tier_max} size="small" />
                </>
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────

export function BulkItemsPageV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))
  const [viewMode, setViewMode] = useViewMode()

  const queryArgs = useMemo(() => ({
    text: searchParams.get("text") || undefined,
    itemType: searchParams.get("item_type") || undefined,
    priceMin: searchParams.get("price_min") ? Number(searchParams.get("price_min")) : undefined,
    priceMax: searchParams.get("price_max") ? Number(searchParams.get("price_max")) : undefined,
    quantityMin: searchParams.get("quantity_min") ? Number(searchParams.get("quantity_min")) : undefined,
    quantityMax: searchParams.get("quantity_max") ? Number(searchParams.get("quantity_max")) : undefined,
    sortBy: (searchParams.get("sort_by") as SearchGameItemAggregatesApiArg["sortBy"]) || "quantity",
    sortOrder: (searchParams.get("sort_order") as SearchGameItemAggregatesApiArg["sortOrder"]) || "desc",
    page: Number(searchParams.get("page")) || 1,
    pageSize: 24,
  }), [searchParams])

  const { data, isLoading } = useSearchGameItemAggregatesQuery(queryArgs)
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / (data?.page_size ?? 24))

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("page", "1")
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const gridBreakpoints = { xs: 6, sm: 4, md: 3, lg: 2 }

  const itemGrid = (
    <>
      {isLoading ? (
        <Grid container spacing={1}>
          {new Array(12).fill(undefined).map((_, i) => (
            <Grid item {...gridBreakpoints} key={i}>
              <ListingSkeleton index={i} />
            </Grid>
          ))}
        </Grid>
      ) : items.length === 0 ? (
        <EmptyListings
          isSearchResult={!!searchParams.get("text") || !!searchParams.get("item_type") || !!searchParams.get("price_min") || !!searchParams.get("quantity_min")}
          title={
            searchParams.get("text") || searchParams.get("item_type")
              ? t("bulk.noResults", "No items match your filters")
              : t("bulk.noItems", "No bulk items available")
          }
          description={
            searchParams.get("text") || searchParams.get("item_type")
              ? t("bulk.noResultsDesc", "Try adjusting your search or clearing filters")
              : t("bulk.noItemsDesc", "There are no items with active listings right now. Check back later or create a listing.")
          }
          showCreateAction={!searchParams.get("text")}
        />
      ) : viewMode === "list" ? (
        <BulkItemsTableV2 items={items} />
      ) : (
        <Grid container spacing={1}>
          {items.map((item) => (
            <Grid item {...gridBreakpoints} key={item.game_item_id}>
              <AggregateCard item={item} />
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={totalPages}
            page={queryArgs.page}
            onChange={(_, p) => updateParam("page", String(p))}
            color="primary"
          />
        </Box>
      )}
    </>
  )

  return (
    <>
      {showMobileSidebar && <BulkMobileSidebar />}

      <Container maxWidth={"xxxl"} sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <HideOnScroll><MarketNavArea /></HideOnScroll>
              </Grid>
              <Grid item xs={12}><Divider light /></Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </Box>
              </Grid>
              <Grid item xs={12}>{itemGrid}</Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              {/* Desktop: Persistent sidebar — same as ListingSearchV2 */}
              <Paper sx={{
                position: "sticky",
                top: "calc(64px + 16px)",
                maxHeight: "calc(100vh - 64px - 32px)",
                height: "fit-content",
                width: 300,
                flexShrink: 0,
                overflowY: "auto",
              }}>
                <BulkSearchArea />
              </Paper>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </Box>
                {itemGrid}
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}

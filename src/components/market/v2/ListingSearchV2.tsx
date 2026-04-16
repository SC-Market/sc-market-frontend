import React, { useState, useMemo } from "react"
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  SelectChangeEvent,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useSearchListingsV2Query } from "./api/marketV2Api"
import type { SearchListingsRequest } from "./types/v2-api-types"

/**
 * ListingSearchV2 - V2 market listing search component
 * 
 * Provides search interface with:
 * - Text query search
 * - Game item filtering
 * - Quality tier range filters (min/max)
 * - Price range filters (min/max)
 * - Paginated results display
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6
 */
export function ListingSearchV2() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Search filters state
  const [textQuery, setTextQuery] = useState("")
  const [gameItemId, setGameItemId] = useState("")
  const [qualityTierMin, setQualityTierMin] = useState<number | "">("")
  const [qualityTierMax, setQualityTierMax] = useState<number | "">("")
  const [priceMin, setPriceMin] = useState<number | "">("")
  const [priceMax, setPriceMax] = useState<number | "">("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Build search params
  const searchParams = useMemo<SearchListingsRequest>(() => {
    const params: SearchListingsRequest = {
      page,
      page_size: pageSize,
    }

    // Add optional filters
    if (textQuery.trim()) {
      params.text = textQuery.trim()
    }
    if (gameItemId) {
      params.game_item_id = gameItemId
    }
    if (qualityTierMin !== "") {
      params.quality_tier_min = qualityTierMin
    }
    if (qualityTierMax !== "") {
      params.quality_tier_max = qualityTierMax
    }
    if (priceMin !== "") {
      params.price_min = priceMin
    }
    if (priceMax !== "") {
      params.price_max = priceMax
    }

    return params
  }, [textQuery, gameItemId, qualityTierMin, qualityTierMax, priceMin, priceMax, page, pageSize])

  // Use Redux Toolkit Query hook
  const { data: searchResults, isLoading, error } = useSearchListingsV2Query(searchParams)

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  // Handle listing click
  const handleListingClick = (listingId: string) => {
    navigate(`/market/v2/listings/${listingId}`)
  }

  // Calculate total pages
  const totalPages = searchResults ? Math.ceil(searchResults.total / pageSize) : 0

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t("market.v2.search.title", "Search Listings")}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Text Search */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("market.v2.search.textQuery", "Search")}
              placeholder={t("market.v2.search.textQueryPlaceholder", "Search by title, description, or item name")}
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              variant="outlined"
            />
          </Grid>

          {/* Game Item Filter */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("market.v2.search.gameItem", "Game Item")}
              placeholder={t("market.v2.search.gameItemPlaceholder", "Filter by item")}
              value={gameItemId}
              onChange={(e) => setGameItemId(e.target.value)}
              variant="outlined"
            />
          </Grid>

          {/* Quality Tier Min */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t("market.v2.search.qualityMin", "Min Quality Tier")}</InputLabel>
              <Select
                value={qualityTierMin}
                label={t("market.v2.search.qualityMin", "Min Quality Tier")}
                onChange={(e: SelectChangeEvent<number | "">) => {
                  const value = e.target.value
                  setQualityTierMin(value === "" ? "" : Number(value))
                }}
              >
                <MenuItem value="">
                  <em>{t("market.v2.search.any", "Any")}</em>
                </MenuItem>
                <MenuItem value={1}>{t("market.v2.quality.tier1", "Tier 1")}</MenuItem>
                <MenuItem value={2}>{t("market.v2.quality.tier2", "Tier 2")}</MenuItem>
                <MenuItem value={3}>{t("market.v2.quality.tier3", "Tier 3")}</MenuItem>
                <MenuItem value={4}>{t("market.v2.quality.tier4", "Tier 4")}</MenuItem>
                <MenuItem value={5}>{t("market.v2.quality.tier5", "Tier 5")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Quality Tier Max */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t("market.v2.search.qualityMax", "Max Quality Tier")}</InputLabel>
              <Select
                value={qualityTierMax}
                label={t("market.v2.search.qualityMax", "Max Quality Tier")}
                onChange={(e: SelectChangeEvent<number | "">) => {
                  const value = e.target.value
                  setQualityTierMax(value === "" ? "" : Number(value))
                }}
              >
                <MenuItem value="">
                  <em>{t("market.v2.search.any", "Any")}</em>
                </MenuItem>
                <MenuItem value={1}>{t("market.v2.quality.tier1", "Tier 1")}</MenuItem>
                <MenuItem value={2}>{t("market.v2.quality.tier2", "Tier 2")}</MenuItem>
                <MenuItem value={3}>{t("market.v2.quality.tier3", "Tier 3")}</MenuItem>
                <MenuItem value={4}>{t("market.v2.quality.tier4", "Tier 4")}</MenuItem>
                <MenuItem value={5}>{t("market.v2.quality.tier5", "Tier 5")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Price Min */}
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label={t("market.v2.search.priceMin", "Min Price")}
              placeholder="0"
              value={priceMin}
              onChange={(e) => {
                const value = e.target.value
                setPriceMin(value === "" ? "" : Number(value))
              }}
              variant="outlined"
              inputProps={{ min: 0 }}
            />
          </Grid>

          {/* Price Max */}
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label={t("market.v2.search.priceMax", "Max Price")}
              placeholder="∞"
              value={priceMax}
              onChange={(e) => {
                const value = e.target.value
                setPriceMax(value === "" ? "" : Number(value))
              }}
              variant="outlined"
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : "Failed to search listings"}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Search Results */}
      {!isLoading && searchResults && (
        <>
          {/* Results Header */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">
              {t("market.v2.search.resultsCount", {
                count: searchResults.total,
                defaultValue: "{{count}} listings found",
              })}
            </Typography>
          </Box>

          {/* Listings Grid */}
          {searchResults.listings.length > 0 ? (
            <Grid container spacing={2}>
              {searchResults.listings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listing_id}>
                  <Card>
                    <CardActionArea onClick={() => handleListingClick(listing.listing_id)}>
                      <CardContent>
                        <Typography variant="h6" noWrap gutterBottom>
                          {listing.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t("market.v2.search.seller", "Seller")}: {listing.seller_name}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Chip
                            label={`⭐ ${listing.seller_rating.toFixed(1)}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${listing.quantity_available} ${t("market.v2.search.available", "available")}`}
                            size="small"
                          />
                        </Stack>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t("market.v2.search.price", "Price")}: {listing.price_min === listing.price_max
                            ? `${listing.price_min} aUEC`
                            : `${listing.price_min} - ${listing.price_max} aUEC`}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t("market.v2.search.quality", "Quality")}: Tier {listing.quality_tier_min}
                          {listing.quality_tier_min !== listing.quality_tier_max && ` - ${listing.quality_tier_max}`}
                        </Typography>

                        {listing.variant_count > 1 && (
                          <Chip
                            label={`${listing.variant_count} ${t("market.v2.search.variants", "variants")}`}
                            size="small"
                            color="secondary"
                            sx={{ mt: 1 }}
                          />
                        )}

                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          {new Date(listing.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                {t("market.v2.search.noResults", "No listings found")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("market.v2.search.noResultsHint", "Try adjusting your search filters")}
              </Typography>
            </Paper>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

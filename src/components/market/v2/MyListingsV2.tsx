import React, { useState, useMemo, useCallback, useRef } from "react"
import {
  Box,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useGetMyListingsQuery } from "../../../store/api/v2/market"
import { ListingPagination } from "../../../features/market/components/listings/ListingPagination"
import { EmptyListings } from "../../empty-states"
import { ListingSkeleton } from "../../skeletons"
import { useMarketSidebarExp } from "../../../features/market"

/**
 * MyListingsV2 - V2 market my listings component
 * 
 * Provides seller dashboard with:
 * - Listing display with variant breakdown
 * - Status filter dropdown (active, sold, expired, cancelled)
 * - Sort dropdown (created_at, updated_at, price, quantity)
 * - Pagination controls
 * - Visual parity with V1 MyItemListings component
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10
 */
export function MyListingsV2() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const marketSidebarOpen = useMarketSidebarExp()
  const ref = useRef<HTMLDivElement>(null)

  // State for filters and pagination
  const [status, setStatus] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)

  // Build query params
  const queryParams = useMemo(() => ({
    status: status || undefined,
    page: page + 1, // API uses 1-based pagination
    pageSize: perPage,
    sortBy,
    sortOrder,
  }), [status, page, perPage, sortBy, sortOrder])

  // Use Redux Toolkit Query hook
  const { data: myListingsData, isLoading, isFetching, error, refetch } = useGetMyListingsQuery(queryParams)

  // Handle status filter change
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value)
    setPage(0) // Reset to first page
  }

  // Handle sort change
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value)
    setPage(0) // Reset to first page
  }

  // Handle page change
  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage)
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref]
  )

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    []
  )

  // Handle listing click
  const handleListingClick = (listingId: string) => {
    navigate(`/market/${listingId}`)
  }

  // Grid breakpoints matching V1 DisplayListingsMin
  const gridBreakpoints = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4, xxl: 2, xxxl: 12 / 8 }

  return (
    <React.Fragment>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("market.v2.myListings.status", "Status")}</InputLabel>
            <Select
              value={status}
              label={t("market.v2.myListings.status", "Status")}
              onChange={handleStatusChange}
            >
              <MenuItem value="">
                <em>{t("market.v2.myListings.allStatuses", "All Statuses")}</em>
              </MenuItem>
              <MenuItem value="active">{t("market.v2.myListings.active", "Active")}</MenuItem>
              <MenuItem value="sold">{t("market.v2.myListings.sold", "Sold")}</MenuItem>
              <MenuItem value="expired">{t("market.v2.myListings.expired", "Expired")}</MenuItem>
              <MenuItem value="cancelled">{t("market.v2.myListings.cancelled", "Cancelled")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("market.v2.myListings.sortBy", "Sort By")}</InputLabel>
            <Select
              value={sortBy}
              label={t("market.v2.myListings.sortBy", "Sort By")}
              onChange={handleSortChange}
            >
              <MenuItem value="created_at">{t("market.v2.myListings.sortCreated", "Created Date")}</MenuItem>
              <MenuItem value="updated_at">{t("market.v2.myListings.sortUpdated", "Updated Date")}</MenuItem>
              <MenuItem value="price">{t("market.v2.myListings.sortPrice", "Price")}</MenuItem>
              <MenuItem value="quantity">{t("market.v2.myListings.sortQuantity", "Quantity")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Listings Grid */}
      <Grid container spacing={1} sx={{ width: "100%" }}>
        {isLoading || isFetching ? (
          // Loading skeletons
          new Array(perPage).fill(undefined).map((_, i) => (
            <Grid item {...gridBreakpoints} key={i}>
              <ListingSkeleton
                index={i}
                sidebarOpen={marketSidebarOpen}
              />
            </Grid>
          ))
        ) : myListingsData && myListingsData.listings.length > 0 ? (
          // Listings
          myListingsData.listings.map((listing) => (
            <Grid item {...gridBreakpoints} key={listing.listing_id}>
              <Card>
                <CardActionArea onClick={() => handleListingClick(listing.listing_id)}>
                  <CardContent>
                    <Typography variant="h6" noWrap gutterBottom>
                      {listing.title}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label={listing.status}
                        size="small"
                        color={
                          listing.status === "active"
                            ? "success"
                            : listing.status === "sold"
                            ? "default"
                            : listing.status === "expired"
                            ? "warning"
                            : "error"
                        }
                      />
                      {listing.variant_count > 1 && (
                        <Chip
                          label={`${listing.variant_count} ${t("market.v2.myListings.variants", "variants")}`}
                          size="small"
                          color="secondary"
                        />
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t("market.v2.myListings.quantity", "Quantity")}: {listing.total_quantity}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t("market.v2.myListings.price", "Price")}: {listing.price_min === listing.price_max
                        ? `${listing.price_min} aUEC`
                        : `${listing.price_min} - ${listing.price_max} aUEC`}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t("market.v2.myListings.quality", "Quality")}: Tier {listing.quality_tier_min}
                      {listing.quality_tier_min !== listing.quality_tier_max && ` - ${listing.quality_tier_max}`}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {t("market.v2.myListings.created", "Created")}: {new Date(listing.created_at).toLocaleDateString()}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block">
                      {t("market.v2.myListings.updated", "Updated")}: {new Date(listing.updated_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        ) : (
          // Empty state
          <Grid item xs={12}>
            <EmptyListings
              isSearchResult={false}
              isError={!!error}
              onRetry={() => refetch()}
              showCreateAction={true}
            />
          </Grid>
        )}

        {/* Divider */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <Divider light />
        </Grid>

        {/* Pagination */}
        <Grid item xs={12}>
          <ListingPagination
            count={myListingsData?.total || 0}
            page={page}
            rowsPerPage={perPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

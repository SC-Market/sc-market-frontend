/**
 * StockManagerV2 — V2 equivalent of V1 ManageStock.tsx
 *
 * Matches V1 layout: StandardPageLayout → ManageListingsTabBar → sidebar + card grid.
 * Uses V2 RTK Query hooks exclusively.
 */

import React, { useState, useCallback, useMemo } from "react"
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  TablePagination,
  Typography,
  useMediaQuery,
} from "@mui/material"
import {
  AddRounded,
  RemoveRounded,
  VisibilityRounded,
  InventoryRounded,
  ShareRounded,
  RefreshOutlined,
  CreateRounded,
  DeleteRounded,
} from "@mui/icons-material"
import FilterListIcon from "@mui/icons-material/FilterList"
import { useTheme } from "@mui/material/styles"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { MarketSearchAreaV2, MarketSidebarV2 } from "./ListingSearchV2"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { EmptyListings } from "../../../components/empty-states"
import { LongPressMenu } from "../../../components/gestures"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useGetMyListingsQuery,
  useUpdateListingMutation,
  useRefreshListingMutation,
  useDeleteListingMutation,
  type MyListingItem,
} from "../../../store/api/v2/market"
import { formatQuality, getQualityMode } from "../../../util/qualityMode"

export function StockManagerV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const issueAlert = useAlertHook()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)

  const { data, isLoading, error } = useGetMyListingsQuery({
    status: "active",
    page: page + 1,
    pageSize: perPage,
    sortBy: "updated_at",
    sortOrder: "desc",
  })

  const [updateListing] = useUpdateListingMutation()
  const [refreshListing] = useRefreshListingMutation()
  const [deleteListing] = useDeleteListingMutation()

  const listings = data?.listings ?? []
  const total = data?.total ?? 0

  const handleUpdateQuantity = useCallback(
    async (listingId: string, currentQty: number, delta: number) => {
      const newQty = Math.max(0, currentQty + delta)
      try {
        await updateListing({
          id: listingId,
          updateListingRequest: {
            lot_updates: [{ lot_id: listingId, quantity_total: newQty }],
          },
        }).unwrap()
        issueAlert({ message: t("ItemStock.updated", "Updated"), severity: "success" })
      } catch (err) {
        issueAlert(err as any)
      }
    },
    [updateListing, issueAlert, t],
  )

  const handleRefresh = useCallback(
    async (listingId: string) => {
      try {
        await refreshListing({ id: listingId }).unwrap()
        issueAlert({ message: t("ItemStock.refreshed", "Listing refreshed"), severity: "success" })
      } catch (err) {
        issueAlert(err as any)
      }
    },
    [refreshListing, issueAlert, t],
  )

  return (
    <StandardPageLayout
      title={t("sidebar.manage_listings", "Manage Listings")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.manage_listings", "Manage Listings") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
      error={error}
    >
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* Mobile bottom sheet */}
          {isMobile && (
            <BottomSheet
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              title={t("market.filters", "Filters")}
              maxHeight="90vh"
            >
              <Box sx={{ overflowY: "auto", overflowX: "hidden", pb: 2 }}>
                <MarketSearchAreaV2 />
              </Box>
            </BottomSheet>
          )}

          {/* Tab bar + actions */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              {isMobile && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<FilterListIcon />}
                  onClick={() => setSidebarOpen((p) => !p)}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  {t("market.filters", "Filters")}
                </Button>
              )}
              <ManageListingsTabBar
                title={t("sidebar.manage_listings", "Manage Listings")}
                rightAction={
                  <Link to="/market/create" style={{ textDecoration: "none" }}>
                    <Button variant="contained" color="secondary" startIcon={<AddRounded />} size="large">
                      {t("market.createListing", "Create Listing")}
                    </Button>
                  </Link>
                }
              />
            </Box>
          </Grid>

          {/* Desktop sidebar */}
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <Paper>
                <MarketSearchAreaV2 />
              </Paper>
            </Grid>
          )}

          {/* Card grid */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                {listings.length === 0 && !isLoading ? (
                  <EmptyListings showCreateAction={false} />
                ) : (
                  <Grid container spacing={theme.layoutSpacing.layout}>
                    {listings.map((listing) => (
                      <Grid item xs={12} key={listing.listing_id}>
                        <StockCardV2
                          listing={listing}
                          onQuantityChange={handleUpdateQuantity}
                          onRefresh={handleRefresh}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Pagination */}
          <Grid item xs={12}>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={perPage}
              onRowsPerPageChange={(e) => {
                setPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              rowsPerPageOptions={[24, 48, 96]}
            />
          </Grid>

          {/* Archived link */}
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Link to="/market/me" style={{ color: "inherit" }}>
              <UnderlineLink>{t("sidebar.archived_listings", "Archived Listings")}</UnderlineLink>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}

/** Card matching V1 StockCard layout */
function StockCardV2({
  listing,
  onQuantityChange,
  onRefresh,
}: {
  listing: MyListingItem
  onQuantityChange: (id: string, currentQty: number, delta: number) => Promise<void>
  onRefresh: (id: string) => Promise<void>
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const qualityMode = getQualityMode(null) // listing-level doesn't have item type
  const qualityLabel =
    listing.quality_tier_min != null
      ? listing.quality_tier_min === listing.quality_tier_max
        ? `Tier ${listing.quality_tier_min}`
        : `Tier ${listing.quality_tier_min}–${listing.quality_tier_max}`
      : null

  const priceLabel =
    listing.price_min === listing.price_max
      ? `${listing.price_min.toLocaleString()} aUEC`
      : `${listing.price_min.toLocaleString()} – ${listing.price_max.toLocaleString()} aUEC`

  const longPressActions = [
    {
      label: t("common.viewDetails", "View Details"),
      icon: <VisibilityRounded />,
      onClick: () => { window.location.href = `/market/${listing.listing_id}` },
    },
    {
      label: t("ItemStock.edit", "Edit"),
      icon: <CreateRounded />,
      onClick: () => { window.location.href = `/market_edit/${listing.listing_id}` },
    },
    {
      label: t("ItemStock.manageStock", "Manage Stock"),
      icon: <InventoryRounded />,
      onClick: () => { window.location.href = `/market/stock/${listing.listing_id}` },
    },
    {
      label: t("ItemStock.share", "Share"),
      icon: <ShareRounded />,
      onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/market/${listing.listing_id}`)
      },
    },
    {
      label: t("ItemStock.refresh", "Refresh"),
      icon: <RefreshOutlined />,
      onClick: () => onRefresh(listing.listing_id),
    },
  ]

  return (
    <LongPressMenu actions={longPressActions}>
      <Paper sx={{ p: 0 }}>
        <Stack direction="row" spacing={2} sx={{ p: 2 }} alignItems="center">
          <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>
            {listing.title.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Link to={`/market/${listing.listing_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {listing.title}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary">
              {priceLabel}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
              <Chip
                label={`${t("ItemStock.quantity", "Qty")}: ${listing.quantity_available.toLocaleString()}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={
                  listing.status === "active"
                    ? t("ItemStock.active", "Active")
                    : t("ItemStock.inactive", "Inactive")
                }
                color={listing.status === "active" ? "success" : "error"}
                size="small"
              />
              {qualityLabel && (
                <Chip label={qualityLabel} size="small" variant="outlined" />
              )}
              {listing.variant_count > 1 && (
                <Chip
                  label={`${listing.variant_count} variants`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>

          {/* Quick quantity +/- */}
          <Stack direction="column" spacing={0.5}>
            <IconButton
              size="small"
              color="success"
              onClick={(e) => {
                e.stopPropagation()
                onQuantityChange(listing.listing_id, listing.quantity_available, 1)
              }}
            >
              <AddRounded fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="warning"
              onClick={(e) => {
                e.stopPropagation()
                onQuantityChange(listing.listing_id, listing.quantity_available, -1)
              }}
            >
              <RemoveRounded fontSize="small" />
            </IconButton>
          </Stack>

          {/* Desktop actions */}
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton size="small" component={Link} to={`/market/${listing.listing_id}`}>
              <VisibilityRounded fontSize="small" />
            </IconButton>
            <IconButton size="small" component={Link} to={`/market_edit/${listing.listing_id}`}>
              <CreateRounded fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onRefresh(listing.listing_id)}>
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    </LongPressMenu>
  )
}

/**
 * StockManagerV2 — V2 equivalent of V1 ManageStock / DisplayStock.
 *
 * Desktop: ThemedDataGrid with columns matching V1 (item, price, qty, offers, views, status, expiry, actions).
 * Mobile: StockCard cards.
 * Sidebar: MarketSearchAreaV2 on desktop, BottomSheet on mobile.
 */

import React, { useState, useCallback, useMemo } from "react"
import {
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid"
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material"
import {
  AddRounded,
  CreateRounded,
  RefreshOutlined,
  InventoryRounded,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ThemedDataGrid } from "../../../components/grid/ThemedDataGrid"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { MarketSearchAreaV2, MarketSidebarV2 } from "./ListingSearchV2"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import FilterListIcon from "@mui/icons-material/FilterList"
import {
  useGetMyListingsQuery,
  useUpdateListingMutation,
  useRefreshListingMutation,
  useDeleteListingMutation,
  type MyListingItem,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { formatMostSignificantDiff } from "../../../util/time"

export function StockManagerV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const issueAlert = useAlertHook()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(48)

  const { data, isLoading, refetch } = useGetMyListingsQuery({
    status: "active",
    page: page + 1,
    pageSize,
    sortBy: "updated_at",
    sortOrder: "desc",
  })
  const [refreshListing] = useRefreshListingMutation()
  const [deleteListing] = useDeleteListingMutation()
  const [updateListing] = useUpdateListingMutation()

  const listings = data?.listings ?? []

  const processRowUpdate = useCallback(async (newRow: any, oldRow: any) => {
    const changes: any = {}
    if (newRow.title !== oldRow.title) changes.title = newRow.title
    if (newRow.status !== oldRow.status) changes.status = newRow.status
    if (Object.keys(changes).length === 0) return oldRow
    try {
      await updateListing({ id: newRow.listing_id, updateListingRequest: changes }).unwrap()
      issueAlert({ message: t("ItemStock.updated", "Listing updated"), severity: "success" })
      return newRow
    } catch {
      issueAlert({ message: "Failed to update", severity: "error" })
      return oldRow
    }
  }, [updateListing, issueAlert, t])

  const handleRefresh = useCallback(async (id: string) => {
    try {
      await refreshListing({ id }).unwrap()
      issueAlert({ message: t("ItemStock.refreshed", "Listing refreshed"), severity: "success" })
    } catch { issueAlert({ message: "Failed to refresh", severity: "error" }) }
  }, [refreshListing, issueAlert, t])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteListing({ id }).unwrap()
      issueAlert({ message: t("ItemStock.deleted", "Listing deleted"), severity: "success" })
    } catch { issueAlert({ message: "Failed to delete", severity: "error" }) }
  }, [deleteListing, issueAlert, t])

  // DataGrid columns matching V1 DisplayStock
  const columns: GridColDef[] = useMemo(() => [
    {
      field: "title",
      headerName: t("ItemStock.item", "Item"),
      flex: 2,
      minWidth: 200,
      editable: true,
      display: "flex" as const,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Link to={`/market/${params.row.listing_id}`} style={{ fontWeight: "bold", color: "inherit", textDecoration: "none" }}>
            <Typography variant="body2" fontWeight="bold" sx={{ "&:hover": { textDecoration: "underline" } }}>
              {params.value}
            </Typography>
          </Link>
        </Stack>
      ),
    },
    {
      field: "price_min",
      headerName: t("ItemStock.price", "Price"),
      width: 140,
      display: "flex" as const,
      renderCell: (params: GridRenderCellParams) => {
        const min = params.row.price_min
        const max = params.row.price_max
        if (min === max) return `${min?.toLocaleString() ?? 0} aUEC`
        return `${min?.toLocaleString() ?? 0}–${max?.toLocaleString() ?? 0} aUEC`
      },
    },
    {
      field: "quantity_available",
      headerName: t("ItemStock.quantity", "Qty"),
      width: 80,
      display: "flex" as const,
    },
    {
      field: "quality",
      headerName: t("ItemStock.quality", "Quality"),
      width: 100,
      display: "flex" as const,
      renderCell: (params: GridRenderCellParams) => {
        const min = params.row.quality_tier_min
        const max = params.row.quality_tier_max
        if (min == null) return <Typography variant="body2" color="text.disabled">—</Typography>
        const label = min === max ? `Tier ${min}` : `T${min}–${max}`
        return <Chip label={label} size="small" variant="outlined" color={min >= 4 ? "success" : min >= 3 ? "primary" : "default"} />
      },
    },
    {
      field: "variant_count",
      headerName: t("ItemStock.variants", "Variants"),
      width: 80,
      display: "flex" as const,
    },
    {
      field: "status",
      headerName: t("ItemStock.status", "Status"),
      width: 100,
      editable: true,
      type: "singleSelect" as const,
      valueOptions: ["active", "inactive"],
      display: "flex" as const,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === "active" ? t("ItemStock.active", "Active") : t("ItemStock.inactive", "Inactive")}
          color={params.value === "active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "updated_at",
      headerName: t("ItemStock.expiration", "Exp"),
      width: 60,
      display: "flex" as const,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return "—"
        const d = new Date(params.value)
        if (d > new Date()) return <Typography variant="caption">{formatMostSignificantDiff(params.value)}</Typography>
        return (
          <Tooltip title={t("ItemStock.refreshListing", "Refresh listing")}>
            <IconButton size="small" color="error" onClick={() => handleRefresh(params.row.listing_id)}>
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      display: "flex" as const,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t("ItemStock.edit", "Edit")}>
            <IconButton size="small" component={Link} to={`/market_edit/${params.row.listing_id}`}>
              <CreateRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("ItemStock.manageStock", "Stock")}>
            <IconButton size="small" component={Link} to={`/market/stock/${params.row.listing_id}`}>
              <InventoryRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("ItemStock.refreshListing", "Refresh")}>
            <IconButton size="small" onClick={() => handleRefresh(params.row.listing_id)}>
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t, theme, handleRefresh])

  const rows = useMemo(() =>
    listings.map((l) => ({ id: l.listing_id, ...l })),
    [listings],
  )

  // Mobile card rendering
  const mobileCards = (
    <Stack spacing={1}>
      {listings.map((listing) => (
        <Card key={listing.listing_id}>
          <CardActionArea component={Link} to={`/market/${listing.listing_id}`}>
            <Stack direction="row" spacing={2} sx={{ p: 2 }} alignItems="center">
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>{listing.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {listing.price_min === listing.price_max
                    ? `${listing.price_min?.toLocaleString()} aUEC`
                    : `${listing.price_min?.toLocaleString()}–${listing.price_max?.toLocaleString()} aUEC`}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                  <Chip label={`Qty: ${listing.quantity_available}`} size="small" variant="outlined" />
                  <Chip label={listing.status === "active" ? "Active" : "Inactive"} size="small" color={listing.status === "active" ? "success" : "default"} />
                </Stack>
              </Box>
            </Stack>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
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
    >
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing?.layout ?? 2}>
          {/* Mobile sidebar */}
          {isMobile && (
            <BottomSheet open={sidebarOpen} onClose={() => setSidebarOpen(false)} title={t("market.filters", "Filters")} maxHeight="90vh">
              <Box sx={{ overflowY: "auto", pb: 2 }}><MarketSearchAreaV2 /></Box>
            </BottomSheet>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              {isMobile && (
                <Button variant="outlined" color="secondary" startIcon={<FilterListIcon />} onClick={() => setSidebarOpen(p => !p)}>
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
              <Paper><MarketSearchAreaV2 /></Paper>
            </Grid>
          )}

          {/* Content */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            {isMobile ? mobileCards : (
              <ThemedDataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                processRowUpdate={processRowUpdate}
                paginationMode="server"
                rowCount={data?.total ?? 0}
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize) }}
                pageSizeOptions={[24, 48, 96]}
                loading={isLoading}
                initialState={{ sorting: { sortModel: [{ field: "title", sort: "asc" }] } }}
              />
            )}
          </Grid>

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

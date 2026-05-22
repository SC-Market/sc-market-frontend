/**
 * BulkStockManagementV2 — V2 equivalent of V1 ManageStockLots.tsx
 *
 * Matches V1 layout: StandardPageLayout → ManageListingsTabBar → sidebar + two DataGrids.
 * Uses V2 RTK Query hooks exclusively.
 */

import React, { useState, useCallback, useMemo, createContext, useContext, ReactNode } from "react"
import {
  Avatar,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  InputAdornment,
  useMediaQuery,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import FilterListIcon from "@mui/icons-material/FilterList"
import SearchIcon from "@mui/icons-material/Search"
import { useTheme } from "@mui/material/styles"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  GridColDef,
  GridRenderCellParams,
  GridRowModel,
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { ThemedDataGrid as DataGrid } from "../../../components/grid/ThemedDataGrid"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { EmptyState } from "../../../components/empty-states/EmptyState"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useGetMyListingsQuery,
  useGetStockLotsQuery,
  useCreateStockLotMutation,
  useUpdateStockLotMutation,
  useDeleteStockLotMutation,
  useGetListingDetailQuery,
  useSearchResourcesQuery,
  type MyListingItem,
  type StockLotDetail,
  type LocationInfo,
  type QualityBand,
  type VariantAttributes,
} from "../../../store/api/v2/market"
import { getQualityMode, formatQuality, type QualityMode } from "../../../util/qualityMode"
import { useGetContractorAllocationsQuery, type Allocation } from "../../../store/api/stockLotsApi"
import { QualityBandSelect } from "../../../components/game-data/QualityBandSelect"
import { CreateLotDialogV2 } from "./components/CreateLotDialogV2"

/* ── Local filter context (mirrors V1 StockSearchContext) ── */

interface StockFilterState {
  search: string
  listingId: string | null
  locationId: string | null
}

interface StockFilterCtx {
  filters: StockFilterState
  setSearch: (v: string) => void
  setListingId: (v: string | null) => void
  setLocationId: (v: string | null) => void
}

const StockFilterContext = createContext<StockFilterCtx | undefined>(undefined)

function StockFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<StockFilterState>({
    search: "",
    listingId: null,
    locationId: null,
  })
  return (
    <StockFilterContext.Provider
      value={{
        filters,
        setSearch: (v) => setFilters((f) => ({ ...f, search: v })),
        setListingId: (v) => setFilters((f) => ({ ...f, listingId: v })),
        setLocationId: (v) => setFilters((f) => ({ ...f, locationId: v })),
      }}
    >
      {children}
    </StockFilterContext.Provider>
  )
}

function useStockFilter() {
  const ctx = useContext(StockFilterContext)
  if (!ctx) throw new Error("useStockFilter must be used within StockFilterProvider")
  return ctx
}

/* ── Main page component ── */

export function BulkStockManagementV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  return (
    <StandardPageLayout
      title={t("sidebar.manage_stock", "Manage Inventory")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.manage_stock", "Manage Inventory") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <StockFilterProvider>
        <Grid item xs={12}>
          <Grid container spacing={theme.layoutSpacing.layout}>
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
                <ManageListingsTabBar title={t("sidebar.manage_stock", "Manage Inventory")} />
              </Box>
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
  const { filters, setSearch, setListingId, setLocationId } = useStockFilter()
  const [currentOrg] = useCurrentOrg()
  const { data: listingsData } = useGetMyListingsQuery({ pageSize: 100, sortBy: "updated_at", sortOrder: "desc", spectrumId: currentOrg?.spectrum_id })
  const listings = listingsData?.listings ?? []

  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      <Typography variant="h6">{t("stock.filters", "Filters")}</Typography>

      <TextField
        fullWidth
        size="small"
        placeholder={t("stock.searchLots", "Search lots...")}
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

/* ── All Stock Lots Grid ── */

function AllStockLotsGridV2() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const { filters } = useStockFilter()

  const { data: lotsData, isLoading } = useGetStockLotsQuery({
    listingId: filters.listingId ?? undefined,
    locationId: filters.locationId ?? undefined,
    pageSize: 100,
  })

  const [currentOrg] = useCurrentOrg()
  const { data: listingsData } = useGetMyListingsQuery({ pageSize: 100, sortBy: "updated_at", sortOrder: "desc", spectrumId: currentOrg?.spectrum_id })
  const listings = listingsData?.listings ?? []

  const [createLot] = useCreateStockLotMutation()
  const [updateLot] = useUpdateStockLotMutation()
  const [deleteLot] = useDeleteStockLotMutation()

  const [addLotListingId, setAddLotListingId] = useState<string | null>(null)

  // Fetch listing detail to determine game item type when a listing is filtered
  const { data: listingDetailData } = useGetListingDetailQuery(
    { id: filters.listingId! },
    { skip: !filters.listingId },
  )
  const gameItem = listingDetailData?.items?.[0]?.game_item
  const qualityMode = getQualityMode(gameItem?.type)
  const gameItemName = gameItem?.name

  // Fetch quality bands for commodity items
  const { data: resourceData } = useSearchResourcesQuery(
    { text: gameItemName || undefined, pageSize: 1 },
    { skip: qualityMode !== "value" || !gameItemName },
  )
  const qualityBands = resourceData?.resources?.[0]?.quality_bands

  const lots = lotsData?.lots ?? []

  const locations = useMemo(() => {
    const map = new Map<string, LocationInfo>()
    lots.forEach((lot) => {
      if (lot.location) map.set(lot.location.location_id, lot.location)
    })
    return Array.from(map.values())
  }, [lots])

  // Location edit cell
  function LocationEditCell(props: GridRenderEditCellParams) {
    const { id, value, field } = props
    const apiRef = useGridApiContext()
    const [inputValue, setInputValue] = useState("")
    const filtered = locations.filter((l) => l.name.toLowerCase().includes(inputValue.toLowerCase()))
    const selected = locations.find((l) => l.location_id === value) ?? null

    return (
      <Autocomplete
        value={selected}
        onChange={(_, v) => apiRef.current.setEditCellValue({ id, field, value: v?.location_id ?? null })}
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        options={filtered}
        getOptionLabel={(o) => o.name}
        renderInput={(params) => <TextField {...params} size="medium" placeholder={t("AllStockLots.selectLocation", "Select location...")} />}
        fullWidth
        size="medium"
        disablePortal={false}
        sx={{ height: "100%" }}
      />
    )
  }

  const renderLocationEditCell = useCallback(
    (props: GridRenderEditCellParams) => <LocationEditCell {...props} />,
    [locations, t],
  )

  // Quality edit cell for tiered mode
  function QualityTierEditCell(props: GridRenderEditCellParams) {
    const apiRef = useGridApiContext()
    return (
      <TextField
        select
        fullWidth
        size="small"
        value={props.value ?? ""}
        onChange={(e) => {
          const val = e.target.value === "" ? null : Number(e.target.value)
          apiRef.current.setEditCellValue({ id: props.id, field: props.field, value: val })
        }}
        SelectProps={{ native: true }}
      >
        <option value="">—</option>
        {[1, 2, 3, 4, 5].map((tier) => (
          <option key={tier} value={tier}>Tier {tier}</option>
        ))}
      </TextField>
    )
  }

  // Quality edit cell for value mode with quality bands.
  // Stores the selected band mapped value in the quality_tier column field;
  // handleRowUpdate interprets it as quality_value when qualityBands are present.
  function QualityBandEditCell(props: GridRenderEditCellParams & { bands: QualityBand[] }) {
    const apiRef = useGridApiContext()
    // Show the current quality_value as the initial selection
    const currentValue = props.row.quality_value as number | null
    return (
      <QualityBandSelect
        bands={props.bands}
        value={currentValue}
        onChange={(val) => {
          apiRef.current.setEditCellValue({ id: props.id, field: props.field, value: val })
        }}
        label=""
        allowAny
        size="small"
        fullWidth
      />
    )
  }

  const allLots = lots
    .filter((lot) => !lot.notes?.includes("allocated"))
    .map((lot) => ({
      id: lot.lot_id,
      lot_id: lot.lot_id,
      item_id: lot.item_id,
      listing_id: lot.listing_id,
      listing_title: lot.listing_title,
      listing_photo: (lot as any).listing_photo ?? null,
      game_item_name: (lot as any).game_item_name ?? null,
      variant_display_name: lot.variant.display_name,
      quality_tier: lot.variant.attributes.quality_tier ?? null,
      quality_value: lot.variant.attributes.quality_value ?? null,
      crafted_source: lot.variant.attributes.crafted_source ?? null,
      quantity: lot.quantity_total,
      location_id: lot.location?.location_id ?? null,
      location_name: lot.location?.name ?? null,
      listed: lot.listed,
      notes: lot.notes ?? "",
    }))

  const rows = allLots

  const columns: GridColDef[] = [
    {
      field: "game_item_name",
      headerName: t("inventory.item", "Item"),
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value || "Custom Item"}
        </Typography>
      ),
    },
    {
      field: "variant_display_name",
      headerName: t("inventory.variant", "Variant"),
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || "—"}</Typography>
      ),
    },
    {
      field: "quantity",
      headerName: t("inventory.quantity", "Qty"),
      flex: 0.7,
      editable: true,
      type: "number" as const,
      align: "right" as const,
      headerAlign: "right" as const,
      valueParser: (value: string) => Math.max(0, Number(value) || 0),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>{params.value?.toLocaleString()}</Typography>
      ),
    },
    {
      field: "location_id",
      headerName: t("inventory.location", "Location"),
      flex: 1.2,
      minWidth: 160,
      editable: true,
      renderEditCell: renderLocationEditCell,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {locations.find((l) => l.location_id === params.value)?.name ?? "Unspecified"}
        </Typography>
      ),
    },
    {
      field: "listing_title",
      headerName: t("inventory.listing", "Listing"),
      flex: 1.8,
      renderCell: (params: GridRenderCellParams) => {
        const photo = params.row.listing_photo
        const listingId = params.row.listing_id
        const title = params.value || "—"
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {photo && (
              <Avatar
                src={photo}
                variant="rounded"
                sx={{ width: 28, height: 28 }}
              />
            )}
            {listingId ? (
              <UnderlineLink
                component={Link}
                to={`/market/${listingId}`}
                variant="body2"
                noWrap
              >
                {title}
              </UnderlineLink>
            ) : (
              <Typography variant="body2" color="text.disabled">{title}</Typography>
            )}
          </Box>
        )
      },
    },
    {
      field: "listed",
      headerName: t("inventory.status", "Status"),
      flex: 0.8,
      editable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? t("inventory.listed", "Listed") : t("inventory.personal", "Personal")}
          color={params.value ? "success" : "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      flex: 0.5,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton size="small" color="error" onClick={() => handleDelete(params.row.lot_id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  const handleDelete = async (lotId: string) => {
    try {
      await deleteLot({ id: lotId }).unwrap()
      issueAlert({ message: t("AllStockLots.deleted", "Lot deleted"), severity: "success" })
    } catch (err) {
      issueAlert({ message: (err as Error)?.message || "Operation failed", severity: "error" })
    }
  }

  const handleRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
    if (String(newRow.id).startsWith("new-")) return newRow

    // When quality bands are available, the quality_tier column carries a band
    // mapped value that should be sent as quality_value instead of quality_tier.
    const isBandMode = !!qualityBands?.length
    const qualityTierChanged = newRow.quality_tier !== oldRow.quality_tier
    const qualityValueChanged = newRow.quality_value !== oldRow.quality_value
    const qualityChanged = qualityTierChanged || qualityValueChanged

    let variantAttrs: VariantAttributes | undefined
    if (qualityChanged) {
      if (isBandMode && qualityTierChanged) {
        // The quality_tier field was edited via QualityBandSelect — interpret as quality_value
        variantAttrs = {
          quality_value: newRow.quality_tier ?? undefined,
          quality_tier: undefined,
          crafted_source: newRow.crafted_source ?? undefined,
        }
        // Update the row model so the returned row reflects the correct fields
        newRow.quality_value = newRow.quality_tier ?? null
        newRow.quality_tier = null
      } else {
        variantAttrs = {
          quality_tier: newRow.quality_tier ?? undefined,
          quality_value: newRow.quality_value ?? undefined,
          crafted_source: newRow.crafted_source ?? undefined,
        }
      }
    }

    try {
      const result = await updateLot({
        id: newRow.lot_id,
        updateStockLotRequest: {
          quantity_total: Number(newRow.quantity),
          location_id: newRow.location_id ?? undefined,
          listed: newRow.listed,
          notes: newRow.notes || null,
          variant_attributes: variantAttrs,
        },
      }).unwrap()
      issueAlert({ message: t("AllStockLots.updated", "Lot updated"), severity: "success" })
      const lot = result.lot
      return {
        id: lot.lot_id,
        lot_id: lot.lot_id,
        listing_id: lot.item_id,
        variant_display_name: lot.variant.display_name,
        quality_tier: lot.variant.attributes.quality_tier ?? null,
        quality_value: lot.variant.attributes.quality_value ?? null,
        crafted_source: lot.variant.attributes.crafted_source ?? null,
        quantity: lot.quantity_total,
        location_id: lot.location?.location_id ?? null,
        location_name: lot.location?.name ?? null,
        listed: lot.listed,
        notes: lot.notes ?? "",
      }
    } catch (err) {
      issueAlert({ message: (err as Error)?.message || "Operation failed", severity: "error" })
      return oldRow
    }
  }

  const handleAddRow = () => {
    // Default to first listing or the currently filtered listing
    const defaultListing = filters.listingId || (listings.length > 0 ? listings[0].listing_id : "")
    setAddLotListingId(defaultListing)
  }

  return (
    <Paper>
      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={handleRowUpdate}
        onProcessRowUpdateError={(error) => console.error(error)}
        pageSizeOptions={[24, 48, 96]}
        initialState={{ pagination: { paginationModel: { pageSize: 24 } } }}
        disableRowSelectionOnClick
        slots={{
          noRowsOverlay: () => (
            <EmptyState
              title={t("stock.noLots", "No stock lots")}
              description={t("stock.noLotsDesc", "Add stock lots to manage your inventory.")}
              sx={{ minHeight: 200 }}
            />
          ),
          toolbar: () => (
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">{t("AllStockLots.title", "All Stock Lots")}</Typography>
                <Chip label={rows.length} size="small" color="primary" />
              </Box>
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={handleAddRow} disabled={listings.length === 0}>
                {t("AllStockLots.addLot", "Add Lot")}
              </Button>
            </Box>
          ),
        }}
        showToolbar
        sx={{ "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" } }}
      />
      {addLotListingId && (
        <CreateLotDialogV2
          listingId={addLotListingId}
          itemId=""
          locations={locations}
          open={!!addLotListingId}
          onClose={() => setAddLotListingId(null)}
        />
      )}
    </Paper>
  )
}

/* ── Allocated Stock Grid ── */

function AllocatedStockGridV2() {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()

  const { data, isLoading } = useGetContractorAllocationsQuery(
    { contractor_spectrum_id: currentOrg?.spectrum_id || "" },
    { skip: !currentOrg?.spectrum_id },
  )
  const allocations: Allocation[] = data?.allocations ?? []

  const columns: GridColDef[] = [
    {
      field: "game_item_name",
      headerName: t("inventory.item", "Item"),
      flex: 1.5,
      valueGetter: (_value, row: Allocation) => (row.lot as any)?.game_item_name || "Item",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
      ),
    },
    {
      field: "variant",
      headerName: t("inventory.variant", "Variant"),
      flex: 1.2,
      valueGetter: (_value, row: Allocation) => row.lot?.variant?.display_name || "—",
    },
    {
      field: "quantity",
      headerName: t("inventory.quantity", "Qty"),
      flex: 0.7,
      align: "right" as const,
      headerAlign: "right" as const,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>{params.value?.toLocaleString()}</Typography>
      ),
    },
    {
      field: "location_name",
      headerName: t("inventory.location", "Location"),
      flex: 1,
      valueGetter: (_value, row: Allocation) => row.lot?.location?.name ?? "Unspecified",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">{params.value}</Typography>
      ),
    },
    {
      field: "listing_id",
      headerName: t("inventory.listing", "Listing"),
      flex: 1.8,
      valueGetter: (_value, row: Allocation) => row.lot?.listing_id ?? "",
      renderCell: (params: GridRenderCellParams) => {
        const photo = params.row.lot?.photos?.[0]
        const title = params.row.lot?.title || "Listing"
        const listingId = params.value
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {photo && <Avatar src={photo} variant="rounded" sx={{ width: 28, height: 28 }} />}
            {listingId ? (
              <UnderlineLink component={Link} to={`/market/${listingId}`} variant="body2" noWrap>
                {title}
              </UnderlineLink>
            ) : (
              <Typography variant="body2" color="text.disabled">—</Typography>
            )}
          </Box>
        )
      },
    },
    {
      field: "order_id",
      headerName: t("stock.order", "Order"),
      flex: 1.2,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.order_title || String(params.value || "").substring(0, 8).toUpperCase()}
        </Typography>
      ),
    },
  ]

  return (
    <Paper>
      <DataGrid
        rows={allocations}
        columns={columns}
        loading={isLoading}
        getRowId={(row: Allocation) => row.allocation_id}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        slots={{
          noRowsOverlay: () => (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                {currentOrg ? t("stock.noAllocations", "No allocated stock") : t("stock.noOrgForAllocations", "Join an org to see allocations")}
              </Typography>
            </Box>
          ),
          toolbar: () => (
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">{t("stock.allocatedStock", "Allocated Stock")}</Typography>
              <Chip label={allocations.length} size="small" color="primary" />
            </Box>
          ),
        }}
        showToolbar
        sx={{ "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" } }}
      />
    </Paper>
  )
}

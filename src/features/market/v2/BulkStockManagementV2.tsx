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
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { ThemedDataGrid as DataGrid } from "../../../components/grid/ThemedDataGrid"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  useGetMyListingsQuery,
  useGetStockLotsQuery,
  useCreateStockLotMutation,
  useUpdateStockLotMutation,
  useDeleteStockLotMutation,
  type MyListingItem,
  type StockLotDetail,
  type LocationInfo,
} from "../../../store/api/v2/market"
import { getQualityMode, formatQuality, type QualityMode } from "../../../util/qualityMode"

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
      title={t("sidebar.manage_stock", "Manage Stock")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.manage_stock", "Manage Stock") },
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
                <ManageListingsTabBar title={t("sidebar.manage_stock", "Manage Stock")} />
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
  const { data: listingsData } = useGetMyListingsQuery({ pageSize: 100, sortBy: "updated_at", sortOrder: "desc" })
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
    pageSize: 100,
  })

  const { data: listingsData } = useGetMyListingsQuery({ pageSize: 100, sortBy: "updated_at", sortOrder: "desc" })
  const listings = listingsData?.listings ?? []

  const [createLot] = useCreateStockLotMutation()
  const [updateLot] = useUpdateStockLotMutation()
  const [deleteLot] = useDeleteStockLotMutation()

  const [newRows, setNewRows] = useState<any[]>([])

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

  const allLots = lots
    .filter((lot) => !lot.notes?.includes("allocated"))
    .map((lot) => ({
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
    }))

  const rows = [...newRows, ...allLots]

  const columns: GridColDef[] = [
    {
      field: "variant_display_name",
      headerName: t("AllStockLots.listing", "Listing"),
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "quality_tier",
      headerName: t("StockManagerV2.qualityTier", "Quality"),
      flex: 1,
      editable: true,
      renderCell: (params: GridRenderCellParams) => {
        const tier = params.value as number | null
        const qv = params.row.quality_value as number | null
        if (qv != null) return <Chip label={`Q${qv}`} size="small" variant="outlined" />
        if (tier != null) return (
          <Chip
            label={`Tier ${tier}`}
            size="small"
            color={tier >= 4 ? "success" : tier >= 3 ? "primary" : "default"}
            variant="outlined"
          />
        )
        return <Typography variant="body2" color="text.disabled">—</Typography>
      },
      renderEditCell: (props: GridRenderEditCellParams) => <QualityTierEditCell {...props} />,
    },
    {
      field: "quantity",
      headerName: t("AllStockLots.quantity", "Quantity"),
      flex: 1,
      editable: true,
      type: "number" as const,
      valueParser: (value: string) => Math.max(0, Number(value) || 0),
    },
    {
      field: "location_id",
      headerName: t("AllStockLots.location", "Location"),
      flex: 1.5,
      minWidth: 200,
      editable: true,
      renderEditCell: renderLocationEditCell,
      valueFormatter: (value: string) => locations.find((l) => l.location_id === value)?.name ?? "Unspecified",
    },
    {
      field: "listed",
      headerName: t("AllStockLots.listed", "Listed"),
      flex: 1,
      editable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? t("ui.yes", "Yes") : t("ui.no", "No")}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "notes",
      headerName: t("AllStockLots.notes", "Notes"),
      flex: 2,
      editable: true,
    },
    {
      field: "actions",
      headerName: t("AllStockLots.actions", "Actions"),
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const isNew = String(params.row.id).startsWith("new-")
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {isNew && (
              <IconButton size="small" color="primary" onClick={() => handleSaveNew(params.row)}>
                <SaveIcon />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => isNew ? handleCancelNew(params.row.id) : handleDelete(params.row.lot_id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )
      },
    },
  ]

  const handleDelete = async (lotId: string) => {
    try {
      await deleteLot({ id: lotId }).unwrap()
      issueAlert({ message: t("AllStockLots.deleted", "Lot deleted"), severity: "success" })
    } catch (err) {
      issueAlert(err as any)
    }
  }

  const handleRowUpdate = async (newRow: any, oldRow: any) => {
    if (String(newRow.id).startsWith("new-")) return newRow
    const qualityChanged = newRow.quality_tier !== oldRow.quality_tier || newRow.quality_value !== oldRow.quality_value
    const variantAttrs = qualityChanged
      ? { quality_tier: newRow.quality_tier ?? undefined, quality_value: newRow.quality_value ?? undefined, crafted_source: newRow.crafted_source ?? undefined }
      : undefined

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
      issueAlert(err as any)
      return oldRow
    }
  }

  const handleSaveNew = async (row: any) => {
    try {
      await createLot({
        createStockLotRequest: {
          item_id: row.listing_id || "",
          quantity: Number(row.quantity) || 0,
          variant_attributes: row.quality_tier ? { quality_tier: row.quality_tier } : {},
          location_id: row.location_id ?? undefined,
          listed: row.listed ?? true,
          notes: row.notes || undefined,
        },
      }).unwrap()
      issueAlert({ message: t("AllStockLots.created", "Lot created"), severity: "success" })
      setNewRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (err) {
      issueAlert(err as any)
    }
  }

  const handleCancelNew = (rowId: string) => {
    setNewRows((prev) => prev.filter((r) => r.id !== rowId))
  }

  const handleAddRow = () => {
    setNewRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        lot_id: null,
        listing_id: "",
        variant_display_name: "New Lot",
        quality_tier: null,
        quality_value: null,
        crafted_source: null,
        quantity: 0,
        location_id: null,
        location_name: null,
        listed: true,
        notes: "",
      },
    ])
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
    </Paper>
  )
}

/* ── Allocated Stock Grid ── */

function AllocatedStockGridV2() {
  const { t } = useTranslation()

  // Allocated lots = lots with listed=false (approximation for V2)
  const { data: lotsData, isLoading } = useGetStockLotsQuery({ listed: false, pageSize: 100 })
  const allocations = lotsData?.lots ?? []

  const columns: GridColDef[] = [
    {
      field: "variant_display_name",
      headerName: t("stock.listing", "Listing"),
      flex: 1.5,
      valueGetter: (_value: any, row: any) => row.variant?.display_name ?? "—",
    },
    {
      field: "quantity_total",
      headerName: t("stock.quantity", "Quantity"),
      width: 120,
    },
    {
      field: "location_name",
      headerName: t("stock.location", "Location"),
      flex: 1,
      valueGetter: (_value: any, row: any) => row.location?.name ?? "Unspecified",
    },
    {
      field: "owner_name",
      headerName: t("stock.user", "User"),
      flex: 1,
      valueGetter: (_value: any, row: any) => row.owner?.display_name ?? row.owner?.username ?? "—",
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row.owner) return <Typography variant="body2" color="text.disabled">—</Typography>
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar src={params.row.owner.avatar_url || undefined} sx={{ width: 24, height: 24 }} />
            <Typography variant="body2" color="text.secondary">{params.value}</Typography>
          </Box>
        )
      },
    },
    {
      field: "created_at",
      headerName: t("stock.allocatedAt", "Allocated"),
      width: 150,
      valueFormatter: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
    },
  ]

  return (
    <Paper>
      <DataGrid
        rows={allocations}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.lot_id}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        slots={{
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

/**
 * All Stock Lots Grid
 *
 * Data grid showing all stock lots across all listings with inline editing
 */

import React, { useState, useCallback } from "react"
import {
  GridColDef,
  GridRowsProp,
  GridRenderEditCellParams,
  GridRenderCellParams,
  useGridApiContext,
} from "@mui/x-data-grid"
import { LazyDataGrid as DataGrid } from "../../../../components/grid/LazyDataGrid"
import {
  Paper,
  Typography,
  Chip,
  IconButton,
  Box,
  Button,
  Avatar,
  Autocomplete,
  TextField,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetMyListingsQuery,
  useSearchMarketListingsQuery,
} from "../../api/marketApi"
import {
  useSearchLotsQuery,
  useCreateLotMutation,
  useUpdateLotMutation,
  useDeleteLotMutation,
  useGetLocationsQuery,
} from "../../../../store/api/stockLotsApi"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import type { StockManageType } from "../../domain/types"
import { LocationSelector } from "./LocationSelector"
import { useStockSearch } from "./StockSearchContext"
import { OrgMemberSearch } from "../../../../components/search/OrgMemberSearch"
import { Link } from "react-router-dom"
import { useGetUserProfileQuery } from "../../../../store/profile"

export function AllStockLotsGrid() {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const issueAlert = useAlertHook()
  const { filters } = useStockSearch()
  const { data: profile } = useGetUserProfileQuery()

  // Fetch all listings using same approach as MyItemStock
  const hasOrg = currentOrg && currentOrg.spectrum_id
  const searchQueryParams = {
    page_size: 96,
    index: 0,
    quantityAvailable: 0,
    query: "",
    sort: "activity",
    statuses: "active,inactive",
  }

  const finalParams = hasOrg
    ? { ...searchQueryParams, contractor_id: currentOrg?.spectrum_id }
    : searchQueryParams

  const { data: listingsData } = useGetMyListingsQuery(finalParams)
  const listings = (listingsData?.listings || []) as StockManageType[]

  // Fetch all lots using search endpoint with filters
  const { data: lotsData } = useSearchLotsQuery({
    contractor_spectrum_id: hasOrg ? currentOrg?.spectrum_id : undefined,
    location_id: filters.locationId || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    min_quantity: filters.minQuantity ? filters.minQuantity : undefined,
    max_quantity: filters.maxQuantity ? filters.maxQuantity : undefined,
    search: filters.search ? filters.search : undefined,
    page_size: 100,
    offset: 0,
  })

  const [createLot] = useCreateLotMutation()
  const [updateLot] = useUpdateLotMutation()
  const [deleteLot] = useDeleteLotMutation()

  const { data: locationsData } = useGetLocationsQuery({ search: "" })
  const locations = locationsData?.locations || []

  const [newRows, setNewRows] = useState<any[]>([])

  // Memoize edit cell renderers to prevent hook issues
  // Custom edit component for listing selection
  function ListingEditCell(props: GridRenderEditCellParams) {
    const { id, value, field } = props
    const apiRef = useGridApiContext()
    const [inputValue, setInputValue] = React.useState("")

    const { data: searchData } = useSearchMarketListingsQuery({
      query: inputValue,
      page_size: 20,
      user_seller: currentOrg ? undefined : profile?.username,
      contractor_seller: currentOrg?.spectrum_id,
      statuses: "active,inactive",
      listing_type: "unique",
    })

    const options = searchData?.listings || []
    const selectedListing = options.find((l) => l.listing_id === value)

    const handleChange = (
      _: React.SyntheticEvent,
      newValue: (typeof options)[0] | null,
    ) => {
      apiRef.current.setEditCellValue({
        id,
        field,
        value: newValue?.listing_id || "",
      })
    }

    return (
      <Autocomplete
        value={selectedListing || null}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(_, newValue) => setInputValue(newValue)}
        options={options}
        getOptionLabel={(option) => option.title}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Avatar
              src={option.photo}
              variant="rounded"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2">{option.title}</Typography>
          </Box>
        )}
        renderInput={(params) => <TextField {...params} size="medium" />}
        fullWidth
        size="medium"
        disablePortal={false}
        sx={{ height: "100%" }}
      />
    )
  }

  // Custom edit component for location selection
  function LocationEditCell(props: GridRenderEditCellParams) {
    const { id, value, field } = props
    const apiRef = useGridApiContext()
    const [inputValue, setInputValue] = React.useState("")

    const filteredLocations = locations.filter((loc) =>
      loc.name.toLowerCase().includes(inputValue.toLowerCase()),
    )

    const selectedLocation = locations.find((l) => l.location_id === value)

    const handleChange = (
      _: React.SyntheticEvent,
      newValue: (typeof locations)[0] | null,
    ) => {
      apiRef.current.setEditCellValue({
        id,
        field,
        value: newValue?.location_id || null,
      })
    }

    return (
      <Autocomplete
        value={selectedLocation || null}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(_, newValue) => setInputValue(newValue)}
        options={filteredLocations}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            size="medium"
            placeholder={t("AllStockLots.selectLocation", "Select location...")}
          />
        )}
        fullWidth
        size="medium"
        disablePortal={false}
        sx={{ height: "100%" }}
      />
    )
  }

  const renderListingEditCell = useCallback(
    (props: GridRenderEditCellParams) => <ListingEditCell {...props} />,
    [currentOrg, profile],
  )

  const renderLocationEditCell = useCallback(
    (props: GridRenderEditCellParams) => <LocationEditCell {...props} />,
    [locations, t],
  )

  // Custom edit component for owner selection
  const renderOwnerEditCell = useCallback(
    (props: GridRenderEditCellParams) => {
      const { id, value, field } = props
      const apiRef = useGridApiContext()

      const handleMemberSelect = (member: any) => {
        apiRef.current.setEditCellValue({
          id,
          field,
          value: member?.username || null,
        })
      }

      return (
        <OrgMemberSearch
          fullWidth
          size="small"
          onMemberSelect={handleMemberSelect}
          placeholder={t("AllStockLots.selectOwner", "Select owner...")}
          sx={{ height: "100%" }}
        />
      )
    },
    [t],
  )

  // Map lots to rows
  // Filter out allocated lots (they show in AllAllocatedLotsGrid)
  const allLots = (lotsData?.lots || [])
    .filter((lot: any) => !lot.is_allocated)
    .map((lot) => ({
      id: lot.lot_id,
      lot_id: lot.lot_id,
      listing_id: lot.listing_id,
      quantity: lot.quantity_total,
      location_id: lot.location_id,
      owner_username: lot.owner?.username || null,
      owner_avatar: lot.owner?.avatar || null,
      listed: lot.listed,
      notes: lot.notes,
    }))

  // Combine all lots into rows
  const rows: GridRowsProp = [...newRows, ...allLots]

  const columns: GridColDef[] = [
    {
      field: "listing_id",
      headerName: t("AllStockLots.listing", "Listing"),
      flex: 2,
      editable: true,
      renderEditCell: renderListingEditCell,
      renderCell: (params: GridRenderCellParams) => {
        const listing = listings.find(
          (l) => l.listing.listing_id === params.value,
        )
        if (!listing) return null
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={listing.photos[0]}
              variant="rounded"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2">{listing.details.title}</Typography>
          </Box>
        )
      },
    },
    {
      field: "quantity",
      headerName: t("AllStockLots.quantity", "Quantity"),
      flex: 1,
      editable: true,
      type: "number" as const,
      valueParser: (value: string) => {
        const parsed = Number(value)
        return isNaN(parsed) ? 0 : Math.max(0, parsed)
      },
    },
    {
      field: "owner_username",
      headerName: t("AllStockLots.owner", "Owner"),
      flex: 1.5,
      minWidth: 180,
      editable: true,
      renderEditCell: renderOwnerEditCell,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value)
          return <Typography variant="body2">Unassigned</Typography>

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={params.row.owner_avatar || undefined}
              sx={{ width: 24, height: 24 }}
            />
            <Link
              to={`/user/${params.value}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography variant="body2">{params.value}</Typography>
            </Link>
          </Box>
        )
      },
    },
    {
      field: "location_id",
      headerName: t("AllStockLots.location", "Location"),
      flex: 1.5,
      minWidth: 200,
      editable: true,
      renderEditCell: renderLocationEditCell,
      valueFormatter: (value: string) => {
        const location = locations.find((l) => l.location_id === value)
        return location?.name || "Unspecified"
      },
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
        const isNew = params.row.id.toString().startsWith("new-")
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {isNew && (
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleSaveNew(params.row)}
                disabled={!params.row.listing_id}
              >
                <SaveIcon />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() =>
                isNew
                  ? handleCancelNew(params.row.id)
                  : handleDelete(params.row.lot_id)
              }
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )
      },
    },
  ].filter((col) => {
    // Hide owner column when there's no org
    if (col.field === "owner_username" && !currentOrg) {
      return false
    }
    return true
  })

  const handleDelete = async (lotId: string) => {
    try {
      await deleteLot({ lot_id: lotId }).unwrap()
      issueAlert({
        message: t("AllStockLots.deleted", "Lot deleted"),
        severity: "success",
      })
    } catch (error) {
      issueAlert(error as any)
    }
  }

  const handleRowUpdate = async (newRow: any, oldRow: any) => {
    // Don't auto-save new rows
    if (newRow.id.toString().startsWith("new-")) {
      return newRow
    }

    // Handle existing row update
    try {
      const result = await updateLot({
        lot_id: newRow.lot_id,
        listing_id: newRow.listing_id,
        quantity: Number(newRow.quantity),
        location_id: newRow.location_id,
        owner_username: newRow.owner_username || null,
        listed: newRow.listed,
        notes: newRow.notes,
      }).unwrap()

      issueAlert({
        message: t("AllStockLots.updated", "Lot updated"),
        severity: "success",
      })

      // Return the updated lot data from server
      return {
        id: result.lot.lot_id,
        lot_id: result.lot.lot_id,
        listing_id: result.lot.listing_id,
        quantity: result.lot.quantity_total,
        location_id: result.lot.location_id,
        owner_username: result.lot.owner?.username || null,
        owner_avatar: result.lot.owner?.avatar || null,
        listed: result.lot.listed,
        notes: result.lot.notes,
      }
    } catch (error) {
      issueAlert(error as any)
      return oldRow
    }
  }

  const handleSaveNew = async (row: any) => {
    try {
      // Auto-set owner to current user when no org
      const ownerUsername = currentOrg
        ? row.owner_username || null
        : profile?.username || null

      await createLot({
        listing_id: row.listing_id,
        quantity: Number(row.quantity) || 0,
        location_id: row.location_id || null,
        owner_username: ownerUsername,
        listed: row.listed ?? true,
        notes: row.notes || null,
      }).unwrap()

      issueAlert({
        message: t("AllStockLots.created", "Lot created"),
        severity: "success",
      })

      setNewRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (error) {
      issueAlert(error as any)
    }
  }

  const handleCancelNew = (rowId: string) => {
    setNewRows((prev) => prev.filter((r) => r.id !== rowId))
  }

  const handleAddRow = () => {
    const newId = `new-${Date.now()}`
    setNewRows((prev) => [
      ...prev,
      {
        id: newId,
        lot_id: null,
        listing_id: "",
        quantity: 0,
        location_id: null,
        owner_username: null,
        owner_avatar: null,
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
        initialState={{
          pagination: { paginationModel: { pageSize: 24 } },
        }}
        disableRowSelectionOnClick
        slots={{
          toolbar: () => (
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                {t("AllStockLots.title", "All Stock Lots")}
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
                disabled={listings.length === 0}
              >
                {t("AllStockLots.addLot", "Add Lot")}
              </Button>
            </Box>
          ),
        }}
        showToolbar
        sx={{
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
      />
    </Paper>
  )
}

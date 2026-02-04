/**
 * All Stock Lots Grid
 *
 * Data grid showing all stock lots across all listings with inline editing
 */

import React, { useState } from "react"
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid"
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
import { useGetMyListingsQuery } from "../../api/marketApi"
import {
  useSearchLotsQuery,
  useCreateLotMutation,
  useUpdateLotMutation,
  useDeleteLotMutation,
  useGetLocationsQuery,
  useCreateLocationMutation,
} from "../../../../store/api/stockLotsApi"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import type { StockManageType } from "../../domain/types"

export function AllStockLotsGrid() {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const issueAlert = useAlertHook()

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

  // Fetch all lots using search endpoint
  const { data: lotsData } = useSearchLotsQuery({
    contractor_spectrum_id: hasOrg ? currentOrg?.spectrum_id : undefined,
    page_size: 24,
    offset: 0,
  })

  const [createLot] = useCreateLotMutation()
  const [updateLot] = useUpdateLotMutation()
  const [deleteLot] = useDeleteLotMutation()

  const { data: locationsData } = useGetLocationsQuery({ search: "" })
  const locations = locationsData?.locations || []
  const [createLocation] = useCreateLocationMutation()

  const [newRows, setNewRows] = useState<any[]>([])

  // Custom edit component for listing selection
  function ListingEditCell(props: GridRenderEditCellParams) {
    const { id, value, field } = props
    const apiRef = useGridApiContext()

    const handleChange = (
      _: React.SyntheticEvent,
      newValue: StockManageType | null,
    ) => {
      apiRef.current.setEditCellValue({
        id,
        field,
        value: newValue?.listing.listing_id || "",
      })
    }

    const selectedListing = listings.find((l) => l.listing.listing_id === value)

    return (
      <Autocomplete
        value={selectedListing || null}
        onChange={handleChange}
        options={listings}
        getOptionLabel={(option) => option.details.title}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Avatar src={option.photos[0]} sx={{ width: 32, height: 32 }} />
            <Typography variant="body2">{option.details.title}</Typography>
          </Box>
        )}
        renderInput={(params) => <TextField {...params} />}
        fullWidth
        sx={{ height: "100%" }}
      />
    )
  }

  // Custom edit component for location selection
  function LocationEditCell(props: GridRenderEditCellParams) {
    const { id, value, field } = props
    const apiRef = useGridApiContext()
    const [inputValue, setInputValue] = useState("")

    const handleChange = async (
      _: any,
      newValue: string | { name: string; location_id: string } | null,
      reason: string,
    ) => {
      if (reason === "createOption" && typeof newValue === "string") {
        // Create new location
        try {
          const result = await createLocation({ name: newValue }).unwrap()
          apiRef.current.setEditCellValue({
            id,
            field,
            value: result.location.location_id,
          })
        } catch (error) {
          console.error("Failed to create location", error)
        }
      } else {
        apiRef.current.setEditCellValue({
          id,
          field,
          value:
            typeof newValue === "string" ? null : newValue?.location_id || null,
        })
      }
    }

    const selectedLocation = locations.find((l) => l.location_id === value)

    return (
      <Autocomplete
        value={selectedLocation || null}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        options={locations}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderInput={(params) => (
          <TextField {...params} placeholder="Select or create location" />
        )}
        fullWidth
        sx={{ height: "100%" }}
      />
    )
  }

  // Map lots to rows
  const allLots = (lotsData?.lots || []).map((lot) => ({
    id: lot.lot_id,
    lot_id: lot.lot_id,
    listing_id: lot.listing_id,
    quantity: lot.quantity_total,
    location_id: lot.location_id,
    owner_id: lot.owner_id,
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
      renderEditCell: ListingEditCell,
      renderCell: (params) => {
        const listing = listings.find(
          (l) => l.listing.listing_id === params.value,
        )
        if (!listing) return null
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar src={listing.photos[0]} sx={{ width: 32, height: 32 }} />
            <Typography variant="body2">{listing.details.title}</Typography>
          </Box>
        )
      },
    },
    {
      field: "quantity",
      headerName: t("AllStockLots.quantity", "Quantity"),
      type: "number",
      flex: 1,
      editable: true,
    },
    {
      field: "location_id",
      headerName: t("AllStockLots.location", "Location"),
      flex: 1,
      editable: true,
      renderEditCell: LocationEditCell,
      valueFormatter: (value) => {
        const location = locations.find((l) => l.location_id === value)
        return location?.name || ""
      },
    },
    {
      field: "listed",
      headerName: t("AllStockLots.listed", "Listed"),
      type: "boolean",
      flex: 1,
      editable: true,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Yes" : "No"}
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
      renderCell: (params) => {
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
  ]

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
        quantity: newRow.quantity,
        location_id: newRow.location_id,
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
        owner_id: result.lot.owner_id,
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
      await createLot({
        listing_id: row.listing_id,
        quantity: row.quantity || 0,
        location_id: row.location_id || null,
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
        owner_id: null,
        listed: true,
        notes: "",
      },
    ])
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          {t("AllStockLots.title", "All Stock Lots")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          disabled={listings.length === 0}
        >
          {t("AllStockLots.addLot", "Add Lot")}
        </Button>
      </Box>
      <Box sx={{ height: 600, width: "100%" }}>
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
          sx={{
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </Box>
    </Paper>
  )
}

/**
 * All Stock Lots Grid
 * 
 * Data grid showing all stock lots across all listings with inline editing
 */

import React, { useState } from "react"
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid"
import { Paper, Typography, Chip, IconButton, Box, Button } from "@mui/material"
import { Delete as DeleteIcon, Save as SaveIcon, Add as AddIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetMyListingsQuery } from "../../api/marketApi"
import { useGetListingLotsQuery, useCreateLotMutation, useUpdateLotMutation, useDeleteLotMutation } from "../../../../store/api/stockLotsApi"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

export function AllStockLotsGrid() {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const issueAlert = useAlertHook()

  // Fetch all listings using same approach as MyItemStock
  const hasOrg = currentOrg && currentOrg.spectrum_id
  const searchQueryParams = {
    page_size: 1000,
    index: 0,
    quantityAvailable: 0,
    query: "",
    sort: "activity",
    statuses: "active,inactive",
  }

  const finalParams = hasOrg
    ? { ...searchQueryParams, contractor_id: currentOrg?.spectrum_id }
    : searchQueryParams

  const { data: listingsData, isLoading, error } = useGetMyListingsQuery(finalParams)
  const listings = listingsData?.listings || []

  console.log("AllStockLotsGrid - listings:", listings.length, "hasOrg:", hasOrg, "isLoading:", isLoading, "error:", error, "finalParams:", finalParams, "listingsData:", listingsData)

  // Fetch lots for all listings
  const lotsQueries = listings.map((listing) =>
    useGetListingLotsQuery({ listing_id: listing.listing.listing_id })
  )

  const [createLot] = useCreateLotMutation()
  const [updateLot] = useUpdateLotMutation()
  const [deleteLot] = useDeleteLotMutation()

  const [newRows, setNewRows] = useState<any[]>([])

  // Combine all lots into rows
  const rows: GridRowsProp = [
    ...newRows,
    ...lotsQueries.flatMap((query, idx) => {
      if (!query.data?.lots) return []
      const listing = listings[idx]
      return query.data.lots.map((lot) => ({
        id: lot.lot_id,
        lot_id: lot.lot_id,
        listing_id: lot.listing_id,
        listing_name: (listing.listing as any).item_name || listing.listing.listing_id,
        quantity: lot.quantity_total,
        location_id: lot.location_id,
        owner_id: lot.owner_id,
        listed: lot.listed,
        notes: lot.notes,
      }))
    }),
  ]

  const columns: GridColDef[] = [
    {
      field: "listing_name",
      headerName: t("AllStockLots.listing", "Listing"),
      flex: 2,
      editable: true,
      type: "singleSelect",
      valueOptions: listings.map((l) => ({
        value: l.listing.listing_id,
        label: (l.listing as any).item_name || l.listing.listing_id,
      })),
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
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDelete(params.row.lot_id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
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
    // Handle new row creation
    if (newRow.id.toString().startsWith("new-")) {
      try {
        await createLot({
          listing_id: newRow.listing_id,
          quantity: newRow.quantity || 0,
          location_id: newRow.location_id || null,
          listed: newRow.listed ?? true,
          notes: newRow.notes || null,
        }).unwrap()

        issueAlert({
          message: t("AllStockLots.created", "Lot created"),
          severity: "success",
        })

        setNewRows((prev) => prev.filter((r) => r.id !== newRow.id))
        return newRow
      } catch (error) {
        issueAlert(error as any)
        return oldRow
      }
    }

    // Handle existing row update
    try {
      await updateLot({
        lot_id: newRow.lot_id,
        quantity: newRow.quantity,
        location_id: newRow.location_id,
        listed: newRow.listed,
        notes: newRow.notes,
      }).unwrap()

      issueAlert({
        message: t("AllStockLots.updated", "Lot updated"),
        severity: "success",
      })

      return newRow
    } catch (error) {
      issueAlert(error as any)
      return oldRow
    }
  }

  const handleAddRow = () => {
    const newId = `new-${Date.now()}`
    setNewRows((prev) => [
      ...prev,
      {
        id: newId,
        lot_id: null,
        listing_id: listings[0]?.listing.listing_id || "",
        listing_name: (listings[0]?.listing as any)?.item_name || "",
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
        />
      </Box>
    </Paper>
  )
}

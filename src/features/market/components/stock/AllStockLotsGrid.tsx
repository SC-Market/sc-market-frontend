/**
 * All Stock Lots Grid
 * 
 * Data grid showing all stock lots across all listings with inline editing
 */

import React, { useState } from "react"
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid"
import { Paper, Typography, Chip, IconButton, Box } from "@mui/material"
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetMyListingsQuery } from "../../api/marketApi"
import { useGetListingLotsQuery, useCreateLotMutation, useUpdateLotMutation, useDeleteLotMutation } from "../../../../store/api/stockLotsApi"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

export function AllStockLotsGrid() {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const issueAlert = useAlertHook()

  // Fetch all listings
  const { data: listingsData } = useGetMyListingsQuery({
    page_size: 1000,
    index: 0,
    quantityAvailable: 0,
    query: "",
    sort: "activity",
    statuses: "active,inactive",
    ...(currentOrg?.spectrum_id && { contractor_id: currentOrg.spectrum_id }),
  })

  const listings = listingsData?.listings || []

  // Fetch lots for all listings
  const lotsQueries = listings.map((listing) =>
    useGetListingLotsQuery({ listing_id: listing.listing.listing_id })
  )

  const [createLot] = useCreateLotMutation()
  const [updateLot] = useUpdateLotMutation()
  const [deleteLot] = useDeleteLotMutation()

  // Combine all lots into rows
  const rows: GridRowsProp = lotsQueries.flatMap((query, idx) => {
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
  })

  const columns: GridColDef[] = [
    {
      field: "listing_name",
      headerName: t("AllStockLots.listing", "Listing"),
      flex: 2,
      editable: false,
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

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t("AllStockLots.title", "All Stock Lots")}
      </Typography>
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

/**
 * OrderAllocationView Component
 *
 * Displays current stock allocations for an order and provides
 * manual allocation management interface.
 *
 * Requirements: 5.3, 7.1, 7.2
 */

import React, { useState, useMemo } from "react"
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  useGetOrderAllocationsQuery,
  useGetListingLotsQuery,
  useManualAllocateOrderMutation,
  ManualAllocationInput,
  Allocation,
} from "../../../../store/api/stockLotsApi"
import { InventoryRounded, WarningRounded } from "@mui/icons-material"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

interface OrderAllocationViewProps {
  orderId: string
  listingId?: string
  orderQuantity?: number
}

export function OrderAllocationView({
  orderId,
  listingId,
  orderQuantity,
}: OrderAllocationViewProps) {
  const [selectedAllocations, setSelectedAllocations] = useState<
    Map<string, number>
  >(new Map())
  const issueAlert = useAlertHook()

  const {
    data: allocationsData,
    isLoading: allocationsLoading,
    error: allocationsError,
  } = useGetOrderAllocationsQuery({ order_id: orderId })

  const { data: lotsData, isLoading: lotsLoading } = useGetListingLotsQuery(
    { listing_id: listingId!, listed: true },
    { skip: !listingId },
  )

  const [manualAllocate, { isLoading: allocating }] =
    useManualAllocateOrderMutation()

  const allocations = allocationsData?.allocations || []
  const totalAllocated = allocationsData?.total_allocated || 0
  const lots = (lotsData?.lots || []).filter((lot) => lot.quantity_total > 0)

  const totalSelected = useMemo(
    () =>
      Array.from(selectedAllocations.values()).reduce(
        (sum, qty) => sum + qty,
        0,
      ),
    [selectedAllocations],
  )

  const handleAllocate = async () => {
    // Validation
    if (orderQuantity && totalSelected > orderQuantity) {
      issueAlert({
        severity: "error",
        message: `Cannot allocate ${totalSelected} units - order only needs ${orderQuantity}`,
      })
      return
    }

    for (const [lotId, quantity] of selectedAllocations.entries()) {
      const lot = lots.find((l) => l.lot_id === lotId)
      if (lot && quantity > lot.quantity_total) {
        issueAlert({
          severity: "error",
          message: `Cannot allocate ${quantity} from lot - only ${lot.quantity_total} available`,
        })
        return
      }
    }

    const allocationsToCreate: ManualAllocationInput[] = Array.from(
      selectedAllocations.entries(),
    )
      .filter(([_, quantity]) => quantity > 0)
      .map(([lot_id, quantity]) => ({
        listing_id: listingId!,
        lot_id,
        quantity,
      }))

    if (allocationsToCreate.length === 0) return

    try {
      await manualAllocate({
        order_id: orderId,
        allocations: allocationsToCreate,
      }).unwrap()
      setSelectedAllocations(new Map())
      issueAlert({
        severity: "success",
        message: "Stock allocated successfully",
      })
    } catch (error: any) {
      issueAlert({
        severity: "error",
        message: error?.data?.message || "Failed to allocate stock",
      })
    }
  }

  const isLoading = allocationsLoading || lotsLoading

  // Group allocations by location for better display
  const allocationsByLocation = useMemo(() => {
    const grouped = new Map<string, typeof allocations>()

    allocations.forEach((allocation: Allocation) => {
      const locationName = allocation.lot?.location_id || "Unspecified"
      const existing = grouped.get(locationName) || []
      grouped.set(locationName, [...existing, allocation])
    })

    return grouped
  }, [allocations])

  const hasAllocations = allocations.length > 0
  const isFullyAllocated = orderQuantity
    ? totalAllocated >= orderQuantity
    : false
  const isPartiallyAllocated = orderQuantity
    ? totalAllocated > 0 && totalAllocated < orderQuantity
    : false

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress size={24} />
            <Typography>Loading allocations...</Typography>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  if (allocationsError) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load allocations. Please try again.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {/* Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <InventoryRounded color="primary" />
                <Typography variant="h6">Stock Allocation</Typography>
              </Stack>
            </Stack>

            {/* Allocation Status */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Total Allocated:
              </Typography>
              <Chip
                label={`${totalAllocated}${orderQuantity ? ` / ${orderQuantity}` : ""}`}
                color={
                  isFullyAllocated
                    ? "success"
                    : isPartiallyAllocated
                      ? "warning"
                      : "default"
                }
                size="small"
              />
            </Stack>

            {/* Warning for partial allocation */}
            {isPartiallyAllocated && (
              <Alert severity="warning" icon={<WarningRounded />}>
                This order is only partially allocated.{" "}
                {orderQuantity! - totalAllocated} units still need allocation.
              </Alert>
            )}

            {/* No allocations message */}
            {!hasAllocations && (
              <Alert severity="info">
                No stock has been allocated to this order yet.
                {listingId &&
                  " Use the allocation interface below to assign stock."}
              </Alert>
            )}

            {/* Allocations Table */}
            {hasAllocations && (
              <>
                <Divider />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell>Lot ID</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.from(allocationsByLocation.entries()).map(
                        ([locationName, locationAllocations]) => (
                          <React.Fragment key={locationName}>
                            {locationAllocations.map(
                              (allocation: Allocation, index: number) => (
                                <TableRow key={allocation.allocation_id}>
                                  <TableCell>
                                    {index === 0 && (
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {locationName}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontFamily: "monospace",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {allocation.lot_id.substring(0, 8)}...
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2">
                                      {allocation.quantity}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={allocation.status}
                                      size="small"
                                      color={
                                        allocation.status === "active"
                                          ? "primary"
                                          : allocation.status === "fulfilled"
                                            ? "success"
                                            : "default"
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </React.Fragment>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Manual Allocation - Inline */}
      {listingId && lots.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Allocate Stock</Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2">Selected:</Typography>
                <Chip
                  label={`${totalSelected}${orderQuantity ? ` / ${orderQuantity}` : ""}`}
                  color={
                    orderQuantity && totalSelected > orderQuantity
                      ? "error"
                      : totalSelected > 0
                        ? "primary"
                        : "default"
                  }
                  size="small"
                />
              </Stack>

              <DataGrid
                rows={lots}
                getRowId={(row) => row.lot_id}
                columns={[
                  {
                    field: "location_name",
                    headerName: "Location",
                    flex: 1,
                    valueGetter: (params) =>
                      params.row.location?.name || "Unspecified",
                  },
                  {
                    field: "title",
                    headerName: "Lot",
                    flex: 2,
                    valueGetter: (params) =>
                      params.row.title ||
                      `Lot ${params.row.lot_id.substring(0, 8)}`,
                  },
                  {
                    field: "quantity_total",
                    headerName: "Available",
                    width: 100,
                    align: "right",
                    headerAlign: "right",
                  },
                  {
                    field: "allocate",
                    headerName: "Allocate",
                    width: 120,
                    renderCell: (params) => (
                      <TextField
                        type="number"
                        size="small"
                        value={selectedAllocations.get(params.row.lot_id) || ""}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 0
                          const newMap = new Map(selectedAllocations)
                          if (qty > 0 && qty <= params.row.quantity_total) {
                            newMap.set(params.row.lot_id, qty)
                          } else {
                            newMap.delete(params.row.lot_id)
                          }
                          setSelectedAllocations(newMap)
                        }}
                        inputProps={{ min: 0, max: params.row.quantity_total }}
                        sx={{ width: 100 }}
                      />
                    ),
                  },
                ]}
                autoHeight
                disableRowSelectionOnClick
                hideFooter
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <LoadingButton
                  variant="contained"
                  onClick={handleAllocate}
                  loading={allocating}
                  disabled={selectedAllocations.size === 0}
                >
                  Allocate Stock
                </LoadingButton>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </>
  )
}

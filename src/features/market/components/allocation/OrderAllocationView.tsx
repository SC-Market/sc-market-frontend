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
  IconButton,
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
import { DataGrid } from "@mui/x-data-grid"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  useGetOrderAllocationsQuery,
  useGetListingLotsQuery,
  useManualAllocateOrderMutation,
  ManualAllocationInput,
  Allocation,
  StockLot,
} from "../../../../store/api/stockLotsApi"
import {
  InventoryRounded,
  WarningRounded,
  AddCircleOutlineRounded,
  RemoveCircleOutlineRounded,
} from "@mui/icons-material"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useGetMarketListingQuery } from "../../api/marketApi"

interface StockLotWithAvailable extends StockLot {
  quantity_available: number
  location?: { name: string }
}

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

  const { data: listingData } = useGetMarketListingQuery(listingId!, {
    skip: !listingId,
  })

  const [manualAllocate, { isLoading: allocating }] =
    useManualAllocateOrderMutation()

  const allocations = allocationsData?.grouped_allocations || []
  const totalAllocated = allocationsData?.total_allocated || 0
  const aggregates = lotsData?.aggregates
  const listingTitle =
    (listingData?.listing as any)?.details?.title ||
    (listingData?.listing as any)?.title ||
    "Item"

  // Calculate available quantity per lot (total - allocated)
  const allocatedByLot = useMemo(() => {
    const map = new Map<string, number>()
    allocations.forEach((group) => {
      group.allocations.forEach((alloc) => {
        const current = map.get(alloc.lot_id) || 0
        map.set(alloc.lot_id, current + alloc.quantity)
      })
    })
    return map
  }, [allocations])

  const lots: StockLotWithAvailable[] = useMemo(() => {
    return (lotsData?.lots || [])
      .map((lot) => ({
        ...lot,
        quantity_available:
          lot.quantity_total - (allocatedByLot.get(lot.lot_id) || 0),
      }))
      .filter((lot) => lot.quantity_available > 0)
  }, [lotsData?.lots, allocatedByLot])

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
      if (lot && quantity > lot.quantity_available) {
        issueAlert({
          severity: "error",
          message: `Cannot allocate ${quantity} from lot - only ${lot.quantity_available} available`,
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
    const grouped = new Map<string, Allocation[]>()

    allocations.forEach((group) => {
      group.allocations.forEach((allocation) => {
        const locationName = allocation.lot?.location_id || "Unspecified"
        const existing = grouped.get(locationName) || []
        grouped.set(locationName, [...existing, allocation])
      })
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
              {aggregates && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Stock:
                  </Typography>
                  <Chip label={aggregates.available} size="small" />
                </>
              )}
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
                        <TableCell>User</TableCell>
                        <TableCell>Item</TableCell>
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
                                    <Typography variant="body2" color="text.secondary">
                                      {allocation.lot?.owner_id || "—"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {listingTitle}
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
                    valueGetter: (value, row) =>
                      row.location?.name || "Unspecified",
                  },
                  {
                    field: "title",
                    headerName: "Item",
                    flex: 2,
                    valueGetter: () => listingTitle,
                  },
                  {
                    field: "quantity_available",
                    headerName: "Available",
                    width: 100,
                    align: "right",
                    headerAlign: "right",
                  },
                  {
                    field: "allocate",
                    headerName: "Allocate",
                    width: 180,
                    renderCell: (params) => {
                      const selectedQty =
                        selectedAllocations.get(params.row.lot_id) || 0
                      return (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newMap = new Map(selectedAllocations)
                              if (selectedQty > 0) {
                                newMap.set(params.row.lot_id, selectedQty - 1)
                              }
                              if (selectedQty === 1) {
                                newMap.delete(params.row.lot_id)
                              }
                              setSelectedAllocations(newMap)
                            }}
                            disabled={selectedQty === 0}
                          >
                            <RemoveCircleOutlineRounded fontSize="small" />
                          </IconButton>
                          <Typography
                            variant="body2"
                            sx={{ minWidth: 30, textAlign: "center" }}
                          >
                            {selectedQty}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newMap = new Map(selectedAllocations)
                              newMap.set(params.row.lot_id, selectedQty + 1)
                              setSelectedAllocations(newMap)
                            }}
                            disabled={
                              selectedQty >= params.row.quantity_available
                            }
                          >
                            <AddCircleOutlineRounded fontSize="small" />
                          </IconButton>
                        </Stack>
                      )
                    },
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

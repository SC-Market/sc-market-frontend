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
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material"
import {
  useGetOrderAllocationsQuery,
  useGetListingLotsQuery,
  useManualAllocateOrderMutation,
  Allocation,
  ManualAllocationInput,
} from "../../../../store/api/stockLotsApi"
import { ManualAllocationDialog } from "./ManualAllocationDialog"
import { InventoryRounded, WarningRounded } from "@mui/icons-material"

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

  // Fetch current allocations
  const {
    data: allocationsData,
    isLoading: allocationsLoading,
    error,
  } = useGetOrderAllocationsQuery({ order_id: orderId })

  // Fetch available lots if listingId provided
  const { data: lotsData, isLoading: lotsLoading } = useGetListingLotsQuery(
    { listing_id: listingId!, listed: true },
    { skip: !listingId },
  )

  const [manualAllocate, { isLoading: allocating }] =
    useManualAllocateOrderMutation()

  const allocations = allocationsData?.allocations || []
  const totalAllocated = allocationsData?.total_allocated || 0
  const lots = lotsData?.lots || []

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

  if (error) {
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
                  " Click 'Manage Allocation' to manually allocate stock."}
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

            {/* Notes about allocation */}
            {hasAllocations && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Stock allocations are automatically created when orders are
                  placed. You can manually adjust allocations if needed.
                </Typography>
              </Box>
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
                  label={`${Array.from(selectedAllocations.values()).reduce((sum, qty) => sum + qty, 0)}${orderQuantity ? ` / ${orderQuantity}` : ""}`}
                  color="primary"
                  size="small"
                />
              </Stack>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Lot ID</TableCell>
                      <TableCell align="right">Available</TableCell>
                      <TableCell align="right">Allocate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lots.map((lot) => (
                      <TableRow key={lot.lot_id}>
                        <TableCell>{lot.location_id || "Unspecified"}</TableCell>
                        <TableCell>{lot.lot_id.substring(0, 8)}...</TableCell>
                        <TableCell align="right">{lot.quantity_total}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={selectedAllocations.get(lot.lot_id) || 0}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0
                              const newMap = new Map(selectedAllocations)
                              if (qty > 0) {
                                newMap.set(lot.lot_id, qty)
                              } else {
                                newMap.delete(lot.lot_id)
                              }
                              setSelectedAllocations(newMap)
                            }}
                            inputProps={{ min: 0, max: lot.quantity_total }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={async () => {
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
                    } catch (error) {
                      console.error("Failed to allocate:", error)
                    }
                  }}
                  disabled={allocating || selectedAllocations.size === 0}
                >
                  {allocating ? "Allocating..." : "Allocate Stock"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </>
  )
}

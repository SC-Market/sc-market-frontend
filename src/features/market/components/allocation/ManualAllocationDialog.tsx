/**
 * ManualAllocationDialog Component
 *
 * Provides interface for manually allocating stock lots to an order.
 * Displays available lots and allows user to specify quantities.
 *
 * Requirements: 7.2, 7.3, 13.1, 13.2
 */

import { useState, useMemo, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material"
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from "@mui/icons-material"
import LoadingButton from "@mui/lab/LoadingButton"
import { InsufficientStockDialog } from "./InsufficientStockDialog"
import {
  ValidationErrorAlert,
  ValidationError,
  createValidationError,
} from "./ValidationErrorAlert"

interface ManualAllocationDialogProps {
  open: boolean
  onClose: () => void
  orderId: string
  listingId: string
  orderQuantity?: number
  currentAllocations: Allocation[]
  onAddStock?: () => void
  onAllocateUnlisted?: () => void
  onReduceOrder?: () => void
}

export function ManualAllocationDialog({
  open,
  onClose,
  orderId,
  listingId,
  orderQuantity,
  currentAllocations,
  onAddStock,
  onAllocateUnlisted,
  onReduceOrder,
}: ManualAllocationDialogProps) {
  const [selectedAllocations, setSelectedAllocations] = useState<
    Map<string, number>
  >(new Map())
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  )
  const [insufficientStockDialogOpen, setInsufficientStockDialogOpen] =
    useState(false)
  const [insufficientStockData, setInsufficientStockData] = useState<{
    orderQuantity: number
    availableQuantity: number
    shortfall: number
  } | null>(null)

  // Fetch available lots
  const { data: lotsData, isLoading: lotsLoading } = useGetListingLotsQuery({
    listing_id: listingId,
    listed: true,
  })

  const [manualAllocate, { isLoading: allocating }] =
    useManualAllocateOrderMutation()

  const lots = lotsData?.lots || []
  const aggregates = lotsData?.aggregates

  // Calculate available quantity for each lot (considering current allocations)
  const lotsWithAvailable = useMemo(() => {
    return lots.map((lot) => {
      // Find current allocations for this lot
      const currentAllocation = currentAllocations.find(
        (alloc) => alloc.lot_id === lot.lot_id && alloc.status === "active",
      )
      const currentlyAllocated = currentAllocation?.quantity || 0

      // Calculate available (total - currently allocated to this order)
      const available = lot.quantity_total - currentlyAllocated

      return {
        ...lot,
        available,
        currentlyAllocated,
      }
    })
  }, [lots, currentAllocations])

  // Calculate totals
  const totalSelected = useMemo(() => {
    return Array.from(selectedAllocations.values()).reduce(
      (sum, qty) => sum + qty,
      0,
    )
  }, [selectedAllocations])

  // Validate allocations
  const validate = useCallback((): boolean => {
    const errors: ValidationError[] = []

    // Check if total doesn't exceed order quantity
    if (orderQuantity && totalSelected > orderQuantity) {
      errors.push(
        createValidationError.overAllocation(
          totalSelected,
          orderQuantity,
          "Total allocation",
        ),
      )
    }

    // Check each lot allocation doesn't exceed available
    selectedAllocations.forEach((quantity, lotId) => {
      const lot = lotsWithAvailable.find((l) => l.lot_id === lotId)
      if (lot && quantity > lot.available) {
        errors.push(
          createValidationError.overAllocation(
            quantity,
            lot.available,
            `Lot ${lotId.substring(0, 8)}...`,
          ),
        )
      }
    })

    // Check for negative quantities
    selectedAllocations.forEach((quantity, lotId) => {
      if (quantity < 0) {
        errors.push(
          createValidationError.negativeQuantity(
            `Lot ${lotId.substring(0, 8)}...`,
          ),
        )
      }
    })

    setValidationErrors(errors)
    return errors.length === 0
  }, [selectedAllocations, lotsWithAvailable, orderQuantity, totalSelected])

  // Handle quantity change for a lot
  const handleQuantityChange = (lotId: string, quantity: number) => {
    const newAllocations = new Map(selectedAllocations)
    if (quantity > 0) {
      newAllocations.set(lotId, quantity)
    } else {
      newAllocations.delete(lotId)
    }
    setSelectedAllocations(newAllocations)
    setValidationErrors([]) // Clear errors when user makes changes
  }

  // Handle increment/decrement
  const handleIncrement = (lotId: string) => {
    const current = selectedAllocations.get(lotId) || 0
    handleQuantityChange(lotId, current + 1)
  }

  const handleDecrement = (lotId: string) => {
    const current = selectedAllocations.get(lotId) || 0
    if (current > 0) {
      handleQuantityChange(lotId, current - 1)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) {
      return
    }

    const allocations: ManualAllocationInput[] = Array.from(
      selectedAllocations.entries(),
    )
      .filter(([_, quantity]) => quantity > 0)
      .map(([lot_id, quantity]) => ({ lot_id, quantity }))

    if (allocations.length === 0) {
      setValidationErrors([
        createValidationError.requiredField("At least one lot allocation"),
      ])
      return
    }

    try {
      await manualAllocate({
        order_id: orderId,
        allocations,
      }).unwrap()

      // Success - close dialog
      onClose()
      setSelectedAllocations(new Map())
      setValidationErrors([])
    } catch (error: any) {
      // Handle API errors
      const errorMessage =
        error?.data?.error?.message || "Failed to allocate stock"

      // Check if this is an insufficient stock error
      if (
        errorMessage.toLowerCase().includes("insufficient") ||
        errorMessage.toLowerCase().includes("not enough")
      ) {
        // Show insufficient stock dialog
        if (orderQuantity && aggregates) {
          setInsufficientStockData({
            orderQuantity,
            availableQuantity: aggregates.available,
            shortfall: orderQuantity - aggregates.available,
          })
          setInsufficientStockDialogOpen(true)
        } else {
          setValidationErrors([createValidationError.generic(errorMessage)])
        }
      } else {
        setValidationErrors([createValidationError.generic(errorMessage)])
      }
    }
  }

  // Handle close
  const handleClose = () => {
    setSelectedAllocations(new Map())
    setValidationErrors([])
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Manual Stock Allocation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Order Info */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Order ID: <strong>{orderId.substring(0, 8)}...</strong>
              </Typography>
              {orderQuantity && (
                <Typography variant="body2" color="text.secondary">
                  Order Quantity: <strong>{orderQuantity}</strong>
                </Typography>
              )}
            </Box>

            {/* Current Selection Summary */}
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
              {aggregates && (
                <Typography variant="caption" color="text.secondary">
                  Available: {aggregates.available}
                </Typography>
              )}
            </Stack>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <ValidationErrorAlert
                errors={validationErrors}
                onDismiss={() => setValidationErrors([])}
              />
            )}

            <Divider />

            {/* Available Lots Table */}
            {lotsLoading ? (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ py: 4 }}
              >
                <CircularProgress size={24} />
                <Typography>Loading available lots...</Typography>
              </Stack>
            ) : lotsWithAvailable.length === 0 ? (
              <Alert severity="info">
                No available lots found for this listing.
              </Alert>
            ) : (
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
                    {lotsWithAvailable.map((lot) => {
                      const selectedQty =
                        selectedAllocations.get(lot.lot_id) || 0
                      const hasError =
                        selectedQty > lot.available || selectedQty < 0

                      return (
                        <TableRow key={lot.lot_id}>
                          <TableCell>
                            <Typography variant="body2">
                              {lot.location_id || "Unspecified"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                              }}
                            >
                              {lot.lot_id.substring(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {lot.available}
                              {lot.currentlyAllocated > 0 && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  ({lot.currentlyAllocated} allocated)
                                </Typography>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="flex-end"
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleDecrement(lot.lot_id)}
                                disabled={selectedQty === 0}
                              >
                                <RemoveCircleOutlineRounded fontSize="small" />
                              </IconButton>
                              <TextField
                                size="small"
                                type="number"
                                value={selectedQty}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    lot.lot_id,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                error={hasError}
                                inputProps={{
                                  min: 0,
                                  max: lot.available,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: 80 }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleIncrement(lot.lot_id)}
                                disabled={selectedQty >= lot.available}
                              >
                                <AddCircleOutlineRounded fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Help Text */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Select lots and specify quantities to manually allocate stock to
                this order. The total allocation cannot exceed the order
                quantity.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            onClick={handleSubmit}
            variant="contained"
            loading={allocating}
            disabled={totalSelected === 0 || lotsWithAvailable.length === 0}
          >
            Allocate Stock
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Insufficient Stock Dialog */}
      {insufficientStockData && (
        <InsufficientStockDialog
          open={insufficientStockDialogOpen}
          onClose={() => {
            setInsufficientStockDialogOpen(false)
            setInsufficientStockData(null)
          }}
          orderQuantity={insufficientStockData.orderQuantity}
          availableQuantity={insufficientStockData.availableQuantity}
          shortfall={insufficientStockData.shortfall}
          onAddStock={onAddStock}
          onAllocateUnlisted={onAllocateUnlisted}
          onReduceOrder={onReduceOrder}
        />
      )}
    </>
  )
}

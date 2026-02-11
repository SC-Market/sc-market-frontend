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
  useGetListingLotsQuery,
  useManualAllocateOrderMutation,
  Allocation,
  ManualAllocationInput,
} from "../../../../store/api/stockLotsApi"
import LoadingButton from "@mui/lab/LoadingButton"
import { InsufficientStockDialog } from "./InsufficientStockDialog"
import {
  ValidationErrorAlert,
  ValidationError,
  createValidationError,
} from "./ValidationErrorAlert"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions from '@mui/material/ThemeOptions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/PaperProps';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Fab from '@mui/material/Fab';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import WarningRounded from '@mui/icons-material/WarningRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import SyncProblemRounded from '@mui/icons-material/SyncProblemRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRounded from '@mui/icons-material/RemoveCircleOutlineRounded';

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
      const lot = lotsWithAvailable.find(
        (l: (typeof lotsWithAvailable)[0]) => l.lot_id === lotId,
      )
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
      .map(([lot_id, quantity]) => ({
        listing_id: listingId,
        lot_id,
        quantity,
      }))

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
                    {lotsWithAvailable.map(
                      (lot: (typeof lotsWithAvailable)[0]) => {
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
                      },
                    )}
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

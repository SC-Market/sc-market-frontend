/**
 * InsufficientStockDialog Component
 * 
 * Displays detailed information when stock allocation fails due to insufficient quantity.
 * Provides actionable options to resolve the issue.
 * 
 * Requirements: 13.1, 13.2
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  Divider,
} from "@mui/material"
import { WarningRounded } from "@mui/icons-material"

interface InsufficientStockDialogProps {
  open: boolean
  onClose: () => void
  orderQuantity: number
  availableQuantity: number
  shortfall: number
  onAddStock?: () => void
  onAllocateUnlisted?: () => void
  onReduceOrder?: () => void
}

export function InsufficientStockDialog({
  open,
  onClose,
  orderQuantity,
  availableQuantity,
  shortfall,
  onAddStock,
  onAllocateUnlisted,
  onReduceOrder,
}: InsufficientStockDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <WarningRounded color="warning" />
          <Typography variant="h6">Insufficient Stock</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Problem Summary */}
          <Alert severity="warning">
            <Typography variant="body2" gutterBottom>
              <strong>Cannot allocate full order quantity</strong>
            </Typography>
            <Typography variant="body2">
              The order requires {orderQuantity} units, but only {availableQuantity} units are available.
            </Typography>
          </Alert>

          {/* Detailed Breakdown */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Stock Breakdown
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Order Quantity:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {orderQuantity}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Available Stock:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {availableQuantity}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="error" fontWeight="medium">
                  Shortfall:
                </Typography>
                <Typography variant="body2" color="error" fontWeight="medium">
                  {shortfall}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Resolution Options */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              What would you like to do?
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {onAddStock && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    onAddStock()
                    onClose()
                  }}
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="body2" fontWeight="medium">
                      Add More Stock
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create new stock lots to fulfill this order
                    </Typography>
                  </Stack>
                </Button>
              )}

              {onAllocateUnlisted && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    onAllocateUnlisted()
                    onClose()
                  }}
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="body2" fontWeight="medium">
                      Use Unlisted Stock
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Allocate from unlisted stock lots if available
                    </Typography>
                  </Stack>
                </Button>
              )}

              {onReduceOrder && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    onReduceOrder()
                    onClose()
                  }}
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="body2" fontWeight="medium">
                      Reduce Order Quantity
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Adjust order to match available stock ({availableQuantity} units)
                    </Typography>
                  </Stack>
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * AllocationStatusDisplay Component
 *
 * Displays allocation status for an order in a compact format.
 * Shows total allocated quantity and provides a link to view details.
 *
 * Requirements: 5.3, 6.1, 6.2, 6.3
 */

import React from "react"
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material"
import {
  CheckCircleRounded,
  WarningRounded,
  InventoryRounded,
} from "@mui/icons-material"
import { useGetOrderAllocationsQuery } from "../../../../store/api/stockLotsApi"

interface AllocationStatusDisplayProps {
  orderId: string
  orderQuantity?: number
  compact?: boolean
  showDetailsLink?: boolean
}

export function AllocationStatusDisplay({
  orderId,
  orderQuantity,
  compact = false,
  showDetailsLink = false,
}: AllocationStatusDisplayProps) {
  const {
    data: allocationsData,
    isLoading,
    error,
  } = useGetOrderAllocationsQuery({ order_id: orderId })

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Loading allocation status...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return null // Silently fail - allocations may not exist for all orders
  }

  if (!allocationsData || allocationsData.grouped_allocations.length === 0) {
    return null // No allocations to display
  }

  const { grouped_allocations, total_allocated } = allocationsData
  const hasActiveAllocations = grouped_allocations.some(
    (a: any) => a.status === "active",
  )
  const allFulfilled = grouped_allocations.every((a: any) => a.status === "fulfilled")
  const allReleased = grouped_allocations.every((a: any) => a.status === "released")

  const isPartial =
    orderQuantity !== undefined && total_allocated < orderQuantity

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {hasActiveAllocations && (
          <Chip
            icon={<InventoryRounded />}
            label={`${total_allocated} allocated`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        {allFulfilled && (
          <Chip
            icon={<CheckCircleRounded />}
            label="Stock consumed"
            size="small"
            color="success"
            variant="outlined"
          />
        )}
        {allReleased && (
          <Chip
            icon={<CheckCircleRounded />}
            label="Stock released"
            size="small"
            color="info"
            variant="outlined"
          />
        )}
        {isPartial && (
          <Chip
            icon={<WarningRounded />}
            label="Partial"
            size="small"
            color="warning"
            variant="outlined"
          />
        )}
      </Box>
    )
  }

  return (
    <Box>
      {hasActiveAllocations && (
        <Alert
          severity={isPartial ? "warning" : "info"}
          icon={<InventoryRounded />}
        >
          <Typography variant="body2">
            <strong>{total_allocated}</strong> units allocated from stock
            {orderQuantity !== undefined && ` (of ${orderQuantity} requested)`}
          </Typography>
          {isPartial && (
            <Typography variant="caption" color="text.secondary">
              Partial allocation - insufficient stock available
            </Typography>
          )}
          {showDetailsLink && (
            <Link
              href="#allocations"
              variant="caption"
              sx={{ display: "block", mt: 0.5 }}
            >
              View allocation details
            </Link>
          )}
        </Alert>
      )}

      {allFulfilled && (
        <Alert severity="success" icon={<CheckCircleRounded />}>
          <Typography variant="body2">
            Stock consumed - <strong>{total_allocated}</strong> units removed
            from inventory
          </Typography>
        </Alert>
      )}

      {allReleased && (
        <Alert severity="info" icon={<CheckCircleRounded />}>
          <Typography variant="body2">
            Stock released - <strong>{total_allocated}</strong> units returned
            to available inventory
          </Typography>
        </Alert>
      )}
    </Box>
  )
}

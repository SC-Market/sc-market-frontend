/**
 * SplitAllocationView Component
 *
 * The order page's Stock Allocation tab. For each of the order's V2 lines:
 * - Left: the lots of the same listing item and variant with free units
 * - Right: the lots the line's units are allocated from
 *
 * Everything goes through V2 /api/v2/orders/{orderId}/allocations (read,
 * auto-allocate, set a lot's allocation, release), which only the order's
 * seller side may use. Allocating takes units out of the lot; releasing puts
 * them back.
 */

import React, { useState } from "react"
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import {
  InventoryRounded,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  useAutoAllocateOrderStockMutation,
  useGetOrderAllocationsQuery,
  useManualAllocateOrderStockMutation,
  useReleaseOrderStockMutation,
  type OrderAllocation,
  type OrderAllocationLine,
  type OrderAllocationLot,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { MARKET_PATHS } from "../../../../routes/paths"

interface SplitAllocationViewProps {
  orderId: string
}

/** The message of a failed V2 request ({ error: { message } }). */
function apiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { error?: { message?: unknown } } }).data
    if (typeof data?.error?.message === "string") return data.error.message
  }
  return fallback
}

function lotLocation(lot: OrderAllocationLot | null) {
  return lot?.location?.name || "Unknown"
}

function LotOwner({ lot }: { lot: OrderAllocationLot | null }) {
  if (!lot?.owner) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    )
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar
        src={lot.owner.avatar_url || undefined}
        sx={{ width: 24, height: 24 }}
      />
      <Typography variant="body2" color="text.secondary">
        {lot.owner.display_name || lot.owner.username}
      </Typography>
    </Box>
  )
}

export function SplitAllocationView({ orderId }: SplitAllocationViewProps) {
  const issueAlert = useAlertHook()
  const { data, isLoading, error } = useGetOrderAllocationsQuery({ orderId })
  const [manualAllocate] = useManualAllocateOrderStockMutation()
  const [autoAllocate, { isLoading: autoLoading }] =
    useAutoAllocateOrderStockMutation()
  const [release, { isLoading: releaseLoading }] =
    useReleaseOrderStockMutation()

  /** Sets the units `lotId` holds for the line (absolute, 0 releases). */
  const setLotAllocation = async (
    line: OrderAllocationLine,
    lotId: string,
    quantity: number,
    success: string,
  ) => {
    try {
      await manualAllocate({
        orderId,
        manualOrderAllocationRequest: {
          allocations: [
            { lot_id: lotId, quantity, order_item_id: line.order_item_id },
          ],
        },
      }).unwrap()
      issueAlert({ severity: "success", message: success })
    } catch (e) {
      issueAlert({
        severity: "error",
        message: apiErrorMessage(e, "Failed to update the allocation"),
      })
    }
  }

  const handleAutoAllocate = async () => {
    try {
      const res = await autoAllocate({ orderId }).unwrap()
      issueAlert({
        severity:
          res.total_allocated < res.total_requested ? "warning" : "success",
        message: `${res.total_allocated} of ${res.total_requested} units allocated`,
      })
    } catch (e) {
      issueAlert({
        severity: "error",
        message: apiErrorMessage(e, "Failed to allocate stock"),
      })
    }
  }

  const handleReleaseAll = async () => {
    try {
      await release({ orderId, releaseOrderAllocationsRequest: {} }).unwrap()
      issueAlert({
        severity: "success",
        message: "Allocated stock returned to its lots",
      })
    } catch (e) {
      issueAlert({
        severity: "error",
        message: apiErrorMessage(e, "Failed to release stock"),
      })
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress aria-label="Loading stock allocations" />
      </Box>
    )
  }
  if (error || !data) {
    return (
      <Alert severity="error">
        {apiErrorMessage(error, "Failed to load stock allocations")}
      </Alert>
    )
  }

  const fullyAllocated = data.total_allocated >= data.total_requested

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          mb={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Stock Allocation</Typography>
            <Chip
              label={`${data.total_allocated} / ${data.total_requested}`}
              color={fullyAllocated ? "success" : "warning"}
              size="small"
            />
            <Chip
              label={`Mode: ${data.allocation_mode}`}
              size="small"
              variant="outlined"
            />
          </Stack>
          {data.editable && data.lines.length > 0 && (
            <Stack direction="row" spacing={1}>
              <LoadingButton
                variant="contained"
                size="small"
                loading={autoLoading}
                disabled={fullyAllocated}
                onClick={handleAutoAllocate}
              >
                Auto-allocate
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                size="small"
                loading={releaseLoading}
                disabled={data.total_allocated === 0}
                onClick={handleReleaseAll}
              >
                Release all
              </LoadingButton>
            </Stack>
          )}
        </Stack>

        {!data.editable && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This order is {data.order_status}; its allocations can no longer
            change.
          </Alert>
        )}
        {data.lines.length === 0 && (
          <Typography color="text.secondary">
            This order has no items to allocate stock for.
          </Typography>
        )}

        <Stack spacing={3}>
          {data.lines.map((line) => (
            <LineAllocation
              key={line.order_item_id}
              line={line}
              editable={data.editable}
              onSet={setLotAllocation}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

function LineAllocation({
  line,
  editable,
  onSet,
}: {
  line: OrderAllocationLine
  editable: boolean
  onSet: (
    line: OrderAllocationLine,
    lotId: string,
    quantity: number,
    success: string,
  ) => Promise<void>
}) {
  const remaining = line.quantity - line.quantity_allocated
  const heldByLot = new Map<string, number>()
  for (const a of line.allocations)
    if (a.lot_id) heldByLot.set(a.lot_id, a.quantity)

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Avatar
          src={line.listing_photo || undefined}
          sx={{ width: 32, height: 32, borderRadius: 1 }}
          variant="rounded"
        >
          <InventoryRounded />
        </Avatar>
        <Link
          href={MARKET_PATHS.listing(line.listing_id)}
          target="_blank"
          underline="hover"
        >
          <Typography variant="subtitle1">{line.listing_title}</Typography>
        </Link>
        <Chip
          label={line.variant.display_name}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`${line.quantity_allocated} / ${line.quantity}`}
          color={remaining <= 0 ? "success" : "warning"}
          size="small"
        />
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Available Stock
          </Typography>
          <AvailableLots
            line={line}
            remaining={remaining}
            editable={editable}
            onAllocate={(lotId, qty) =>
              onSet(
                line,
                lotId,
                (heldByLot.get(lotId) ?? 0) + qty,
                "Stock allocated",
              )
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Allocated
          </Typography>
          <AllocatedLots
            allocations={line.allocations}
            editable={editable}
            onDeallocate={async (alloc, qty) => {
              if (alloc.lot_id)
                await onSet(
                  line,
                  alloc.lot_id,
                  alloc.quantity - qty,
                  "Allocation updated",
                )
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

function AvailableLots({
  line,
  remaining,
  editable,
  onAllocate,
}: {
  line: OrderAllocationLine
  remaining: number
  editable: boolean
  onAllocate: (lotId: string, quantity: number) => Promise<void>
}) {
  const [qtys, setQtys] = useState<Record<string, number>>({})

  if (line.available_lots.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No free stock of this variant.
      </Typography>
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Location</TableCell>
          <TableCell>User</TableCell>
          <TableCell width={130}>Quantity</TableCell>
          <TableCell width={50} />
        </TableRow>
      </TableHead>
      <TableBody>
        {line.available_lots.map((lot) => {
          const qty = qtys[lot.lot_id] || 0
          const wouldExceed = qty > remaining
          const disabled = !editable || remaining <= 0
          return (
            <TableRow key={lot.lot_id}>
              <TableCell>
                {lotLocation(lot)}
                {!lot.listed && (
                  <Chip
                    label="Unlisted"
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </TableCell>
              <TableCell>
                <LotOwner lot={lot} />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  inputMode="numeric"
                  value={qty || ""}
                  disabled={disabled}
                  error={wouldExceed}
                  helperText={
                    wouldExceed ? `Line needs ${remaining} more` : undefined
                  }
                  inputProps={{
                    "aria-label": `Quantity to allocate from ${lotLocation(lot)}`,
                  }}
                  onChange={(e) =>
                    setQtys({
                      ...qtys,
                      [lot.lot_id]: Math.max(
                        0,
                        Math.min(
                          lot.quantity_available,
                          parseInt(e.target.value) || 0,
                        ),
                      ),
                    })
                  }
                  onFocus={() => {
                    if (!qty) {
                      setQtys({
                        ...qtys,
                        [lot.lot_id]: Math.min(
                          lot.quantity_available,
                          remaining,
                        ),
                      })
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        / {lot.quantity_available}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 130 }}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  aria-label={`Allocate from ${lotLocation(lot)}`}
                  disabled={disabled || qty === 0 || wouldExceed}
                  onClick={async () => {
                    await onAllocate(lot.lot_id, qty)
                    setQtys({ ...qtys, [lot.lot_id]: 0 })
                  }}
                >
                  <KeyboardArrowRight />
                </IconButton>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function AllocatedLots({
  allocations,
  editable,
  onDeallocate,
}: {
  allocations: OrderAllocation[]
  editable: boolean
  onDeallocate: (allocation: OrderAllocation, quantity: number) => Promise<void>
}) {
  const [qtys, setQtys] = useState<Record<string, number>>({})

  if (allocations.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nothing allocated yet.
      </Typography>
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell width={50} />
          <TableCell width={130}>Quantity</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {allocations.map((alloc) => {
          const qty = qtys[alloc.allocation_id] || 0
          // A deleted lot has nowhere to return units to.
          const disabled = !editable || !alloc.lot_id
          return (
            <TableRow key={alloc.allocation_id}>
              <TableCell>
                <IconButton
                  size="small"
                  aria-label={`Return units to ${lotLocation(alloc.lot)}`}
                  disabled={disabled || qty === 0}
                  onClick={async () => {
                    await onDeallocate(alloc, qty)
                    setQtys({ ...qtys, [alloc.allocation_id]: 0 })
                  }}
                >
                  <KeyboardArrowLeft />
                </IconButton>
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  inputMode="numeric"
                  value={qty || ""}
                  disabled={disabled}
                  inputProps={{
                    "aria-label": `Quantity to return to ${lotLocation(alloc.lot)}`,
                  }}
                  onChange={(e) =>
                    setQtys({
                      ...qtys,
                      [alloc.allocation_id]: Math.max(
                        0,
                        Math.min(alloc.quantity, parseInt(e.target.value) || 0),
                      ),
                    })
                  }
                  onFocus={() => {
                    if (!qty)
                      setQtys({
                        ...qtys,
                        [alloc.allocation_id]: alloc.quantity,
                      })
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        / {alloc.quantity}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 130 }}
                />
              </TableCell>
              <TableCell>
                {alloc.lot ? lotLocation(alloc.lot) : "Deleted lot"}
              </TableCell>
              <TableCell>
                <LotOwner lot={alloc.lot} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

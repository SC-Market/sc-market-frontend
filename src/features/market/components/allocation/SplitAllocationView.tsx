/**
 * SplitAllocationView Component
 *
 * Two-panel allocation interface:
 * - Left: Available lots with quantity inputs
 * - Right: Allocation targets showing required vs allocated
 *
 * Lots come from V2 GET /api/v2/stock-lots (listing_id + the selling org's
 * spectrum_id, which limits them to that org's members). Allocations are
 * read and changed through /api/orders/:id/allocations, which only the
 * order's seller side may use.
 */

import React, { useState, useMemo } from "react"
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  TextField,
  IconButton,
  Chip,
  Avatar,
  Link,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  InputAdornment,
} from "@mui/material"
import {
  ArrowForwardRounded,
  ArrowBackRounded,
  InventoryRounded,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from "@mui/icons-material"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  useManualAllocateOrderMutation,
  useGetOrderAllocationsQuery,
  Allocation,
} from "../../../../store/api/stockLotsApi"
import {
  useGetStockLotsQuery,
  type StockLotDetail,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { MARKET_PATHS } from "../../../../routes/paths"

interface ListingAllocation {
  listing_id: string
  quantity: number
}

interface SplitAllocationViewProps {
  orderId: string
  /** Spectrum ID of the org selling the order; scopes the stock-lot lookup */
  spectrumId: string
  listings: ListingAllocation[]
}

interface StockLotWithAvailable extends StockLotDetail {
  quantity_available: number
}

import type { AllocationListingData } from "../../../../store/api/stockLotsApi"

function getListingTitle(
  listingData: AllocationListingData | undefined | null,
  lots: StockLotDetail[] | undefined,
): string {
  return (
    listingData?.details?.title ||
    listingData?.title ||
    lots?.[0]?.listing_title ||
    "Item"
  )
}

function getListingImage(
  listingData: AllocationListingData | undefined | null,
  lots: StockLotDetail[] | undefined,
): string | undefined {
  return listingData?.photos?.[0] || lots?.[0]?.listing_photo || undefined
}

/** A listing's listed lots in the selling org's shops (V2 stock lots). */
function useListingLots(listingId: string, spectrumId: string) {
  return useGetStockLotsQuery({
    listingId,
    spectrumId,
    listed: true,
    pageSize: 100,
  })
}

export function SplitAllocationView({
  orderId,
  spectrumId,
  listings,
}: SplitAllocationViewProps) {
  const issueAlert = useAlertHook()

  const { data: allocationsData } = useGetOrderAllocationsQuery({
    order_id: orderId,
  })

  const [manualAllocate] = useManualAllocateOrderMutation()

  const groupedAllocations = allocationsData?.grouped_allocations || []

  const handleAllocate = async (
    lotId: string,
    listingId: string,
    quantity: number,
  ) => {
    // Validate against order quantity
    const listing = listings.find((l) => l.listing_id === listingId)
    if (listing) {
      const currentAllocated = allocationsByListing.get(listingId) || 0
      if (currentAllocated + quantity > listing.quantity) {
        issueAlert({
          severity: "error",
          message: `Cannot allocate ${currentAllocated + quantity} units. Order only requires ${listing.quantity}.`,
        })
        return
      }
    }

    try {
      await manualAllocate({
        order_id: orderId,
        allocations: [{ lot_id: lotId, listing_id: listingId, quantity }],
      }).unwrap()
      issueAlert({
        severity: "success",
        message: "Stock allocated successfully",
      })
    } catch (error) {
      const err = error as { data?: { message?: string } }
      issueAlert({
        severity: "error",
        message: err?.data?.message || "Failed to allocate stock",
      })
    }
  }

  const handleDeallocate = async (
    allocationId: string,
    lotId: string,
    listingId: string,
    currentQuantity: number,
    amountToRemove: number,
  ) => {
    const newQuantity = Math.max(0, currentQuantity - amountToRemove)
    try {
      await manualAllocate({
        order_id: orderId,
        allocations: [
          { lot_id: lotId, listing_id: listingId, quantity: newQuantity },
        ],
      }).unwrap()
      issueAlert({
        severity: "success",
        message: "Allocation updated successfully",
      })
    } catch (error) {
      const err = error as { data?: { message?: string } }
      issueAlert({
        severity: "error",
        message: err?.data?.message || "Failed to update allocation",
      })
    }
  }

  const allocationsByListing = useMemo(() => {
    const map = new Map<string, number>()
    groupedAllocations.forEach((group) => {
      map.set(group.listing_id, group.total_allocated)
    })
    return map
  }, [groupedAllocations])

  const [inputValues, setInputValues] = React.useState<
    Record<string, Record<string, number>>
  >({})

  // Update input values after allocations change
  React.useEffect(() => {
    setInputValues((prev) => {
      const newValues: Record<string, Record<string, number>> = {}
      listings.forEach((listing) => {
        const currentAllocated =
          allocationsByListing.get(listing.listing_id) || 0
        const remaining = listing.quantity - currentAllocated
        const group = groupedAllocations.find(
          (g) => g.listing_id === listing.listing_id,
        )
        const lotsData = group?.allocations || []

        newValues[listing.listing_id] = {}
        // Only update if there's remaining to allocate
        if (remaining > 0) {
          lotsData.forEach((alloc) => {
            if (alloc.lot) {
              const lotId = alloc.lot_id
              // Keep existing value if it exists and is valid, otherwise set to 0
              newValues[listing.listing_id][lotId] =
                prev[listing.listing_id]?.[lotId] || 0
            }
          })
        }
      })
      return newValues
    })
  }, [groupedAllocations, allocationsByListing, listings])

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          {/* Left: Available Lots */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h6">Available Stock</Typography>
              {listings.map((listing) => {
                const group = groupedAllocations.find(
                  (g) => g.listing_id === listing.listing_id,
                )
                return (
                  <AvailableLots
                    key={listing.listing_id}
                    listingId={listing.listing_id}
                    spectrumId={spectrumId}
                    listingData={group?.listing}
                    allocations={group?.allocations || []}
                    onAllocate={handleAllocate}
                    orderQuantity={listing.quantity}
                    currentAllocated={
                      allocationsByListing.get(listing.listing_id) || 0
                    }
                    allocateQtys={inputValues[listing.listing_id] || {}}
                    setAllocateQtys={(qtys) =>
                      setInputValues((prev) => ({
                        ...prev,
                        [listing.listing_id]: qtys,
                      }))
                    }
                  />
                )
              })}
            </Stack>
          </Grid>

          {/* Right: Allocation Targets */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h6">Allocation Targets</Typography>
              {listings.map((listing) => {
                const group = groupedAllocations.find(
                  (g) => g.listing_id === listing.listing_id,
                )
                return (
                  <AllocationTarget
                    key={listing.listing_id}
                    listingId={listing.listing_id}
                    spectrumId={spectrumId}
                    listingData={group?.listing}
                    required={listing.quantity}
                    allocated={
                      allocationsByListing.get(listing.listing_id) || 0
                    }
                    allocations={group?.allocations || []}
                    onDeallocate={handleDeallocate}
                  />
                )
              })}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

function AvailableLots({
  listingId,
  spectrumId,
  listingData,
  allocations,
  onAllocate,
  orderQuantity,
  currentAllocated,
  allocateQtys,
  setAllocateQtys,
}: {
  listingId: string
  spectrumId: string
  listingData?: AllocationListingData | null
  allocations: Allocation[]
  onAllocate: (lotId: string, listingId: string, quantity: number) => void
  orderQuantity: number
  currentAllocated: number
  allocateQtys: Record<string, number>
  setAllocateQtys: (qtys: Record<string, number>) => void
}) {
  const { data: lotsData } = useListingLots(listingId, spectrumId)

  // quantity_allocated counts every active allocation of the lot (this
  // order's included), so what is left is what can still be allocated.
  const lots: StockLotWithAvailable[] = useMemo(() => {
    return (lotsData?.lots || [])
      .map((lot) => ({
        ...lot,
        quantity_available: lot.quantity_total - lot.quantity_allocated,
      }))
      .filter((lot) => lot.quantity_available > 0)
  }, [lotsData?.lots])

  const title = getListingTitle(listingData, lotsData?.lots)
  const image = getListingImage(listingData, lotsData?.lots)

  if (lots.length === 0) return null

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Avatar
          src={image}
          sx={{ width: 32, height: 32, borderRadius: 1 }}
          variant="rounded"
        >
          <InventoryRounded />
        </Avatar>
        <Link
          href={MARKET_PATHS.listing(listingId)}
          target="_blank"
          underline="hover"
        >
          <Typography variant="h6">{title}</Typography>
        </Link>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Location</TableCell>
            <TableCell>User</TableCell>
            <TableCell width={120}>Quantity</TableCell>
            <TableCell width={50}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lots.map((lot) => {
            const allocateQty = allocateQtys[lot.lot_id] || 0
            const remaining = orderQuantity - currentAllocated
            const isFullyAllocated = remaining <= 0
            const wouldExceed =
              allocateQty > 0 && currentAllocated + allocateQty > orderQuantity
            return (
              <TableRow key={lot.lot_id}>
                <TableCell>{lot.location?.name || "Unknown"}</TableCell>
                <TableCell>
                  {lot.owner ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={lot.owner.avatar_url || undefined}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {lot.owner.display_name || lot.owner.username}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    inputMode="numeric"
                    value={allocateQty || ""}
                    onChange={(e) => {
                      const val = Math.max(
                        0,
                        Math.min(
                          lot.quantity_available,
                          parseInt(e.target.value) || 0,
                        ),
                      )
                      setAllocateQtys({
                        ...allocateQtys,
                        [lot.lot_id]: val,
                      })
                    }}
                    onFocus={(e) => {
                      if (!allocateQty) {
                        const autoFill = Math.min(
                          lot.quantity_available,
                          remaining,
                        )
                        setAllocateQtys({
                          ...allocateQtys,
                          [lot.lot_id]: autoFill,
                        })
                      }
                    }}
                    disabled={isFullyAllocated}
                    error={wouldExceed}
                    helperText={
                      wouldExceed
                        ? `Would exceed order quantity (${orderQuantity})`
                        : undefined
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          / {lot.quantity_available}
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 120 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    aria-label={`Allocate from ${lot.location?.name || "lot"}`}
                    disabled={
                      allocateQty === 0 || wouldExceed || isFullyAllocated
                    }
                    onClick={() => {
                      onAllocate(lot.lot_id, listingId, allocateQty)
                      setAllocateQtys({
                        ...allocateQtys,
                        [lot.lot_id]: 0,
                      })
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
    </Box>
  )
}

function AllocationTarget({
  listingId,
  spectrumId,
  listingData,
  required,
  allocated,
  allocations,
  onDeallocate,
}: {
  listingId: string
  spectrumId: string
  listingData?: AllocationListingData | null
  required: number
  allocated: number
  allocations: Allocation[]
  onDeallocate: (
    allocationId: string,
    lotId: string,
    listingId: string,
    currentQuantity: number,
    amountToRemove: number,
  ) => void
}) {
  const [deallocateQtys, setDeallocateQtys] = React.useState<
    Record<string, number>
  >({})
  const { data: lotsData } = useListingLots(listingId, spectrumId)
  const title = getListingTitle(listingData, lotsData?.lots)
  const image = getListingImage(listingData, lotsData?.lots)

  const isComplete = allocated >= required

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Avatar
          src={image}
          sx={{ width: 32, height: 32, borderRadius: 1 }}
          variant="rounded"
        >
          <InventoryRounded />
        </Avatar>
        <Link
          href={MARKET_PATHS.listing(listingId)}
          target="_blank"
          underline="hover"
        >
          <Typography variant="h6">{title}</Typography>
        </Link>
        <Chip
          label={`${allocated} / ${required}`}
          color={isComplete ? "success" : "warning"}
          size="small"
        />
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={50}></TableCell>
            <TableCell width={120}>Quantity</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allocations.map((alloc) => {
            const deallocateQty = deallocateQtys[alloc.allocation_id] || 0
            return (
              <TableRow key={alloc.allocation_id}>
                <TableCell>
                  <IconButton
                    size="small"
                    aria-label="Deallocate"
                    disabled={deallocateQty === 0}
                    onClick={() => {
                      onDeallocate(
                        alloc.allocation_id,
                        alloc.lot_id,
                        listingId,
                        alloc.quantity,
                        deallocateQty,
                      )
                      setDeallocateQtys((prev) => ({
                        ...prev,
                        [alloc.allocation_id]: 0,
                      }))
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    inputMode="numeric"
                    value={deallocateQty || ""}
                    onChange={(e) => {
                      const val = Math.max(
                        0,
                        Math.min(alloc.quantity, parseInt(e.target.value) || 0),
                      )
                      setDeallocateQtys((prev) => ({
                        ...prev,
                        [alloc.allocation_id]: val,
                      }))
                    }}
                    onFocus={(e) => {
                      if (!deallocateQty) {
                        setDeallocateQtys((prev) => ({
                          ...prev,
                          [alloc.allocation_id]: alloc.quantity,
                        }))
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          / {alloc.quantity}
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 120 }}
                  />
                </TableCell>
                <TableCell>{alloc.lot?.location?.name || "Unknown"}</TableCell>
                <TableCell>
                  {alloc.lot?.owner ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={alloc.lot.owner.avatar || undefined}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {alloc.lot.owner.display_name ||
                          alloc.lot.owner.username}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}

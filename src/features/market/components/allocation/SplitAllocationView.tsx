/**
 * SplitAllocationView Component
 *
 * Two-panel allocation interface:
 * - Left: Available lots with quantity inputs
 * - Right: Allocation targets showing required vs allocated
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
} from "@mui/material"
import {
  ArrowForwardRounded,
  ArrowBackRounded,
  InventoryRounded,
} from "@mui/icons-material"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  useGetListingLotsQuery,
  useManualAllocateOrderMutation,
  useGetOrderAllocationsQuery,
  ManualAllocationInput,
  Allocation,
  StockLot,
} from "../../../../store/api/stockLotsApi"
import { useGetMarketListingQuery } from "../../api/marketApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

interface ListingAllocation {
  listing_id: string
  quantity: number
}

interface SplitAllocationViewProps {
  orderId: string
  listings: ListingAllocation[]
}

interface StockLotWithAvailable extends StockLot {
  quantity_available: number
  location?: { name: string }
}

function getListingTitle(listingData: any): string {
  return listingData?.details?.title || listingData?.title || "Item"
}

function getListingImage(listingData: any): string | undefined {
  return listingData?.photos?.[0]
}

export function SplitAllocationView({
  orderId,
  listings,
}: SplitAllocationViewProps) {
  const [pendingAllocations, setPendingAllocations] = useState<
    Map<string, { lot_id: string; listing_id: string; quantity: number }>
  >(new Map())
  const issueAlert = useAlertHook()

  const { data: allocationsData } = useGetOrderAllocationsQuery({
    order_id: orderId,
  })

  const [manualAllocate, { isLoading: allocating }] =
    useManualAllocateOrderMutation()

  const groupedAllocations = allocationsData?.grouped_allocations || []

  // Create a map of listing_id to allocated quantity
  const allocationsByListing = useMemo(() => {
    const map = new Map<string, number>()
    groupedAllocations.forEach((group) => {
      map.set(group.listing_id, group.total_allocated)
    })
    return map
  }, [groupedAllocations])

  const handleAllocate = async () => {
    const allocationsToCreate: ManualAllocationInput[] = Array.from(
      pendingAllocations.values(),
    ).filter((alloc) => alloc.quantity > 0)

    if (allocationsToCreate.length === 0) return

    // Validate we're not over-allocating
    for (const listing of listings) {
      const currentAllocated = allocationsByListing.get(listing.listing_id) || 0
      const pendingForListing = allocationsToCreate
        .filter((a) => a.listing_id === listing.listing_id)
        .reduce((sum, a) => sum + a.quantity, 0)

      if (currentAllocated + pendingForListing > listing.quantity) {
        issueAlert({
          severity: "error",
          message: `Cannot allocate ${currentAllocated + pendingForListing} units - order only needs ${listing.quantity}`,
        })
        return
      }
    }

    try {
      await manualAllocate({
        order_id: orderId,
        allocations: allocationsToCreate,
      }).unwrap()
      setPendingAllocations(new Map())
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
                    listingData={group?.listing}
                    pendingAllocations={pendingAllocations}
                    setPendingAllocations={setPendingAllocations}
                    allocations={group?.allocations || []}
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
                    listingData={group?.listing}
                    required={listing.quantity}
                    allocated={
                      allocationsByListing.get(listing.listing_id) || 0
                    }
                    allocations={group?.allocations || []}
                  />
                )
              })}
              <LoadingButton
                variant="contained"
                onClick={handleAllocate}
                loading={allocating}
                disabled={pendingAllocations.size === 0}
                fullWidth
              >
                Allocate Stock
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

function AvailableLots({
  listingId,
  listingData,
  pendingAllocations,
  setPendingAllocations,
  allocations,
}: {
  listingId: string
  listingData?: any
  pendingAllocations: Map<
    string,
    { lot_id: string; listing_id: string; quantity: number }
  >
  setPendingAllocations: (
    map: Map<string, { lot_id: string; listing_id: string; quantity: number }>,
  ) => void
  allocations: Allocation[]
}) {
  const { data: lotsData } = useGetListingLotsQuery({
    listing_id: listingId,
    listed: true,
  })

  const allocatedByLot = useMemo(() => {
    const map = new Map<string, number>()
    allocations.forEach((alloc) => {
      const current = map.get(alloc.lot_id) || 0
      map.set(alloc.lot_id, current + alloc.quantity)
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

  const title = getListingTitle(lotsData?.listing || listingData)
  const image = getListingImage(lotsData?.listing || listingData)

  if (lots.length === 0) return null

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={image}
              sx={{ width: 32, height: 32, borderRadius: 1 }}
              variant="rounded"
            >
              <InventoryRounded />
            </Avatar>
            <Typography variant="subtitle2">{title}</Typography>
          </Stack>
          {lots.map((lot) => (
            <Stack
              key={lot.lot_id}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Typography variant="caption" sx={{ minWidth: 80 }}>
                {lot.location?.name || "Unspecified"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({lot.quantity_available} avail)
              </Typography>
              <TextField
                size="small"
                type="number"
                value={pendingAllocations.get(lot.lot_id)?.quantity || ""}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 0
                  const newMap = new Map(pendingAllocations)
                  if (qty > 0 && qty <= lot.quantity_available) {
                    newMap.set(lot.lot_id, {
                      lot_id: lot.lot_id,
                      listing_id: listingId,
                      quantity: qty,
                    })
                  } else {
                    newMap.delete(lot.lot_id)
                  }
                  setPendingAllocations(newMap)
                }}
                inputProps={{ min: 0, max: lot.quantity_available }}
                sx={{ width: 80 }}
              />
              <IconButton size="small" disabled>
                <ArrowForwardRounded fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

function AllocationTarget({
  listingId,
  listingData,
  required,
  allocated,
  allocations,
}: {
  listingId: string
  listingData?: any
  required: number
  allocated: number
  allocations: Allocation[]
}) {
  const title = getListingTitle(listingData)
  const image = getListingImage(listingData)

  const isComplete = allocated >= required

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={image}
              sx={{ width: 32, height: 32, borderRadius: 1 }}
              variant="rounded"
            >
              <InventoryRounded />
            </Avatar>
            <Typography variant="subtitle2">{title}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Required:
            </Typography>
            <Chip
              label={`${allocated} / ${required}`}
              color={isComplete ? "success" : "warning"}
              size="small"
            />
          </Stack>
          {allocations.map((alloc) => (
            <Stack
              key={alloc.allocation_id}
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="caption">
                {alloc.lot?.location?.name || "Unspecified"}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption">{alloc.quantity}</Typography>
                <IconButton size="small" disabled>
                  <ArrowBackRounded fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

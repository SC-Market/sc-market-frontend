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
    try {
      await manualAllocate({
        order_id: orderId,
        allocations: [{ lot_id: lotId, listing_id: listingId, quantity }],
      }).unwrap()
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
    } catch (error: any) {
      issueAlert({
        severity: "error",
        message: error?.data?.message || "Failed to update allocation",
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
                    allocations={group?.allocations || []}
                    onAllocate={handleAllocate}
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
  listingData,
  allocations,
  onAllocate,
}: {
  listingId: string
  listingData?: any
  allocations: Allocation[]
  onAllocate: (lotId: string, listingId: string, quantity: number) => void
}) {
  const [allocateQtys, setAllocateQtys] = React.useState<Record<string, number>>(
    {},
  )
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
          href={`/market/listing/${listingId}`}
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
            <TableCell width={120}>Quantity</TableCell>
            <TableCell width={50}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lots.map((lot) => {
            const allocateQty = allocateQtys[lot.lot_id] || 0
            return (
              <TableRow key={lot.lot_id}>
                <TableCell>{lot.location?.name || "Unknown"}</TableCell>
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
                      setAllocateQtys((prev) => ({
                        ...prev,
                        [lot.lot_id]: val,
                      }))
                    }}
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
                    disabled={allocateQty === 0}
                    onClick={() => {
                      onAllocate(lot.lot_id, listingId, allocateQty)
                      setAllocateQtys((prev) => ({
                        ...prev,
                        [lot.lot_id]: 0,
                      }))
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
  listingData,
  required,
  allocated,
  allocations,
  onDeallocate,
}: {
  listingId: string
  listingData?: any
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
  const title = getListingTitle(listingData)
  const image = getListingImage(listingData)

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
          href={`/market/listing/${listingId}`}
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}

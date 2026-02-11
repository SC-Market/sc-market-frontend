/**
 * SplitAllocationView Component
 *
 * Two-panel allocation interface:
 * - Left: Available lots with quantity inputs
 * - Right: Allocation targets showing required vs allocated
 */

import React, { useState, useMemo } from "react"
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
import ThemeOptions from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/Paper';
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
  owner?: {
    user_id: string
    username: string
    display_name: string
    avatar: string | null
  } | null
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
  orderQuantity,
  currentAllocated,
  allocateQtys,
  setAllocateQtys,
}: {
  listingId: string
  listingData?: any
  allocations: Allocation[]
  onAllocate: (lotId: string, listingId: string, quantity: number) => void
  orderQuantity: number
  currentAllocated: number
  allocateQtys: Record<string, number>
  setAllocateQtys: (qtys: Record<string, number>) => void
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

  const title = getListingTitle(listingData)
  const image = getListingImage(listingData)

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
        <MaterialLink
          href={`/market/listing/${listingId}`}
          target="_blank"
          underline="hover"
        >
          <Typography variant="h6">{title}</Typography>
        </MaterialLink>
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
                        src={lot.owner.avatar || undefined}
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
        <MaterialLink
          href={`/market/listing/${listingId}`}
          target="_blank"
          underline="hover"
        >
          <Typography variant="h6">{title}</Typography>
        </MaterialLink>
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

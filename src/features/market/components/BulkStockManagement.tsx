/**
 * Bulk Stock Management Component
 *
 * Allows managing stock quantities across multiple listings at once
 */

import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { UniqueListing } from "../domain/types"
import { useUpdateListingQuantityMutation } from "../api/marketApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { Link } from "react-router-dom"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';

export interface BulkStockManagementProps {
  listings: UniqueListing[]
  onRefresh?: () => void
}

export function BulkStockManagement({
  listings,
  onRefresh,
}: BulkStockManagementProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [updateQuantity] = useUpdateListingQuantityMutation()
  const issueAlert = useAlertHook()

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const handleQuantityChange = (listingId: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [listingId]: Math.max(0, newQuantity),
    }))
  }

  const handleSave = async (listing: UniqueListing) => {
    const newQuantity = quantities[listing.listing.listing_id]
    if (
      newQuantity === undefined ||
      newQuantity === listing.listing.quantity_available
    ) {
      return
    }

    setSaving((prev) => ({ ...prev, [listing.listing.listing_id]: true }))

    try {
      await updateQuantity({
        listing_id: listing.listing.listing_id,
        quantity: newQuantity,
      }).unwrap()

      issueAlert({
        message: t("ItemStock.updated"),
        severity: "success",
      })

      // Clear the pending change
      setQuantities((prev) => {
        const next = { ...prev }
        delete next[listing.listing.listing_id]
        return next
      })

      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      issueAlert(error as any)
    } finally {
      setSaving((prev) => ({ ...prev, [listing.listing.listing_id]: false }))
    }
  }

  const handleQuickUpdate = async (listing: UniqueListing, delta: number) => {
    const currentQty = listing.listing.quantity_available
    const newQuantity = Math.max(0, currentQty + delta)

    setSaving((prev) => ({ ...prev, [listing.listing.listing_id]: true }))

    try {
      await updateQuantity({
        listing_id: listing.listing.listing_id,
        quantity: newQuantity,
      }).unwrap()

      issueAlert({
        message: t("ItemStock.updated"),
        severity: "success",
      })

      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      issueAlert(error as any)
    } finally {
      setSaving((prev) => ({ ...prev, [listing.listing.listing_id]: false }))
    }
  }

  if (listings.length === 0) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="body1" color="text.secondary" align="center">
          {t(
            "ItemStock.noListings",
            "No listings found. Create your first listing to get started.",
          )}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        {t("ItemStock.bulkStockManagement", "Quick Stock Updates")}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {listings.map((listing) => {
          const listingId = listing.listing.listing_id
          const currentQty = listing.listing.quantity_available
          const pendingQty = quantities[listingId]
          const hasChanges =
            pendingQty !== undefined && pendingQty !== currentQty
          const isSaving = saving[listingId]

          return (
            <Paper
              key={listingId}
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: hasChanges ? "action.hover" : "background.paper",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                {/* Item info */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <Avatar
                    src={listing.photos[0]}
                    variant="rounded"
                    sx={{ width: 48, height: 48 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" noWrap>
                      {listing.details.title}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`${currentQty.toLocaleString()} ${t("ItemStock.inStock", "in stock")}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${listing.listing.price.toLocaleString()} aUEC`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Stack>

                {/* Stock controls */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ flexShrink: 0 }}
                >
                  {/* Quick buttons */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleQuickUpdate(listing, -1)}
                    disabled={isSaving || currentQty === 0}
                  >
                    <RemoveRounded />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleQuickUpdate(listing, -currentQty)}
                    disabled={isSaving || currentQty === 0}
                  >
                    0
                  </IconButton>

                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleQuickUpdate(listing, 1)}
                    disabled={isSaving}
                  >
                    <AddRounded />
                  </IconButton>

                  {/* Manual input */}
                  <TextField
                    type="number"
                    size="small"
                    value={pendingQty ?? currentQty}
                    onChange={(e) =>
                      handleQuantityChange(
                        listingId,
                        parseInt(e.target.value) || 0,
                      )
                    }
                    disabled={isSaving}
                    sx={{ width: 80 }}
                    inputProps={{ min: 0 }}
                  />

                  {/* Save button */}
                  {hasChanges && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleSave(listing)}
                      disabled={isSaving}
                    >
                      <SaveRounded />
                    </IconButton>
                  )}

                  {/* Advanced stock management link */}
                  <IconButton
                    size="small"
                    component={Link}
                    to={`/market/stock/${listingId}`}
                    sx={{ ml: 1 }}
                  >
                    <InventoryRounded />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          )
        })}
      </Stack>
    </Paper>
  )
}

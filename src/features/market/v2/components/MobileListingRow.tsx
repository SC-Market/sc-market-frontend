/**
 * MobileListingRow — compact list-style row for mobile manage pages.
 *
 * Replaces the 400px grid cards on mobile with a dense row that shows:
 *   thumbnail | name + status chip | price · qty · variants | relative time | edit btn
 *
 * Swipe right → open quick-edit sheet
 * Swipe left  → archive (with confirmation in parent)
 * Tap row     → navigate to listing detail
 * Tap ✎ btn   → open quick-edit sheet
 */

import React, { useCallback } from "react"
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import {
  ArchiveRounded,
  ChevronRightRounded,
  EditRounded,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { SwipeableItem } from "../../../../components/gestures"
import { type MyListingItem } from "../../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { getRelativeTime } from "../../../../util/time"

interface MobileListingRowProps {
  listing: MyListingItem
  onEdit: (listing: MyListingItem) => void
  /** When provided, swipe-left reveals an Archive action */
  onArchive?: (listing: MyListingItem) => void
}

export function MobileListingRow({
  listing,
  onEdit,
  onArchive,
}: MobileListingRowProps) {
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()

  const handleRowClick = useCallback(
    () => navigate(`/market/${listing.listing_id}`),
    [navigate, listing.listing_id],
  )

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onEdit(listing)
    },
    [onEdit, listing],
  )

  const priceLabel =
    listing.price_min === listing.price_max
      ? `${listing.price_min.toLocaleString()} aUEC`
      : `${listing.price_min.toLocaleString()}–${listing.price_max.toLocaleString()} aUEC`

  const statusColor =
    listing.status === "active"
      ? "success"
      : listing.status === "inactive" || listing.status === "expired"
        ? "warning"
        : "default"

  // Left accent bar colour mirrors status
  const accentColor =
    listing.status === "active"
      ? theme.palette.success.main
      : listing.status === "inactive" || listing.status === "expired"
        ? theme.palette.warning.main
        : theme.palette.secondary.main

  return (
    <SwipeableItem
      onSwipeRight={() => onEdit(listing)}
      onSwipeLeft={onArchive ? () => onArchive(listing) : undefined}
      leftAction={
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "secondary.main" }}
        >
          <EditRounded fontSize="small" />
          <Typography variant="caption">Edit</Typography>
        </Box>
      }
      rightAction={
        onArchive ? (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "error.main" }}
          >
            <ArchiveRounded fontSize="small" />
            <Typography variant="caption">Archive</Typography>
          </Box>
        ) : undefined
      }
      threshold={80}
    >
      <Box
        onClick={handleRowClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: "pointer",
          position: "relative",
          bgcolor: "background.default",
          "&:active": { bgcolor: "action.hover" },
          // Status accent bar on the left edge
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: 3,
            borderRadius: 1,
            bgcolor: accentColor,
          },
        }}
      >
        <Avatar
          src={listing.photo || FALLBACK_IMAGE_URL}
          variant="rounded"
          sx={{ width: 48, height: 48, flexShrink: 0, ml: 0.5 }}
          imgProps={{ loading: "lazy" }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              noWrap
              sx={{ flex: 1, minWidth: 0 }}
            >
              {listing.title}
            </Typography>
            <Chip
              label={listing.status.toUpperCase()}
              color={statusColor as "success" | "warning" | "default"}
              size="small"
              sx={{ flexShrink: 0, height: 18, fontSize: "0.65rem" }}
            />
          </Box>

          {/* Meta row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="caption" fontWeight={600} color="primary.main">
              {priceLabel}
            </Typography>
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Typography variant="caption" color="text.secondary">
              Qty {listing.quantity_available.toLocaleString()}
            </Typography>
            {listing.variant_count > 1 && (
              <>
                <Typography variant="caption" color="text.disabled">·</Typography>
                <Typography variant="caption" color="text.disabled">
                  {listing.variant_count} var.
                </Typography>
              </>
            )}
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ ml: "auto", flexShrink: 0 }}
            >
              {getRelativeTime(new Date(listing.updated_at))}
            </Typography>
          </Box>
        </Box>

        {/* Action column */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          {listing.status !== "cancelled" && (
            <IconButton
              size="small"
              onClick={handleEditClick}
              aria-label="Quick edit"
              sx={{
                width: 36,
                height: 36,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
              }}
            >
              <EditRounded sx={{ fontSize: 16 }} />
            </IconButton>
          )}
          <ChevronRightRounded sx={{ fontSize: 16, color: "text.disabled" }} />
        </Box>
      </Box>
      <Divider />
    </SwipeableItem>
  )
}

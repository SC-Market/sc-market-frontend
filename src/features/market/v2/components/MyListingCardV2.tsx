/**
 * MyListingCardV2 — Card for a single listing in the My Listings grid.
 *
 * Matches V1 ItemListingBase card style (Fade animation, hover translateY,
 * minHeight, etc.) while displaying V2-specific data (variant count,
 * quality tier range, price range).
 */

import React, { useCallback, useMemo } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  Fade,
} from "@mui/material"
import { ImageAvatar } from "../../../../components/avatar/ImageAvatar"
import { useTheme } from "@mui/material/styles"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { EditRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import type { MyListingItem } from "../../../../store/api/v2/market"
import { MISSING_IMAGE_URL } from "../../../../util/constants"
import { formatMarketUrl } from "../../domain/urls"
import { MARKET_PATHS } from "../../../../routes/paths"
import { listingStatusLabel } from "../../domain/listingStatus"
import { useFormatters, useNow } from "../../../../util/format"

interface MyListingCardV2Props {
  listing: MyListingItem
  index: number
}

export function MyListingCardV2({ listing, index }: MyListingCardV2Props) {
  const fmt = useFormatters()
  const now = useNow()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const priceRange = useMemo(() => {
    if (listing.price_min === listing.price_max) {
      return `${fmt.number(listing.price_min)} aUEC`
    }
    return `${fmt.number(listing.price_min)} - ${fmt.number(listing.price_max)} aUEC`
  }, [listing.price_min, listing.price_max, fmt])

  const qualityRange = useMemo(() => {
    if (!listing.quality_tier_min || !listing.quality_tier_max) return null
    if (listing.quality_tier_min === listing.quality_tier_max) {
      return `Tier ${listing.quality_tier_min}`
    }
    return `Tier ${listing.quality_tier_min}-${listing.quality_tier_max}`
  }, [listing.quality_tier_min, listing.quality_tier_max])

  const statusColor = (
    s: string,
  ): "success" | "info" | "warning" | "error" | "default" => {
    switch (s.toLowerCase()) {
      case "active":
        return "success"
      case "sold":
        return "info"
      case "expired":
        return "warning"
      case "cancelled":
        return "error"
      default:
        return "default"
    }
  }

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      navigate(MARKET_PATHS.edit(listing.listing_id))
    },
    [navigate, listing.listing_id],
  )

  return (
    <Fade in timeout={500} style={{ transitionDelay: `${50 + 50 * index}ms` }}>
      <Card
        component={RouterLink}
        to={formatMarketUrl(listing)}
        sx={{
          minHeight: 400,
          padding: 3,
          cursor: "pointer",
          textDecoration: "none",
          color: "inherit",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8],
          },
          position: "relative",
        }}
      >
        <CardContent sx={{ padding: 0 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Chip
                  label={listingStatusLabel(listing.status, t).toUpperCase()}
                  color={statusColor(listing.status)}
                  size="small"
                />
                {listing.visibility === "private" && (
                  <Chip
                    label={t("market.internalListing")}
                    color="warning"
                    size="small"
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                    }}
                  />
                )}
              </Box>
              <Button
                size="small"
                startIcon={<EditRounded />}
                onClick={handleEditClick}
                sx={{ minWidth: "auto" }}
              >
                {t("myListings.edit", "Edit")}
              </Button>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ImageAvatar
                alt=""
                src={listing.photo || MISSING_IMAGE_URL}
                variant="rounded"
                sx={{ width: 48, height: 48, flexShrink: 0 }}
                imgProps={{ loading: "lazy" }}
              />
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {listing.title}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.variants", "Variants")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {t("marketV2.variantCount", { count: listing.variant_count })}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.quantity", "Total Quantity")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {fmt.number(listing.quantity_available)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.priceRange", "Price Range")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {priceRange}
              </Typography>
            </Box>

            {qualityRange && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("myListings.qualityRange", "Quality Range")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {qualityRange}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.created", "Created")}
              </Typography>
              <Typography variant="body2">
                {fmt.relative(new Date(listing.created_at), now)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.updated", "Last Updated")}
              </Typography>
              <Typography variant="body2">
                {fmt.relative(new Date(listing.updated_at), now)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  )
}

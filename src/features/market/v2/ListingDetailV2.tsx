import React, { useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Stack,
  Chip,
  Grid,
  useMediaQuery,
  CardMedia,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, Link as RouterLink } from "react-router-dom";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout";
import { useGetListingDetailQuery, useAddToCartMutation, useTrackViewMutation } from "../../../store/api/v2/market";
import { VariantBreakdown } from "../../../components/market/v2/VariantBreakdown";
import { QualityBadge } from "../../../components/market/v2/QualityBadge";
import { UnderlineLink } from "../../../components/typography/UnderlineLink";
import { FALLBACK_IMAGE_URL } from "../../../util/constants";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useTranslation } from "react-i18next"
import { formatQuantity } from "../../../util/formatQuantity";
import { useAlertHook } from "../../../hooks/alert/AlertHook";

/**
 * ListingDetailV2 - Detailed view of V2 listing with variant breakdown
 * 
 * Displays:
 * - Listing metadata with seller information
 * - Image gallery with CardMedia and FALLBACK_IMAGE_URL
 * - VariantBreakdown component showing all variants with attributes, quantities, prices
 * - Quality tier with QualityBadge visual indicators
 * - Location information for stock lots
 * - Crafted_by information if applicable
 * 
 * Reuses:
 * - StandardPageLayout for page structure
 * - UnderlineLink for seller name
 * - QualityBadge for quality tier display
 * - VariantBreakdown for variant table
 * 
 * Maintains identical typography and button variants to V1.
 */
export function ListingDetailV2() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme<ExtendedTheme>();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch listing details using RTK Query
  const {
    data: listingData,
    isLoading,
    error,
  } = useGetListingDetailQuery({ id: id! });

  const [addToCart] = useAddToCartMutation();
  const [trackView] = useTrackViewMutation();
  const issueAlert = useAlertHook();

  // Track view on page load
  useEffect(() => {
    if (id) { trackView({ id }).catch(() => {}) }
  }, [id, trackView]);

  // Compute quality tier range from variants
  const qualityTierRange = useMemo(() => {
    if (!listingData?.items) return null;

    const allVariants = listingData.items.flatMap((item) => item.variants);
    const qualityTiers = allVariants
      .map((v) => v.attributes.quality_tier)
      .filter((tier): tier is number => tier !== undefined && tier !== null);

    if (qualityTiers.length === 0) return null;

    const min = Math.min(...qualityTiers);
    const max = Math.max(...qualityTiers);

    return { min, max };
  }, [listingData]);

  // Compute price range from variants
  const priceRange = useMemo(() => {
    if (!listingData?.items) return null;

    const allVariants = listingData.items.flatMap((item) => item.variants);
    const prices = allVariants.map((v) => v.price);

    if (prices.length === 0) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return { min, max };
  }, [listingData]);

  // Compute total quantity available
  const totalQuantity = useMemo(() => {
    if (!listingData?.items) return 0;

    return listingData.items
      .flatMap((item) => item.variants)
      .reduce((sum, variant) => sum + variant.quantity, 0);
  }, [listingData]);

  return (
    <StandardPageLayout
      title={listingData?.listing.title || "Listing Details"}
      isLoading={isLoading}
      error={error ? "not_found" : undefined}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {listingData && (
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* Image Gallery Section */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 0.375),
                overflow: "hidden",
              }}
            >
              <CardMedia
                component="img"
                image={FALLBACK_IMAGE_URL}
                alt={listingData.listing.title}
                sx={{
                  width: "100%",
                  height: { xs: 250, sm: 400 },
                  objectFit: "cover",
                }}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = FALLBACK_IMAGE_URL;
                }}
              />
            </Paper>
          </Grid>

          {/* Listing Info Section */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {/* Title */}
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {listingData.listing.title}
              </Typography>

              {/* Quality Tier Range */}
              {qualityTierRange && (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quality:
                  </Typography>
                  {qualityTierRange.min === qualityTierRange.max ? (
                    <QualityBadge tier={qualityTierRange.min} />
                  ) : (
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                      <QualityBadge tier={qualityTierRange.min} />
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                      <QualityBadge tier={qualityTierRange.max} />
                    </Box>
                  )}
                </Box>
              )}

              {/* Price Range */}
              {priceRange && (
                <Box>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {priceRange.min === priceRange.max
                      ? `${priceRange.min.toLocaleString()} aUEC`
                      : `${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()} aUEC`}
                  </Typography>
                </Box>
              )}

              {/* Quantity Available */}
              <Typography variant="subtitle2" color="text.primary">
                {formatQuantity(totalQuantity, listingData.listing.quantity_unit)} {t("listing.available", "available")}
              </Typography>

              <Divider />

              {/* Seller Information */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t("listing.seller", "Seller")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RouterLink
                    to={`/${listingData.seller.type === "contractor" ? "contractor" : "user"}/${listingData.seller.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <UnderlineLink variant="subtitle1" color="text.primary">
                      {listingData.seller.name}
                    </UnderlineLink>
                  </RouterLink>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                    <StarRoundedIcon
                      sx={{ fontSize: "1rem", color: theme.palette.warning.main }}
                    />
                    <Typography variant="subtitle2" color="text.secondary">
                      {listingData.seller.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Status Badges */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {listingData.listing.status !== "active" && (
                  <Chip
                    label={listingData.listing.status.toUpperCase()}
                    color="default"
                    size="small"
                    sx={{ textTransform: "uppercase", fontWeight: "bold" }}
                  />
                )}
                {listingData.listing.visibility === "private" && (
                  <Chip
                    label="PRIVATE LISTING"
                    color="warning"
                    size="small"
                    sx={{ textTransform: "uppercase", fontWeight: "bold" }}
                  />
                )}
                {totalQuantity === 0 && (
                  <Chip
                    label="OUT OF STOCK"
                    color="error"
                    size="small"
                    sx={{ textTransform: "uppercase", fontWeight: "bold" }}
                  />
                )}
              </Box>

              {/* Listing Metadata */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("listing.created", "Created")}{" "}
                  {new Date(listingData.listing.created_at).toLocaleDateString()}
                </Typography>
                {listingData.listing.updated_at !== listingData.listing.created_at && (
                  <>
                    {" • "}
                    <Typography variant="caption" color="text.secondary">
                      {t("listing.updated", "Updated")}{" "}
                      {new Date(listingData.listing.updated_at).toLocaleDateString()}
                    </Typography>
                  </>
                )}
                {listingData.listing.pickup_method && (
                  <>
                    {" • "}
                    <Chip
                      size="small"
                      variant="outlined"
                      label={
                        listingData.listing.pickup_method === "delivery"
                          ? t("listing.delivery", "Delivery")
                          : listingData.listing.pickup_method === "pickup"
                            ? t("listing.pickup", "Pickup")
                            : t("listing.deliveryOrPickup", "Delivery or Pickup")
                      }
                    />
                  </>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Description Section */}
          {listingData.listing.description && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 0.375),
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  {t("listing.description", "Description")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {listingData.listing.description}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Variant Breakdown Section */}
          {listingData.items.map((item) => (
            <Grid item xs={12} key={item.item_id}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 0.375),
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  {item.game_item.name}
                </Typography>

                {item.variants.length > 0 ? (
                  <VariantBreakdown
                    variants={item.variants}
                    showActions={listingData.listing.status === "active"}
                    onSelectVariant={async (variantId) => {
                      try {
                        await addToCart({
                          addToCartRequest: {
                            listing_id: id!,
                            variant_id: variantId,
                            quantity: 1,
                          },
                        }).unwrap();
                        issueAlert({ message: t("cart.added", "Added to cart"), severity: "success" });
                      } catch (err) {
                        issueAlert({ message: err instanceof Error ? err.message : "Failed to add to cart", severity: "error" });
                      }
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("listing.noVariants", "No variants available")}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </StandardPageLayout>
  );
}

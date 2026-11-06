import { useMemo, useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../../components/avatar/ImageAvatar"
import Grid from "@mui/material/Grid2"
import GavelRounded from "@mui/icons-material/GavelRounded"
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded"
import { Link as RouterLink, useParams } from "react-router-dom"
import { Helmet } from "@unhead/react/helmet"
import { useTranslation } from "react-i18next"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { useGetListingDetailQuery } from "../../../../store/api/v2/market"
import type {
  VariantDetail,
  ListingItemDetail,
} from "../../../../store/api/v2/market"
import { SHOP_PATHS } from "../../../../routes/paths"
import { usePageReady } from "../../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../../components/metadata/pageReadyStore"
import { useFormatters } from "../../../../util/format"
import { useAddToCart, useBuyNow } from "../../hooks/useCartActions"
import { NUMERIC_SX } from "../../../../hooks/styles/theme/fonts"
import { ListingPhotoGallery } from "./ListingPhotoGallery"
import { AuctionPanel, ListingBuyBox } from "./ListingBuyBox"

/**
 * ListingDetailRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). An eBay-style single-seller offer page:
 * item photos, shop + rating, price, a "buy N of M" quantity selector with a
 * live subtotal, and Buy / Add to cart actions that flow into the EXISTING
 * offers/orders pipeline (MARKET_V2_RESEARCH.md §11.6.1).
 *
 * Works for fungible items, per-instance non-fungible items, and bundles
 * (component items rendered as a set; quantity = number of sets). Auctions show
 * a bid panel instead of the buy box. All "contract / all-or-nothing / immutable"
 * language is intentionally dropped (§11.3).
 */

export function ListingDetailRedesign() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const {
    data,
    isLoading,
    error,
    isFetching: pageIsFetching,
    currentData: pageCurrentData,
  } = useGetListingDetailQuery({ id: id! }, { skip: !id })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({
      isLoading,
      isFetching: pageIsFetching,
      currentData: pageCurrentData,
    }),
  )

  const { add: addToCart, isAdding } = useAddToCart()
  const { buy, isBuying } = useBuyNow()

  const listing = data?.listing
  const seller = data?.seller
  const items: ListingItemDetail[] = useMemo(() => data?.items ?? [], [data])
  const isBundle =
    (listing?.listing_type ?? "single") === "bundle" || items.length > 1
  const isAuction = listing?.sale_type === "auction"
  const isNegotiable = listing?.sale_type === "negotiable"

  // All variants across all items (a bundle has several items, each 1 variant
  // in practice; a fungible listing has one item with several quality variants).
  const allVariants: VariantDetail[] = useMemo(
    () => items.flatMap((i) => i.variants),
    [items],
  )

  // The buyer selects which variant (quality option) they're buying. Default to
  // the cheapest available so the subtotal is meaningful immediately.
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  )
  const selectedVariant: VariantDetail | undefined = useMemo(() => {
    if (selectedVariantId)
      return allVariants.find((v) => v.variant_id === selectedVariantId)
    return [...allVariants].sort((a, b) => a.price - b.price)[0]
  }, [allVariants, selectedVariantId])

  const photos = listing?.photos?.length ? listing.photos : [FALLBACK_IMAGE_URL]

  // For a bundle the "unit" is the set: quantity available = min set count the
  // seller can assemble (bounded by the scarcest component). Phase 0: visual only
  // — the backend doesn't yet model bundle set-stock, so we derive it client-side.
  const setsAvailable = useMemo(() => {
    if (!isBundle) return selectedVariant?.quantity ?? 0
    const perItem = items.map((i) =>
      i.variants.reduce((s, v) => s + v.quantity, 0),
    )
    return perItem.length ? Math.min(...perItem) : 0
  }, [isBundle, items, selectedVariant])

  const maxQty = isBundle ? setsAvailable : (selectedVariant?.quantity ?? 0)
  const minOrder = listing?.min_order_quantity ?? 1
  const maxOrder = listing?.max_order_quantity ?? undefined

  const [qty, setQty] = useState(1)
  const clampedMax = Math.max(
    1,
    Math.min(maxQty || 1, maxOrder ?? Number.POSITIVE_INFINITY),
  )
  const effectiveQty = Math.min(Math.max(qty, minOrder), clampedMax)

  const unitPrice = isBundle
    ? items.reduce((s, i) => s + (i.base_price ?? i.variants[0]?.price ?? 0), 0)
    : (selectedVariant?.price ?? 0)
  const subtotal = unitPrice * effectiveQty

  const priceRange = useMemo(() => {
    if (!allVariants.length) return null
    const prices = allVariants.map((v) => v.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [allVariants])

  const quantityUnitLabel =
    listing?.quantity_unit === "scu"
      ? t("MarketDetailRedesign.unitScu", "cSCU")
      : t("MarketDetailRedesign.unit", "units")

  const canTransact = !!listing && listing.status === "active" && maxQty > 0

  const handleAddToCart = async () => {
    if (!listing || !selectedVariant) return
    await addToCart(
      {
        listing_id: listing.listing_id,
        variant_id: selectedVariant.variant_id,
        quantity: effectiveQty,
      },
      t("MarketDetailRedesign.addedToCart", "Added to cart"),
    )
  }

  const handleBuyNow = async () => {
    if (!listing || !selectedVariant) return
    await buy({
      listing_id: listing.listing_id,
      variant_id: selectedVariant.variant_id,
      quantity: effectiveQty,
    })
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography sx={{ color: "text.primary", textAlign: "center" }}>
          {t("MarketDetailRedesign.loading", "Loading listing…")}
        </Typography>
      </Container>
    )
  }

  if (error || !listing || !seller) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography sx={{ color: "error.main", textAlign: "center" }}>
          {t("MarketDetailRedesign.error", "Failed to load this listing.")}
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Helmet>
        <title>{listing.title} — SC Market</title>
      </Helmet>

      <Grid container spacing={3}>
        {/* Photos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ListingPhotoGallery photos={photos} title={listing.title} />
        </Grid>

        {/* Offer detail */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1 }}
                flexWrap="wrap"
                useFlexGap
              >
                {items[0]?.game_item?.type && (
                  <Chip
                    label={items[0].game_item.type}
                    size="small"
                    variant="outlined"
                    sx={{ color: "text.primary" }}
                  />
                )}
                {isBundle && (
                  <Chip
                    icon={<Inventory2Rounded />}
                    label={t("MarketDetailRedesign.bundle", "Bundle")}
                    size="small"
                    variant="outlined"
                  />
                )}
                {isAuction && (
                  <Chip
                    icon={<GavelRounded />}
                    label={t("MarketDetailRedesign.auction", "Auction")}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
                {isNegotiable && (
                  <Chip
                    label={t("MarketDetailRedesign.negotiable", "Negotiable")}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography variant="h4" sx={{ color: "text.secondary" }}>
                {listing.title}
              </Typography>
            </Box>

            {/* Seller */}
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  component={RouterLink}
                  to={SHOP_PATHS.profile(seller.slug)}
                  sx={{ textDecoration: "none", color: "inherit" }}
                >
                  <ImageAvatar
                    src={seller.logo_url || undefined}
                    alt={seller.name}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{ color: "text.secondary" }}
                    >
                      {seller.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Rating
                        value={seller.rating ?? 0}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "text.primary" }}
                      >
                        {(seller.rating ?? 0).toFixed(1)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Price */}
            <Box>
              <Typography
                variant="h3"
                sx={{ ...NUMERIC_SX, color: "primary.main", fontWeight: 700 }}
              >
                {isBundle
                  ? fmt.price(unitPrice)
                  : priceRange
                    ? fmt.priceRange(priceRange.min, priceRange.max)
                    : fmt.price(unitPrice)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                {t(
                  "MarketDetailRedesign.availability",
                  "{{count}} {{unit}} available",
                  {
                    count: maxQty,
                    unit: isBundle
                      ? t("MarketDetailRedesign.sets", "sets")
                      : quantityUnitLabel,
                  },
                )}
              </Typography>
            </Box>

            {/* Bundle component list */}
            {isBundle && (
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="overline" sx={{ color: "text.primary" }}>
                    {t(
                      "MarketDetailRedesign.includedInSet",
                      "Included in each set",
                    )}
                  </Typography>
                  <Stack divider={<Divider />} sx={{ mt: 0.5 }}>
                    {items.map((it) => (
                      <Stack
                        key={it.item_id}
                        direction="row"
                        justifyContent="space-between"
                        sx={{ py: 0.75 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {it.game_item?.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary" }}
                        >
                          {fmt.price(it.base_price ?? it.variants[0]?.price)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Quality / variant options (fungible or per-quality) */}
            {!isBundle && allVariants.length > 1 && (
              <TextField
                select
                fullWidth
                label={t(
                  "MarketDetailRedesign.chooseOption",
                  "Choose an option",
                )}
                value={selectedVariant?.variant_id ?? ""}
                onChange={(e) => {
                  setSelectedVariantId(e.target.value)
                  setQty(1)
                }}
                SelectProps={{ native: true }}
              >
                {[...allVariants]
                  .sort((a, b) => a.price - b.price)
                  .map((v) => (
                    <option key={v.variant_id} value={v.variant_id}>
                      {v.display_name} — {fmt.price(v.price)} ({v.quantity})
                    </option>
                  ))}
              </TextField>
            )}

            {/* Auction bid panel OR buy box */}
            {isAuction ? (
              <AuctionPanel />
            ) : (
              <ListingBuyBox
                canTransact={canTransact}
                effectiveQty={effectiveQty}
                minOrder={minOrder}
                clampedMax={clampedMax}
                maxQty={maxQty}
                setQty={setQty}
                subtotal={subtotal}
                isNegotiable={isNegotiable}
                isBuying={isBuying}
                isAdding={isAdding}
                handleBuyNow={handleBuyNow}
                handleAddToCart={handleAddToCart}
              />
            )}

            {listing.description && (
              <Box>
                <Typography variant="overline" sx={{ color: "text.primary" }}>
                  {t("MarketDetailRedesign.description", "Description")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}
                >
                  {listing.description}
                </Typography>
              </Box>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}

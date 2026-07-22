import React, { useMemo, useState } from "react"
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Container,
  Divider,
  Fade,
  IconButton,
  Rating,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import { useTheme } from "@mui/material/styles"
import AddRounded from "@mui/icons-material/AddRounded"
import RemoveRounded from "@mui/icons-material/RemoveRounded"
import ShoppingCartRounded from "@mui/icons-material/ShoppingCartRounded"
import BoltRounded from "@mui/icons-material/BoltRounded"
import GavelRounded from "@mui/icons-material/GavelRounded"
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded"
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded"
import { Link as RouterLink, useParams } from "react-router-dom"
import { Helmet } from "react-helmet"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { formatPrice, formatPriceRange } from "../../../../util/formatPrice"
import {
  useGetListingDetailQuery,
  useAddToCartMutation,
  useCreatePurchaseMutation,
} from "../../../../store/api/v2/market"
import type { VariantDetail, ListingItemDetail } from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { SHOP_PATHS } from "../../../../routes/paths"

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
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error } = useGetListingDetailQuery(
    { id: id! },
    { skip: !id },
  )

  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation()
  const [createPurchase, { isLoading: isBuying }] = useCreatePurchaseMutation()

  const listing = data?.listing
  const seller = data?.seller
  const items: ListingItemDetail[] = useMemo(() => data?.items ?? [], [data])
  const isBundle = (listing?.listing_type ?? "single") === "bundle" || items.length > 1
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const selectedVariant: VariantDetail | undefined = useMemo(() => {
    if (selectedVariantId) return allVariants.find((v) => v.variant_id === selectedVariantId)
    return [...allVariants].sort((a, b) => a.price - b.price)[0]
  }, [allVariants, selectedVariantId])

  const photos = listing?.photos?.length ? listing.photos : [FALLBACK_IMAGE_URL]
  const [activePhoto, setActivePhoto] = useState(0)

  // For a bundle the "unit" is the set: quantity available = min set count the
  // seller can assemble (bounded by the scarcest component). Phase 0: visual only
  // — the backend doesn't yet model bundle set-stock, so we derive it client-side.
  const setsAvailable = useMemo(() => {
    if (!isBundle) return selectedVariant?.quantity ?? 0
    const perItem = items.map((i) => i.variants.reduce((s, v) => s + v.quantity, 0))
    return perItem.length ? Math.min(...perItem) : 0
  }, [isBundle, items, selectedVariant])

  const maxQty = isBundle ? setsAvailable : selectedVariant?.quantity ?? 0
  const minOrder = listing?.min_order_quantity ?? 1
  const maxOrder = listing?.max_order_quantity ?? undefined

  const [qty, setQty] = useState(1)
  const clampedMax = Math.max(1, Math.min(maxQty || 1, maxOrder ?? Number.POSITIVE_INFINITY))
  const effectiveQty = Math.min(Math.max(qty, minOrder), clampedMax)

  const unitPrice = isBundle
    ? items.reduce((s, i) => s + (i.base_price ?? i.variants[0]?.price ?? 0), 0)
    : selectedVariant?.price ?? 0
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
    try {
      await addToCart({
        addToCartRequest: {
          listing_id: listing.listing_id,
          variant_id: selectedVariant.variant_id,
          quantity: effectiveQty,
        },
      }).unwrap()
      issueAlert({
        message: t("MarketDetailRedesign.addedToCart", "Added to cart"),
        severity: "success",
      })
    } catch (e) {
      issueAlert(e as never)
    }
  }

  const handleBuyNow = async () => {
    if (!listing || !selectedVariant) return
    try {
      await createPurchase({
        createBuyOrderRequest: {
          listing_id: listing.listing_id,
          variant_id: selectedVariant.variant_id,
          quantity: effectiveQty,
        },
      }).unwrap()
      issueAlert({
        message: t(
          "MarketDetailRedesign.orderPlaced",
          "Order placed — the seller has been notified to coordinate handoff.",
        ),
        severity: "success",
      })
    } catch (e) {
      issueAlert(e as never)
    }
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
          <Card sx={{ overflow: "hidden" }}>
            <CardMedia
              component="img"
              image={photos[activePhoto] || FALLBACK_IMAGE_URL}
              alt={listing.title}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL
              }}
              sx={{
                width: "100%",
                aspectRatio: "4 / 3",
                objectFit: "cover",
                bgcolor: "background.default",
                transition: theme.transitions.create("opacity", {
                  duration: theme.transitions.duration.standard,
                }),
              }}
            />
          </Card>
          {photos.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }} useFlexGap>
              {photos.map((p, i) => (
                <Box
                  key={`${p}-${i}`}
                  component="img"
                  src={p || FALLBACK_IMAGE_URL}
                  alt=""
                  onClick={() => setActivePhoto(i)}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL
                  }}
                  sx={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 1,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: i === activePhoto ? "primary.main" : "divider",
                    transition: "border-color .2s",
                  }}
                />
              ))}
            </Stack>
          )}
        </Grid>

        {/* Offer detail */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
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
                    color="secondary"
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
                  <Avatar src={seller.logo_url || undefined} alt={seller.name} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" noWrap sx={{ color: "text.secondary" }}>
                      {seller.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Rating
                        value={seller.rating ?? 0}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <Typography variant="caption" sx={{ color: "text.primary" }}>
                        {(seller.rating ?? 0).toFixed(1)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Price */}
            <Box>
              <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 700 }}>
                {isBundle
                  ? formatPrice(unitPrice)
                  : priceRange
                    ? formatPriceRange(priceRange.min, priceRange.max)
                    : formatPrice(unitPrice)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                {t("MarketDetailRedesign.availability", "{{count}} {{unit}} available", {
                  count: maxQty,
                  unit: isBundle ? t("MarketDetailRedesign.sets", "sets") : quantityUnitLabel,
                })}
              </Typography>
            </Box>

            {/* Bundle component list */}
            {isBundle && (
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="overline" sx={{ color: "text.primary" }}>
                    {t("MarketDetailRedesign.includedInSet", "Included in each set")}
                  </Typography>
                  <Stack divider={<Divider />} sx={{ mt: 0.5 }}>
                    {items.map((it) => (
                      <Stack
                        key={it.item_id}
                        direction="row"
                        justifyContent="space-between"
                        sx={{ py: 0.75 }}
                      >
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {it.game_item?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.primary" }}>
                          {formatPrice(it.base_price ?? it.variants[0]?.price)}
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
                label={t("MarketDetailRedesign.chooseOption", "Choose an option")}
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
                      {v.display_name} — {formatPrice(v.price)} ({v.quantity})
                    </option>
                  ))}
              </TextField>
            )}

            {/* Auction bid panel OR buy box */}
            {isAuction ? (
              <AuctionPanel />
            ) : (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "text.primary", mb: 0.5 }}>
                        {t("MarketDetailRedesign.quantityLabel", "Quantity")}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() => setQty((q) => Math.max(minOrder, q - 1))}
                          disabled={!canTransact || effectiveQty <= minOrder}
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <RemoveRounded />
                        </IconButton>
                        <TextField
                          value={effectiveQty}
                          onChange={(e) => {
                            const n = parseInt(e.target.value, 10)
                            setQty(Number.isFinite(n) ? n : 1)
                          }}
                          type="number"
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ min: minOrder, max: clampedMax, style: { textAlign: "center" } }}
                        />
                        <IconButton
                          onClick={() => setQty((q) => Math.min(clampedMax, q + 1))}
                          disabled={!canTransact || effectiveQty >= clampedMax}
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <AddRounded />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: "text.primary", ml: 1 }}>
                          {t("MarketDetailRedesign.ofAvailable", "of {{count}}", { count: maxQty })}
                        </Typography>
                      </Stack>
                    </Box>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="subtitle1" sx={{ color: "text.primary" }}>
                        {t("MarketDetailRedesign.subtotal", "Subtotal")}
                      </Typography>
                      <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 700 }}>
                        {formatPrice(subtotal)}
                      </Typography>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        startIcon={<BoltRounded />}
                        disabled={!canTransact || isBuying}
                        onClick={handleBuyNow}
                      >
                        {isNegotiable
                          ? t("MarketDetailRedesign.makeOffer", "Make an offer")
                          : t("MarketDetailRedesign.buyNow", "Buy now")}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="large"
                        fullWidth
                        startIcon={<ShoppingCartRounded />}
                        disabled={!canTransact || isAdding}
                        onClick={handleAddToCart}
                      >
                        {t("MarketDetailRedesign.addToCart", "Add to cart")}
                      </Button>
                    </Stack>

                    {/* Phase 0: visual only — messaging/Contact-seller thread UI is
                        explicitly deferred; this is a disabled stub per the plan. */}
                    <Tooltip
                      title={t(
                        "MarketDetailRedesign.contactComingSoon",
                        "Messaging is coming soon",
                      )}
                    >
                      <span>
                        <Button
                          variant="text"
                          color="inherit"
                          fullWidth
                          disabled
                          startIcon={<ChatBubbleOutlineRounded />}
                        >
                          {t("MarketDetailRedesign.contactSeller", "Contact seller")}
                        </Button>
                      </span>
                    </Tooltip>

                    {!canTransact && (
                      <Alert severity="info" variant="outlined">
                        {t(
                          "MarketDetailRedesign.unavailable",
                          "This listing is not currently available to purchase.",
                        )}
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {listing.description && (
              <Box>
                <Typography variant="overline" sx={{ color: "text.primary" }}>
                  {t("MarketDetailRedesign.description", "Description")}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}>
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

/**
 * AuctionPanel — Phase 0: visual only. The existing V2 API exposes bid/auction
 * detail hooks, but wiring live bidding is out of scope for the Phase 0 redesign,
 * so this shows the bid affordance without submitting.
 */
function AuctionPanel() {
  const { t } = useTranslation()
  const [bid, setBid] = useState("")
  const [placed, setPlaced] = useState(false)

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
            {t("MarketDetailRedesign.placeBid", "Place a bid")}
          </Typography>
          <TextField
            fullWidth
            type="number"
            label={t("MarketDetailRedesign.yourBid", "Your bid (aUEC)")}
            value={bid}
            onChange={(e) => setBid(e.target.value)}
          />
          <Button
            variant="contained"
            color="warning"
            size="large"
            startIcon={<GavelRounded />}
            disabled={!bid}
            onClick={() => setPlaced(true)}
          >
            {t("MarketDetailRedesign.submitBid", "Submit bid")}
          </Button>
          <Collapse in={placed}>
            <Fade in={placed}>
              <Alert severity="info" variant="outlined">
                {t(
                  "MarketDetailRedesign.bidPreview",
                  "Bidding is being wired up — your bid was not submitted.",
                )}
              </Alert>
            </Fade>
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  )
}

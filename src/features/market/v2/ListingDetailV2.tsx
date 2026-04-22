import React, { useMemo, useEffect, useState } from "react"
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Fade,
  Grid,
  Link,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useParams, Link as RouterLink } from "react-router-dom"
import { Helmet } from "react-helmet"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import {
  useGetListingDetailQuery,
  useAddToCartMutation,
  useTrackViewMutation,
} from "../../../store/api/v2/market"
import { VariantBreakdown } from "../../../components/market/v2/VariantBreakdown"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { ImagePreviewPaper } from "../../../components/paper/ImagePreviewPaper"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { SellerReviews } from "../listing-view/components/SellerReviews"
import { SellerOtherListingsV2, RelatedListingsV2, AggregateMarketDataV2 } from "./components/ListingViewComponentsV2"
import { FRONTEND_URL, FALLBACK_IMAGE_URL } from "../../../util/constants"
import { getRelativeTime } from "../../../util/time"
import { dateDiffInDays } from "../../../util/dateDiff"
import { formatQuantity } from "../../../util/formatQuantity"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { AddToCartDrawer } from "./components/AddToCartDrawer"
import { useCartDrawer } from "../../../hooks/market/AddToCartContext"
import {
  CreateRounded,
  RefreshRounded,
  LocationOnRounded,
  LocalShippingRounded,
  PersonRounded,
  StarRounded,
  VisibilityRounded,
  WarningRounded,
  SportsEsportsRounded,
  AccessTimeRounded,
} from "@mui/icons-material"
import { ClockAlert } from "mdi-material-ui"
import { ListingDetailItem } from "../listing-view/components/ListingDetailItem"
import { ReportButton } from "../../../components/button/ReportButton"

export function ListingDetailV2() {
  const { id } = useParams<{ id: string }>()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const {
    data: listingData,
    isLoading,
    error,
  } = useGetListingDetailQuery({ id: id! })

  const [addToCart] = useAddToCartMutation()
  const { openAddToCart } = useCartDrawer()
  const [trackView] = useTrackViewMutation()
  const issueAlert = useAlertHook()

  useEffect(() => {
    if (id) trackView({ id }).catch(() => {})
  }, [id, trackView])

  // Derived data
  const listing = listingData?.listing
  const seller = listingData?.seller
  const items = listingData?.items ?? []
  const photos = listing?.photos?.length ? listing.photos : [FALLBACK_IMAGE_URL]
  const firstItem = items[0]
  const gameItemId = firstItem?.game_item?.id
  const gameItemName = firstItem?.game_item?.name
  const gameItemType = firstItem?.game_item?.type

  const qualityTierRange = useMemo(() => {
    const tiers = items
      .flatMap((i) => i.variants)
      .map((v) => v.attributes.quality_tier)
      .filter((t): t is number => t != null)
    if (!tiers.length) return null
    return { min: Math.min(...tiers), max: Math.max(...tiers) }
  }, [items])

  const priceRange = useMemo(() => {
    const prices = items.flatMap((i) => i.variants).map((v) => v.price)
    if (!prices.length) return null
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [items])

  const totalQuantity = useMemo(
    () => items.flatMap((i) => i.variants).reduce((s, v) => s + v.quantity, 0),
    [items],
  )

  const allLocations = useMemo(() => {
    const locs = new Set(items.flatMap((i) => i.variants).flatMap((v) => v.locations))
    return [...locs]
  }, [items])

  const isNew = listing ? dateDiffInDays(new Date(listing.created_at), new Date()) <= 1 : false

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; href?: string }[] = [
      { label: t("sidebar.market_short", "Market"), href: "/market" },
    ]
    if (gameItemType) {
      crumbs.push({ label: gameItemType, href: `/market?type=${encodeURIComponent(gameItemType)}` })
    }
    if (gameItemId && gameItemName) {
      crumbs.push({ label: gameItemName, href: `/market/aggregate/${gameItemId}` })
    }
    if (listing) crumbs.push({ label: listing.title })
    return crumbs
  }, [listing, gameItemType, gameItemId, gameItemName, t])

  // Seller props for V1 components
  const userSeller = seller?.type === "user" ? { username: seller.slug } : null
  const contractorSeller = seller?.type === "contractor" ? { spectrum_id: seller.slug } : null

  const canonicalUrl = listing ? `${FRONTEND_URL}/market/${listing.listing_id}` : undefined

  return (
    <StandardPageLayout
      title={listing?.title || "Listing Details"}
      headerTitle={listing?.title}
      breadcrumbs={breadcrumbs}
      isLoading={isLoading}
      error={error ? "not_found" : undefined}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {listingData && listing && seller && (
        <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* LEFT COLUMN — Image + SEO */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <ImagePreviewPaper photos={photos} />

                {/* SEO Metadata */}
                <Helmet>
                  <title>{listing.title} — SC Market</title>
                  <meta name="description" content={listing.description?.slice(0, 160) || listing.title} />
                  <link rel="canonical" href={canonicalUrl} />
                  <meta property="og:title" content={listing.title} />
                  <meta property="og:description" content={listing.description?.slice(0, 160) || listing.title} />
                  <meta property="og:url" content={canonicalUrl} />
                  <meta property="og:image" content={photos[0]} />
                  <meta property="og:type" content="product" />
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta name="twitter:title" content={listing.title} />
                  <meta name="twitter:image" content={photos[0]} />
                </Helmet>
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT COLUMN — Main card */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={theme.layoutSpacing.component}>
              <Grid item xs={12}>
                <Fade in>
                  <Card sx={{ minHeight: 400 }}>
                    <CardHeader
                      disableTypography
                      title={
                        <Stack direction="column" spacing={theme.layoutSpacing.text}>
                          {/* Breadcrumbs inside card */}
                          <Breadcrumbs separator="›" sx={{ fontSize: "0.85rem" }}>
                            {breadcrumbs.map((crumb, i) =>
                              crumb.href && i < breadcrumbs.length - 1 ? (
                                <Link
                                  key={i}
                                  component={RouterLink}
                                  to={crumb.href}
                                  underline="hover"
                                  color="text.secondary"
                                  variant="body2"
                                >
                                  {crumb.label}
                                </Link>
                              ) : (
                                <Typography key={i} variant="body2" color="text.secondary">
                                  {crumb.label}
                                </Typography>
                              ),
                            )}
                          </Breadcrumbs>

                          {/* Title + New chip */}
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h5" fontWeight="bold">
                              {listing.title}
                            </Typography>
                            {isNew && (
                              <Chip label="NEW" color="primary" size="small" />
                            )}
                          </Stack>
                        </Stack>
                      }
                      subheader={
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
                          <Stack direction="column" spacing={0.5} flex={1}>
                          {/* Seller */}
                          <ListingDetailItem icon={<PersonRounded fontSize="small" />}>
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                              <Link
                                component={RouterLink}
                                to={`/${seller.type === "contractor" ? "contractor" : "user"}/${seller.slug}`}
                                underline="hover"
                                color="text.primary"
                                variant="subtitle2"
                              >
                                {seller.name}
                              </Link>
                              <StarRounded sx={{ fontSize: "1rem", color: "warning.main" }} />
                              <Typography variant="subtitle2" color="text.secondary" component="span">
                                {seller.rating.toFixed(1)}
                              </Typography>
                            </Box>
                          </ListingDetailItem>

                          {/* Locations */}
                          {allLocations.length > 0 && (
                            <ListingDetailItem icon={<LocationOnRounded fontSize="small" />}>
                              {allLocations.join(", ")}
                            </ListingDetailItem>
                          )}

                          {/* Listed date */}
                          <ListingDetailItem icon={<CreateRounded fontSize="small" />}>
                            {t("MarketListingView.listed", "Listed")} {getRelativeTime(new Date(listing.created_at))}
                          </ListingDetailItem>

                          {/* Updated date */}
                          {listing.updated_at !== listing.created_at && (
                            <ListingDetailItem icon={<RefreshRounded fontSize="small" />}>
                              {t("MarketListingView.updated", "Updated")} {getRelativeTime(new Date(listing.updated_at))}
                            </ListingDetailItem>
                          )}
                          </Stack>

                          <Stack direction="column" spacing={0.5} flex={1}>
                          {/* Expires */}
                          {listing.expires_at && (
                            <ListingDetailItem icon={<ClockAlert style={{ fontSize: "1.25rem" }} />}>
                              {t("MarketListingView.expires", "Expires")} {getRelativeTime(new Date(listing.expires_at))}
                            </ListingDetailItem>
                          )}

                          {/* Views */}
                          <ListingDetailItem icon={<VisibilityRounded fontSize="small" />}>
                            {t("MarketListingView.views", "Views")} {(listing as any).view_count ?? 0}
                          </ListingDetailItem>

                          {/* Languages */}
                          {(seller as any).languages && (seller as any).languages.length > 0 && (
                            <ListingDetailItem icon={<PersonRounded fontSize="small" />}>
                              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  {t("MarketListingView.languages", "Languages")}:
                                </Typography>
                                {((seller as any).languages as string[]).map((lang: string) => (
                                  <Chip key={lang} label={lang} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
                                ))}
                              </Box>
                            </ListingDetailItem>
                          )}

                          {/* Report */}
                          <ListingDetailItem icon={<WarningRounded fontSize="small" />}>
                            <ReportButton reportedUrl={`/market/${listing.listing_id}`} />
                          </ListingDetailItem>
                          </Stack>
                        </Stack>
                      }
                    />

                    <CardContent sx={{ p: 3 }}>
                      {listing.status === "active" && (
                        <>
                          <Divider light />
                          {/* Fixed price: show big price. Per-variant: show variant table */}
                          {priceRange && priceRange.min === priceRange.max ? (
                            <Stack sx={{ py: 2 }} spacing={1}>
                              <Typography variant="h4" fontWeight="bold">
                                {priceRange.min.toLocaleString()} aUEC
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {totalQuantity.toLocaleString()} available
                              </Typography>
                            </Stack>
                          ) : null}

                          {/* Variant breakdown table (always shown for multi-variant, replaces price summary) */}
                          {items.map((item) =>
                            item.variants.length > 0 ? (
                              <Box key={item.item_id} sx={{ py: 1 }}>
                                <VariantBreakdown
                                  variants={item.variants}
                                  showActions={listing.status === "active"}
                                  onSelectVariant={() => openAddToCart(id!)}
                                />
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                                No variants available
                              </Typography>
                            ),
                          )}
                          <Divider light />
                        </>
                      )}

                      {/* Status badges */}
                      {(listing.status !== "active" || listing.visibility === "private" || totalQuantity === 0) && (
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 1 }}>
                          {listing.status !== "active" && (
                            <Chip label={listing.status.toUpperCase()} color="default" size="small" sx={{ fontWeight: "bold" }} />
                          )}
                          {listing.visibility === "private" && (
                            <Chip label="PRIVATE" color="warning" size="small" sx={{ fontWeight: "bold" }} />
                          )}
                          {totalQuantity === 0 && (
                            <Chip label="OUT OF STOCK" color="error" size="small" sx={{ fontWeight: "bold" }} />
                          )}
                        </Box>
                      )}

                      {/* Description */}
                      {listing.description && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                            Description
                          </Typography>
                          <MarkdownRender text={listing.description} />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
                </Grid>
            </Grid>
          </Grid>

          {/* FULL-WIDTH SECTIONS */}

          {/* Seller Reviews */}
          <SellerReviews userSeller={userSeller} contractorSeller={contractorSeller} />

          {/* Market Analysis */}
          {gameItemId && priceRange && (
            <AggregateMarketDataV2
              gameItemId={gameItemId}
              currentPrice={priceRange.min}
            />
          )}

          {/* Seller's Other Listings */}
          <SellerOtherListingsV2
            sellerUsername={seller.type === "user" ? seller.slug : undefined}
            contractorSpectrumId={seller.type === "contractor" ? seller.slug : undefined}
            currentListingId={listing.listing_id}
          />

          {/* Related Listings */}
          {gameItemType && (
            <RelatedListingsV2
              itemType={gameItemType}
              currentListingId={listing.listing_id}
            />
          )}
        </Grid>
        </Grid>
      )}
    </StandardPageLayout>
  )
}

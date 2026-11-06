import { SellerStatusBadge } from "../../../components/presence/SellerStatusBadge"
import React, { useMemo } from "react"
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
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useParams, Link as RouterLink } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { useGetListingDetailQuery } from "../../../store/api/v2/market"
import { VariantBreakdown } from "../../../components/market/v2/VariantBreakdown"
import { ImagePreviewPaper } from "../../../components/paper/ImagePreviewPaper"
import { BidAreaV2 } from "./components/BidAreaV2"
import { useGetUserProfileQuery } from "../../../features/profile/api/profileApi"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { SellerReviews } from "../listing-view/components/SellerReviews"
import {
  SellerOtherListingsV2,
  RelatedListingsV2,
  AggregateMarketDataV2,
} from "./components/ListingViewComponentsV2"
import { ListingOrdersSection } from "./components/ListingOrdersSection"
import { useListingPermissions } from "../hooks/useListingPermissions"
import { FRONTEND_URL, FALLBACK_IMAGE_URL } from "../../../util/constants"
import { MARKET_PATHS, WIKI_PATHS, SHOP_PATHS } from "../../../routes/paths"
import { getLanguageName } from "../../../constants/languages"
import { useFormatters, useNow } from "../../../util/format"
import { isListingNew } from "../domain/listingBadges"
import { useTranslation } from "react-i18next"
import { useCartDrawer } from "../hooks/AddToCartContext"
import {
  CreateRounded,
  RefreshRounded,
  LocationOnRounded,
  PersonRounded,
  StarRounded,
  VisibilityRounded,
  ShoppingCartRounded,
  WarningRounded,
  MenuBookRounded,
} from "@mui/icons-material"
import { ClockAlert } from "mdi-material-ui"
import { ListingDetailItem } from "../listing-view/components/ListingDetailItem"
import { ReportButton } from "../../../components/button/ReportButton"
import { buildListingHead } from "../../../seo/entityHeads"
import { headDescription } from "../../../seo/pageHead"
import { SeoHead } from "../../../seo/SeoHead"
import { ListingDetailContentSkeleton } from "../../../components/skeletons/MarketListingDetailSkeleton"
import { WatchPriceButton } from "../../price-alerts/components/WatchPriceButton"
import { listingStatusLabel } from "../domain/listingStatus"
import { useTrackListingView } from "../hooks/useTrackListingView"

export function ListingDetailV2() {
  const { id } = useParams<{ id: string }>()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const fmt = useFormatters()
  const now = useNow()

  const {
    data: listingData,
    isLoading,
    error,
  } = useGetListingDetailQuery({ id: id! })

  const { openAddToCart } = useCartDrawer()
  const { data: profile } = useGetUserProfileQuery()

  useTrackListingView(id)

  // Derived data
  const listing = listingData?.listing
  const seller = listingData?.seller
  const items = useMemo(() => listingData?.items ?? [], [listingData?.items])
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
    const locs = new Set(
      items.flatMap((i) => i.variants).flatMap((v) => v.locations),
    )
    return [...locs]
  }, [items])

  const isNew = listing
    ? isListingNew(listing.created_at, new Date(now))
    : false

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; href?: string }[] = [
      { label: t("sidebar.market_short", "Market"), href: MARKET_PATHS.search },
    ]
    if (gameItemType) {
      crumbs.push({
        label: gameItemType,
        href: `/market?type=${encodeURIComponent(gameItemType)}`,
      })
    }
    if (gameItemId && gameItemName) {
      crumbs.push({
        label: gameItemName,
        href: MARKET_PATHS.aggregate(gameItemId, gameItemName),
      })
    }
    if (listing) crumbs.push({ label: listing.title })
    return crumbs
  }, [listing, gameItemType, gameItemId, gameItemName, t])

  const belongsToSellerOrg = profile?.contractors?.some(
    (c) => c.spectrum_id === seller?.slug,
  )
  const { canManage: canEdit } = useListingPermissions(seller?.shop_id)

  const canonicalPath = listing
    ? MARKET_PATHS.listing(listing.listing_id, listing.title)
    : undefined
  // The head the bridge and SSR render (title, description): the layout's
  // own title and description must be the same, or the page changes them
  // after hydrating.
  const head = listingData ? buildListingHead(listingData, FRONTEND_URL) : null

  return (
    <StandardPageLayout
      title={head?.title ?? (listing?.title || t("marketV2.listingDetails"))}
      description={head ? headDescription(head) : undefined}
      headerTitle={listing?.title}
      canonicalUrl={canonicalPath}
      breadcrumbs={breadcrumbs}
      isLoading={isLoading}
      skeleton={<ListingDetailContentSkeleton />}
      error={error}
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
                  {head && <SeoHead head={head} />}
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
                        action={
                          canEdit && listing.status !== "cancelled" ? (
                            <IconButton
                              component={RouterLink}
                              to={MARKET_PATHS.edit(listing.listing_id)}
                              sx={{ color: "inherit" }}
                              aria-label={t(
                                "MarketListingView.editListing",
                                "Edit listing",
                              )}
                            >
                              <CreateRounded />
                            </IconButton>
                          ) : undefined
                        }
                        title={
                          <Stack
                            direction="column"
                            spacing={theme.layoutSpacing.text}
                          >
                            {/* Breadcrumbs inside card */}
                            <Breadcrumbs
                              separator="›"
                              sx={{ fontSize: "0.85rem" }}
                            >
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
                                  <Typography
                                    key={i}
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {crumb.label}
                                  </Typography>
                                ),
                              )}
                            </Breadcrumbs>

                            {/* Title + New chip */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Typography variant="h5" fontWeight="bold">
                                {listing.title}
                              </Typography>
                              {isNew && (
                                <Chip
                                  label="NEW"
                                  color="primary"
                                  size="small"
                                />
                              )}
                              {gameItemId && (
                                <Chip
                                  icon={
                                    <MenuBookRounded sx={{ fontSize: 14 }} />
                                  }
                                  label={t("footer.wiki")}
                                  size="small"
                                  variant="outlined"
                                  component={RouterLink}
                                  to={WIKI_PATHS.item(gameItemId, gameItemName)}
                                  clickable
                                />
                              )}
                            </Stack>
                          </Stack>
                        }
                        subheader={
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ mt: 1 }}
                          >
                            <Stack direction="column" spacing={0.5} flex={1}>
                              {/* Seller */}
                              <ListingDetailItem
                                icon={<PersonRounded fontSize="small" />}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Link
                                    component={RouterLink}
                                    to={SHOP_PATHS.profile(seller.slug)}
                                    underline="hover"
                                    color="text.primary"
                                    variant="subtitle2"
                                  >
                                    {seller.name}
                                  </Link>
                                  <StarRounded
                                    sx={{
                                      fontSize: "1rem",
                                      color: "warning.main",
                                    }}
                                  />
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    component="span"
                                  >
                                    {seller.rating.toFixed(1)}
                                  </Typography>
                                </Box>
                              </ListingDetailItem>

                              {/* Seller activity: last seen, reply time, completed orders */}
                              {seller.activity && (
                                <Box sx={{ pl: 3.5 }}>
                                  <SellerStatusBadge
                                    activity={seller.activity}
                                  />
                                </Box>
                              )}

                              {/* Locations */}
                              {allLocations.length > 0 && (
                                <ListingDetailItem
                                  icon={<LocationOnRounded fontSize="small" />}
                                >
                                  {allLocations.join(", ")}
                                </ListingDetailItem>
                              )}

                              {/* Listed date */}
                              <ListingDetailItem
                                icon={<CreateRounded fontSize="small" />}
                              >
                                {t("MarketListingView.listed", "Listed")}{" "}
                                {fmt.relative(listing.created_at, now)}
                              </ListingDetailItem>

                              {/* Updated date */}
                              {listing.updated_at !== listing.created_at && (
                                <ListingDetailItem
                                  icon={<RefreshRounded fontSize="small" />}
                                >
                                  {t("MarketListingView.updated", "Updated")}{" "}
                                  {fmt.relative(listing.updated_at, now)}
                                </ListingDetailItem>
                              )}
                            </Stack>

                            <Stack direction="column" spacing={0.5} flex={1}>
                              {/* Expires */}
                              {listing.expires_at && (
                                <ListingDetailItem
                                  icon={
                                    <ClockAlert
                                      style={{ fontSize: "1.25rem" }}
                                    />
                                  }
                                >
                                  {t("MarketListingView.expires", "Expires")}{" "}
                                  {fmt.relative(listing.expires_at, now)}
                                </ListingDetailItem>
                              )}

                              {/* Views */}
                              <ListingDetailItem
                                icon={<VisibilityRounded fontSize="small" />}
                              >
                                {t("MarketListingView.views", "Views")}{" "}
                                {listing.view_count ?? 0}
                              </ListingDetailItem>

                              {/* In carts */}
                              {(listing.in_carts ?? 0) > 0 && (
                                <ListingDetailItem
                                  icon={
                                    <ShoppingCartRounded fontSize="small" />
                                  }
                                >
                                  {t(
                                    "MarketListingView.inCarts",
                                    "{{count}} people have this in their cart",
                                    { count: listing.in_carts },
                                  )}
                                </ListingDetailItem>
                              )}

                              {/* Languages */}
                              {seller.languages &&
                                seller.languages.length > 0 && (
                                  <ListingDetailItem
                                    icon={<PersonRounded fontSize="small" />}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 0.5,
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                      >
                                        {t(
                                          "MarketListingView.languages",
                                          "Languages",
                                        )}
                                        :
                                      </Typography>
                                      {seller.languages.map((lang) => (
                                        <Chip
                                          key={lang}
                                          label={getLanguageName(lang) || lang}
                                          size="small"
                                          variant="outlined"
                                          sx={{
                                            height: 22,
                                            fontSize: "0.7rem",
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  </ListingDetailItem>
                                )}

                              {/* Report */}
                              <ListingDetailItem
                                icon={<WarningRounded fontSize="small" />}
                              >
                                <ReportButton
                                  reportedUrl={MARKET_PATHS.listing(
                                    listing.listing_id,
                                  )}
                                />
                              </ListingDetailItem>
                            </Stack>
                          </Stack>
                        }
                      />

                      <CardContent sx={{ p: 3 }}>
                        {listing.status === "active" && (
                          <>
                            {/* Variant breakdown table */}
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
                                <Typography
                                  key={item.item_id}
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ py: 2, textAlign: "center" }}
                                >
                                  {t("marketV2.noVariants")}
                                </Typography>
                              ),
                            )}
                            <Divider light />
                          </>
                        )}

                        {/* Price alert for the listed game item */}
                        {gameItemId && gameItemName && (
                          <Box sx={{ my: 1.5 }}>
                            <WatchPriceButton
                              gameItemId={gameItemId}
                              itemName={gameItemName}
                              currentPrice={priceRange?.min}
                              qualityRelevant={qualityTierRange != null}
                            />
                          </Box>
                        )}

                        {/* Status badges */}
                        {(listing.status !== "active" ||
                          listing.visibility === "private" ||
                          totalQuantity === 0) && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              flexWrap: "wrap",
                              my: 1,
                            }}
                          >
                            {listing.status !== "active" && (
                              <Chip
                                label={listingStatusLabel(
                                  listing.status,
                                  t,
                                ).toUpperCase()}
                                color="default"
                                size="small"
                                sx={{ fontWeight: "bold" }}
                              />
                            )}
                            {listing.visibility === "private" && (
                              <Chip
                                label={t("marketV2.privateBadge")}
                                color="warning"
                                size="small"
                                sx={{ fontWeight: "bold" }}
                              />
                            )}
                            {totalQuantity === 0 && (
                              <Chip
                                label={t("marketV2.outOfStockBadge")}
                                color="error"
                                size="small"
                                sx={{ fontWeight: "bold" }}
                              />
                            )}
                          </Box>
                        )}

                        {/* Auction Bid Area */}
                        {listing.sale_type === "auction" && (
                          <BidAreaV2
                            listingId={listing.listing_id}
                            startingPrice={items[0]?.base_price || 0}
                            isOwner={
                              seller?.slug === profile?.username ||
                              !!belongsToSellerOrg
                            }
                          />
                        )}

                        {/* Description */}
                        {listing.description && (
                          <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="text.secondary"
                              gutterBottom
                            >
                              {t("marketV2.description")}
                            </Typography>
                            <MarkdownRender text={listing.description} />
                          </Paper>
                        )}
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              </Grid>
            </Grid>

            {/* FULL-WIDTH SECTIONS */}

            {/* Seller Reviews */}
            <SellerReviews
              shopId={seller?.shop_id}
              shopSlug={seller?.slug}
              shopName={seller?.name}
            />

            {/* Market Analysis */}
            {gameItemId && priceRange && (
              <AggregateMarketDataV2
                key={gameItemId}
                gameItemId={gameItemId}
                currentPrice={priceRange.min}
              />
            )}

            {/* Related Orders/Offers (seller only) */}
            <ListingOrdersSection
              listingId={listing.listing_id}
              shopId={seller.shop_id}
            />

            {/* Seller's Other Listings */}
            <SellerOtherListingsV2
              shopSlug={seller.slug}
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

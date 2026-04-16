import React, { useCallback, useRef, useState, useMemo, useEffect } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Fade,
  Grid,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { isAfter, subDays } from "date-fns"
import {
  useSearchListingsQuery,
  type SearchListingsApiArg,
  type ListingSearchResult,
} from "../../../store/api/v2/market"
import { ExtendedTheme, cardFadeGradient } from "../../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { UnderlineLink } from "../../typography/UnderlineLink"
import {
  MarketListingRating,
  BadgeDisplay,
} from "../../rating/ListingRating"
import { calculateBadgesFromRating, prioritizeBadges } from "../../../util/badges"
import { ListingWrapper } from "../../../features/market/components/listings/ListingCard"
import { ListingPagination } from "../../../features/market/components/listings/ListingPagination"
import { EmptyListings } from "../../empty-states"
import { ListingSkeleton } from "../../skeletons"
import { MarketSidebar } from "../../../features/market/components/MarketSidebar"
import { HideOnScroll, MarketNavArea } from "../../../features/market/components/MarketNavArea"
import { useMarketSidebarExp } from "../../../features/market"

// ---------------------------------------------------------------------------
// V2 Listing Card – mirrors V1 ItemListingBase visual style
// ---------------------------------------------------------------------------
const V2ListingCard = React.memo(function V2ListingCard({
  listing,
  index,
}: {
  listing: ListingSearchResult
  index: number
}) {
  const { t, i18n } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()

  const { user_seller, contractor_seller } = listing
  const sellerName = user_seller || contractor_seller

  const rating = {
    avg_rating: listing.avg_rating,
    rating_count: listing.rating_count || 0,
    total_rating: listing.total_rating,
    streak: listing.rating_streak || 0,
    total_orders: listing.total_orders || 0,
    total_assignments: listing.total_assignments || 0,
    response_rate: listing.response_rate || 0,
  }
  const allBadges =
    listing.badges?.badge_ids || calculateBadgesFromRating(rating)
  const badges = prioritizeBadges(allBadges, 3)

  return (
    <ListingWrapper>
      <Fade
        in
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          <Link
            to={`/market/${listing.listing_id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <CardActionArea
              sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
            >
              <Card sx={{ height: 300, position: "relative" }}>
                {/* NEW chip */}
                {isAfter(new Date(listing.timestamp), subDays(new Date(), 3)) && (
                  <Chip
                    label={t("market.new")}
                    color="secondary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      zIndex: 5,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                      height: 18,
                    }}
                  />
                )}

                {/* OUT OF STOCK chip */}
                {listing.quantity_available === 0 && (
                  <Chip
                    label={t("market.outOfStock")}
                    color="error"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: listing.internal ? 28 : 4,
                      right: 4,
                      zIndex: 5,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                      height: 18,
                    }}
                  />
                )}

                {/* INTERNAL chip */}
                {listing.internal && (
                  <Chip
                    label={t("market.internalListing")}
                    color="warning"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      zIndex: 5,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                      height: 18,
                    }}
                  />
                )}

                {/* Image */}
                <CardMedia
                  component="img"
                  loading="lazy"
                  image={listing.photo || FALLBACK_IMAGE_URL}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null
                    currentTarget.src = FALLBACK_IMAGE_URL
                  }}
                  sx={{
                    width: "100%",
                    objectFit: "cover",
                    ...(theme.palette.mode === "dark"
                      ? { height: "100%", aspectRatio: "16/9" }
                      : { height: 150, aspectRatio: "16/9" }),
                    overflow: "hidden",
                  }}
                  alt={`Image of ${listing.title}`}
                />

                {/* Dark mode gradient overlay */}
                {theme.palette.mode === "dark" && (
                  <Box
                    sx={{
                      position: "absolute",
                      zIndex: 3,
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: "100%",
                      borderRadius: theme.spacing(theme.borderRadius.topLevel),
                      background: cardFadeGradient(theme, 50, 60),
                    }}
                  />
                )}

                {/* Card content */}
                <CardContent
                  sx={{
                    ...(theme.palette.mode === "dark"
                      ? { position: "absolute", bottom: 0, zIndex: 4 }
                      : {}),
                    maxWidth: "100%",
                    padding: "8px 12px !important",
                  }}
                >
                  {/* Price */}
                  <Typography
                    variant="h6"
                    color="primary"
                    fontWeight="bold"
                    sx={{ fontSize: "0.95rem", mb: 0.5 }}
                  >
                    {listing.price.toLocaleString(i18n.language)} aUEC
                  </Typography>

                  {/* Title + item type */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.75rem",
                      lineHeight: 1.3,
                      maxHeight: 36,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      mb: 0.5,
                    }}
                  >
                    {listing.title}
                    {listing.item_type ? ` (${listing.item_type})` : ""}
                  </Typography>

                  {/* Seller + badges */}
                  <Box sx={{ mb: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.25,
                        flexWrap: "wrap",
                      }}
                    >
                      {sellerName && (
                        <UnderlineLink
                          component="span"
                          display="inline"
                          noWrap
                          variant="caption"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            navigate(
                              user_seller
                                ? `/user/${user_seller}`
                                : `/contractor/${contractor_seller}`,
                            )
                          }}
                          sx={{
                            overflowX: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {sellerName}
                        </UnderlineLink>
                      )}
                      {badges.length > 0 && (
                        <BadgeDisplay badges={badges} iconSize="1rem" />
                      )}
                    </Box>
                    <Box
                      sx={{
                        fontSize: "0.7rem",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <MarketListingRating
                        avg_rating={listing.avg_rating}
                        rating_count={listing.rating_count}
                        total_rating={listing.total_rating}
                        rating_streak={listing.rating_streak}
                        total_orders={listing.total_orders}
                        total_assignments={listing.total_assignments}
                        response_rate={listing.response_rate}
                        badge_ids={[]}
                        display_limit={0}
                        showBadges={false}
                      />
                    </Box>
                  </Box>

                  {/* Quantity available */}
                  <Typography
                    display="block"
                    color="text.primary"
                    variant="caption"
                    sx={{ fontSize: "0.7rem", lineHeight: 1.2 }}
                  >
                    {t("market.available", {
                      count: listing.quantity_available,
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>
          </Link>
        </Box>
      </Fade>
    </ListingWrapper>
  )
})

// ---------------------------------------------------------------------------
// ListingSearchV2 – V1 sidebar+content layout with V2 API
// ---------------------------------------------------------------------------
export function ListingSearchV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))
  const sidebarOpen = useMarketSidebarExp()
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Pagination state
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(
    showMobileSidebar ? 12 : 48,
  )

  // Build search params from URL (V1 pattern: MarketSidebar → useMarketFilters → useMarketSearch → URL params)
  const searchParams = useMemo<SearchListingsApiArg>(() => {
    const sp = new URLSearchParams(location.search)
    const params: SearchListingsApiArg = {
      page: page + 1,
      pageSize: perPage,
    }
    if (sp.get("query")) params.query = sp.get("query")!
    if (sp.get("type")) params.itemType = sp.get("type")!
    if (sp.get("kind") && sp.get("kind") !== "any") params.saleType = sp.get("kind")!
    if (sp.get("minCost")) params.minPrice = Number(sp.get("minCost"))
    if (sp.get("maxCost")) params.maxPrice = Number(sp.get("maxCost"))
    if (sp.get("quantityAvailable")) params.quantityAvailable = Number(sp.get("quantityAvailable"))
    if (sp.get("sort")) params.sort = sp.get("sort")!
    if (sp.get("statuses")) params.statuses = sp.get("statuses")!
    if (sp.get("listing_type")) params.listingType = sp.get("listing_type")!
    return params
  }, [location.search, page, perPage])

  const { data, isLoading, isFetching, isError, refetch } =
    useSearchListingsQuery(searchParams)

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [location.search])

  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      setPage(newPage)
      ref.current?.scrollIntoView({ block: "end", behavior: "smooth" })
    },
    [],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  const showViewModeSelector = useMemo(() => {
    if (location.pathname.startsWith("/market/services")) return false
    if (location.pathname.startsWith("/market")) return true
    if (location.pathname.startsWith("/bulk")) return true
    if (location.pathname.startsWith("/buyorders")) return true
    return false
  }, [location.pathname])

  // Grid breakpoints matching V1
  const gridBreakpoints = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4 }

  const resultsContent = (
    <>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />

      <Grid container spacing={1} sx={{ width: "100%" }}>
        {isLoading || isFetching ? (
          Array.from({ length: perPage }).map((_, i) => (
            <Grid item {...gridBreakpoints} key={i}>
              <ListingSkeleton index={i} sidebarOpen={sidebarOpen} />
            </Grid>
          ))
        ) : data && data.listings.length > 0 ? (
          data.listings.map((listing, i) => (
            <Grid item {...gridBreakpoints} key={listing.listing_id}>
              <V2ListingCard listing={listing} index={i} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <EmptyListings
              isSearchResult={true}
              isError={isError}
              showCreateAction={true}
              onRetry={refetch}
            />
          </Grid>
        )}

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Divider light />
        </Grid>

        <Grid item xs={12}>
          <ListingPagination
            count={data?.total ?? 0}
            page={page}
            rowsPerPage={perPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Grid>
      </Grid>
    </>
  )

  return (
    <>
      {/* Mobile: BottomSheet sidebar (controlled by MarketSidebarContext via FAB) */}
      {showMobileSidebar && (
        <MarketSidebar showViewModeSelector={showViewModeSelector} />
      )}

      <Container maxWidth="xxxl" sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            /* Mobile layout */
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                {resultsContent}
              </Grid>
            </Grid>
          ) : (
            /* Desktop: sticky sidebar + content */
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              <Paper
                sx={{
                  position: "sticky",
                  top: "calc(64px + 16px)",
                  maxHeight: "calc(100vh - 64px - 32px)",
                  height: "fit-content",
                  width: 300,
                  flexShrink: 0,
                  overflowY: "auto",
                }}
              >
                <MarketSidebar showViewModeSelector={showViewModeSelector} />
              </Paper>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                {resultsContent}
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}

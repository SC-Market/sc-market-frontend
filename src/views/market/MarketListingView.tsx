import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Link as MaterialLink,
  TextField,
  Rating,
  Typography,
  Skeleton,
  TablePagination,
  Tabs,
  Tab,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { getRelativeTime } from "../../util/time"
import { Section } from "../../components/paper/Section"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  AddShoppingCartRounded,
  CreateRounded,
  GavelRounded,
  PersonRounded,
  RefreshRounded,
  WarningRounded,
  VisibilityRounded,
  StarRounded,
} from "@mui/icons-material"
import { useCurrentMarketListing } from "../../features/market"
import { BaseListingType, UniqueListing } from "../../features/market"
import {
  useMarketTrackListingViewMutation,
  useMarketGetListingOrdersQuery,
  useCreateListingBidMutation,
} from "../../features/market"
import { AggregateLink } from "../../features/market"
import { OrderList } from "../../components/list/OrderList"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { Bids } from "../../features/market"
import { useGetGameItemAttributesQuery } from "../../store/api/attributes"
import { Helmet } from "react-helmet"
import { useCookies } from "react-cookie"
import { Cart } from "../../datatypes/Cart"
import { ListingNameAndRating } from "../../components/rating/ListingRating"
import { has_permission } from "../contractor/OrgRoles"
import { BACKEND_URL, FRONTEND_URL } from "../../util/constants"
import { NumericFormat } from "react-number-format"
import { Stack } from "@mui/system"
import { ImagePreviewPaper } from "../../components/paper/ImagePreviewPaper"
import moment from "moment"
import { ClockAlert } from "mdi-material-ui"
import { useTranslation } from "react-i18next"
import { ReportButton } from "../../components/button/ReportButton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { DisplayListingsHorizontal } from "./ItemListings"
import { useTheme } from "@mui/material/styles"
import { useSearchMarketQuery } from "../../features/market"
import { useGetUserOrderReviews } from "../../store/profile"
import { useGetContractorReviewsQuery } from "../../store/contractor"
import { OrderReview } from "../../datatypes/Order"
import { HorizontalListingSkeleton } from "../../components/skeletons"

export function SellerOtherListings(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
  currentListingId: string
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { userSeller, contractorSeller, currentListingId } = props

  // Get other listings from the same seller
  const searchParams = useMemo(() => {
    if (!userSeller && !contractorSeller) return null

    return {
      index: 0,
      page_size: 8, // Get a few more than we need in case current listing is included
      quantityAvailable: 1,
      sort: "date-new",
      listing_type: "not-aggregate",
      user_seller: userSeller?.username || "",
      contractor_seller: contractorSeller?.spectrum_id || "",
    }
  }, [userSeller?.username, contractorSeller?.spectrum_id])

  const {
    data: results,
    isLoading,
    isFetching,
  } = useSearchMarketQuery(searchParams!, {
    skip: !searchParams,
  })

  // Filter out the current listing and convert to legacy format
  const otherListings = useMemo(() => {
    if (!results?.listings) return []

    return results.listings.filter((l) => l.listing_id !== currentListingId) // exclude current listing
  }, [results?.listings, currentListingId])

  const sellerName = userSeller?.username || contractorSeller?.spectrum_id || ""

  // Show skeletons while loading
  if (isLoading || isFetching) {
    return (
      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight="bold"
            gutterBottom
          >
            {t("MarketListingView.otherListingsFrom", {
              seller: sellerName,
              defaultValue: `Other listings from ${sellerName}`,
            })}
          </Typography>
          <Box
            sx={{
              maxWidth: "100%",
              overflowX: "scroll",
              pb: 1,
              display: "flex",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
              <HorizontalListingSkeleton key={index} index={index} />
            ))}
          </Box>
        </Box>
      </Grid>
    )
  }

  // Don't show section if no other listings
  if (!otherListings.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          gutterBottom
        >
          {t("MarketListingView.otherListingsFrom", {
            seller: sellerName,
            defaultValue: `Other listings from ${sellerName}`,
          })}
        </Typography>
        <Box
          sx={{
            maxWidth: "100%",
            overflowX: "scroll",
            pb: 1, // Add some padding for scrollbar
          }}
        >
          <DisplayListingsHorizontal listings={otherListings} />
        </Box>
      </Box>
    </Grid>
  )
}

export function SellerReviews(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { userSeller, contractorSeller } = props

  // Get reviews for user or contractor
  const { data: userReviews, isLoading: userReviewsLoading } =
    useGetUserOrderReviews(userSeller?.username || "", {
      skip: !userSeller?.username,
    })

  const { data: contractorReviews, isLoading: contractorReviewsLoading } =
    useGetContractorReviewsQuery(contractorSeller?.spectrum_id || "", {
      skip: !contractorSeller?.spectrum_id,
    })

  const reviews = useMemo(() => {
    const allReviews = userReviews || contractorReviews || []
    return allReviews.slice(0, 3) // Show max 3 recent reviews
  }, [userReviews, contractorReviews])

  const isLoading = userReviewsLoading || contractorReviewsLoading
  const sellerName = userSeller?.username || contractorSeller?.spectrum_id || ""
  const totalReviews = userReviews?.length || contractorReviews?.length || 0

  // Don't show section if no seller info, still loading, or no reviews
  if (!sellerName || isLoading || !reviews.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight="bold">
            {t("MarketListingView.sellerReviews", {
              seller: sellerName,
              defaultValue: `Reviews for ${sellerName}`,
            })}
          </Typography>
          {totalReviews > 3 && (
            <MaterialLink
              component={Link}
              to={
                userSeller
                  ? `/user/${userSeller.username}/reviews`
                  : `/contractor/${contractorSeller?.spectrum_id}/reviews`
              }
              underline="hover"
              color="primary"
              variant="body2"
            >
              {t(
                "MarketListingView.viewAllReviews",
                "View all {{count}} reviews",
                { count: totalReviews },
              )}
            </MaterialLink>
          )}
        </Box>
        <Grid container spacing={theme.layoutSpacing.component}>
          {reviews.map((review: OrderReview) => (
            <Grid item xs={12} md={4} key={review.review_id}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Rating
                    value={review.rating}
                    max={5}
                    readOnly
                    size="small"
                    icon={<StarRounded fontSize="inherit" />}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getRelativeTime(new Date(review.timestamp))}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    mb: 1,
                  }}
                >
                  {review.content ||
                    t("MarketListingView.noReviewContent", "No review content")}
                </Typography>
                <Divider light sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {t("MarketListingView.reviewBy", "by")}{" "}
                  {review.user_author?.display_name ||
                    review.contractor_author?.name ||
                    t("MarketListingView.anonymousReviewer", "Anonymous")}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  )
}

export function RelatedListings(props: {
  itemType: string
  currentListingId: string
}) {
  const { t } = useTranslation()
  const { itemType, currentListingId } = props

  // Get related listings from the same item type/category
  const searchParams = useMemo(
    () => ({
      index: 0,
      page_size: 8, // Get a few more than we need in case current listing is included
      quantityAvailable: 1,
      sort: "date-new",
      listing_type: "not-aggregate",
      item_type: itemType,
      user_seller: "",
      contractor_seller: "",
    }),
    [itemType],
  )

  const {
    data: results,
    isLoading,
    isFetching,
  } = useSearchMarketQuery(searchParams)

  // Filter out the current listing and convert to legacy format
  const relatedListings = useMemo(() => {
    if (!results?.listings) return []

    return results.listings.filter((l) => l.listing_id !== currentListingId) // Exclude current listing
  }, [results?.listings, currentListingId])

  // Show skeletons while loading
  if (isLoading || isFetching) {
    return (
      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight="bold"
            gutterBottom
          >
            {t("MarketListingView.relatedListings", {
              category: itemType,
              defaultValue: `Related ${itemType} listings`,
            })}
          </Typography>
          <Box
            sx={{
              maxWidth: "100%",
              overflowX: "scroll",
              pb: 1,
              display: "flex",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
              <HorizontalListingSkeleton key={index} index={index} />
            ))}
          </Box>
        </Box>
      </Grid>
    )
  }

  // Don't show section if no related listings
  if (!relatedListings.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          gutterBottom
        >
          {t("MarketListingView.relatedListings", {
            category: itemType,
            defaultValue: `Related ${itemType} listings`,
          })}
        </Typography>
        <Box
          sx={{
            maxWidth: "100%",
            overflowX: "scroll",
            pb: 1, // Add some padding for scrollbar
          }}
        >
          <DisplayListingsHorizontal listings={relatedListings} />
        </Box>
      </Box>
    </Grid>
  )
}

export function ListingDetailItem(props: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      spacing={theme.layoutSpacing.compact}
    >
      {props.icon}
      <Typography color={"text.primary"} variant={"subtitle2"}>
        {props.children}
      </Typography>
    </Stack>
  )
}

export function dateDiffInDays(a: Date, b: Date) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())

  return Math.abs((utc2 - utc1) / _MS_PER_DAY)
}

export function PurchaseArea(props: { listing: BaseListingType }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { listing } = props
  const [quantity, setQuantity] = useState(1)
  const [offer, setOffer] = useState(1)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const containerRef = React.useRef(null)
  const issueAlert = useAlertHook()

  const { data: profile } = useGetUserProfileQuery()
  const location = useLocation()

  const [cookies, setCookie] = useCookies(["market_cart"])
  const [justAddedToCart, setJustAddedToCart] = useState(false)

  const addToCart = useCallback(async () => {
    if (!profile) {
      // Redirect to frontend login page with current path as redirect parameter
      window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`
      return
    }

    const cart: Cart = cookies.market_cart || []
    let found = false
    for (const seller of cart) {
      if (
        seller.contractor_seller_id &&
        seller.contractor_seller_id ===
          listing.listing.contractor_seller?.spectrum_id
      ) {
        const entry = seller.items.find(
          (l) => l.listing_id === listing.listing.listing_id,
        )
        if (entry) {
          entry.quantity = Math.min(
            entry.quantity + quantity,
            listing.listing.quantity_available,
          )
        } else {
          seller.items.push({
            listing_id: listing.listing.listing_id,
            quantity,
            type: listing.type,
          })
        }
        found = true
        break
      } else if (
        seller.user_seller_id &&
        seller.user_seller_id === listing.listing.user_seller?.username
      ) {
        const entry = seller.items.find(
          (l) => l.listing_id === listing.listing.listing_id,
        )
        if (entry) {
          entry.quantity = Math.min(
            entry.quantity + quantity,
            listing.listing.quantity_available,
          )
        } else {
          seller.items.push({
            listing_id: listing.listing.listing_id,
            quantity,
            type: listing.type,
          })
        }
        found = true
        break
      }
    }

    if (!found) {
      cart.push({
        user_seller_id: listing.listing.user_seller?.username,
        contractor_seller_id: listing.listing.contractor_seller?.spectrum_id,
        items: [
          {
            listing_id: listing.listing.listing_id,
            quantity,
            type: listing.type,
          },
        ],
      })
    }

    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000, // 30 days in seconds - cart items may become unavailable or prices may change
    })
    issueAlert({
      message: t("MarketListingView.addedToCart"),
      severity: "success",
    })
    setJustAddedToCart(true)
  }, [
    cookies.market_cart,
    listing.listing.contractor_seller,
    listing.listing.listing_id,
    listing.listing.quantity_available,
    listing.listing.user_seller,
    listing.type,
    location.pathname,
    profile,
    quantity,
    issueAlert,
    setCookie,
    t,
  ])

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
      }}
    >
      <Stack direction={"row"} justifyContent={"space-between"} padding={2}>
        <Stack
          spacing={theme.layoutSpacing.text}
          direction={"column"}
          justifyContent={"space-between"}
        >
          <Box>
            <Typography
              variant={"body1"}
              fontWeight={"bold"}
              color={"text.secondary"}
            >
              {t("MarketListingView.price")}
            </Typography>
            <Typography
              variant={"h5"}
              sx={{
                fontWeight: "bold",
              }}
              // color={'primary'}
            >
              {listing.listing.price.toLocaleString(undefined)} aUEC
            </Typography>
            {listing.type === "unique" && listing.details?.game_item_id && (
              <Box sx={{ mt: 0.5 }}>
                <AggregateLink listing={listing as UniqueListing} />
              </Box>
            )}
          </Box>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values, sourceInfo) => {
              setQuantity(values.floatValue || 0)
              setJustAddedToCart(false)
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  {t("MarketListingView.ofAvailable", {
                    count: listing.listing.quantity_available,
                  })}
                </InputAdornment>
              ),
              inputMode: "numeric",
            }}
            size="small"
            label={t("MarketListingView.quantity")}
            value={quantity}
            color={"secondary"}
          />
        </Stack>
        <Stack
          spacing={theme.layoutSpacing.text}
          direction={"column"}
          justifyContent={"space-between"}
        >
          <Box />
          {justAddedToCart ? (
            <Button
              component={Link}
              to="/market/cart"
              variant={"contained"}
              color={"secondary"}
              startIcon={<VisibilityRounded />}
              size={"large"}
              sx={{
                display: purchaseOpen || offerOpen ? "none" : undefined,
                marginBottom: 1,
              }}
            >
              {t("MarketListingView.viewInCart")}
            </Button>
          ) : (
            <Button
              variant={"contained"}
              color={"primary"}
              startIcon={<AddShoppingCartRounded />}
              size={"large"}
              onClick={addToCart}
              sx={{
                display: purchaseOpen || offerOpen ? "none" : undefined,
                marginBottom: 1,
              }}
            >
              {t("MarketListingView.addToCart")}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

function BidArea(props: { listing: UniqueListing }) {
  const { t } = useTranslation()
  const { listing } = props
  const [bid, setBid] = useState(
    listing.listing.price + listing.auction_details!.minimum_bid_increment,
  )

  const issueAlert = useAlertHook()

  const [createBid, { isLoading }] = useCreateListingBidMutation()

  const handleBid = useCallback(async () => {
    createBid({ listing_id: listing.listing.listing_id, bid_amount: bid })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("MarketListingView.bidSuccess"),
          severity: "success",
        })
        setBid(bid + listing.auction_details!.minimum_bid_increment)
      })
      .catch((err) => issueAlert(err))
  }, [
    bid,
    listing.auction_details,
    listing.listing.listing_id,
    createBid,
    issueAlert,
    t,
  ])

  return (
    <Box
      sx={{
        padding: 2,
        "& > *": {
          marginRight: 1,
        },
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography
          variant={"h5"}
          sx={{
            marginBottom: 2,
            fontWeight: "bold",
          }}
        >
          {t("MarketListingView.currentBid", {
            price: listing.listing.price.toLocaleString(undefined),
          })}
        </Typography>
        {listing.details?.game_item_id && (
          <Box sx={{ mt: 0.5, mb: 1 }}>
            <AggregateLink listing={listing} />
          </Box>
        )}
        <NumericFormat
          decimalScale={0}
          allowNegative={false}
          customInput={TextField}
          thousandSeparator
          onValueChange={async (values, sourceInfo) => {
            setBid(values.floatValue || 0)
          }}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            "aria-label": t("accessibility.bidAmountInput", "Enter bid amount"),
            "aria-describedby": "bid-amount-help",
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">aUEC</InputAdornment>
            ),
            inputMode: "numeric",
          }}
          size="small"
          label={t("MarketListingView.bid")}
          value={bid}
          color={"secondary"}
          disabled={listing.listing.status === "archived"}
          id="bid-amount"
          aria-required="true"
        />
        <div id="bid-amount-help" className="sr-only">
          {t(
            "accessibility.bidAmountHelp",
            "Enter your bid amount in aUEC. Must be higher than current bid plus minimum increment.",
          )}
        </div>
      </Box>
      <Box>
        <LoadingButton
          variant={"outlined"}
          color={"secondary"}
          startIcon={<GavelRounded />}
          size={"large"}
          disabled={
            bid <
              listing.listing.price +
                listing.auction_details!.minimum_bid_increment ||
            listing.listing.status === "archived"
          }
          onClick={handleBid}
          loading={isLoading}
          aria-label={t("accessibility.placeBid", "Place bid")}
          aria-describedby="place-bid-help"
        >
          {t("MarketListingView.placeBid")}
          <span id="place-bid-help" className="sr-only">
            {t(
              "accessibility.placeBidHelp",
              "Submit your bid for this auction item",
            )}
          </span>
        </LoadingButton>
      </Box>
    </Box>
  )
}

// Skeleton component for market listing view
export function MarketListingViewSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid item xs={12} lg={12}>
      <Grid container spacing={theme.layoutSpacing.layout}>
        {/* Left column - Image and user info */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12} lg={12}>
              {/* Image skeleton */}
              <Skeleton
                variant="rectangular"
                height={400}
                width="100%"
                sx={{
                  borderRadius: (theme) =>
                    theme.spacing((theme as ExtendedTheme).borderRadius.image),
                }}
              />
            </Grid>

            {/* User info skeleton */}
            <Grid item lg={12} xs={12}>
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={24}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Right column - Main content */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Card sx={{ minHeight: 400 }}>
                <CardHeader
                  sx={{ padding: 3, paddingBottom: 1 }}
                  title={
                    <Box>
                      {/* Breadcrumbs skeleton */}
                      <Skeleton variant="text" width="80%" height={24} />
                      {/* Title skeleton */}
                      <Skeleton
                        variant="text"
                        width="70%"
                        height={40}
                        sx={{ mt: 1 }}
                      />
                      {/* Meta info skeleton */}
                      <Skeleton
                        variant="text"
                        width="50%"
                        height={24}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  }
                  subheader={
                    <Box sx={{ mt: 2 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton
                          key={i}
                          variant="text"
                          width="60%"
                          height={20}
                          sx={{ mt: 0.5 }}
                        />
                      ))}
                    </Box>
                  }
                />
                <CardContent sx={{ padding: 3, paddingTop: 0 }}>
                  {/* Action area skeleton */}
                  <Skeleton
                    variant="rectangular"
                    height={80}
                    width="100%"
                    sx={{ mb: 2 }}
                  />
                  {/* Description skeleton */}
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="85%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

// Component for displaying item attributes
function ItemAttributesSection({ gameItemId }: { gameItemId: string }) {
  const { t } = useTranslation()
  const { data: attributesData } = useGetGameItemAttributesQuery(gameItemId)

  if (!attributesData?.attributes || attributesData.attributes.length === 0) {
    return null
  }

  return (
    <Box sx={{ paddingTop: 2 }}>
      <Typography
        variant={"subtitle1"}
        fontWeight={"bold"}
        color={"text.secondary"}
        sx={{ mb: 1 }}
      >
        {t("MarketListingView.itemAttributes", "Item Attributes")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 1,
        }}
      >
        {attributesData.attributes.map((attr) => (
          <Box key={attr.attribute_name}>
            <Typography variant="caption" color="text.secondary">
              {attr.display_name}
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {attr.attribute_value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Component for displaying paginated orders
function ListingOrdersSection({ listingId }: { listingId: string }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0)
  const [activeOrdersPage, setActiveOrdersPage] = useState(0) // TablePagination uses 0-based indexing
  const [completedOrdersPage, setCompletedOrdersPage] = useState(0) // TablePagination uses 0-based indexing
  const [activeOrdersPageSize, setActiveOrdersPageSize] = useState(10)
  const [completedOrdersPageSize, setCompletedOrdersPageSize] = useState(10)

  // Define status arrays as constants to avoid recreation
  const activeStatuses = ["not-started", "in-progress"]
  const completedStatuses = ["fulfilled", "cancelled"]

  // Fetch active orders (not-started, in-progress)
  const { data: activeOrdersData, isLoading: activeOrdersLoading } =
    useMarketGetListingOrdersQuery({
      listing_id: listingId,
      page: activeOrdersPage + 1, // Convert 0-based to 1-based for API
      pageSize: activeOrdersPageSize,
      status: activeStatuses,
      sortBy: "timestamp",
      sortOrder: "desc",
    })

  // Fetch completed orders (fulfilled, cancelled)
  const { data: completedOrdersData, isLoading: completedOrdersLoading } =
    useMarketGetListingOrdersQuery({
      listing_id: listingId,
      page: completedOrdersPage + 1, // Convert 0-based to 1-based for API
      pageSize: completedOrdersPageSize,
      status: completedStatuses,
      sortBy: "timestamp",
      sortOrder: "desc",
    })

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleActiveOrdersPageChange = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => {
    setActiveOrdersPage(page)
  }

  const handleCompletedOrdersPageChange = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => {
    setCompletedOrdersPage(page)
  }

  const handleActiveOrdersPageSizeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setActiveOrdersPageSize(parseInt(event.target.value, 10))
    setActiveOrdersPage(0)
  }

  const handleCompletedOrdersPageSizeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setCompletedOrdersPageSize(parseInt(event.target.value, 10))
    setCompletedOrdersPage(0)
  }

  // Don't render if no orders exist
  if (!activeOrdersData?.data?.length && !completedOrdersData?.data?.length) {
    return null
  }

  return (
    <>
      <Section
        xs={12}
        title={t("MarketListingView.orders")}
        innerJustify={"flex-start"}
        disablePadding
      >
        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              label={`${t("MarketListingView.activeOrders")} (${activeOrdersData?.pagination?.totalItems || 0})`}
            />
            <Tab
              label={`${t("MarketListingView.previousOrders")} (${completedOrdersData?.pagination?.totalItems || 0})`}
            />
          </Tabs>

          <Box sx={{ paddingTop: 2, paddingBottom: 2 }}>
            {activeTab === 0 && (
              <>
                {activeOrdersLoading ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : (
                  <>
                    <OrderList orders={activeOrdersData?.data || []} />
                    {activeOrdersData?.pagination &&
                      activeOrdersData.pagination.totalItems > 0 && (
                        <TablePagination
                          labelRowsPerPage={t("rows_per_page")}
                          labelDisplayedRows={({ from, to, count }) => (
                            <>
                              {t("displayed_rows", {
                                from: from.toLocaleString(undefined),
                                to: to.toLocaleString(undefined),
                                count: count,
                              })}
                            </>
                          )}
                          SelectProps={{
                            "aria-label": t("rows_per_page"),
                            color: "primary",
                          }}
                          rowsPerPageOptions={[5, 10, 20, 50]}
                          component="div"
                          count={activeOrdersData.pagination.totalItems}
                          rowsPerPage={activeOrdersPageSize}
                          page={activeOrdersPage}
                          onPageChange={handleActiveOrdersPageChange}
                          onRowsPerPageChange={handleActiveOrdersPageSizeChange}
                          color={"primary"}
                          nextIconButtonProps={{ color: "primary" }}
                          backIconButtonProps={{ color: "primary" }}
                        />
                      )}
                  </>
                )}
              </>
            )}

            {activeTab === 1 && (
              <>
                {completedOrdersLoading ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : (
                  <>
                    <OrderList orders={completedOrdersData?.data || []} />
                    {completedOrdersData?.pagination &&
                      completedOrdersData.pagination.totalItems > 0 && (
                        <TablePagination
                          labelRowsPerPage={t("rows_per_page")}
                          labelDisplayedRows={({ from, to, count }) => (
                            <>
                              {t("displayed_rows", {
                                from: from.toLocaleString(undefined),
                                to: to.toLocaleString(undefined),
                                count: count,
                              })}
                            </>
                          )}
                          SelectProps={{
                            "aria-label": t("rows_per_page"),
                            color: "primary",
                          }}
                          rowsPerPageOptions={[5, 10, 20, 50]}
                          component="div"
                          count={completedOrdersData.pagination.totalItems}
                          rowsPerPage={completedOrdersPageSize}
                          page={completedOrdersPage}
                          onPageChange={handleCompletedOrdersPageChange}
                          onRowsPerPageChange={
                            handleCompletedOrdersPageSizeChange
                          }
                          color={"primary"}
                          nextIconButtonProps={{ color: "primary" }}
                          backIconButtonProps={{ color: "primary" }}
                        />
                      )}
                  </>
                )}
              </>
            )}
          </Box>
        </Grid>
      </Section>
    </>
  )
}

export function MarketListingView() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [complete] = useCurrentMarketListing<UniqueListing>()
  const { listing, details, photos, auction_details } = complete
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()
  const [trackView] = useMarketTrackListingViewMutation()

  // Track view when component mounts
  useEffect(() => {
    if (listing?.listing_id) {
      trackView(listing.listing_id)
    }
  }, [listing?.listing_id]) // Removed trackView from dependencies to prevent duplicate calls

  const amContractor = useMemo(
    () =>
      profile &&
      currentOrg?.spectrum_id === listing.contractor_seller?.spectrum_id,
    [currentOrg?.spectrum_id, listing?.contractor_seller],
  )
  const amSeller = useMemo(
    () =>
      profile &&
      profile?.username === listing.user_seller?.username &&
      !currentOrg,
    [currentOrg, listing?.user_seller?.username, profile?.username],
  )

  const amContractorManager = useMemo(
    () =>
      amContractor &&
      has_permission(
        currentOrg,
        profile,
        "manage_market",
        profile?.contractors,
      ),
    [currentOrg, profile, amContractor],
  )

  const [timeDisplay, setTimeDisplay] = useState(
    auction_details ? getRelativeTime(new Date(auction_details.end_time)) : "",
  )

  useEffect(() => {
    if (auction_details) {
      const interval = setInterval(
        () =>
          auction_details &&
          setTimeDisplay(getRelativeTime(new Date(auction_details.end_time))),
        1000,
      )
      return () => {
        clearInterval(interval)
      }
    }
  }, [auction_details, listing])

  const ending = useMemo(
    () =>
      timeDisplay.endsWith("seconds") ||
      timeDisplay.endsWith("minutes") ||
      timeDisplay.endsWith("minute") ||
      timeDisplay.endsWith("minute"),
    [timeDisplay],
  )

  const amRelated = useMemo(
    () => amSeller || amContractorManager || profile?.role === "admin",
    [amSeller, amContractorManager, profile?.role],
  )

  // const {data: contractor} = useGetContractorBySpectrumIDQuery(listing.listing.contractor_seller?.spectrum_id!, {skip: !listing.listing.contractor_seller})

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12} lg={12}>
                <ImagePreviewPaper photos={photos} />

                <Helmet>
                  <meta name="description" content={details.description} />
                  <meta name="thumbnail" content={photos[0]} />

                  {/* Open Graph Meta Tags */}
                  <meta property="og:type" content="website" />
                  <meta
                    property="og:url"
                    content={`${FRONTEND_URL}/market/${listing.listing_id}`}
                  />
                  <meta property="og:title" content={details.title} />
                  <meta
                    property="og:description"
                    content={details.description}
                  />
                  <meta property="og:image" content={photos[0]} />

                  {/* Twitter Card Meta Tags */}
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta
                    name="twitter:url"
                    content={`${FRONTEND_URL}/market/${listing.listing_id}`}
                  />
                  <meta name="twitter:title" content={details.title} />
                  <meta
                    name="twitter:description"
                    content={details.description}
                  />
                  <meta name="twitter:image" content={photos[0]} />

                  <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Product",
                      seller: {
                        "@type": listing.contractor_seller
                          ? "Contractor"
                          : "User",
                        name:
                          listing.contractor_seller?.name ||
                          listing.user_seller?.display_name,
                      },
                      description: details.description,
                      name: details.title,
                      price: `${listing.price} aUEC`,
                      kind: details.item_type,
                      image: photos[0],
                      offers: {
                        "@type": "Offer",
                        url: `https://sc-market.space/market/${listing.listing_id}`,
                        priceCurrency: "JPY",
                        price: listing.price,
                        // "priceValidUntil": "2020-11-20",
                        // "itemCondition": "https://schema.org/NewCondition",
                        availability:
                          listing.quantity_available > 0
                            ? "https://schema.org/InStock"
                            : "https://schema.org/OutOfStock",
                      },
                    })}
                  </script>
                </Helmet>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Grid container spacing={theme.layoutSpacing.component}>
              <Grid item xs={12}>
                <Fade in={true}>
                  <Card
                    sx={{
                      minHeight: 400,
                    }}
                  >
                    <CardHeader
                      disableTypography
                      sx={{
                        padding: 3,
                        paddingBottom: 1,
                      }}
                      title={
                        <Stack
                          direction={"column"}
                          alignItems={"left"}
                          spacing={theme.layoutSpacing.text}
                          justifyContent={"left"}
                        >
                          <Breadcrumbs
                            aria-label={t("ui.aria.breadcrumb")}
                            color={"text.primary"}
                          >
                            <MaterialLink
                              component={Link}
                              underline="hover"
                              color="inherit"
                              to="/market"
                            >
                              {t("MarketListingView.market")}
                            </MaterialLink>
                            <MaterialLink
                              component={Link}
                              underline="hover"
                              color="inherit"
                              to={`/market?type=${encodeURIComponent(
                                details.item_type,
                              )}`}
                            >
                              {details.item_type}
                            </MaterialLink>
                            {details.item_name && (
                              <MaterialLink
                                component={Link}
                                underline="hover"
                                color="text.secondary"
                                to={`/market?query=${encodeURIComponent(
                                  details.item_name,
                                )}`}
                              >
                                {details.item_name}
                              </MaterialLink>
                            )}
                          </Breadcrumbs>
                          <Typography
                            sx={{
                              marginRight: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                            variant={"h5"}
                            color={"text.secondary"}
                            fontWeight={"bold"}
                          >
                            {details.title}{" "}
                            <Typography
                              display={"inline"}
                              sx={{ marginLeft: 1 }}
                            >
                              {dateDiffInDays(
                                new Date(),
                                new Date(listing.timestamp),
                              ) <= 1 && (
                                <Chip
                                  color={"secondary"}
                                  label={t("MarketListingView.new")}
                                  sx={{
                                    marginRight: 1,
                                    textTransform: "uppercase",
                                    fontSize: "0.85em",
                                    fontWeight: "bold",
                                  }}
                                />
                              )}
                            </Typography>
                          </Typography>
                          {auction_details && (
                            <Typography
                              display={"inline"}
                              color={ending ? "error.light" : "inherit"}
                            >
                              {timeDisplay.endsWith("ago")
                                ? t("MarketListingView.ended")
                                : t("MarketListingView.endingIn")}{" "}
                              {timeDisplay}
                            </Typography>
                          )}
                        </Stack>
                      }
                      subheader={
                        <Box>
                          <Stack direction={"column"} alignItems={"left"}>
                            <ListingDetailItem
                              icon={<PersonRounded fontSize={"inherit"} />}
                            >
                              <ListingNameAndRating
                                user={listing.user_seller}
                                contractor={listing.contractor_seller}
                              />
                            </ListingDetailItem>

                            <ListingDetailItem
                              icon={<CreateRounded fontSize={"inherit"} />}
                            >
                              {t("MarketListingView.listed")}{" "}
                              {getRelativeTime(new Date(listing.timestamp))}
                            </ListingDetailItem>

                            <ListingDetailItem
                              icon={<RefreshRounded fontSize={"inherit"} />}
                            >
                              {t("MarketListingView.updated")}{" "}
                              {getRelativeTime(
                                moment(listing.expiration)
                                  .subtract(30, "days")
                                  .toDate(),
                              )}
                            </ListingDetailItem>

                            <ListingDetailItem
                              icon={<ClockAlert fontSize={"inherit"} />}
                            >
                              {t("MarketListingView.expires")}{" "}
                              {getRelativeTime(new Date(listing.expiration))}
                            </ListingDetailItem>

                            <ListingDetailItem
                              icon={<VisibilityRounded fontSize={"inherit"} />}
                            >
                              {t("MarketListingView.views")}{" "}
                              {(
                                complete.stats?.view_count || 0
                              ).toLocaleString()}
                            </ListingDetailItem>

                            <ListingDetailItem
                              icon={<WarningRounded fontSize={"inherit"} />}
                            >
                              <ReportButton
                                reportedUrl={`/market/${listing.listing_id}`}
                              />
                            </ListingDetailItem>

                            {listing.languages &&
                              listing.languages.length > 0 && (
                                <ListingDetailItem
                                  icon={<PersonRounded fontSize={"inherit"} />}
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
                                    {listing.languages.map((lang) => (
                                      <Chip
                                        key={lang.code}
                                        label={lang.name}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 22, fontSize: "0.7rem" }}
                                      />
                                    ))}
                                  </Box>
                                </ListingDetailItem>
                              )}
                          </Stack>
                        </Box>
                      }
                      action={
                        <Stack
                          direction={"row"}
                          spacing={theme.layoutSpacing.compact}
                        >
                          {amRelated &&
                          listing.status !== "archived" &&
                          listing.sale_type !== "auction" ? (
                            <Link
                              to={`/market_edit/${listing.listing_id}`}
                              style={{ color: "inherit" }}
                            >
                              <IconButton>
                                <CreateRounded style={{ color: "inherit" }} />
                              </IconButton>
                            </Link>
                          ) : undefined}
                        </Stack>
                      }
                    />
                    <CardContent
                      sx={{
                        width: "auto",
                        minHeight: 192,
                        padding: 3,
                        paddingTop: 0,
                      }}
                    >
                      {listing.status === "active" && (
                        <>
                          <Divider light />
                          {listing.sale_type === "auction" ? (
                            <BidArea listing={complete as UniqueListing} />
                          ) : (
                            <PurchaseArea listing={complete} />
                          )}
                          <Divider light />
                        </>
                      )}
                      <Box sx={{ paddingTop: 2 }}>
                        <Typography
                          variant={"subtitle1"}
                          fontWeight={"bold"}
                          color={"text.secondary"}
                        >
                          {t("MarketListingView.description")}
                        </Typography>
                        <Typography variant={"body2"}>
                          <MarkdownRender text={details.description} />
                        </Typography>
                      </Box>
                      {details.game_item_id && (
                        <ItemAttributesSection
                          gameItemId={details.game_item_id}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
              {/*{*/}
              {/*    amRelated && (listing.sale_type === 'sale') &&*/}
              {/*    <Offers listing={listing}/>*/}
              {/*}*/}
              {amRelated &&
                listing.sale_type === "auction" &&
                (complete as UniqueListing).bids && (
                  <Bids listing={complete as UniqueListing} />
                )}

              {amRelated && (
                <ListingOrdersSection listingId={listing.listing_id} />
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Seller Reviews Section - Full Width */}
        <SellerReviews
          userSeller={listing.user_seller}
          contractorSeller={listing.contractor_seller}
        />

        {/* Seller's Other Listings Section - Full Width */}
        <SellerOtherListings
          userSeller={listing.user_seller}
          contractorSeller={listing.contractor_seller}
          currentListingId={listing.listing_id}
        />

        {/* Related Listings Section - Full Width */}
        <RelatedListings
          itemType={details.item_type}
          currentListingId={listing.listing_id}
        />
      </Grid>
    </>
  )
}

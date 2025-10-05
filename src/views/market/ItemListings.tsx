/*
<ListingSection xs={12}>
            <Grid item xs={12} lg={10} container justifyContent={'left'}>
<Grid item xs={.66}>
    <Avatar src={userObject.avatar} variant={'rounded'}
            sx={{width: theme.spacing(8), height: theme.spacing(8)}}/>
</Grid>
<Grid item xs={3}>
    <Typography
        color={"text.secondary"}
        variant={'subtitle1'}
        fontWeight={'bold'}
    >
        {listing.title}
    </Typography>
    <Link to={`/user/${userObject.username}`} style={{textDecoration: 'none', color: 'inherit'}}>
        <Typography variant={'subtitle2'} color={'primary'}>
            {userObject.username}
        </Typography>
    </Link>
</Grid>
<Grid item xs={12} lg={4}>
    <Typography
        color={"text.secondary"}
        variant={'subtitle1'}
        fontWeight={'bold'}
    >
        {listing.description}
    </Typography>
</Grid>
</Grid>


<Grid item xs={12} lg={2} container justifyContent={'right'}>

</Grid>
</ListingSection>
 */
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Fab,
  Fade,
  Grid,
  Skeleton,
  TablePagination,
  Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  MarketAggregate,
  MarketAggregateListing,
  MarketListing,
  MarketListingType,
  SellerListingType,
  UniqueListing,
} from "../../datatypes/MarketListing"
import { useMarketSearch } from "../../hooks/market/MarketSearch"
import {
  MarketListingSearchResult,
  useGetBuyOrderListingsQuery,
  useRefreshMarketListingMutation,
  useSearchMarketListingsQuery,
  ExtendedUniqueSearchResult,
  ExtendedMultipleSearchResult,
  ExtendedAggregateSearchResult,
  useSearchMarketQuery,
  useGetMyListingsQuery,
} from "../../store/market"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { useMarketSidebarExp } from "../../hooks/market/MarketSidebar"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import { RecentListingsSkeleton } from "../../pages/home/LandingPage"
import { getRelativeTime } from "../../util/time"
import { MarketListingRating } from "../../components/rating/ListingRating"
import { useGetUserProfileQuery } from "../../store/profile"
import { RefreshRounded } from "@mui/icons-material"
import moment from "moment/moment"
import { Stack } from "@mui/system"
import { formatMarketMultipleUrl, formatMarketUrl } from "../../util/urls"
import { FALLBACK_IMAGE_URL } from "../../util/constants" // const listingIcons = {

export function ListingSkeleton(props: { index: number }) {
  const { index } = props
  const marketSidebarOpen = useMarketSidebarExp()
  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={3}
      sx={{ transition: "0.3s" }}
    >
      <Fade
        in={true}
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <Skeleton
          variant={"rectangular"}
          height={400}
          width={"100%"}
          sx={{ borderRadius: 3 }}
        />
      </Fade>
    </Grid>
  )
}

export function ListingRefreshButton(props: {
  listing: ExtendedUniqueSearchResult
}) {
  const { listing } = props
  const [refresh] = useRefreshMarketListingMutation()

  return (
    <Fab
      sx={{ position: "absolute", right: 8, top: 8 }}
      color={"primary"}
      size={"small"}
      onClick={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        await refresh(listing.listing_id)
      }}
    >
      <RefreshRounded />
    </Fab>
  )
}

export function ItemListingBase(props: {
  listing: ExtendedUniqueSearchResult
  index: number
}) {
  const { t, i18n } = useTranslation()
  const { listing, index } = props
  const { user_seller, contractor_seller } = listing
  const theme = useTheme<ExtendedTheme>()
  const [timeDisplay, setTimeDisplay] = useState(
    listing.auction_end_time
      ? getRelativeTime(new Date(listing.auction_end_time))
      : "",
  )

  useEffect(() => {
    if (listing.auction_end_time) {
      const interval = setInterval(
        () =>
          listing.auction_end_time &&
          setTimeDisplay(getRelativeTime(new Date(listing.auction_end_time))),
        1000,
      )
      return () => {
        clearInterval(interval)
      }
    }
  }, [listing])
  const ending = useMemo(
    () =>
      timeDisplay.endsWith("seconds") ||
      timeDisplay.endsWith("minutes") ||
      timeDisplay.endsWith("minute") ||
      timeDisplay.endsWith("minute"),
    [timeDisplay],
  )
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()
  const showExpiration = useMemo(
    () =>
      (listing.user_seller === profile?.username ||
        (currentOrg && currentOrg.spectrum_id === listing.contractor_seller)) &&
      listing.expiration &&
      profile,
    [
      currentOrg,
      listing.contractor_seller,
      listing.expiration,
      listing.user_seller,
      profile,
    ],
  )

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={formatMarketUrl(listing)}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea sx={{ borderRadius: 2 }}>
          <Card
            sx={{
              height: 400,
              postition: "relative",
            }}
          >
            {showExpiration &&
              moment(listing.expiration) <
                moment().add(1, "months").subtract(3, "days") && (
                <ListingRefreshButton listing={listing} />
              )}
            {moment(listing.timestamp) > moment().subtract(3, "days") && (
              <Chip
                label={t("market.new")}
                color={"secondary"}
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              />
            )}
            {listing.internal && (
              <Chip
                label={t("market.internalListing")}
                color={"warning"}
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              />
            )}
            <CardMedia
              component="img"
              loading="lazy"
              image={listing.photo || FALLBACK_IMAGE_URL}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      height: "100%",
                    }
                  : {
                      height: 244,
                    }),
                // maxHeight: '100%',
                overflow: "hidden",
              }}
              alt={`Image of ${listing.title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light"
                  ? {
                      display: "none",
                    }
                  : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: 1,
                background: `linear-gradient(to bottom, transparent, transparent 25%, ${theme.palette.background.sidebar}AA 40%, ${theme.palette.background.sidebar} 100%)`,
              }}
            />

            <CardContent
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      position: "absolute",
                      bottom: 0,
                      zIndex: 4,
                    }
                  : {}),
                maxWidth: "100%",
              }}
            >
              <Typography variant={"h5"} color={"primary"} fontWeight={"bold"}>
                {listing.price.toLocaleString(i18n.language)} aUEC
              </Typography>
              <Typography
                variant={"subtitle2"}
                color={"text.secondary"}
                maxHeight={60}
              >
                <span
                  style={{
                    lineClamp: "2",
                    textOverflow: "ellipsis",
                    // whiteSpace: "pre-line",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    display: "-webkit-box",
                    WebkitLineClamp: "2",
                  }}
                >
                  {listing.title} ({listing.item_type})
                </span>{" "}
              </Typography>
              <Stack
                direction={"row"}
                spacing={1}
                alignItems={"center"}
                display={"flex"}
                sx={{
                  width: "100%",
                  overflowX: "hidden",
                }}
              >
                <UnderlineLink
                  component={Link}
                  display={"inline"}
                  noWrap={true}
                  variant={"subtitle2"}
                  to={
                    user_seller
                      ? `/user/${user_seller}`
                      : `/contractor/${contractor_seller}`
                  }
                  sx={{
                    overflowX: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user_seller || contractor_seller}{" "}
                </UnderlineLink>
                <Typography variant={"subtitle2"} sx={{ flexShrink: "0" }}>
                  <MarketListingRating
                    avg_rating={listing.avg_rating}
                    rating_count={listing.rating_count}
                    total_rating={listing.total_rating}
                    rating_streak={listing.rating_streak}
                    total_orders={listing.total_orders}
                    total_assignments={listing.total_assignments}
                    response_rate={listing.response_rate}
                  />
                </Typography>
              </Stack>

              {listing.auction_end_time && (
                <Typography display={"block"}>
                  <Typography
                    display={"inline"}
                    color={ending ? "error.light" : "inherit"}
                    variant={"subtitle2"}
                  >
                    {timeDisplay.endsWith("ago")
                      ? t("market.ended", { time: timeDisplay })
                      : t("market.ending_in", { time: timeDisplay })}
                  </Typography>
                </Typography>
              )}
              {showExpiration && (
                <Typography display={"block"}>
                  <Typography
                    display={"inline"}
                    color={ending ? "error.light" : "inherit"}
                    variant={"subtitle2"}
                  >
                    {t("market.expiration", {
                      time: getRelativeTime(new Date(listing.expiration!)),
                    })}
                  </Typography>
                </Typography>
              )}
              <Typography
                display={"block"}
                color={"text.primary"}
                variant={"subtitle2"}
              >
                {t("market.available", {
                  count: listing.quantity_available,
                })}
              </Typography>
            </CardContent>
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}

export function ItemListing(props: {
  listing: ExtendedUniqueSearchResult
  index: number
}) {
  const { listing, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={3}
      sx={{ transition: "0.3s" }}
      // key={listing.listing.listing_id}
    >
      <ItemListingBase listing={listing} index={index} />
    </Grid>
  )
}

export function AggregateListing(props: {
  aggregate: ExtendedAggregateSearchResult
  index: number
}) {
  const { aggregate, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={3}
      sx={{ transition: "0.3s" }}
      // key={aggregate.aggregate_id}
    >
      <AggregateListingBase aggregate={aggregate} index={index} />
    </Grid>
  )
}

export function AggregateBuyOrderListing(props: {
  aggregate: MarketAggregate
  index: number
}) {
  const { aggregate, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={3}
      sx={{ transition: "0.3s" }}
    >
      <AggregateBuyOrderListingBase aggregate={aggregate} index={index} />
    </Grid>
  )
}

export function AggregateListingBase(props: {
  aggregate: ExtendedAggregateSearchResult
  index: number
}) {
  const { t } = useTranslation()
  const { aggregate, index } = props
  const theme = useTheme<ExtendedTheme>()
  const { minimum_price, photo, quantity_available, title } = aggregate

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={`/market/aggregate/${aggregate.game_item_id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea
          sx={{
            borderRadius: 3,
          }}
        >
          <Card
            sx={{
              borderRadius: 2,
              height: 400,
              postition: "relative",
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              image={photo || FALLBACK_IMAGE_URL}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      height: "100%",
                    }
                  : {
                      height: 244,
                    }),
                // maxHeight: '100%',
                overflow: "hidden",
              }}
              alt={`Image of ${title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light"
                  ? {
                      display: "none",
                    }
                  : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: 2,
                background: `linear-gradient(to bottom, transparent, transparent 25%, ${theme.palette.background.sidebar}AA 40%, ${theme.palette.background.sidebar} 100%)`,
              }}
            />

            <Box
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      position: "absolute",
                      bottom: 0,
                      zIndex: 4,
                    }
                  : {}),
              }}
            >
              <CardContent>
                <Typography
                  variant={"h5"}
                  color={"primary"}
                  fontWeight={"bold"}
                >
                  {minimum_price.toLocaleString(undefined)} aUEC{" "}
                </Typography>
                <Typography
                  variant={"subtitle2"}
                  color={"text.secondary"}
                  maxHeight={60}
                >
                  <span
                    style={{
                      lineClamp: "2",
                      textOverflow: "ellipsis",
                      // whiteSpace: "pre-line",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                    }}
                  >
                    {aggregate.title} ({aggregate.item_type})
                  </span>{" "}
                </Typography>
                <Typography
                  display={"block"}
                  color={"text.primary"}
                  variant={"subtitle2"}
                >
                  {quantity_available.toLocaleString(undefined)}{" "}
                  {t("market.total_available")}
                </Typography>
              </CardContent>
            </Box>

            {/*<CardActions*/}
            {/*    sx={{*/}
            {/*        paddingLeft: 2,*/}
            {/*        paddingRight: 2*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Grid container justifyContent={'space-between'}>*/}
            {/*        /!*<Grid item xs={6} container alignItems={'center'}>*!/*/}
            {/*        /!*    <Rating name="read-only" value={listing.rating} readOnly precision={0.1}/>*!/*/}
            {/*        /!*</Grid>*!/*/}
            {/*        <Grid item xs={6} container justifyContent={'right'}>*/}
            {/*            <Button color={'secondary'} variant={'outlined'}>*/}
            {/*                Buy*/}
            {/*            </Button>*/}
            {/*        </Grid>*/}

            {/*    </Grid>*/}

            {/*</CardActions>*/}
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}

export function AggregateBuyOrderListingBase(props: {
  aggregate: MarketAggregate
  index: number
}) {
  const { t } = useTranslation()
  const { aggregate, index } = props
  const { details, listings, photos } = aggregate
  const theme = useTheme<ExtendedTheme>()
  const maximum_price = useMemo(
    () =>
      aggregate.buy_orders.length
        ? aggregate.buy_orders.reduce((prev, curr) =>
            prev.price > curr.price ? prev : curr,
          ).price
        : 0,
    [aggregate.buy_orders],
  )
  const minimum_price = useMemo(
    () =>
      aggregate.buy_orders.length
        ? aggregate.buy_orders.reduce((prev, curr) =>
            prev.price < curr.price ? prev : curr,
          ).price
        : 0,
    [aggregate.buy_orders],
  )
  const sum_requested = useMemo(
    () => aggregate.buy_orders.reduce((prev, curr) => prev + curr.quantity, 0),
    [aggregate.buy_orders],
  )

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={`/market/aggregate/${aggregate.details.game_item_id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea
          sx={{
            borderRadius: 3,
          }}
        >
          <Card
            sx={{
              borderRadius: 2,
              height: 400,
              postition: "relative",
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              image={photos[0] || FALLBACK_IMAGE_URL}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      height: "100%",
                    }
                  : {
                      height: 244,
                    }),
                // maxHeight: '100%',
                overflow: "hidden",
              }}
              alt={`Image of ${details.title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light"
                  ? {
                      display: "none",
                    }
                  : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: 2,
                background: `linear-gradient(to bottom, transparent, transparent 25%, ${theme.palette.background.sidebar}AA 40%, ${theme.palette.background.sidebar} 100%)`,
              }}
            />

            <Box
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      position: "absolute",
                      bottom: 0,
                      zIndex: 4,
                    }
                  : {}),
              }}
            >
              <CardContent>
                <Typography
                  variant={"h6"}
                  color={"primary"}
                  fontWeight={"bold"}
                >
                  {minimum_price.toLocaleString(undefined)} -{" "}
                  {maximum_price.toLocaleString(undefined)} aUEC/
                  {t("market.unit")}
                </Typography>
                <Typography
                  variant={"subtitle2"}
                  color={"text.secondary"}
                  maxHeight={60}
                >
                  <span
                    style={{
                      lineClamp: "2",
                      textOverflow: "ellipsis",
                      // whiteSpace: "pre-line",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                    }}
                  >
                    {details.title} ({details.item_type})
                  </span>{" "}
                </Typography>
                <Typography
                  display={"block"}
                  color={"text.primary"}
                  variant={"subtitle2"}
                >
                  {sum_requested.toLocaleString(undefined)}{" "}
                  {t("market.total_requested")}
                </Typography>
              </CardContent>
            </Box>

            {/*<CardActions*/}
            {/*    sx={{*/}
            {/*        paddingLeft: 2,*/}
            {/*        paddingRight: 2*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Grid container justifyContent={'space-between'}>*/}
            {/*        /!*<Grid item xs={6} container alignItems={'center'}>*!/*/}
            {/*        /!*    <Rating name="read-only" value={listing.rating} readOnly precision={0.1}/>*!/*/}
            {/*        /!*</Grid>*!/*/}
            {/*        <Grid item xs={6} container justifyContent={'right'}>*/}
            {/*            <Button color={'secondary'} variant={'outlined'}>*/}
            {/*                Buy*/}
            {/*            </Button>*/}
            {/*        </Grid>*/}

            {/*    </Grid>*/}

            {/*</CardActions>*/}
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}

export function MultipleListing(props: {
  multiple: ExtendedMultipleSearchResult
  index: number
}) {
  const { multiple, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={3}
      sx={{ transition: "0.3s" }}
      // key={multiple.multiple_id}
    >
      <MultipleListingBase multiple={multiple} index={index} />
    </Grid>
  )
}

export function MultipleListingBase(props: {
  multiple: ExtendedMultipleSearchResult
  index: number
}) {
  const { t } = useTranslation()
  const { multiple, index } = props
  const { photo, title } = multiple
  const theme = useTheme<ExtendedTheme>()

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <Link
        to={formatMarketMultipleUrl(multiple)}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <CardActionArea
          sx={{
            borderRadius: 3,
          }}
        >
          <Card
            sx={{
              borderRadius: 2,
              height: 400,
              postition: "relative",
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              image={photo || FALLBACK_IMAGE_URL}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      height: "100%",
                    }
                  : {
                      height: 244,
                    }),
                // maxHeight: '100%',
                overflow: "hidden",
              }}
              alt={`Image of ${title}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light"
                  ? {
                      display: "none",
                    }
                  : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: 2,
                background: `linear-gradient(to bottom, transparent, transparent 25%, ${theme.palette.background.sidebar}AA 40%, ${theme.palette.background.sidebar} 100%)`,
              }}
            />

            <Box
              sx={{
                ...(theme.palette.mode === "dark"
                  ? {
                      position: "absolute",
                      bottom: 0,
                      zIndex: 4,
                    }
                  : {}),
              }}
            >
              <CardContent>
                <Typography
                  variant={"h5"}
                  color={"primary"}
                  fontWeight={"bold"}
                >
                  {t("market.starting_at", {
                    price: multiple.minimum_price.toLocaleString(undefined),
                  })}{" "}
                  aUEC
                </Typography>
                <Typography
                  variant={"subtitle2"}
                  color={"text.secondary"}
                  maxHeight={60}
                >
                  <span
                    style={{
                      lineClamp: "2",
                      textOverflow: "ellipsis",
                      // whiteSpace: "pre-line",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                    }}
                  >
                    {title} ({multiple.item_type})
                  </span>{" "}
                </Typography>
                <Typography
                  display={"block"}
                  color={"text.primary"}
                  variant={"subtitle2"}
                >
                  {multiple.quantity_available.toLocaleString(undefined)}{" "}
                  {t("market.total_available")}
                </Typography>
              </CardContent>
            </Box>

            {/*<CardActions*/}
            {/*    sx={{*/}
            {/*        paddingLeft: 2,*/}
            {/*        paddingRight: 2*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Grid container justifyContent={'space-between'}>*/}
            {/*        /!*<Grid item xs={6} container alignItems={'center'}>*!/*/}
            {/*        /!*    <Rating name="read-only" value={listing.rating} readOnly precision={0.1}/>*!/*/}
            {/*        /!*</Grid>*!/*/}
            {/*        <Grid item xs={6} container justifyContent={'right'}>*/}
            {/*            <Button color={'secondary'} variant={'outlined'}>*/}
            {/*                Buy*/}
            {/*            </Button>*/}
            {/*        </Grid>*/}

            {/*    </Grid>*/}

            {/*</CardActions>*/}
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}

export function getComparePrice(
  listing: MarketListingType | SellerListingType,
) {
  const market_listing = listing as UniqueListing
  if (market_listing.listing?.sale_type) {
    return market_listing.listing.price
  }

  const market_aggregate = listing as MarketAggregate
  if (!market_aggregate.listings.length) {
    return 0
  }
  return market_aggregate.listings.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr,
  ).price
}

export function getCompareTimestamp(
  listing: MarketListingType | SellerListingType,
) {
  const market_listing = listing as UniqueListing
  if (market_listing.listing?.sale_type) {
    return +new Date(market_listing.listing.timestamp)
  }

  const market_aggregate = listing as MarketAggregate
  if (market_aggregate.listings.length) {
    return +new Date(
      market_aggregate.listings.reduce((prev, curr) =>
        new Date(prev.timestamp) > new Date(curr.timestamp) ? prev : curr,
      ).timestamp,
    )
  }

  return +new Date()
}

export function DisplayListingsHorizontal(props: {
  listings: MarketListingSearchResult[]
}) {
  const { listings } = props

  return (
    <Grid item xs={12}>
      <Box
        sx={{
          // "& > *": {
          // [theme.breakpoints.up("xs")]: {
          //     width: 250,
          // },
          // },
          width: "100%",
          overflowX: "scroll",
        }}
      >
        <Box display={"flex"}>
          {listings.map((item, index) => {
            return (
              <Box
                sx={{
                  marginLeft: 1,
                  marginRight: 1,
                  width: 250,
                  display: "inline-block",
                  flexShrink: 0,
                }}
                key={item.details_id}
              >
                <ListingBase listing={item} index={index} />
              </Box>
            )
          })}
        </Box>
      </Box>
    </Grid>
  )
}

export function ListingBase(props: {
  listing: MarketListingSearchResult
  index: number
}) {
  const { listing, index } = props
  if (listing.listing_type === "aggregate") {
    return (
      <AggregateListingBase
        aggregate={listing as ExtendedAggregateSearchResult}
        key={index}
        index={index}
      />
    )
  } else if (listing.listing_type === "multiple") {
    return (
      <MultipleListingBase
        multiple={listing as ExtendedMultipleSearchResult}
        key={index}
        index={index}
      />
    )
  } else {
    return (
      <ItemListingBase
        listing={listing as ExtendedUniqueSearchResult}
        key={index}
        index={index}
      />
    )
  }
}

export function Listing(props: {
  listing: MarketListingSearchResult
  index: number
}) {
  const { listing, index } = props
  if (listing.listing_type === "aggregate") {
    return (
      <AggregateListing
        aggregate={listing as ExtendedAggregateSearchResult}
        key={index}
        index={index}
      />
    )
  } else if (listing.listing_type === "multiple") {
    return (
      <MultipleListing
        multiple={listing as ExtendedMultipleSearchResult}
        key={index}
        index={index}
      />
    )
  } else {
    return (
      <ItemListing
        listing={listing as ExtendedUniqueSearchResult}
        key={index}
        index={index}
      />
    )
  }
}

export function DisplayListings(props: {
  listings: MarketListingSearchResult[]
  loading?: boolean
  total?: number
}) {
  const { t } = useTranslation()
  const [perPage, setPerPage] = useState(48)
  const [page, setPage] = useState(0)

  const { listings, loading, total } = props

  const ref = useRef<HTMLDivElement>(null)

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage)
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref, setPage],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(+event.target.value || 0)
      setPage(0)
    },
    [],
  )

  return (
    <React.Fragment>
      <Grid item xs={12}>
        <div ref={ref} />
      </Grid>

      {loading
        ? new Array(perPage)
            .fill(undefined)
            .map((o, i) => <ListingSkeleton index={i} key={i} />)
        : (listings || []).map((item, index) => (
            <Listing listing={item} index={index} key={item.listing_id} />
          ))}

      {listings !== undefined && !listings.length && !props.loading && (
        <Grid item xs={12}>
          {t("no_listings")}
        </Grid>
      )}

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
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
            "aria-label": t("select_rows_per_page"),
            color: "primary",
          }}
          rowsPerPageOptions={[12, 24, 48, 96]}
          component="div"
          count={total ?? (listings?.length || 0)}
          rowsPerPage={perPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>
    </React.Fragment>
  )
}

export function DisplayListingsMin(props: {
  listings: MarketListingSearchResult[]
  loading?: boolean
}) {
  return (
    <React.Fragment>
      {props.loading
        ? new Array(16)
            .fill(undefined)
            .map((o, i) => <ListingSkeleton index={i} key={i} />)
        : props.listings.map((item, index) => (
            <Listing listing={item} index={index} key={item.listing_id} />
          ))}
    </React.Fragment>
  )
}

export function DisplayBuyOrderListings(props: {
  listings: MarketAggregate[]
  loading?: boolean
}) {
  const { t } = useTranslation()
  const [searchState] = useMarketSearch()
  const [perPage, setPerPage] = useState(48)
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [searchState])

  const { listings } = props

  const ref = useRef<HTMLDivElement>(null)

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage)
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  return (
    <>
      <Grid item xs={12}>
        <div ref={ref} />
      </Grid>

      {props.loading
        ? new Array(perPage)
            .fill(undefined)
            .map((o, i) => <ListingSkeleton index={i} key={i} />)
        : listings.map((item, index) => (
            <AggregateBuyOrderListing
              aggregate={item}
              index={index}
              key={item.details.game_item_id}
            />
          ))}

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
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
            "aria-label": t("select_rows_per_page"),
            color: "primary",
          }}
          rowsPerPageOptions={[12, 24, 48, 96]}
          component="div"
          count={listings.length}
          rowsPerPage={perPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>
    </>
  )
}

export function ItemListings(props: {
  org?: string
  user?: string
  status?: string
  mine?: boolean
}) {
  const { t } = useTranslation()
  const [searchState, setSearchState] = useMarketSearch()

  const { org, user, status } = props

  useEffect(() => {
    setSearchState({
      ...searchState,
      quantityAvailable:
        !searchState.quantityAvailable || searchState.quantityAvailable > 1
          ? searchState.quantityAvailable
          : 1,
    })
    // Fire once, no deps
  }, [])

  const [perPage, setPerPage] = useState(48)
  const [page, setPage] = useState(0)

  // Memoize search query parameters to prevent unnecessary re-renders
  const searchQueryParams = useMemo(
    () => ({
      rating: 0,
      contractor_seller: CURRENT_CUSTOM_ORG || org,
      user_seller: user,
      ...searchState,
      index: page,
      page_size: perPage,
      listing_type: "not-aggregate",
    }),
    [org, user, searchState, page, perPage],
  )

  const { data: results, isLoading } =
    useSearchMarketListingsQuery(searchQueryParams)

  const { total, listings } = useMemo(
    () => results || { total: 1, listings: [] },
    [results],
  )

  const ref = useRef<HTMLDivElement>(null)

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage)
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  return (
    <>
      <Grid item xs={12}>
        <div ref={ref} />
      </Grid>
      <DisplayListingsMin listings={listings || []} loading={isLoading} />

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
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
            "aria-label": t("select_rows_per_page"),
            color: "primary",
          }}
          rowsPerPageOptions={[12, 24, 48, 96]}
          component="div"
          count={total}
          rowsPerPage={perPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>
    </>
  )
}

export function BulkListingsRefactor(props: {
  org?: string
  user?: string
  status?: string
  mine?: boolean
}) {
  const { t } = useTranslation()
  const [searchState, setSearchState] = useMarketSearch()

  const { org, user, status } = props

  useEffect(() => {
    setSearchState({
      ...searchState,
      quantityAvailable:
        !searchState.quantityAvailable || searchState.quantityAvailable > 1
          ? searchState.quantityAvailable
          : 1,
    })
    // Fire once, no deps
  }, [])

  const [perPage, setPerPage] = useState(48)
  const [page, setPage] = useState(0)

  // Memoize search query parameters to prevent unnecessary re-renders
  const searchQueryParams = useMemo(
    () => ({
      rating: 0,
      contractor_seller: CURRENT_CUSTOM_ORG || org,
      user_seller: user,
      ...searchState,
      index: page,
      page_size: perPage,
      listing_type: "aggregate",
    }),
    [org, user, searchState, page, perPage],
  )

  const { data: results, isLoading } =
    useSearchMarketListingsQuery(searchQueryParams)

  const { total, listings } = useMemo(
    () => results || { total: 1, listings: [] },
    [results],
  )

  const ref = useRef<HTMLDivElement>(null)

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage)
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  return (
    <>
      <Grid item xs={12}>
        <div ref={ref} />
      </Grid>
      <DisplayListingsMin listings={listings || []} loading={isLoading} />

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
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
            "aria-label": t("select_rows_per_page"),
            color: "primary",
          }}
          rowsPerPageOptions={[12, 24, 48, 96]}
          component="div"
          count={total}
          rowsPerPage={perPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>
    </>
  )
}

export function BuyOrders() {
  const { data: listings, isLoading } = useGetBuyOrderListingsQuery()

  return (
    <DisplayBuyOrderListings
      listings={(listings || []).filter((a) => a.buy_orders.length)}
      loading={isLoading}
    />
  )
}

export function OrgListings(props: { org: string }) {
  const { org } = props
  const [searchState, setSearchState] = useMarketSearch()

  // Use search endpoint with contractor filter
  const { data: searchResults, isLoading } = useSearchMarketListingsQuery({
    contractor_seller: org,
    quantityAvailable: 1,
    index: 0,
    page_size: 96,
    listing_type: undefined,
    ...searchState,
  })

  useEffect(() => {
    setSearchState({
      ...searchState,
      quantityAvailable:
        !searchState.quantityAvailable || searchState.quantityAvailable > 1
          ? searchState.quantityAvailable
          : 1,
      listing_type: undefined,
    })
    // Fire once, no deps
  }, [])

  return (
    <DisplayListings
      listings={searchResults?.listings || []}
      loading={isLoading}
    />
  )
}

export function OrgRecentListings(props: { org: string }) {
  const { org } = props
  const { data: searchResults } = useSearchMarketListingsQuery({
    contractor_seller: org,
    quantityAvailable: 1,
    index: 0,
    page_size: 96, // Large page size to get all listings
    listing_type: undefined,
  })

  return searchResults ? (
    <DisplayListingsHorizontal listings={searchResults.listings || []} />
  ) : (
    <RecentListingsSkeleton />
  )
}

export function UserRecentListings(props: { user: string }) {
  const { user } = props
  const { data: listings } = useSearchMarketListingsQuery({
    page_size: 25,
    user_seller: user,
  })

  return listings ? (
    <DisplayListingsHorizontal listings={listings.listings || []} />
  ) : (
    <RecentListingsSkeleton />
  )
}

export function MyItemListings(props: {
  status?: string
  showInternal?: boolean | "all"
}) {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const { data: profile, isLoading: profileLoading } = useGetUserProfileQuery()
  const [perPage, setPerPage] = useState(48)
  const [page, setPage] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
    if (ref.current) {
      ref.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
      })
    }
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  // Determine if we should search by contractor or user
  const hasOrg = currentOrg && currentOrg.spectrum_id
  const hasUser = !hasOrg && profile?.username && !profileLoading

  // Get search state from URL
  const [searchState] = useMarketSearch()

  // Build search query parameters for new endpoints
  const searchQueryParams = useMemo(() => {
    const baseParams = {
      page_size: perPage,
      index: page * perPage, // Convert page to index
      quantityAvailable: searchState.quantityAvailable ?? 1,
      query: searchState.query || "",
      sort: searchState.sort || "activity",
      minCost: searchState.minCost || undefined,
      maxCost: searchState.maxCost || undefined,
      item_type: searchState.item_type || undefined,
      sale_type: searchState.sale_type || undefined,
    }

    // Add status filter if provided
    if (props.status) {
      ;(baseParams as any).statuses = props.status
    }

    return baseParams
  }, [perPage, page, props.status, searchState])

  // Use unified endpoint with contractor_id parameter when needed
  const finalParams = hasOrg
    ? { ...searchQueryParams, contractor_id: currentOrg?.spectrum_id }
    : searchQueryParams

  const { data: searchResults, isLoading } = useGetMyListingsQuery(finalParams)

  // Convert the new format to the old format for compatibility
  const convertedListings = useMemo(() => {
    if (!searchResults?.listings) return []

    return searchResults.listings.map((listing: any) => ({
      listing_id: listing.listing.listing_id,
      listing_type: listing.type,
      item_type: listing.details.item_type,
      item_name: listing.details.title,
      game_item_id: null,
      price: listing.listing.price,
      expiration: listing.listing.expiration || "",
      minimum_price: listing.listing.price,
      maximum_price: listing.listing.price,
      quantity_available: listing.listing.quantity_available,
      timestamp: listing.listing.timestamp || "",
      total_rating: 0,
      avg_rating: 0,
      details_id: listing.listing.listing_id,
      status: listing.listing.status,
      user_seller: null,
      contractor_seller: null,
      rating_count: 0,
      rating_streak: 0,
      total_orders: listing.stats?.order_count || 0,
      total_assignments: 0,
      response_rate: 0,
      title: listing.details.title,
      photo: listing.photos[0] || "",
      internal: false,
      sale_type: listing.listing.sale_type,
      auction_end_time: null,
    }))
  }, [searchResults])

  return (
    <>
      <Grid item xs={12}>
        <div ref={ref} />
      </Grid>
      <DisplayListingsMin listings={convertedListings} loading={isLoading} />

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
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
            "aria-label": t("select_rows_per_page"),
            color: "primary",
          }}
          rowsPerPageOptions={[12, 24, 48, 96]}
          component="div"
          count={searchResults?.total || 0}
          rowsPerPage={perPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>
    </>
  )
}

export function AllItemListings(props: { status?: string }) {
  const { data: searchResults, isLoading } = useSearchMarketQuery({
    statuses: props.status,
  })

  const [, setSearchState] = useMarketSearch()
  useEffect(() => {
    setSearchState({ query: "", quantityAvailable: 0 })
  }, [])

  return (
    <DisplayListings
      listings={searchResults?.listings || []}
      loading={isLoading}
    />
  )
}

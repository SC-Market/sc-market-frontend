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
import { useTranslation } from "react-i18next" // added
import {
  MarketAggregate,
  MarketAggregateListing,
  MarketListing,
  MarketListingType,
  MarketMultiple,
  SellerListingType,
  UniqueListing,
} from "../../datatypes/MarketListing"
import {
  MarketSearchState,
  useMarketSearch,
} from "../../hooks/market/MarketSearch"
import {
  MarketSearchResult,
  useMarketGetListingsByContractorQuery,
  useMarketGetPublicQuery,
  useMarketGetAllListingsQuery,
  useMarketGetBuyOrderListingsQuery,
  useMarketGetListingByUserQuery,
  useMarketGetMyListingsQuery,
  useMarketRefreshListingMutation,
  useSearchMarketQuery,
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
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { Rating } from "../../datatypes/Contractor"
import { useGetUserProfileQuery } from "../../store/profile"
import { RefreshRounded } from "@mui/icons-material"
import moment from "moment/moment"
import { Stack } from "@mui/system"
import { formatMarketMultipleUrl, formatMarketUrl } from "../../util/urls" // const listingIcons = {

// const listingIcons = {
//     "auction": <GavelIcon/>,
//     "sale": <PaidIcon/>,
//     "service": <AccountBoxIcon/>,
// }

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

export function ListingRefreshButton(props: { listing: MarketListing }) {
  const { listing } = props
  const [refresh] = useMarketRefreshListingMutation()

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
  listing: UniqueListing
  index: number
}) {
  const { listing: complete, index } = props
  const { details, listing, auction_details, photos } = complete
  const { user_seller, contractor_seller } = listing
  const theme = useTheme<ExtendedTheme>()
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
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()
  const showExpiration = useMemo(
    () =>
      (listing.user_seller?.username === profile?.username ||
        (currentOrg &&
          currentOrg.spectrum_id === listing.contractor_seller?.spectrum_id)) &&
      listing.expiration &&
      profile,
    [
      currentOrg,
      listing.contractor_seller?.spectrum_id,
      listing.expiration,
      listing.user_seller?.username,
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
        to={formatMarketUrl(complete)}
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
                label={"New"}
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
            <CardMedia
              component="img"
              loading="lazy"
              image={photos[0]}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src =
                  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
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
                {listing.price.toLocaleString("en-US")} aUEC
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
                      ? `/user/${user_seller?.username}`
                      : `/contractor/${contractor_seller?.spectrum_id}`
                  }
                  sx={{
                    overflowX: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user_seller?.username || contractor_seller?.spectrum_id}{" "}
                </UnderlineLink>
                <Typography variant={"subtitle2"} sx={{ flexShrink: "0" }}>
                  <ListingSellerRating
                    user={user_seller}
                    contractor={contractor_seller}
                  />
                </Typography>
              </Stack>

              {auction_details && (
                <Typography display={"block"}>
                  <Typography
                    display={"inline"}
                    color={ending ? "error.light" : "inherit"}
                    variant={"subtitle2"}
                  >
                    {timeDisplay.endsWith("ago") ? "Ended" : "Ending in"}{" "}
                    {timeDisplay}
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
                    Expiration: {getRelativeTime(new Date(listing.expiration!))}
                  </Typography>
                </Typography>
              )}
              <Typography
                display={"block"}
                color={"text.primary"}
                variant={"subtitle2"}
              >
                {listing.quantity_available.toLocaleString(undefined)} available
              </Typography>
            </CardContent>
          </Card>
        </CardActionArea>
      </Link>
    </Fade>
  )
}

export function ItemListing(props: { listing: UniqueListing; index: number }) {
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
  aggregate: MarketAggregate
  index: number
}) {
  const { aggregate, index } = props
  const { details, listings, photos } = aggregate
  const theme = useTheme<ExtendedTheme>()
  const minimum_price = useMemo(
    () =>
      aggregate.listings.length
        ? aggregate.listings.reduce((prev, curr) =>
            prev.price < curr.price || !curr.quantity_available ? prev : curr,
          ).price
        : 0,
    [aggregate.listings],
  )
  const sum_available = useMemo(
    () =>
      aggregate.listings.reduce(
        (prev, curr) => prev + curr.quantity_available,
        0,
      ),
    [aggregate.listings],
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
              image={
                photos[0] ||
                "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
              }
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src =
                  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
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
                    {details.title} ({details.item_type})
                  </span>{" "}
                </Typography>
                <Typography
                  display={"block"}
                  color={"text.primary"}
                  variant={"subtitle2"}
                >
                  {sum_available.toLocaleString(undefined)} total available
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
              image={
                photos[0] ||
                "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
              }
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src =
                  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
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
                  {maximum_price.toLocaleString(undefined)} aUEC/ea
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
                  {sum_requested.toLocaleString(undefined)} total requested
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
  multiple: MarketMultiple
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
  multiple: MarketMultiple
  index: number
}) {
  const { multiple, index } = props
  const { details, listings, photos } = multiple
  const theme = useTheme<ExtendedTheme>()
  const minimum_price = useMemo(
    () =>
      multiple.listings.length
        ? multiple.listings.reduce((prev, curr) =>
            prev.listing.price < curr.listing.price ? prev : curr,
          ).listing.price
        : 0,
    [multiple.listings],
  )
  const sum_available = useMemo(
    () =>
      multiple.listings.reduce(
        (prev, curr) => prev + curr.listing.quantity_available,
        0,
      ),
    [multiple.listings],
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
              image={
                photos[0] ||
                "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
              }
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src =
                  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
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
                  variant={"h5"}
                  color={"primary"}
                  fontWeight={"bold"}
                >
                  Starting at {minimum_price.toLocaleString(undefined)} aUEC
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
                  {sum_available.toLocaleString(undefined)} total available
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

export function getListingRating(
  listing: MarketAggregateListing | MarketListing,
): Rating {
  return listing.contractor_seller?.rating || listing.user_seller?.rating!
}

export function getCompareRating(
  listing: MarketListingType | SellerListingType,
): number {
  const market_listing = listing as UniqueListing
  if (
    ["unique", "multiple_listing", "aggregate_listing"].includes(listing.type)
  ) {
    const r = getListingRating(market_listing.listing)
    return r.avg_rating * r.rating_count
  } else if (listing.type === "multiple") {
    const multiple = listing as MarketMultiple
    if (!multiple.listings.length) {
      return 0
    }

    const r =
      multiple.listings[0].listing.contractor_seller?.rating ||
      multiple.listings[0].listing.user_seller?.rating!
    return r.avg_rating * r.rating_count
  }

  const market_aggregate = listing as MarketAggregate
  return market_aggregate.listings.reduce((prev, curr) => {
    const r = getListingRating(curr)
    const value = r.avg_rating * r.rating_count
    return prev > value ? prev : value
  }, 0)
}

export function getCompareQuantity(
  listing: MarketListingType | SellerListingType,
) {
  const market_listing = listing as UniqueListing
  if (market_listing.listing?.sale_type) {
    return market_listing.listing.quantity_available
  }

  const market_aggregate = listing as MarketAggregate
  return market_aggregate.listings.reduce(
    (prev, curr) => prev + curr.quantity_available,
    0,
  )
}

export function filterListings<T extends MarketListingType | SellerListingType>(
  listings: T[],
  searchState: MarketSearchState,
): T[] {
  return listings
    .filter((listing) => {
      const market_listing = listing as UniqueListing
      if (
        market_listing.type === "unique" ||
        market_listing.type === "aggregate_composite" ||
        market_listing.type === "multiple_listing"
      ) {
        // Normal listing or aggregate composite
        return (
          (!searchState.status ||
            searchState.status === market_listing.listing.status) &&
          (!searchState.sale_type ||
            searchState.sale_type === "any" ||
            (searchState.sale_type !== "aggregate" &&
              searchState.sale_type === market_listing.listing.sale_type)) &&
          (!searchState.item_type ||
            searchState.item_type === market_listing.details.item_type) &&
          (!searchState.query ||
            listing.details.title
              .toLowerCase()
              .includes(searchState.query.toLowerCase()) ||
            market_listing.details.description
              .toLowerCase()
              .includes(searchState.query.toLowerCase())) &&
          (!searchState.quantityAvailable ||
            market_listing.listing.quantity_available >=
              searchState.quantityAvailable) &&
          (!searchState.maxCost ||
            market_listing.listing.price <= searchState.maxCost) &&
          (!searchState.minCost ||
            market_listing.listing.price >= searchState.minCost)
        )
      }

      if (market_listing.type === "multiple") {
        const multiple = listing as MarketMultiple

        const min = getComparePrice(multiple)

        if (searchState.query) {
          let found =
            multiple.details.title
              .toLowerCase()
              .includes(searchState.query.toLowerCase()) ||
            multiple.details.description
              .toLowerCase()
              .includes(searchState.query.toLowerCase())

          if (!found) {
            found = !!multiple.listings.find(
              (l) =>
                l.details.title
                  .toLowerCase()
                  .includes(searchState.query.toLowerCase()) ||
                l.details.description
                  .toLowerCase()
                  .includes(searchState.query.toLowerCase()),
            )

            if (!found) {
              return false
            }
          }
        }

        return (
          (!searchState.item_type ||
            searchState.item_type === multiple.details.item_type) &&
          (!searchState.quantityAvailable ||
            !!multiple.listings.find(
              (l) =>
                l.listing.quantity_available >= searchState.quantityAvailable!,
            )) &&
          (!searchState.maxCost || min <= searchState.maxCost) &&
          (!searchState.minCost || min >= searchState.minCost) &&
          (!searchState.sale_type ||
            ["any", "sale", "multiple"].includes(searchState.sale_type))
        )
      }

      const market_aggregate = listing as MarketAggregate
      // Aggregate listing
      const min = getComparePrice(market_aggregate)

      return (
        (!searchState.item_type ||
          searchState.item_type === market_aggregate.details.item_type) &&
        (!searchState.quantityAvailable ||
          !!market_aggregate.listings.find(
            (l) => l.quantity_available >= searchState.quantityAvailable!,
          )) &&
        (!searchState.query ||
          market_aggregate.details.title
            .toLowerCase()
            .includes(searchState.query.toLowerCase()) ||
          market_aggregate.details.description
            .toLowerCase()
            .includes(searchState.query.toLowerCase())) &&
        (!searchState.maxCost || min <= searchState.maxCost) &&
        (!searchState.minCost || min >= searchState.minCost) &&
        (!searchState.sale_type ||
          ["any", "sale", "aggregate"].includes(searchState.sale_type))
      )
    })
    .sort((a, b) => {
      switch (searchState.sort) {
        case "title":
          return a.details.title.localeCompare(b.details.title)
        case "price-low":
          return getComparePrice(a) - getComparePrice(b)
        case "price-high":
          return getComparePrice(b) - getComparePrice(a)
        case "quantity-low":
          return getCompareQuantity(a) - getCompareQuantity(b)
        case "quantity-high":
          return getCompareQuantity(b) - getCompareQuantity(a)
        case "date-new":
          return getCompareTimestamp(a) - getCompareTimestamp(b)
        case "date-old":
          return getCompareTimestamp(b) - getCompareTimestamp(a)
        case "activity":
          return getCompareTimestamp(b) - getCompareTimestamp(a)
        case "rating": {
          const brating = getCompareRating(b)
          const arating = getCompareRating(a)
          if (brating === arating) {
            return getCompareTimestamp(b) - getCompareTimestamp(a)
          }
          return brating - arating
        }
        default:
          return 0
      }
    })
}

export function ListingBase(props: {
  listing: MarketListingType
  index: number
}) {
  const { listing, index } = props
  if (listing.type === "aggregate") {
    return (
      <AggregateListingBase
        aggregate={listing as MarketAggregate}
        key={index}
        index={index}
      />
    )
  } else if (listing.type === "multiple") {
    return (
      <MultipleListingBase
        multiple={listing as MarketMultiple}
        key={index}
        index={index}
      />
    )
  } else {
    return (
      <ItemListingBase
        listing={listing as UniqueListing}
        key={index}
        index={index}
      />
    )
  }
}

export function DisplayListingsHorizontal(props: {
  listings: MarketListingType[]
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
                key={item.details.details_id}
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

export function Listing(props: {
  listing: MarketListingType | SellerListingType
  index: number
}) {
  const { listing, index } = props
  if (listing.type === "aggregate") {
    return (
      <AggregateListing
        aggregate={listing as MarketAggregate}
        key={index}
        index={index}
      />
    )
  } else if (listing.type === "multiple") {
    return (
      <MultipleListing
        multiple={listing as MarketMultiple}
        key={index}
        index={index}
      />
    )
  } else {
    return (
      <ItemListing
        listing={listing as UniqueListing}
        key={index}
        index={index}
      />
    )
  }
}

export function DisplayListings(props: {
  listings: (MarketListingType | SellerListingType)[]
  loading?: boolean
}) {
  const { t } = useTranslation() // added
  const [searchState] = useMarketSearch()
  const [perPage, setPerPage] = useState(48)
  const [page, setPage] = useState(0)

  const { listings, loading } = props

  const filteredListings = useMemo(
    () => filterListings(listings, searchState),
    [listings, searchState],
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
        : filteredListings
            .filter(
              (item, index) =>
                index >= perPage * page && index < perPage * (page + 1),
            )
            .map((item, index) => (
              <Listing
                listing={item}
                index={index}
                key={item.details.details_id}
              />
            ))}

      {listings && !filteredListings.length && !props.loading && (
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
          labelDisplayedRows={({ from, to, count }) =>
            t("displayed_rows", {
              from,
              to,
              count: count === -1 ? t("all") : count,
            })
          }
          SelectProps={{
            "aria-label": t("select_rows_per_page"),
            color: "primary",
          }}
          rowsPerPageOptions={[12, 24, 48, 96]}
          component="div"
          count={filteredListings.length}
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

export function convertToLegacy(l: MarketSearchResult): MarketListingType {
  {
    if (l.listing_type === "unique") {
      return {
        accept_offers: false,
        details: {
          details_id: l.details_id,
          item_type: l.item_type,
          item_name: l.item_name,
          game_item_id: l.game_item_id,
          title: l.title,
          description: l.title,
        },
        auction_details:
          l.sale_type === "auction"
            ? {
                listing_id: l.listing_id,
                status: "active",
                minimum_bid_increment: 0,
                end_time: l.auction_end_time,
              }
            : undefined,
        listing: {
          listing_id: l.listing_id,
          sale_type: l.sale_type,
          price: +l.minimum_price,
          timestamp: l.timestamp,
          quantity_available: +l.quantity_available,
          status: l.status,
          expiration: new Date().toString(),
          user_seller: l.user_seller
            ? {
                username: l.user_seller,
                avatar: "",
                display_name: l.user_seller,
                rating: {
                  avg_rating: +l.avg_rating * 10,
                  rating_count: +l.rating_count,
                  streak: +l.rating_streak,
                  total_orders: +l.total_orders,
                },
              }
            : null,
          contractor_seller: l.contractor_seller
            ? {
                avatar: "",
                name: l.contractor_seller,
                spectrum_id: l.contractor_seller,
                rating: {
                  avg_rating: l.avg_rating * 10,
                  rating_count: l.rating_count,
                  streak: l.rating_streak,
                  total_orders: l.total_orders,
                },
              }
            : null,
        },
        photos: [l.photo],
        type: "unique",
      }
    } else if (l.listing_type === "multiple") {
      return {
        user_seller: l.user_seller
          ? {
              username: l.user_seller,
              avatar: "",
              display_name: l.user_seller,
              rating: {
                avg_rating: +l.avg_rating * 10,
                rating_count: +l.rating_count,
                streak: +l.rating_streak,
                total_orders: +l.total_orders,
              },
            }
          : null,
        contractor_seller: l.contractor_seller
          ? {
              avatar: "",
              name: l.contractor_seller,
              spectrum_id: l.contractor_seller,
              rating: {
                avg_rating: +l.avg_rating * 10,
                rating_count: +l.rating_count,
                streak: +l.rating_streak,
                total_orders: +l.total_orders,
              },
            }
          : null,
        default_listing: {
          type: "multiple_listing",
          multiple_id: l.listing_id,
          details: {
            details_id: l.details_id,
            item_type: l.item_type,
            item_name: l.item_name,
            game_item_id: l.game_item_id,
            title: l.title,
            description: l.title,
          },
          listing: {
            listing_id: "",
            sale_type: "sale",
            price: +l.price,
            timestamp: l.timestamp,
            quantity_available: +l.quantity_available,
            status: l.status,
            expiration: new Date().toString(),
          },
          photos: [l.photo],
        },
        listings: [
          {
            multiple_id: l.listing_id,
            listing: {
              listing_id: "",
              sale_type: "sale",
              price: +l.price,
              timestamp: l.timestamp,
              quantity_available: +l.quantity_available,
              status: l.status,
              expiration: new Date().toString(),
            },
            details: {
              details_id: "",
              item_type: "",
              item_name: "",
              game_item_id: null,
              title: "",
              description: "",
            },
            type: "multiple_listing",
            photos: [],
          },
        ],
        multiple_id: l.listing_id,
        photos: [l.photo],
        type: "multiple",
        details: {
          details_id: l.details_id,
          item_type: l.item_type,
          item_name: l.item_name,
          game_item_id: l.game_item_id,
          title: l.title,
          description: l.title,
        },
      }
    } else {
      return {
        buy_orders: [],
        details: {
          details_id: l.details_id,
          item_type: l.item_type,
          item_name: l.item_name,
          game_item_id: l.game_item_id,
          title: l.title,
          description: l.title,
        },
        listings: [
          {
            aggregate_id: l.listing_id,
            listing_id: l.listing_id,
            price: +l.minimum_price,
            timestamp: l.timestamp,
            quantity_available: +l.quantity_available - 1,
            status: l.status,
          },
          {
            aggregate_id: l.listing_id,
            listing_id: l.listing_id,
            price: +l.maximum_price,
            timestamp: l.timestamp,
            quantity_available: 1,
            status: l.status,
          },
        ],
        photos: [l.photo],
        type: "aggregate",
      }
    }
  }
}

export function DisplayListingsMin(props: {
  listings: MarketSearchResult[]
  loading?: boolean
}) {
  const filledListings = useMemo(
    () => props.listings.map((l) => convertToLegacy(l)),
    [props.listings],
  )

  return (
    <React.Fragment>
      {props.loading
        ? new Array(16)
            .fill(undefined)
            .map((o, i) => <ListingSkeleton index={i} key={i} />)
        : filledListings.map((item, index) => (
            <Listing
              listing={item}
              index={index}
              key={item.details.details_id}
            />
          ))}
    </React.Fragment>
  )
}

export function DisplayBuyOrderListings(props: {
  listings: MarketAggregate[]
  loading?: boolean
}) {
  const { t } = useTranslation() // added
  const [searchState] = useMarketSearch()
  const [perPage, setPerPage] = useState(48)
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [searchState])

  const { listings } = props

  const filteredListings = useMemo(
    () => filterListings(listings, searchState),
    [listings, searchState],
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

      {props.loading
        ? new Array(perPage)
            .fill(undefined)
            .map((o, i) => <ListingSkeleton index={i} key={i} />)
        : filteredListings
            .filter(
              (item, index) =>
                index >= perPage * page && index < perPage * (page + 1),
            )
            .map((item, index) => (
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
          labelDisplayedRows={({ from, to, count }) =>
            t("displayed_rows", {
              from,
              to,
              count: count === -1 ? t("all") : count,
            })
          }
          SelectProps={{
            "aria-label": t("select_rows_per_page"),
            color: "primary",
          }}
          rowsPerPageOptions={[12, 24, 48, 96]}
          component="div"
          count={filteredListings.length}
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
  const { t } = useTranslation() // added
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

  const { data: results, isLoading } = useSearchMarketQuery({
    rating: undefined,
    seller_rating: 0,
    contractor_seller: CURRENT_CUSTOM_ORG || org,
    user_seller: user,
    ...searchState,
    index: page,
    page_size: perPage,
    listing_type: "not-aggregate",
  })

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
          labelDisplayedRows={({ from, to, count }) =>
            t("displayed_rows", {
              from,
              to,
              count: count === -1 ? t("all") : count,
            })
          }
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
  const { t } = useTranslation() // added
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

  const { data: results, isLoading } = useSearchMarketQuery({
    rating: undefined,
    seller_rating: 0,
    contractor_seller: CURRENT_CUSTOM_ORG || org,
    user_seller: user,
    ...searchState,
    index: page,
    page_size: perPage,
    listing_type: "aggregate",
  })

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
          labelDisplayedRows={({ from, to, count }) =>
            t("displayed_rows", {
              from,
              to,
              count: count === -1 ? t("all") : count,
            })
          }
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

export function BulkListings() {
  const { data: listings, isLoading } = useMarketGetPublicQuery()

  const [searchState, setSearchState] = useMarketSearch()
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

  return (
    <DisplayListings
      listings={(listings || []).filter((l) => l.type === "aggregate")}
      loading={isLoading}
    />
  )
}

export function BuyOrders() {
  const { data: listings, isLoading } = useMarketGetBuyOrderListingsQuery()

  return (
    <DisplayBuyOrderListings
      listings={(listings || []).filter((a) => a.buy_orders.length)}
      loading={isLoading}
    />
  )
}

export function OrgListings(props: { org: string }) {
  const { org } = props
  const { data: listings, isLoading } =
    useMarketGetListingsByContractorQuery(org)
  const filteredListings = useMemo(() => listings || [], [listings, org])

  const [searchState, setSearchState] = useMarketSearch()
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

  return <DisplayListings listings={filteredListings} loading={isLoading} />
}

export function OrgRecentListings(props: { org: string }) {
  const { org } = props
  const { data: listings } = useMarketGetListingsByContractorQuery(org)

  const filteredListings = useMemo(() => {
    return [...(listings || [])]
      .filter((item) => getCompareQuantity(item))
      .sort((a, b) => getCompareTimestamp(b) - getCompareTimestamp(a))
      .slice(0, 25)
  }, [listings])

  return listings ? (
    <DisplayListingsHorizontal listings={filteredListings || []} />
  ) : (
    <RecentListingsSkeleton />
  )
}

export function UserRecentListings(props: { user: string }) {
  const { user } = props
  const { data: listings } = useMarketGetListingByUserQuery(user)

  const filteredListings = useMemo(() => {
    return [...(listings || [])]
      .filter((item) => getCompareQuantity(item))
      .sort((a, b) => getCompareTimestamp(b) - getCompareTimestamp(a))
      .slice(0, 25)
  }, [listings])

  return listings ? (
    <DisplayListingsHorizontal listings={filteredListings || []} />
  ) : (
    <RecentListingsSkeleton />
  )
}

export function MyItemListings(props: { status?: string }) {
  const [currentOrg] = useCurrentOrg()
  const { data: listings, isLoading } = useMarketGetMyListingsQuery(
    currentOrg?.spectrum_id,
  )

  const { status } = props
  const filteredListings = useMemo(
    () =>
      (listings || []).filter((listing) => {
        if (!status) {
          return true
        }

        const unique = listing as UniqueListing
        if (unique.listing) {
          return status === unique.listing.status
        } else {
          const multiple = listing as MarketMultiple
          return multiple.listings.find((l) => l.listing.status === status)
        }
      }),
    [listings, status],
  )

  const [, setSearchState] = useMarketSearch()
  useEffect(() => {
    setSearchState({ query: "", quantityAvailable: 0 })
  }, [])

  return (
    <DisplayListings listings={[...filteredListings]} loading={isLoading} />
  )
}

export function AllItemListings(props: { status?: string }) {
  const { data: listings, isLoading } = useMarketGetAllListingsQuery(undefined)

  const [, setSearchState] = useMarketSearch()
  useEffect(() => {
    setSearchState({ query: "", quantityAvailable: 0 })
  }, [])

  const filteredListings = useMemo(
    () =>
      (listings || []).filter((listing) => {
        if (!props.status) {
          return true
        }

        const unique = listing as UniqueListing
        if (unique.listing) {
          return props.status === unique.listing.status
        } else {
          const multiple = listing as MarketMultiple
          return multiple.listings.find(
            (l) => l.listing.status === props.status,
          )
        }
      }),
    [listings, props.status],
  )

  return <DisplayListings listings={filteredListings} loading={isLoading} />
}

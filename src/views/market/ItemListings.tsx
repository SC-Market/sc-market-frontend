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
  useMediaQuery,
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
  MarketListingComplete,
} from "../../store/market"
import { Link, useNavigate } from "react-router-dom"
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
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { AdCard } from "../../components/ads/AdCard"
import { MARKET_ADS } from "../../components/ads/adConfig"
import { VirtualizedGrid } from "../../components/list/VirtualizedGrid"
import {
  injectAds,
  ListingOrAd,
  isListing,
  calculateRequestSize,
} from "../../components/ads/adUtils"
import { ListingSkeleton as StandardListingSkeleton } from "../../components/skeletons"
import { EmptyListings } from "../../components/empty-states"

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

export const ItemListingBase = React.memo(
  function ItemListingBase(props: {
    listing: ExtendedUniqueSearchResult
    index: number
  }) {
    const { t, i18n } = useTranslation()
    const { listing, index } = props
    const { user_seller, contractor_seller } = listing
    const theme = useTheme<ExtendedTheme>()
    const navigate = useNavigate()
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
          (currentOrg &&
            currentOrg.spectrum_id === listing.contractor_seller)) &&
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
        <Box
          sx={{
            position: "relative",
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          {showExpiration &&
            moment(listing.expiration) <
              moment().add(1, "months").subtract(3, "days") && (
              <ListingRefreshButton listing={listing} />
            )}
          <Link
            to={formatMarketUrl(listing)}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <CardActionArea
              sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
            >
              <Card
                sx={{
                  height: 400,
                  position: "relative",
                }}
              >
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
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                    background: `linear-gradient(to bottom, transparent, transparent 60%, ${theme.palette.background.sidebar}AA 70%, ${theme.palette.background.sidebar} 100%)`,
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
                  <Typography
                    variant={"h5"}
                    color={"primary"}
                    fontWeight={"bold"}
                  >
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
                    spacing={theme.layoutSpacing.text}
                    alignItems={"center"}
                    display={"flex"}
                    sx={{
                      width: "100%",
                      overflowX: "hidden",
                    }}
                  >
                    <UnderlineLink
                      component="span"
                      display={"inline"}
                      noWrap={true}
                      variant={"subtitle2"}
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
                        badge_ids={listing.badges?.badge_ids || null}
                        display_limit={3}
                      />
                    </Typography>
                  </Stack>

                  {listing.auction_end_time && (
                    <Typography component="div" display={"block"}>
                      <Typography
                        component="span"
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
                    <Typography component="div" display={"block"}>
                      <Typography
                        component="span"
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
                  {listing.languages && listing.languages.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        mt: 1,
                      }}
                    >
                      {listing.languages.map((lang) => (
                        <Chip
                          key={lang.code}
                          label={lang.name}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </CardActionArea>
          </Link>
        </Box>
      </Fade>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if listing data actually changed
    return (
      prevProps.listing.listing_id === nextProps.listing.listing_id &&
      prevProps.listing.price === nextProps.listing.price &&
      prevProps.listing.quantity_available ===
        nextProps.listing.quantity_available &&
      prevProps.listing.status === nextProps.listing.status &&
      prevProps.listing.expiration === nextProps.listing.expiration &&
      prevProps.index === nextProps.index
    )
  },
)

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
      sm={marketSidebarOpen ? 12 : 6}
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
      sm={marketSidebarOpen ? 12 : 6}
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
      sm={marketSidebarOpen ? 12 : 6}
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
            borderRadius: (theme) =>
              theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
          }}
        >
          <Card
            sx={{
              borderRadius: (theme) =>
                theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
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
                borderRadius: (theme) =>
                  theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
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
            borderRadius: (theme) =>
              theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
          }}
        >
          <Card
            sx={{
              borderRadius: (theme) =>
                theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
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
                borderRadius: (theme) =>
                  theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
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
      sm={marketSidebarOpen ? 12 : 6}
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
            borderRadius: (theme) =>
              theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
          }}
        >
          <Card
            sx={{
              borderRadius: (theme) =>
                theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
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
                borderRadius: (theme) =>
                  theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
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
  listing: MarketListingSearchResult | ListingOrAd
  index: number
}) {
  const { listing, index } = props

  // Handle ad cards
  if (!isListing(listing)) {
    return <AdCard ad={listing} index={index} />
  }

  // Handle regular listings
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
  startIndex?: number
  disableAds?: boolean
}) {
  const { t } = useTranslation()
  const [perPage, setPerPage] = useState(48)
  const [page, setPage] = useState(0)
  const marketSidebarOpen = useMarketSidebarExp()

  const { listings, loading, total, startIndex = 0, disableAds = false } = props

  const ref = useRef<HTMLDivElement>(null)

  // Inject ads into listings array before pagination
  // Ads are injected into the full list, then we paginate the result
  const listingsWithAds = useMemo(() => {
    if (loading || !listings || listings.length === 0) {
      return []
    }
    // Skip ad injection if disabled
    if (disableAds) {
      return listings
    }
    // Inject ads into the full listings array
    // startIndex accounts for any offset from parent (e.g., if parent is doing server-side pagination)
    return injectAds(listings, MARKET_ADS, startIndex)
  }, [listings, loading, startIndex, disableAds])

  // Apply client-side pagination to the listings with ads
  const paginatedListings = useMemo(() => {
    const start = page * perPage
    const end = start + perPage
    return listingsWithAds.slice(start, end)
  }, [listingsWithAds, page, perPage])

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
            .map((o, i) => (
              <StandardListingSkeleton
                key={i}
                index={i}
                sidebarOpen={marketSidebarOpen}
              />
            ))
        : paginatedListings.map((item, index) => {
            // Generate unique key for each item (listing or ad)
            const key = isListing(item)
              ? item.listing_id
              : `ad-${item.id}-${index}`
            // Note: Listing components (ItemListingBase, AggregateListingBase, MultipleListingBase)
            // already have Material-UI Fade animations built in, so no need for AnimatedListItem wrapper
            return <Listing listing={item} index={index} key={key} />
          })}

      {listings !== undefined && !listings.length && !props.loading && (
        <Grid item xs={12}>
          <EmptyListings isSearchResult={true} />
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
          count={total ?? listingsWithAds.length}
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
  startIndex?: number
  disableAds?: boolean
  useVirtualization?: boolean
}) {
  const {
    listings,
    loading,
    startIndex = 0,
    disableAds = false,
    useVirtualization = true,
  } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Inject ads into listings array
  const listingsWithAds = useMemo(() => {
    if (loading || !listings || listings.length === 0) {
      return []
    }
    // Skip ad injection if disabled
    if (disableAds) {
      return listings
    }
    // Inject ads into the full listings array
    return injectAds(listings, MARKET_ADS, startIndex)
  }, [listings, loading, startIndex, disableAds])

  // Use virtualization for large lists (50+ items) or on mobile
  const shouldVirtualize =
    useVirtualization && (listingsWithAds.length > 50 || isMobile)

  if (loading) {
    const marketSidebarOpen = useMarketSidebarExp()
    return (
      <React.Fragment>
        {new Array(16).fill(undefined).map((o, i) => (
          <StandardListingSkeleton
            index={i}
            key={i}
            sidebarOpen={marketSidebarOpen}
          />
        ))}
      </React.Fragment>
    )
  }

  if (shouldVirtualize && listingsWithAds.length > 0) {
    // Use virtual scrolling for better performance
    // For virtualized grid, we render ItemListingBase directly (not wrapped in Grid item)
    return (
      <Grid item xs={12}>
        <Box
          sx={{
            // Remove fixed height on <900px devices to allow natural page scrolling
            height: { xs: "auto", sm: "auto", md: "calc(100vh - 400px)" },
            minHeight: { xs: "auto", sm: "auto", md: 600 },
          }}
        >
          <VirtualizedGrid
            items={listingsWithAds}
            renderItem={(item, index) => {
              const key = isListing(item)
                ? item.listing_id
                : `ad-${item.id}-${index}`
              // For virtualized grid, render the base component directly
              // The grid handles layout, so we don't need Grid item wrapper
              if (isListing(item)) {
                if (item.listing_type === "unique") {
                  return (
                    <ItemListingBase
                      listing={item as ExtendedUniqueSearchResult}
                      index={index}
                      key={key}
                    />
                  )
                } else if (item.listing_type === "aggregate") {
                  return (
                    <AggregateListingBase
                      aggregate={item as ExtendedAggregateSearchResult}
                      index={index}
                      key={key}
                    />
                  )
                } else if (item.listing_type === "multiple") {
                  return (
                    <MultipleListingBase
                      multiple={item as ExtendedMultipleSearchResult}
                      index={index}
                      key={key}
                    />
                  )
                }
              }
              // Ad card - render same as listings, no special handling
              return (
                <AdCard
                  ad={item as any}
                  index={index}
                  key={key}
                  noGridWrapper={true}
                />
              )
            }}
            itemHeight={400}
            columns={{ xs: 2, sm: 2, md: 3, lg: 4 }}
            gap={{
              xs: theme.layoutSpacing.component,
              sm: theme.layoutSpacing.layout,
            }}
            overscan={3}
          />
        </Box>
      </Grid>
    )
  }

  // Show empty state if no listings
  if (listingsWithAds.length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyListings isSearchResult={false} showCreateAction={false} />
      </Grid>
    )
  }

  // Fallback to regular rendering for small lists
  return (
    <React.Fragment>
      {listingsWithAds.map((item, index) => {
        // Generate unique key for each item (listing or ad)
        const key = isListing(item) ? item.listing_id : `ad-${item.id}-${index}`
        // Note: Listing components already have Material-UI Fade animations built in
        return <Listing listing={item} index={index} key={key} />
      })}
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
  const marketSidebarOpen = useMarketSidebarExp()

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
            .map((o, i) => (
              <StandardListingSkeleton
                key={i}
                index={i}
                sidebarOpen={marketSidebarOpen}
              />
            ))
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
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
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

  const [perPage, setPerPage] = useState(isMobile ? 12 : 48)
  const [page, setPage] = useState(0)

  // Memoize search query parameters to prevent unnecessary re-renders
  const searchQueryParams = useMemo(
    () => ({
      rating: 0,
      contractor_seller: CURRENT_CUSTOM_ORG || org,
      user_seller: user,
      ...searchState,
      language_codes:
        searchState.language_codes && searchState.language_codes.length > 0
          ? searchState.language_codes.join(",")
          : undefined,
      index: page,
      page_size: perPage,
      listing_type: "not-aggregate",
    }),
    [org, user, searchState, page, perPage],
  )

  const { data: results, isLoading, isFetching } =
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
      <DisplayListingsMin
        listings={listings || []}
        loading={isLoading || isFetching}
        disableAds={!!(org || user)}
      />

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

  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [perPage, setPerPage] = useState(isMobile ? 12 : 48)
  const [page, setPage] = useState(0)

  // Memoize search query parameters to prevent unnecessary re-renders
  const searchQueryParams = useMemo(
    () => ({
      rating: 0,
      contractor_seller: CURRENT_CUSTOM_ORG || org,
      user_seller: user,
      ...searchState,
      language_codes:
        searchState.language_codes && searchState.language_codes.length > 0
          ? searchState.language_codes.join(",")
          : undefined,
      index: page,
      page_size: perPage,
      listing_type: "aggregate",
    }),
    [org, user, searchState, page, perPage],
  )

  const { data: results, isLoading, isFetching } =
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
      <DisplayListingsMin
        listings={listings || []}
        loading={isLoading || isFetching}
        disableAds={!!(org || user)}
      />

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
    language_codes:
      searchState.language_codes && searchState.language_codes.length > 0
        ? searchState.language_codes.join(",")
        : undefined,
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
      disableAds={true}
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
  const { t } = useTranslation()
  const { data: listings, isLoading, isFetching } = useSearchMarketListingsQuery({
    page_size: 25,
    user_seller: user,
  })

  if (isLoading || isFetching) {
    return <RecentListingsSkeleton />
  }

  if (!listings || (listings.listings || []).length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyListings
          isSearchResult={false}
          showCreateAction={false}
          title={t("emptyStates.profile.noListings", {
            defaultValue: "No listings yet",
          })}
          description={t("emptyStates.profile.noListingsDescription", {
            defaultValue: "This user hasn't created any market listings yet",
          })}
        />
      </Grid>
    )
  }

  return <DisplayListingsHorizontal listings={listings.listings || []} />
}

export const completeToSearchResult = (
  listing: UniqueListing,
): MarketListingSearchResult => {
  const seller =
    listing.listing.user_seller || listing.listing.contractor_seller!
  const rating = seller.rating

  return {
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
    total_rating: rating.total_rating,
    avg_rating: rating.avg_rating, // Already in 0-5 scale, no division needed
    details_id: listing.listing.listing_id,
    status: listing.listing.status,
    user_seller: listing.listing.user_seller?.username || null,
    contractor_seller: listing.listing.contractor_seller?.spectrum_id || null,
    rating_count: rating.rating_count,
    rating_streak: rating.streak,
    total_orders: listing.stats?.order_count || 0,
    total_assignments: rating.total_assignments || 0,
    response_rate: rating.response_rate || 0,
    title: listing.details.title,
    photo: listing.photos[0] || "",
    internal: false,
    sale_type: listing.listing.sale_type as "auction" | "sale",
    auction_end_time: null,
  }
}

export function MyItemListings(props: {
  status?: string
  showInternal?: boolean | "all"
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [currentOrg] = useCurrentOrg()
  const { data: profile, isLoading: profileLoading } = useGetUserProfileQuery()
  const [perPage, setPerPage] = useState(isMobile ? 12 : 48)
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

  const { data: searchResults, isLoading, isFetching } = useGetMyListingsQuery(finalParams)

  // Convert the new format to the old format for compatibility
  const convertedListings: MarketListingSearchResult[] = useMemo(() => {
    if (!searchResults?.listings) return []

    return searchResults.listings.map(completeToSearchResult)
  }, [searchResults])

  return (
    <>
      <Grid item xs={12}>
        <div ref={ref} />
      </Grid>
      <DisplayListingsMin listings={convertedListings} loading={isLoading || isFetching} />

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

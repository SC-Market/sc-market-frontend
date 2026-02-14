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
  Chip,
  Divider,
  Fab,
  Grid,
  Skeleton,
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
  marketApi,
  useMarketSearch,
  useMarketSidebarExp,
} from "../../index"
import { Link, useNavigate } from "react-router-dom"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { UnderlineLink } from "../../../../components/typography/UnderlineLink"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { CURRENT_CUSTOM_ORG } from "../../../../hooks/contractor/CustomDomain"
import { RecentListingsSkeleton } from "../../../../components/landing"
import { getRelativeTime } from "../../../../util/time"
import {
  MarketListingRating,
  BadgeDisplay,
} from "../../../../components/rating/ListingRating"
import {
  calculateBadgesFromRating,
  prioritizeBadges,
} from "../../../../util/badges"
import { useGetUserProfileQuery } from "../../../../store/profile"
import { RefreshRounded, EditRounded, ShareRounded } from "@mui/icons-material"
import { isAfter, subDays, addMonths, subDays as subDaysFromDate } from "date-fns"
import { Stack } from "@mui/system"
import { AdCard } from "../../../../components/ads/AdCard"
import { MARKET_ADS } from "../../../../components/ads/adConfig"
import { VirtualizedGrid } from "../../../../components/list/VirtualizedGrid"
import {
  injectAds,
  ListingOrAd,
  isListing,
  calculateRequestSize,
} from "../../../../components/ads/adUtils"
import { completeToSearchResult } from "../utils/listingUtils"
import { ListingSkeleton as StandardListingSkeleton } from "../../../../components/skeletons"
import { EmptyListings } from "../../../../components/empty-states"
import { LongPressMenu } from "../../../../components/gestures"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import {
  ListingRefreshButton,
  ItemListingBase,
  ItemListing,
} from "../../components/listings/ListingCard"
import {
  AggregateListing,
  AggregateListingBase,
  AggregateBuyOrderListing,
  AggregateBuyOrderListingBase,
} from "../../components/listings/AggregateListingCard"
import {
  MultipleListing,
  MultipleListingBase,
} from "../../components/listings/MultipleListingCard"
import { ListingPagination } from "../../components/listings/ListingPagination"

export {
  ListingRefreshButton,
  ItemListingBase,
  ItemListing,
} from "../../components/listings/ListingCard"
export {
  AggregateListing,
  AggregateListingBase,
  AggregateBuyOrderListing,
  AggregateBuyOrderListingBase,
} from "../../components/listings/AggregateListingCard"
export {
  MultipleListing,
  MultipleListingBase,
} from "../../components/listings/MultipleListingCard"

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
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Grid item xs={12}>
      <Box
        sx={{
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
                  width: isMobile ? 200 : 250,
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
        <ListingPagination
          count={total ?? listingsWithAds.length}
          page={page}
          rowsPerPage={perPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </React.Fragment>
  )
}

export function DisplayListingsMin(props: {
  listings: MarketListingSearchResult[]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  startIndex?: number
  disableAds?: boolean
  useVirtualization?: boolean
}) {
  const {
    listings,
    loading,
    error,
    onRetry,
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

  // Use virtualization for large lists (50+ items)
  const shouldVirtualize =
    useVirtualization && listingsWithAds.length > 50

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
            itemHeight={{ xs: 300, sm: 300, md: 420, lg: 420 }}
            columns={{ xs: 2, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 }}
            gap={{
              xs: theme.layoutSpacing.component,
              sm: theme.layoutSpacing.layout,
            }}
            overscan={3}
          />
      </Grid>
    )
  }

  // Show empty state if no listings
  if (listingsWithAds.length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyListings
          isSearchResult={false}
          isError={error}
          onRetry={onRetry}
          showCreateAction={false}
        />
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
        <ListingPagination
          count={listings.length}
          page={page}
          rowsPerPage={perPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
  const searchQueryParams = useMemo(() => {
    const { attributes, ...rest } = searchState
    const params: any = {
      rating: 0,
      contractor_seller: CURRENT_CUSTOM_ORG || org,
      user_seller: user,
      ...rest,
      language_codes:
        searchState.language_codes && searchState.language_codes.length > 0
          ? searchState.language_codes.join(",")
          : undefined,
      index: page,
      page_size: perPage,
      listing_type: "not-aggregate",
    }

    // Convert attributes object to attr_* params
    if (attributes) {
      Object.entries(attributes).forEach(([name, values]) => {
        if (values && values.length > 0) {
          params[`attr_${name}`] = values.join(",")
        }
      })
    }

    return params
  }, [org, user, searchState, page, perPage])

  const {
    data: results,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSearchMarketListingsQuery(searchQueryParams)

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
        error={!!error}
        onRetry={() => refetch()}
        disableAds={!!(org || user)}
      />

      <Box sx={{ width: "100%" }}>
        <Divider light />
      </Box>

      <Box sx={{ width: "100%" }}>
        <ListingPagination
          count={total}
          page={page}
          rowsPerPage={perPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
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

  const {
    data: results,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSearchMarketListingsQuery(searchQueryParams)

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
        error={!!error}
        onRetry={() => refetch()}
        disableAds={!!(org || user)}
      />

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
        <ListingPagination
          count={total}
          page={page}
          rowsPerPage={perPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </>
  )
}

export function BuyOrders() {
  const [searchState] = useMarketSearch()

  // Convert attributes from URL format to API format
  const searchParams = useMemo(() => {
    const params: any = {}

    // Convert attributes to JSON string for API
    if (
      searchState.attributes &&
      Object.keys(searchState.attributes).length > 0
    ) {
      const attributeFilters = Object.entries(searchState.attributes).map(
        ([name, values]) => ({
          name,
          values,
          operator: "in" as const,
        }),
      )
      params.attributes = JSON.stringify(attributeFilters)
    }

    return params
  }, [searchState])

  const { data: listings, isLoading } =
    useGetBuyOrderListingsQuery(searchParams)

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
  const {
    data: listings,
    isLoading,
    isFetching,
  } = useSearchMarketListingsQuery({
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

// Re-exported from utils
export { completeToSearchResult } from "../utils/listingUtils"

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

  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = useGetMyListingsQuery(finalParams)

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
      <DisplayListingsMin
        listings={convertedListings}
        loading={isLoading || isFetching}
      />

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
        <ListingPagination
          count={searchResults?.total || 0}
          page={page}
          rowsPerPage={perPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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

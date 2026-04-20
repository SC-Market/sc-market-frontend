/**
 * V2 listing-view components that use V2 APIs and V2 listing cards.
 * Drop-in replacements for the V1 listing-view components.
 */

import React, { useMemo } from "react"
import { Box, Grid, Typography, Skeleton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useSearchListingsQuery, useGetPriceHistoryQuery, ListingSearchResult } from "../../../../store/api/v2/market"
import { ListingCardV2 } from "../ListingSearchV2"
import { Section } from "../../../../components/paper/Section"
import { MuiAreaChart } from "../../../../components/charts/MuiCharts"

function HorizontalListingScroll({ listings }: { listings: ListingSearchResult[] }) {
  return (
    <Grid item xs={12}>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box display="flex" gap={1}>
          {listings.map((listing, i) => (
            <Box key={listing.listing_id} sx={{ minWidth: 280, maxWidth: 320 }}>
              <ListingCardV2 listing={listing} index={i} />
            </Box>
          ))}
        </Box>
      </Box>
    </Grid>
  )
}

function LoadingRow() {
  return (
    <Grid item xs={12}>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box display="flex" gap={1}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={300} height={200} />
          ))}
        </Box>
      </Box>
    </Grid>
  )
}

export function SellerOtherListingsV2(props: {
  sellerUsername?: string | null
  contractorSpectrumId?: string | null
  currentListingId: string
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { sellerUsername, contractorSpectrumId, currentListingId } = props

  const { data, isLoading } = useSearchListingsQuery(
    {
      sellerUsername: sellerUsername || undefined,
      contractorSpectrumId: contractorSpectrumId || undefined,
      pageSize: 8,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    { skip: !sellerUsername && !contractorSpectrumId },
  )

  const listings = useMemo(
    () => (data?.listings ?? []).filter((l) => l.listing_id !== currentListingId),
    [data, currentListingId],
  )

  if (isLoading) return <LoadingRow />
  if (!listings.length) return null

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" fontWeight="bold">
          {t("listing.otherListings", "Other listings from this seller")}
        </Typography>
      </Grid>
      <HorizontalListingScroll listings={listings} />
    </>
  )
}

export function RelatedListingsV2(props: {
  itemType: string
  currentListingId: string
}) {
  const { t } = useTranslation()
  const { itemType, currentListingId } = props

  const { data, isLoading } = useSearchListingsQuery({
    itemType,
    pageSize: 8,
    sortBy: "created_at",
    sortOrder: "desc",
  })

  const listings = useMemo(
    () => (data?.listings ?? []).filter((l) => l.listing_id !== currentListingId),
    [data, currentListingId],
  )

  if (isLoading) return <LoadingRow />
  if (!listings.length) return null

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" fontWeight="bold">
          {t("listing.relatedListings", "Related Listings")}
        </Typography>
      </Grid>
      <HorizontalListingScroll listings={listings} />
    </>
  )
}

export function AggregateMarketDataV2(props: {
  gameItemId: string
  currentPrice: number
}) {
  const { t } = useTranslation()
  const { gameItemId } = props

  const { data: priceData, isLoading } = useGetPriceHistoryQuery(
    { gameItemId },
    { skip: !gameItemId },
  )

  const series = useMemo(() => {
    if (!priceData?.data?.length) return null
    const points = priceData.data
    return [
      { name: "Average", data: points.map((p) => ({ x: p.timestamp, y: p.avg_price })) },
      { name: "Min", data: points.map((p) => ({ x: p.timestamp, y: p.min_price })) },
      { name: "Max", data: points.map((p) => ({ x: p.timestamp, y: p.max_price })) },
    ]
  }, [priceData])

  if (isLoading || !series) return null

  return (
    <Section xs={12} title={t("listing.marketAnalysis", "Market Analysis") as string}>
      <Grid item xs={12}>
        <MuiAreaChart
          series={series}
          height={400}
          xAxisType="time"
          yAxisLabel="aUEC"
        />
      </Grid>
    </Section>
  )
}

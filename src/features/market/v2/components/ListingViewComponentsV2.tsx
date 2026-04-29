/**
 * V2 listing-view components that use V2 APIs and V2 listing cards.
 * Drop-in replacements for the V1 listing-view components.
 */

import React, { useMemo } from "react"
import { Box, Grid, Typography, Skeleton, Button } from "@mui/material"
import { ArrowForwardRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useSearchListingsQuery, useGetPriceHistoryQuery, type ListingSearchResult } from "../../../../store/api/v2/market"
import { ListingCardV2 } from "../ListingSearchV2"
import { Section } from "../../../../components/paper/Section"
import { MuiAreaChart } from "../../../../components/charts/MuiCharts"

// ============================================================================
// Shared listing row component
// ============================================================================

function ListingRow({
  title,
  seeAllHref,
  listings,
  isLoading,
}: {
  title: string
  seeAllHref: string
  listings: ListingSearchResult[]
  isLoading: boolean
}) {
  if (isLoading) return (
    <Grid item xs={12}>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box display="flex" gap={1}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={225} height={200} />
          ))}
        </Box>
      </Box>
    </Grid>
  )

  if (!listings.length) return null

  return (
    <>
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold">{title}</Typography>
          <Button
            component={Link}
            to={seeAllHref}
            size="small"
            endIcon={<ArrowForwardRounded />}
            sx={{ textTransform: "none" }}
          >
            See all
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box display="flex" gap={1}>
            {listings.map((listing, i) => (
              <Box key={listing.listing_id} sx={{ minWidth: 210, maxWidth: 240 }}>
                <ListingCardV2 listing={listing} index={i} />
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </>
  )
}

// ============================================================================
// Seller's other listings
// ============================================================================

export function SellerOtherListingsV2(props: {
  sellerUsername?: string | null
  contractorSpectrumId?: string | null
  currentListingId: string
}) {
  const { t } = useTranslation()
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

  const seeAllHref = contractorSpectrumId
    ? `/market?seller=${encodeURIComponent(contractorSpectrumId)}`
    : `/market?seller=${encodeURIComponent(sellerUsername || "")}`

  return (
    <ListingRow
      title={t("listing.otherListings", "Other listings from this seller")}
      seeAllHref={seeAllHref}
      listings={listings}
      isLoading={isLoading}
    />
  )
}

// ============================================================================
// Related listings (same item type)
// ============================================================================

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

  return (
    <ListingRow
      title={t("listing.relatedListings", "Related Listings")}
      seeAllHref={`/market?type=${encodeURIComponent(itemType)}`}
      listings={listings}
      isLoading={isLoading}
    />
  )
}

// ============================================================================
// Price history chart
// ============================================================================

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

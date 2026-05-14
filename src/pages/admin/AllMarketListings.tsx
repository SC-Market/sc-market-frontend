import React, { useState } from "react"
import {
  Box,
  Divider,
  Grid,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Fade,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExpireAllListingsButton } from "../../views/admin/ExpireAllListingsButton"
import {
  useSearchListingsQuery,
  SearchListingsApiArg,
  ListingSearchResult,
} from "../../store/api/v2/market"
import { formatPrice } from "../../util/formatPrice"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { ListingPagination } from "../../features/market/components/listings/ListingPagination"

type ListingStatus = "active" | "inactive" | "expired" | "sold" | "cancelled"

function AdminListingCard({ listing }: { listing: ListingSearchResult }) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Fade in style={{ transitionDuration: "300ms" }}>
      <Box sx={{ position: "relative", height: "100%" }}>
        <Link
          to={`/listing/${listing.listing_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <CardActionArea
            sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
          >
            <Card sx={{ height: 280, position: "relative" }}>
              <CardMedia
                component="img"
                loading="lazy"
                image={listing.photo || FALLBACK_IMAGE_URL}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null
                  currentTarget.src = FALLBACK_IMAGE_URL
                }}
                sx={{ height: 140, objectFit: "cover" }}
                alt={listing.title}
              />
              <CardContent sx={{ padding: "8px 12px !important" }}>
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  noWrap
                  sx={{ fontSize: "0.95rem", mb: 0.5 }}
                >
                  {listing.price_min === listing.price_max
                    ? formatPrice(listing.price_min)
                    : `${formatPrice(listing.price_min)} - ${formatPrice(listing.price_max)}`}
                </Typography>
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
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {listing.seller_name} · {listing.game_item_type}
                </Typography>
                <Typography
                  display="block"
                  variant="caption"
                  color="text.primary"
                  sx={{ mt: 0.5 }}
                >
                  Qty: {listing.quantity_available}
                  {listing.variant_count > 1 &&
                    ` · ${listing.variant_count} variants`}
                </Typography>
              </CardContent>
            </Card>
          </CardActionArea>
        </Link>
      </Box>
    </Fade>
  )
}

function ListingsSkeleton() {
  return (
    <Grid container spacing={1}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={i}>
          <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
        </Grid>
      ))}
    </Grid>
  )
}

function AdminListingsSection({ status }: { status: ListingStatus }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(48)

  const { data, isLoading } = useSearchListingsQuery({
    status,
    page,
    pageSize,
    sortBy: "updated_at",
    sortOrder: "desc",
  })

  if (isLoading) return <ListingsSkeleton />

  if (!data?.listings?.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        No {status} listings
      </Typography>
    )
  }

  return (
    <>
      <Grid container spacing={1}>
        {data.listings.map((listing) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={listing.listing_id}>
            <AdminListingCard listing={listing} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 2 }}>
        <ListingPagination
          count={data.total}
          page={page - 1}
          rowsPerPage={pageSize}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10))
            setPage(1)
          }}
        />
      </Box>
    </>
  )
}

export function AllMarketListings() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ListingStatus>("active")

  return (
    <StandardPageLayout
      title={t("market.allListingsTitle", "All Market Listings")}
      headerTitle={t("market.allListingsTitle", "All Market Listings")}
      headerActions={<ExpireAllListingsButton />}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Active" value="active" />
          <Tab label="Inactive" value="inactive" />
          <Tab label="Expired" value="expired" />
          <Tab label="Sold" value="sold" />
          <Tab label="Cancelled" value="cancelled" />
        </Tabs>
        <Divider sx={{ mb: 2 }} />
      </Grid>

      <Grid item xs={12}>
        <AdminListingsSection status={tab} />
      </Grid>
    </StandardPageLayout>
  )
}

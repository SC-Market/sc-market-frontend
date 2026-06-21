import { useParams } from "react-router-dom"
import {
  Avatar,
  Box,
  Chip,
  Container,
  Grid,
  Rating,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { StorefrontRounded } from "@mui/icons-material"
import { useState } from "react"
import { useGetShopQuery, useSearchListingsQuery } from "../../store/api/v2/market"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { DarkBannerContainer, LightBannerContainer } from "../../features/profile/components/BannerContainers"
import { ListingCardV2 } from "../../features/market/v2/ListingSearchV2"

export function ShopProfile() {
  const { slug } = useParams<{ slug: string }>()
  const theme = useTheme<ExtendedTheme>()
  const { data: shop, isLoading, error } = useGetShopQuery({ slug: slug! }, { skip: !slug })
  const [tab, setTab] = useState(0)

  if (isLoading) return <ShopProfileSkeleton />

  if (error || !shop) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <StorefrontRounded sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5">Shop not found</Typography>
      </Container>
    )
  }

  const bannerProfile = { banner: shop.banner_url || "" }

  return (
    <Box sx={{ position: "relative" }}>
      {theme.palette.mode === "dark" ? (
        <DarkBannerContainer profile={bannerProfile as any} />
      ) : (
        <LightBannerContainer profile={bannerProfile as any} />
      )}
      <Box
        sx={{
          ...(theme.palette.mode === "dark"
            ? { position: "relative", top: -450 }
            : { position: "relative", top: -200 }),
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={theme.layoutSpacing?.layout || 3}>
            <Grid item xs={12}>
              <Grid
                container
                spacing={theme.layoutSpacing?.component || 2}
                alignItems="flex-end"
                justifyContent="space-between"
                minHeight={375}
              >
                <Grid item xs={12} md={8}>
                  <ShopHeader shop={shop} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ShopRatingSummary rating={shop.rating} ratingCount={shop.rating_count} />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Listings" icon={<StorefrontRounded />} iconPosition="start" />
                <Tab label="About" />
              </Tabs>
            </Grid>
          </Grid>
        </Container>

        <Container maxWidth="xl" sx={{ mt: 3 }}>
          {tab === 0 && <ShopListingsTab slug={slug!} />}
          {tab === 1 && <ShopAboutTab shop={shop} />}
        </Container>
      </Box>
    </Box>
  )
}

function ShopHeader(props: { shop: NonNullable<ReturnType<typeof useGetShopQuery>["data"]> }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
      <Avatar
        src={shop.logo_url || undefined}
        variant="rounded"
        sx={{
          height: theme.spacing(12),
          width: theme.spacing(12),
          flexShrink: 0,
          fontSize: 40,
        }}
      >
        {shop.name[0]}
      </Avatar>
      <Stack spacing={0.5}>
        <Typography variant="h4" fontWeight={700}>
          {shop.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating value={shop.rating || 0} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            ({shop.rating_count} reviews)
          </Typography>
        </Box>
        {shop.supported_languages.length > 1 && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {shop.supported_languages.map((lang) => (
              <Chip key={lang} label={lang.toUpperCase()} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </Stack>
    </Stack>
  )
}

function ShopRatingSummary(props: { rating: number | null; ratingCount: number }) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography variant="h3" fontWeight={700}>
        {props.rating ? props.rating.toFixed(1) : "—"}
      </Typography>
      <Rating value={props.rating || 0} precision={0.5} readOnly />
      <Typography variant="body2" color="text.secondary">
        {props.ratingCount} review{props.ratingCount !== 1 ? "s" : ""}
      </Typography>
    </Box>
  )
}

function ShopListingsTab(props: { slug: string }) {
  const { data, isLoading } = useSearchListingsQuery({
    shopSlug: props.slug,
    pageSize: 40,
    sortBy: "created_at",
    sortOrder: "desc",
  })

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (!data?.listings.length) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
        No active listings
      </Typography>
    )
  }

  return (
    <Grid container spacing={2}>
      {data.listings.map((listing, index) => (
        <Grid item xs={6} sm={4} md={3} lg={2.4} key={listing.listing_id}>
          <ListingCardV2 listing={listing} index={index} />
        </Grid>
      ))}
    </Grid>
  )
}

function ShopAboutTab(props: { shop: NonNullable<ReturnType<typeof useGetShopQuery>["data"]> }) {
  const { shop } = props
  return (
    <Box sx={{ maxWidth: 700 }}>
      {shop.description ? (
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {shop.description}
        </Typography>
      ) : (
        <Typography color="text.secondary">No description provided</Typography>
      )}
    </Box>
  )
}

function ShopProfileSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Box>
      <Skeleton
        variant="rectangular"
        sx={{
          height: theme.palette.mode === "dark" ? 450 : 200,
          width: "100%",
        }}
      />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rounded" width={96} height={96} />
          <Stack spacing={1}>
            <Skeleton width={200} height={40} />
            <Skeleton width={150} height={24} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

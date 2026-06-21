import { Link, useParams } from "react-router-dom"
import {
  Avatar,
  Box,
  Chip,
  Container,
  Grid,
  Rating,
  Skeleton,
  Stack,
  Tabs,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import {
  InfoRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import {
  useGetShopQuery,
  useSearchListingsQuery,
  ShopPublicResponse,
} from "../../store/api/v2/market"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  DarkBannerContainer,
  LightBannerContainer,
} from "../../features/profile/components/BannerContainers"
import type { User } from "../../datatypes/User"
import { ListingCardV2 } from "../../features/market/v2/ListingSearchV2"
import { HapticTab } from "../../components/haptic"
import { a11yProps } from "../../components/tabs/Tabs"
import { ShareButton } from "../../components/buttons/ShareButton"
import { useShopTab } from "../../features/shops/hooks/useShopTab"

export function ShopProfile() {
  const { slug } = useParams<{ slug: string }>()
  const theme = useTheme<ExtendedTheme>()
  const { data: shop, isLoading, error } = useGetShopQuery(
    { slug: slug! },
    { skip: !slug },
  )
  const currentTab = useShopTab()

  if (isLoading) return <ShopProfileSkeleton />

  if (error || !shop) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <StorefrontRounded sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5">Shop not found</Typography>
      </Container>
    )
  }

  const bannerProfile = { banner: shop.banner_url || "" } as unknown as User

  return (
    <Box sx={{ position: "relative" }}>
      {theme.palette.mode === "dark" ? (
        <DarkBannerContainer profile={bannerProfile} />
      ) : (
        <LightBannerContainer profile={bannerProfile} />
      )}
      <Box
        sx={{
          ...(theme.palette.mode === "dark"
            ? { position: "relative", top: -450 }
            : { position: "relative", top: -200 }),
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Grid
                container
                spacing={theme.layoutSpacing.component}
                alignItems="flex-end"
                justifyContent="space-between"
                minHeight={375}
              >
                <Grid item xs={12} md={8}>
                  <ShopHeader shop={shop} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ShopRatingSummary
                    rating={shop.rating}
                    ratingCount={shop.rating_count}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <ShopTabs slug={slug!} currentTab={currentTab} />
            </Grid>
          </Grid>
        </Container>

        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <ShopTabContent currentTab={currentTab} slug={slug!} shop={shop} />
        </Container>
      </Box>
    </Box>
  )
}

function ShopHeader(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()

  const ownerLink = shop.owner
    ? shop.owner.type === "contractor"
      ? `/contractor/${shop.owner.slug}`
      : `/user/${shop.owner.slug}`
    : null

  const memberSince = new Date(shop.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  })

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Typography color="text.secondary" variant="h6" fontWeight={600}>
            {shop.name}
          </Typography>
          <ShareButton title={`${shop.name} - SC Market`} />
        </Box>

        {shop.owner && ownerLink && (
          <Typography variant="body2" color="text.secondary">
            by{" "}
            <Typography
              component={Link}
              to={ownerLink}
              variant="body2"
              color="primary"
              sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              {shop.owner.name}
            </Typography>
          </Typography>
        )}

        {shop.supported_languages.length > 1 && (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {shop.supported_languages.map((lang) => (
              <Chip
                key={lang}
                label={lang.toUpperCase()}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ padding: 0.5, textTransform: "capitalize" }}
              />
            ))}
          </Box>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
          {shop.listing_count != null && (
            <Chip
              size="small"
              label={`${shop.listing_count} listing${shop.listing_count !== 1 ? "s" : ""}`}
              icon={<StorefrontRounded />}
              variant="outlined"
            />
          )}
          {shop.total_sales != null && (
            <Chip
              size="small"
              label={`${shop.total_sales} sale${shop.total_sales !== 1 ? "s" : ""}`}
              variant="outlined"
            />
          )}
          <Chip size="small" label={`Since ${memberSince}`} variant="outlined" />
        </Stack>
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

function ShopTabs(props: { slug: string; currentTab: number }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
      <Tabs value={props.currentTab} variant="scrollable" aria-label="Shop tabs">
        <HapticTab
          label="Listings"
          component={Link}
          to={`/shops/${props.slug}`}
          icon={<StorefrontRounded />}
          {...a11yProps(0)}
        />
        <HapticTab
          label="Reviews"
          component={Link}
          to={`/shops/${props.slug}/reviews`}
          icon={<StarRounded />}
          {...a11yProps(1)}
        />
        <HapticTab
          label="About"
          component={Link}
          to={`/shops/${props.slug}/about`}
          icon={<InfoRounded />}
          {...a11yProps(2)}
        />
      </Tabs>
    </Box>
  )
}

function ShopTabContent(props: {
  currentTab: number
  slug: string
  shop: ShopPublicResponse
}) {
  switch (props.currentTab) {
    case 0:
      return <ShopListingsTab slug={props.slug} />
    case 1:
      return <ShopReviewsTab shop={props.shop} />
    case 2:
      return <ShopAboutTab shop={props.shop} />
    default:
      return null
  }
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

function ShopReviewsTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  return (
    <Box sx={{ maxWidth: 600 }}>
      <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
        {shop.rating != null && (
          <>
            <Typography variant="h2" fontWeight={700}>
              {shop.rating.toFixed(1)}
            </Typography>
            <Rating value={shop.rating} precision={0.5} readOnly size="large" />
            <Typography variant="body1" color="text.secondary">
              {shop.rating_count} review{shop.rating_count !== 1 ? "s" : ""}
            </Typography>
          </>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: "center" }}
        >
          Reviews will appear here as orders are completed
        </Typography>
      </Stack>
    </Box>
  )
}

function ShopAboutTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12} md={8}>
        {shop.description ? (
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {shop.description}
          </Typography>
        ) : (
          <Typography color="text.secondary">No description provided</Typography>
        )}
      </Grid>
      {shop.owner && (
        <Grid item xs={12} md={4}>
          <OwnerCard owner={shop.owner} />
        </Grid>
      )}
    </Grid>
  )
}

function OwnerCard(props: { owner: NonNullable<ShopPublicResponse["owner"]> }) {
  const { owner } = props
  const theme = useTheme<ExtendedTheme>()
  const ownerLink =
    owner.type === "contractor"
      ? `/contractor/${owner.slug}`
      : `/user/${owner.slug}`

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: theme.spacing(1),
        border: `1px solid`,
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Shop owner
      </Typography>
      <Stack
        component={Link}
        to={ownerLink}
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ textDecoration: "none", color: "inherit" }}
      >
        <Avatar
          src={owner.avatar_url || undefined}
          sx={{ width: 40, height: 40 }}
        >
          {owner.name[0]}
        </Avatar>
        <Typography variant="body1" fontWeight={500}>
          {owner.name}
        </Typography>
      </Stack>
    </Box>
  )
}

function ShopProfileSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Box sx={{ position: "relative" }}>
      <Skeleton
        variant="rectangular"
        sx={{
          height: theme.palette.mode === "dark" ? 500 : 250,
          width: "100%",
          borderRadius: 0,
        }}
      />
      <Container
        maxWidth="xl"
        sx={{
          ...(theme.palette.mode === "dark"
            ? { position: "relative", top: -450 }
            : { position: "relative", top: -200 }),
        }}
      >
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12}>
            <Grid
              container
              spacing={theme.layoutSpacing.component}
              alignItems="flex-end"
              justifyContent="space-between"
              minHeight={375}
            >
              <Grid item xs={12} md={8}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                  flexWrap="wrap"
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      height: theme.spacing(12),
                      width: theme.spacing(12),
                      flexShrink: 0,
                      borderRadius: 2,
                    }}
                  />
                  <Stack spacing={0.5}>
                    <Skeleton variant="text" width={200} height={28} />
                    <Skeleton variant="text" width={120} height={20} />
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={28}
                        sx={{ borderRadius: 1 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={28}
                        sx={{ borderRadius: 1 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={28}
                        sx={{ borderRadius: 1 }}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton
                  variant="rectangular"
                  sx={{
                    height: 120,
                    width: "100%",
                    borderRadius: 1,
                    maxWidth: 320,
                    ml: "auto",
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
              <Tabs value={0} aria-label="Shop tabs" variant="scrollable">
                <HapticTab
                  label={<Skeleton width={60} />}
                  icon={<StorefrontRounded />}
                  {...a11yProps(0)}
                />
                <HapticTab
                  label={<Skeleton width={60} />}
                  icon={<StarRounded />}
                  {...a11yProps(1)}
                />
                <HapticTab
                  label={<Skeleton width={60} />}
                  icon={<InfoRounded />}
                  {...a11yProps(2)}
                />
              </Tabs>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

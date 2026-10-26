import { Link, useParams } from "react-router-dom"
import {
  Avatar,
  Box,
  Chip,
  Container,
  Grid,
  InputAdornment,
  LinearProgress,
  linearProgressClasses,
  MenuItem,
  Pagination,
  Paper,
  Rating,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material"
import { styled, useTheme } from "@mui/material/styles"
import {
  CreateRounded,
  DesignServicesRounded,
  InfoRounded,
  SearchRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import {
  useGetShopQuery,
  useGetShopReviewsQuery,
  useSearchListingsQuery,
  ShopPublicResponse,
} from "../../../store/api/v2/market"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  BANNER_OVERLAP,
  DarkBannerContainer,
  LightBannerContainer,
} from "../../profile/components/BannerContainers"
import type { User } from "../../../datatypes/User"
import { ListingCardV2 } from "../../market/v2/ListingSearchV2"
import { HapticTab } from "../../../components/haptic"
import { a11yProps } from "../../../components/tabs/Tabs"
import { ShareButton } from "../../../components/buttons/ShareButton"
import { SHOP_LISTINGS_PAGE_SIZE, useShopTab } from "../hooks/useShopTab"
import { ServiceListings } from "../../services/components/ServiceListings"
import { ServiceSearchArea } from "../../../views/services/ServiceSearchArea"
import { MarkdownRender } from "../../../components/markdown/Markdown"
import { HeadCell, PaginatedTable } from "../../../components/table/PaginatedTable"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { amber } from "@mui/material/colors"
import { useCallback, useMemo, useState, MouseEventHandler } from "react"
import { useDebounce } from "../../../hooks/useDebounce"
import { FRONTEND_URL } from "../../../util/constants"
import { EmptyReviews } from "../../../components/empty-states"
import { CreateOrderForm } from "../../../views/orders/CreateOrderForm"
import {
  calculateBadgesFromShopMetrics,
  prioritizeBadges,
} from "../../../util/badges"
import { BadgeDisplay } from "../../../components/rating/ListingRating"
import { SHOP_PATHS, ORG_PATHS, USER_PATHS } from "../../../routes/paths"
import { buildShopHead } from "../../../seo/entityHeads"
import { SeoHead } from "../../../seo/SeoHead"
import {
  SHOP_LISTING_GRID_BREAKPOINTS,
  ShopListingsGridSkeleton,
  ShopProfileSkeleton,
} from "../../../components/skeletons/ShopProfileSkeleton"
import { usePageReady } from "../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../components/metadata/pageReadyStore"

export function ShopProfile() {
  const { slug } = useParams<{ slug: string }>()
  const theme = useTheme<ExtendedTheme>()
  const { data: shop, isLoading, error, isFetching: pageIsFetching, currentData: pageCurrentData } = useGetShopQuery(
    { slug: slug! },
    { skip: !slug },
  )
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({ isLoading, isFetching: pageIsFetching, currentData: pageCurrentData }),
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
      <SeoHead head={buildShopHead(shop, FRONTEND_URL)} />
      {theme.palette.mode === "dark" ? (
        <DarkBannerContainer profile={bannerProfile} />
      ) : (
        <LightBannerContainer profile={bannerProfile} />
      )}
      <Box
        sx={{
          position: "relative",
          top: -BANNER_OVERLAP[theme.palette.mode],
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
                  <ShopRatingSummary shop={shop} />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <ShopTabs slug={slug!} currentTab={currentTab} shop={shop} />
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
      ? ORG_PATHS.profile(shop.owner.slug)
      : USER_PATHS.profile(shop.owner.slug)
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
      <Stack
        spacing={0.5}
        sx={{
          backgroundColor: theme.palette.background.default,
          opacity: 0.98,
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          p: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Typography color="text.primary" variant="h6" component="h1" fontWeight={700}>
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
              color="default"
            />
          )}
          {shop.total_sales != null && (
            <Chip
              size="small"
              label={`${shop.total_sales} sale${shop.total_sales !== 1 ? "s" : ""}`}
              color="default"
            />
          )}
          <Chip size="small" label={`Since ${memberSince}`} color="default" />
        </Stack>
      </Stack>
    </Stack>
  )
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => {
  const extendedTheme = theme as ExtendedTheme
  return {
    height: 10,
    borderRadius: theme.spacing(extendedTheme.borderRadius.input),
    width: "95%",
    display: "inline",
    flexGrow: "1",
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: theme.spacing(extendedTheme.borderRadius.input),
      backgroundColor: amber[500],
    },
  }
})

function ShopRatingSummary(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()
  const { data: reviewsData } = useGetShopReviewsQuery({
    shopId: shop.shop_id,
    pageSize: 200,
  })

  const counts = useMemo(() => {
    const reviews = reviewsData?.reviews || []
    const vals = [0, 0, 0, 0, 0]
    reviews.forEach((item) => {
      if (+item.rating) {
        vals[5 - Math.ceil(+item.rating)] += 1
      }
    })
    const max = vals.reduce((x, y) => (x > y ? x : y), 0)
    return vals.map((v) => (max > 0 ? (v / max) * 100 : 0))
  }, [reviewsData])

  // Prefer server-computed badge_ids; fall back to client-side metrics calc
  const shopBadges = useMemo(() => {
    if (shop.badge_ids && shop.badge_ids.length > 0) {
      return prioritizeBadges(shop.badge_ids)
    }
    const metrics = (shop as ShopPublicResponseWithMetrics).metrics
    if (!metrics) return []
    return prioritizeBadges(
      calculateBadgesFromShopMetrics({
        avg_rating: shop.rating || 0,
        rating_count: shop.rating_count,
        total_orders: metrics.total_orders,
        total_completed: metrics.total_completed,
        streak: metrics.streak,
        response_rate: metrics.response_rate,
        avg_completion_hours: metrics.avg_completion_hours,
        created_at: shop.created_at,
      }),
    )
  }, [shop])

  return (
    <Box display="flex" sx={{ maxWidth: 800, width: "100%", marginTop: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: "3",
          "& > *": {
            width: "100%",
            display: "flex",
            alignItems: "center",
          },
        }}
      >
        {counts.map((d, i) => (
          <Box key={i}>
            {5 - i}&nbsp;&nbsp;
            <BorderLinearProgress variant="determinate" value={d || 0} />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          minWidth: 100,
        }}
      >
        <Typography variant="h3">
          {shop.rating != null ? shop.rating.toFixed(1) : "—"}
        </Typography>
        <Rating
          readOnly
          precision={0.5}
          value={shop.rating || 0}
          icon={<StarRounded fontSize="inherit" />}
          emptyIcon={
            <StarRounded
              style={{ color: theme.palette.text.primary }}
              fontSize="inherit"
            />
          }
        />
        <Typography variant="body1" color="text.primary">
          {shop.rating_count} review{shop.rating_count !== 1 ? "s" : ""}
        </Typography>
        {shopBadges.length > 0 && (
          <Box sx={{ mt: 1, fontSize: "1.2rem" }}>
            <BadgeDisplay badges={shopBadges} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

/**
 * Extended ShopPublicResponse type that includes the metrics field
 * once the backend API is updated to return it.
 */
interface ShopPublicResponseWithMetrics extends ShopPublicResponse {
  metrics?: {
    total_orders: number
    total_completed: number
    avg_completion_hours: number | null
    streak: number
    response_rate: number | null
  }
}

function ShopTabs(props: { slug: string; currentTab: number; shop: ShopPublicResponse }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
      <Tabs value={props.currentTab} variant="scrollable" aria-label="Shop tabs">
        <HapticTab
          label="Listings"
          component={Link}
          to={SHOP_PATHS.profile(props.slug)}
          icon={<StorefrontRounded />}
          {...a11yProps(0)}
        />
        <HapticTab
          label="Services"
          component={Link}
          to={SHOP_PATHS.profileTab(props.slug, "services")}
          icon={<DesignServicesRounded />}
          {...a11yProps(1)}
        />
        <HapticTab
          label="Reviews"
          component={Link}
          to={SHOP_PATHS.profileTab(props.slug, "reviews")}
          icon={<StarRounded />}
          {...a11yProps(2)}
        />
        <HapticTab
          label="About"
          component={Link}
          to={SHOP_PATHS.profileTab(props.slug, "about")}
          icon={<InfoRounded />}
          {...a11yProps(3)}
        />
        {props.shop.accepts_custom_orders && (
          <HapticTab
            label="Order"
            component={Link}
            to={SHOP_PATHS.profileTab(props.slug, "order")}
            icon={<CreateRounded />}
            {...a11yProps(4)}
          />
        )}
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
      return <ShopServicesTab shop={props.shop} />
    case 2:
      return <ShopReviewsTab shop={props.shop} />
    case 3:
      return <ShopAboutTab shop={props.shop} />
    case 4:
      return <ShopOrderTab shop={props.shop} />
    default:
      return null
  }
}

function ShopListingsTab(props: { slug: string }) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "price" | "quantity">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const pageSize = SHOP_LISTINGS_PAGE_SIZE
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isFetching: pageIsFetching, currentData: pageCurrentData } = useSearchListingsQuery({
    shopSlug: props.slug,
    page,
    pageSize,
    sortBy,
    sortOrder,
    text: debouncedSearch || undefined,
  })
  // Shop listings tab: primary content.
  usePageReady(
    isPrimaryLoading({ isLoading, isFetching: pageIsFetching, currentData: pageCurrentData }),
  )

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }}
        />
        <TextField
          select
          size="small"
          inputProps={{ "aria-label": "Sort listings" }}
          SelectProps={{
            SelectDisplayProps: {
              "aria-label": "Sort listings",
              "aria-labelledby": undefined,
            },
          }}
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split("-") as ["created_at" | "price" | "quantity", "asc" | "desc"]
            setSortBy(s); setSortOrder(o); setPage(1)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="created_at-desc">Newest</MenuItem>
          <MenuItem value="created_at-asc">Oldest</MenuItem>
          <MenuItem value="price-asc">Price: Low</MenuItem>
          <MenuItem value="price-desc">Price: High</MenuItem>
          <MenuItem value="quantity-desc">Most Stock</MenuItem>
        </TextField>
      </Stack>

      {isLoading ? (
        <ShopListingsGridSkeleton />
      ) : !data?.listings.length ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          {search ? "No listings match your search" : "No active listings"}
        </Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {data.listings.map((listing, index) => (
              <Grid item {...SHOP_LISTING_GRID_BREAKPOINTS} key={listing.listing_id}>
                <ListingCardV2 listing={listing} index={index} />
              </Grid>
            ))}
          </Grid>
          {(data.total || 0) > pageSize && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={Math.ceil((data.total || 0) / pageSize)}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

function ShopServicesTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()

  // Services are owned by users/orgs, so filter by the shop owner
  const ownerFilter = shop.owner
    ? shop.owner.type === "user"
      ? { user: shop.owner.slug }
      : { contractor: shop.owner.slug }
    : {}

  return (
    <Grid container spacing={theme.layoutSpacing.layout} justifyContent="center">
      <Grid item xs={12} md={3} sx={{ display: { xs: "none", md: "block" } }}>
        <Paper sx={{ padding: 1 }}>
          <ServiceSearchArea />
        </Paper>
      </Grid>
      <Grid item xs={12} md={9}>
        <Grid container spacing={theme.layoutSpacing.layout} justifyContent="center">
          <ServiceListings {...ownerFilter} />
        </Grid>
      </Grid>
    </Grid>
  )
}

interface ShopReviewRow {
  review_id: string
  rating: number
  comment: string
  created_at: string
  author: {
    avatar: string | null
    display_name: string
    username: string
    user_id: string
  }
  timestamp: number
}

const shopReviewHeadCells: readonly HeadCell<ShopReviewRow>[] = [
  {
    id: "rating",
    numeric: false,
    disablePadding: false,
    label: "Rating",
  },
  {
    id: "comment",
    numeric: true,
    disablePadding: false,
    label: "Review",
  },
]

function ShopReviewRow(props: {
  row: ShopReviewRow
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { row, onClick, isItemSelected, labelId } = props
  const theme = useTheme<ExtendedTheme>()

  const formatDate = useCallback(
    (date: number) =>
      Intl.DateTimeFormat("default", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date)),
    [],
  )

  return (
    <TableRow
      hover
      onClick={onClick}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.author.username}
      selected={isItemSelected}
    >
      <TableCell component="th" id={labelId} scope="row">
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item>
            <Link to={USER_PATHS.profile(row.author.username)}>
              <Avatar src={row.author.avatar || undefined} />
            </Link>
          </Grid>
          <Grid item>
            <Link to={USER_PATHS.profile(row.author.username)}>
              <UnderlineLink
                color="text.secondary"
                variant="subtitle1"
                fontWeight="bold"
              >
                {row.author.username}
              </UnderlineLink>
            </Link>
            <Typography variant="subtitle2">
              {row.author.display_name}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="subtitle1">
          <Rating
            readOnly
            precision={0.5}
            value={row.rating}
            icon={<StarRounded fontSize="inherit" />}
            emptyIcon={
              <StarRounded
                style={{ color: theme.palette.text.primary }}
                fontSize="inherit"
              />
            }
          />
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Box
          sx={{
            height: "100%",
            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
            WebkitLineClamp: "3",
            lineClamp: "3",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {formatDate(row.timestamp)}
          </Typography>
          <Typography variant="subtitle1">{row.comment}</Typography>
        </Box>
      </TableCell>
    </TableRow>
  )
}

function ShopReviewsTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const { data: reviewsData, isLoading } = useGetShopReviewsQuery({
    shopId: shop.shop_id,
    pageSize: 200,
  })

  const rows: ShopReviewRow[] = useMemo(() => {
    if (!reviewsData?.reviews) return []
    return reviewsData.reviews.map((r) => ({
      ...r,
      timestamp: new Date(r.created_at).getTime(),
    }))
  }, [reviewsData])

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    )
  }

  if (!rows.length) {
    return (
      <Grid container>
        <Grid item xs={12}>
          <EmptyReviews
            title="No reviews yet"
            description="Reviews will appear here as orders are completed"
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <PaginatedTable<ShopReviewRow>
      rows={rows}
      initialSort="timestamp"
      initialSortDirection="desc"
      generateRow={ShopReviewRow}
      keyAttr="review_id"
      headCells={shopReviewHeadCells}
      disableSelect
    />
  )
}

function ShopAboutTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12} md={8}>
        {shop.description ? (
          <MarkdownRender text={shop.description} />
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

function ShopOrderTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()

  const contractorId =
    shop.owner?.type === "contractor" ? shop.owner.slug : undefined
  const assignedTo =
    shop.owner?.type === "user" ? shop.owner.slug : undefined

  return (
    <Grid container spacing={theme.layoutSpacing.layout} justifyContent="center">
      <CreateOrderForm
        contractor_id={contractorId}
        assigned_to={assignedTo}
      />
    </Grid>
  )
}

function OwnerCard(props: { owner: NonNullable<ShopPublicResponse["owner"]> }) {
  const { owner } = props
  const theme = useTheme<ExtendedTheme>()
  const ownerLink =
    owner.type === "contractor"
      ? ORG_PATHS.profile(owner.slug)
      : USER_PATHS.profile(owner.slug)

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

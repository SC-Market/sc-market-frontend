import { SellerStatusBadge } from "../../../components/presence/SellerStatusBadge"
import { Link } from "react-router-dom"
import {
  Box,
  Chip,
  LinearProgress,
  linearProgressClasses,
  Rating,
  Stack,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { styled, useTheme } from "@mui/material/styles"
import { StarRounded, StorefrontRounded } from "@mui/icons-material"
import {
  useGetShopReviewsQuery,
  ShopPublicResponse,
} from "../../../store/api/v2/market"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ShareButton } from "../../../components/buttons/ShareButton"
import { amber } from "@mui/material/colors"
import { useMemo } from "react"
import {
  calculateBadgesFromShopMetrics,
  prioritizeBadges,
} from "../../../util/badges"
import { BadgeDisplay } from "../../../components/rating/ListingRating"
import { ORG_PATHS, USER_PATHS } from "../../../routes/paths"
import { Trans, useTranslation } from "react-i18next"
import { useFormatters, useNow } from "../../../util/format"

export function ShopHeader(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const fmt = useFormatters()

  const ownerLink = shop.owner
    ? shop.owner.type === "contractor"
      ? ORG_PATHS.profile(shop.owner.slug)
      : USER_PATHS.profile(shop.owner.slug)
    : null

  const memberSince = fmt.date(shop.created_at, {
    year: "numeric",
    month: "short",
  })

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
      <ImageAvatar
        src={shop.logo_url || undefined}
        alt={t("accessibility.shopLogo", "Logo of {{name}}", {
          name: shop.name,
        })}
        variant="rounded"
        sx={{
          height: theme.spacing(12),
          width: theme.spacing(12),
          flexShrink: 0,
          fontSize: 40,
        }}
      >
        {shop.name[0]}
      </ImageAvatar>
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
          <Typography
            color="text.primary"
            variant="h6"
            component="h1"
            fontWeight={700}
          >
            {shop.name}
          </Typography>
          <ShareButton title={`${shop.name} - SC Market`} />
        </Box>

        {shop.owner && ownerLink && (
          <Typography variant="body2" color="text.secondary">
            <Trans
              i18nKey="shops.profile.byOwner"
              values={{ name: shop.owner.name }}
              components={{
                owner: (
                  <Typography
                    component={Link}
                    to={ownerLink}
                    variant="body2"
                    color="primary"
                    sx={{
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  />
                ),
              }}
            />
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
              label={t("shops.listingCount", { count: shop.listing_count })}
              icon={<StorefrontRounded />}
              color="default"
            />
          )}
          {shop.total_sales != null && (
            <Chip
              size="small"
              label={t("shops.saleCount", { count: shop.total_sales })}
              color="default"
            />
          )}
          <Chip
            size="small"
            label={t("shops.profile.since", { date: memberSince })}
            color="default"
          />
        </Stack>

        {/* Seller activity (sales are shown above) */}
        <SellerStatusBadge
          activity={shop.activity}
          showCompletedOrders={false}
        />
      </Stack>
    </Stack>
  )
}

export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => {
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

export function ShopRatingSummary(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
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
  const now = useNow()
  const shopBadges = useMemo(() => {
    if (shop.badge_ids && shop.badge_ids.length > 0) {
      return prioritizeBadges(shop.badge_ids)
    }
    const metrics = (shop as ShopPublicResponseWithMetrics).metrics
    if (!metrics) return []
    return prioritizeBadges(
      calculateBadgesFromShopMetrics(
        {
          avg_rating: shop.rating || 0,
          rating_count: shop.rating_count,
          total_orders: metrics.total_orders,
          total_completed: metrics.total_completed,
          streak: metrics.streak,
          response_rate: metrics.response_rate,
          avg_completion_hours: metrics.avg_completion_hours,
          created_at: shop.created_at,
        },
        now,
      ),
    )
  }, [shop, now])

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
          {t("shops.reviewCount", { count: shop.rating_count })}
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
export interface ShopPublicResponseWithMetrics extends ShopPublicResponse {
  metrics?: {
    total_orders: number
    total_completed: number
    avg_completion_hours: number | null
    streak: number
    response_rate: number | null
  }
}

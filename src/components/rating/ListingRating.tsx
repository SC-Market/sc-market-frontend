import { MinimalUser } from "../../datatypes/User"
import { MinimalContractor } from "../../features/contractor/domain/types"
import { Box } from "@mui/material"
import { Rating } from "../../features/contractor/domain/types"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import { StaticRatingStars } from "./StaticRatingStars"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { prioritizeBadges, calculateBadgesFromRating } from "../../util/badges"

import { useFormatters } from "../../util/format"
import { BadgeDisplay } from "./BadgeDisplay"
export { BadgeDisplay } from "./BadgeDisplay"
/**
 * Minimal shop rating data that can be passed to rating components
 * in place of user/contractor ratings. Allows V2 callers to gradually
 * migrate to shop-level rating display.
 */
export interface ShopRatingProps {
  avg_rating: number
  rating_count: number
  total_orders: number
  streak: number
}

/**
 * Minimal shop identity for display in listing/offer views.
 * Use this instead of contractor/user props when the seller is a shop.
 */
export interface ShopIdentityProps {
  name: string
  slug: string
  rating?: number
  rating_count?: number
  total_orders?: number
  streak?: number
}

export function ListingNameAndRating(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
  shop?: ShopIdentityProps | null
  shopRating?: ShopRatingProps
}) {
  const { user, contractor, shop, shopRating } = props
  const navigate = useNavigate()

  const url = shop
    ? `/shops/${shop.slug}`
    : user
      ? `/user/${user?.username}`
      : `/contractor/${contractor?.spectrum_id}`

  const displayName = shop ? shop.name : user?.display_name || contractor?.name

  // Build shopRating from shop prop if not explicitly provided
  const effectiveShopRating: ShopRatingProps | undefined =
    shopRating ??
    (shop
      ? {
          avg_rating: shop.rating ?? 0,
          rating_count: shop.rating_count ?? 0,
          total_orders: shop.total_orders ?? 0,
          streak: shop.streak ?? 0,
        }
      : undefined)

  return (
    <Box display={"flex"} alignItems={"center"} flexWrap={"wrap"} gap={0.5}>
      <Box
        component="span"
        onClick={(e) => {
          e.stopPropagation()
          navigate(url)
        }}
        sx={{
          cursor: "pointer",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <UnderlineLink variant={"subtitle2"}>{displayName}</UnderlineLink>
      </Box>
      <ListingSellerRating
        user={user}
        contractor={contractor}
        shopRating={effectiveShopRating}
      />
    </Box>
  )
}

export function ListingSellerRating(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
  shop?: ShopIdentityProps | null
  shopRating?: ShopRatingProps
}) {
  const { user, contractor, shop, shopRating } = props

  // Build shopRating from shop prop if not explicitly provided
  const effectiveShopRating: ShopRatingProps | undefined =
    shopRating ??
    (shop
      ? {
          avg_rating: shop.rating ?? 0,
          rating_count: shop.rating_count ?? 0,
          total_orders: shop.total_orders ?? 0,
          streak: shop.streak ?? 0,
        }
      : undefined)

  return (
    <Box display={"flex"} alignItems={"center"} flexWrap={"wrap"} gap={0.5}>
      <SellerRatingStars
        user={user}
        contractor={contractor}
        shopRating={effectiveShopRating}
      />
      <SellerRatingCount
        user={user}
        contractor={contractor}
        shopRating={effectiveShopRating}
      />
    </Box>
  )
}

// New component for market listings that have rating info at the top level
export function MarketListingRating(props: {
  avg_rating: number
  rating_count: number | null
  total_rating: number
  rating_streak: number | null
  total_orders: number | null
  total_assignments: number | null
  response_rate: number | null
  badge_ids?: string[] | null
  display_limit?: number // Default: 3 for market listings
  iconSize?: string | number // Size for badge icons
  showBadges?: boolean // Whether to show badges (default: true for backward compatibility)
}) {
  const {
    avg_rating,
    rating_count,
    total_rating,
    rating_streak,
    total_orders,
    total_assignments,
    response_rate,
    badge_ids,
    display_limit = 3, // Default to 3 for market listings
    iconSize,
    showBadges = true, // Default to true for backward compatibility
  } = props

  // Create a rating object that matches the expected structure
  const rating = {
    avg_rating,
    rating_count: rating_count || 0,
    total_rating,
    streak: rating_streak || 0,
    total_orders: total_orders || 0,
    total_assignments: total_assignments || 0,
    response_rate: response_rate || 0,
  }

  // Use badge_ids if available, otherwise calculate from rating
  const allBadges = badge_ids || calculateBadgesFromRating(rating)
  const badges = prioritizeBadges(allBadges, display_limit)

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      gap={0.5}
      sx={{ lineHeight: 1, margin: 0, padding: 0 }}
    >
      <MarketRatingStars rating={rating} />
      <MarketRatingCount
        rating={rating}
        badges={showBadges ? badges : []}
        iconSize={iconSize}
      />
    </Box>
  )
}

export function SellerRatingStars(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
  shopRating?: ShopRatingProps
}) {
  const theme = useTheme<ExtendedTheme>()
  const { user, contractor, shopRating } = props
  const rating = useMemo(() => {
    if (shopRating) return shopRating.avg_rating
    const avgRating =
      user?.rating?.avg_rating || contractor?.rating?.avg_rating || 0
    // Ratings are stored in 0-5 scale, use directly (no division needed)
    return avgRating
  }, [user, contractor, shopRating])

  return (
    <StaticRatingStars value={rating} emptyColor={theme.palette.text.primary} />
  )
}

export function MarketRatingStars(props: { rating: Rating }) {
  const theme = useTheme<ExtendedTheme>()
  const { rating } = props

  // Market listings use 0-5 scale from market_search view
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        lineHeight: 1,
        margin: 0,
        padding: 0,
      }}
    >
      <StaticRatingStars
        value={rating.avg_rating}
        emptyColor={theme.palette.text.primary}
      />
    </Box>
  )
}

export function SellerRatingCount(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
  shopRating?: ShopRatingProps
  display_limit?: number // Default: unlimited for profiles
}) {
  const fmt = useFormatters()
  const { user, contractor, shopRating, display_limit } = props
  const rating = useMemo(
    () =>
      user?.rating ||
      contractor?.rating || {
        avg_rating: 0,
        rating_count: 0,
        streak: 0,
        total_orders: 0,
        total_assignments: 0,
        total_rating: 0,
        response_rate: 0,
      },
    [user, contractor],
  )

  // When shopRating is provided, use it for badge calculation
  const allBadges = useMemo(() => {
    if (shopRating) {
      return calculateBadgesFromRating({
        avg_rating: shopRating.avg_rating,
        rating_count: shopRating.rating_count,
        total_rating: shopRating.avg_rating * shopRating.rating_count,
        streak: shopRating.streak,
        total_orders: shopRating.total_orders,
      })
    }
    const badgeIds = user?.badges?.badge_ids || contractor?.badges?.badge_ids
    return badgeIds || calculateBadgesFromRating(rating)
  }, [shopRating, user, contractor, rating])

  const badges = prioritizeBadges(allBadges, display_limit)
  const displayCount = shopRating
    ? shopRating.rating_count
    : rating.rating_count

  return (
    <>
      ({fmt.number(displayCount)}) <BadgeDisplay badges={badges} />
    </>
  )
}

export function MarketRatingCount(props: {
  rating: Rating
  badges?: string[]
  iconSize?: string | number
}) {
  const { rating, badges = [], iconSize } = props
  const fmt = useFormatters()

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      gap={0.5}
      sx={{ lineHeight: 1, margin: 0, padding: 0 }}
    >
      <Box component="span" sx={{ lineHeight: 1, margin: 0, padding: 0 }}>
        ({fmt.number(rating.rating_count)})
      </Box>
      {badges.length > 0 && (
        <BadgeDisplay badges={badges} iconSize={iconSize} />
      )}
    </Box>
  )
}

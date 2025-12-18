import { MinimalUser } from "../../datatypes/User"
import { MinimalContractor } from "../../datatypes/Contractor"
import {
  AccessTimeRounded,
  AutoAwesomeRounded,
  AutoGraphOutlined,
  StarRounded,
  WhatshotRounded,
  WorkspacePremiumRounded,
  TrendingUpRounded,
  BoltRounded,
  CalendarTodayRounded,
  RocketLaunchRounded,
} from "@mui/icons-material"
import { Box, Link as MaterialLink, Rating as MuiRating, Tooltip } from "@mui/material"
import { Rating } from "../../datatypes/Contractor"
import React, { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import {
  prioritizeBadges,
  calculateBadgesFromRating,
  BADGE_RATING_99_9,
  BADGE_RATING_99,
  BADGE_RATING_95,
  BADGE_RATING_90,
  BADGE_STREAK_PRO,
  BADGE_STREAK_GOLD,
  BADGE_STREAK_SILVER,
  BADGE_STREAK_COPPER,
  BADGE_VOLUME_PRO,
  BADGE_VOLUME_GOLD,
  BADGE_VOLUME_SILVER,
  BADGE_VOLUME_COPPER,
  BADGE_POWER_SELLER,
  BADGE_BUSY_SELLER,
  BADGE_ACTIVE_SELLER,
  BADGE_SPEED_PRO,
  BADGE_SPEED_GOLD,
  BADGE_SPEED_SILVER,
  BADGE_SPEED_COPPER,
  BADGE_CONSISTENCY_PRO,
  BADGE_CONSISTENCY_GOLD,
  BADGE_CONSISTENCY_SILVER,
  BADGE_CONSISTENCY_COPPER,
  BADGE_EARLY_ADOPTER,
  BADGE_RESPONSIVE,
} from "../../util/badges"

export function ListingNameAndRating(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
}) {
  const { user, contractor } = props

  return (
    <Box display={"flex"} alignItems={"center"}>
      <MaterialLink
        component={Link}
        to={
          user
            ? `/user/${user?.username}`
            : `/contractor/${contractor?.spectrum_id}`
        }
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <UnderlineLink variant={"subtitle2"}>
          {user?.display_name || contractor?.name}
        </UnderlineLink>
      </MaterialLink>
      <ListingSellerRating user={user} contractor={contractor} />
    </Box>
  )
}

export function ListingSellerRating(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
}) {
  const { user, contractor } = props

  return (
    <Box display={"flex"} alignItems={"center"}>
      <SellerRatingStars user={user} contractor={contractor} />
      <SellerRatingCount user={user} contractor={contractor} />
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
    <Box display={"flex"} alignItems={"center"}>
      <MarketRatingStars rating={rating} />
      <MarketRatingCount rating={rating} badges={badges} />
    </Box>
  )
}

export function SellerRatingStars(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
}) {
  const theme = useTheme<ExtendedTheme>()
  const { user, contractor } = props
  const rating = useMemo(() => {
    const avgRating = user?.rating.avg_rating || contractor?.rating.avg_rating || 0
    // Ratings are stored in 0-5 scale, use directly (no division needed)
    return avgRating
  }, [user, contractor])

  return (
    <MuiRating
      readOnly
      precision={0.1}
      value={rating}
      icon={<StarRounded fontSize="inherit" />}
      emptyIcon={
        <StarRounded
          style={{ color: theme.palette.text.primary }}
          fontSize="inherit"
        />
      }
      size={"small"}
    />
  )
}

export function MarketRatingStars(props: {
  rating: Rating
}) {
  const theme = useTheme<ExtendedTheme>()
  const { rating } = props

  // Market listings use 0-5 scale from market_search view
  return (
    <MuiRating
      readOnly
      precision={0.1}
      value={rating.avg_rating}
      icon={<StarRounded fontSize="inherit" />}
      emptyIcon={
        <StarRounded
          style={{ color: theme.palette.text.primary }}
          fontSize="inherit"
        />
      }
      size={"small"}
    />
  )
}

export function SellerRatingCount(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
  display_limit?: number // Default: unlimited for profiles
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { user, contractor, display_limit } = props
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

  // Use badge_ids if available, otherwise calculate from rating
  const badgeIds = user?.badges?.badge_ids || contractor?.badges?.badge_ids
  const allBadges = badgeIds || calculateBadgesFromRating(rating)
  const badges = prioritizeBadges(allBadges, display_limit)

  return (
    <>
      ({rating.rating_count.toLocaleString(undefined)}){" "}
      <BadgeDisplay badges={badges} />
    </>
  )
}

export function MarketRatingCount(props: {
  rating: Rating
  badges?: string[]
}) {
  const { rating, badges = [] } = props

  return (
    <>
      ({rating.rating_count.toLocaleString(undefined)}){" "}
      <BadgeDisplay badges={badges} />
    </>
  )
}

// Badge display component that renders badges based on badge IDs
function BadgeDisplay(props: { badges: string[] }) {
  const { badges } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Create unique gradient ID for each instance to avoid conflicts
  const gradientId = `linearColors-${Math.random().toString(36).substr(2, 9)}`

  return (
    <>
      {/* Rating badges */}
      {badges.includes(BADGE_RATING_99_9) && (
        <Tooltip title={t("listing.99_9PercentRating25PlusTransactions")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={gradientId}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <AutoAwesomeRounded
              sx={{
                fill: `url(#${gradientId})`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_99) && (
        <Tooltip title={t("listing.99PercentRating25PlusTransactions")}>
          <AutoAwesomeRounded sx={{ color: "#FFD700" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_95) && (
        <Tooltip title={t("listing.95PercentRating25PlusTransactions")}>
          <AutoAwesomeRounded sx={{ color: "#C0C0C0" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_RATING_90) && (
        <Tooltip title={t("listing.90PercentRating25PlusTransactions")}>
          <AutoGraphOutlined sx={{ color: "#CD7F32" }} />
        </Tooltip>
      )}

      {/* Volume badges */}
      {badges.includes(BADGE_VOLUME_PRO) && (
        <Tooltip title={t("listing.5000PlusOrdersCompleted")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-volume`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <WorkspacePremiumRounded
              sx={{
                fill: `url(#${gradientId}-volume)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_GOLD) && (
        <Tooltip title={t("listing.1000PlusOrdersCompleted")}>
          <WorkspacePremiumRounded sx={{ color: "#FFD700" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_SILVER) && (
        <Tooltip title={t("listing.500PlusOrdersCompleted")}>
          <WorkspacePremiumRounded sx={{ color: "#C0C0C0" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_VOLUME_COPPER) && (
        <Tooltip title={t("listing.100PlusOrdersCompleted")}>
          <WorkspacePremiumRounded sx={{ color: "#CD7F32" }} />
        </Tooltip>
      )}

      {/* Streak badges */}
      {badges.includes(BADGE_STREAK_PRO) && (
        <Tooltip title={t("listing.50PlusFiveStarStreak")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-streak`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <WhatshotRounded
              sx={{
                fill: `url(#${gradientId}-streak)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_GOLD) && (
        <Tooltip title={t("listing.25PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: "#FFD700" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_SILVER) && (
        <Tooltip title={t("listing.15PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: "#C0C0C0" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_STREAK_COPPER) && (
        <Tooltip title={t("listing.5PlusFiveStarStreak")}>
          <WhatshotRounded sx={{ color: "#CD7F32" }} />
        </Tooltip>
      )}

      {/* Activity badges */}
      {badges.includes(BADGE_POWER_SELLER) && (
        <Tooltip title={t("listing.20PlusOrdersLast30Days")}>
          <TrendingUpRounded sx={{ color: theme.palette.error.main }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_BUSY_SELLER) && (
        <Tooltip title={t("listing.10PlusOrdersLast30Days")}>
          <TrendingUpRounded sx={{ color: theme.palette.warning.main }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_ACTIVE_SELLER) && (
        <Tooltip title={t("listing.5PlusOrdersLast30Days")}>
          <TrendingUpRounded color={"primary"} />
        </Tooltip>
      )}

      {/* Speed badges */}
      {badges.includes(BADGE_SPEED_PRO) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan3Hours")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-speed`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <BoltRounded
              sx={{
                fill: `url(#${gradientId}-speed)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_GOLD) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan6Hours")}>
          <BoltRounded sx={{ color: "#FFD700" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_SILVER) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan12Hours")}>
          <BoltRounded sx={{ color: "#C0C0C0" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_SPEED_COPPER) && (
        <Tooltip title={t("listing.avgCompletionTimeLessThan24Hours")}>
          <BoltRounded sx={{ color: "#CD7F32" }} />
        </Tooltip>
      )}

      {/* Consistency badges */}
      {badges.includes(BADGE_CONSISTENCY_PRO) && (
        <Tooltip title={t("listing.activeSellerFor3PlusYears")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id={`${gradientId}-consistency`}
                x1={1}
                y1={0}
                x2={1}
                y2={1}
                gradientTransform="rotate(-15)"
              >
                <stop offset={0} stopColor={theme.palette.primary.main} />
                <stop offset={1} stopColor={theme.palette.secondary.main} />
              </linearGradient>
            </svg>
            <CalendarTodayRounded
              sx={{
                fill: `url(#${gradientId}-consistency)`,
              }}
            />
          </Box>
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_GOLD) && (
        <Tooltip title={t("listing.activeSellerFor2PlusYears")}>
          <CalendarTodayRounded sx={{ color: "#FFD700" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_SILVER) && (
        <Tooltip title={t("listing.activeSellerFor1PlusYear")}>
          <CalendarTodayRounded sx={{ color: "#C0C0C0" }} />
        </Tooltip>
      )}
      {badges.includes(BADGE_CONSISTENCY_COPPER) && (
        <Tooltip title={t("listing.activeSellerFor6PlusMonths")}>
          <CalendarTodayRounded sx={{ color: "#CD7F32" }} />
        </Tooltip>
      )}

      {/* Early adopter badge */}
      {badges.includes(BADGE_EARLY_ADOPTER) && (
        <Tooltip title={t("listing.earlyPlatformAdopter")}>
          <RocketLaunchRounded sx={{ color: "#9C27B0" }} />
        </Tooltip>
      )}

      {/* Responsive badge */}
      {badges.includes(BADGE_RESPONSIVE) && (
        <Tooltip title={t("listing.responsiveBadge")}>
          <AccessTimeRounded color={"success"} />
        </Tooltip>
      )}
    </>
  )
}

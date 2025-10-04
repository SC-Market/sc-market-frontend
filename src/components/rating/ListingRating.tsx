import { MinimalUser } from "../../datatypes/User"
import { MinimalContractor } from "../../datatypes/Contractor"
import {
  AccessTimeRounded,
  AutoAwesomeRounded,
  AutoGraphOutlined,
  StarRounded,
  WhatshotRounded,
} from "@mui/icons-material"
import { Box, Link as MaterialLink, Rating, Tooltip } from "@mui/material"
import React, { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../typography/UnderlineLink"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"

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
}) {
  const {
    avg_rating,
    rating_count,
    total_rating,
    rating_streak,
    total_orders,
    total_assignments,
    response_rate,
  } = props

  // Create a rating object that matches the expected structure
  const rating = {
    avg_rating,
    rating_count: rating_count || 0,
    total_rating,
    rating_streak: rating_streak || 0,
    total_orders: total_orders || 0,
    total_assignments: total_assignments || 0,
    response_rate: response_rate || 0,
  }

  return (
    <Box display={"flex"} alignItems={"center"}>
      <MarketRatingStars rating={rating} />
      <MarketRatingCount rating={rating} />
    </Box>
  )
}

export function SellerRatingStars(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
}) {
  const theme = useTheme<ExtendedTheme>()
  const { user, contractor } = props
  const rating = useMemo(
    () => (user?.rating.avg_rating || contractor?.rating.avg_rating || 0) / 10,
    [user, contractor],
  )

  return (
    <Rating
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
  rating: {
    avg_rating: number
    rating_count: number
    total_rating: number
    rating_streak: number
    total_orders: number
    total_assignments: number
    response_rate: number
  }
}) {
  const theme = useTheme<ExtendedTheme>()
  const { rating } = props

  return (
    <Rating
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
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { user, contractor } = props
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

  return (
    <>
      ({rating.rating_count.toLocaleString(undefined)}){" "}
      {rating.total_orders >= 25 ? (
        rating.avg_rating >= 47.5 ? (
          <Tooltip title={t("listing.95PercentRating25PlusTransactions")}>
            <Box>
              <svg width={0} height={0}>
                <linearGradient
                  id="linearColors"
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
                  fill: "url(#linearColors)",
                }}
              />
            </Box>
          </Tooltip>
        ) : rating.avg_rating >= 45 ? (
          <Tooltip title={t("listing.90PercentRating25PlusTransactions")}>
            <AutoGraphOutlined color={"primary"} />
          </Tooltip>
        ) : null
      ) : null}
      {/* Responsive Badge */}
      {(rating.total_assignments || 0) >= 10 &&
      (rating.response_rate || 0) >= 90 ? (
        <Tooltip title={t("listing.responsiveBadge")}>
          <AccessTimeRounded color={"success"} />
        </Tooltip>
      ) : null}
      {rating.streak >= 10 ? (
        <Tooltip title={t("listing.tenPlusFiveStarStreak")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id="linearColors"
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
                fill: "url(#linearColors)",
              }}
            />
          </Box>
        </Tooltip>
      ) : rating.streak >= 5 ? (
        <Tooltip title={t("listing.fivePlusFiveStarStreak")}>
          <WhatshotRounded color={"primary"} />
        </Tooltip>
      ) : null}
    </>
  )
}

export function MarketRatingCount(props: {
  rating: {
    avg_rating: number
    rating_count: number
    total_rating: number
    rating_streak: number
    total_orders: number
    total_assignments: number
    response_rate: number
  }
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { rating } = props

  return (
    <>
      ({rating.rating_count.toLocaleString(undefined)}){" "}
      {rating.total_orders >= 25 ? (
        rating.avg_rating >= 47.5 ? (
          <Tooltip title={t("listing.95PercentRating25PlusTransactions")}>
            <Box>
              <svg width={0} height={0}>
                <linearGradient
                  id="linearColors"
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
                  fill: "url(#linearColors)",
                }}
              />
            </Box>
          </Tooltip>
        ) : rating.avg_rating >= 45 ? (
          <Tooltip title={t("listing.90PercentRating25PlusTransactions")}>
            <AutoGraphOutlined color={"primary"} />
          </Tooltip>
        ) : null
      ) : null}
      {/* Responsive Badge */}
      {(rating.total_assignments || 0) >= 10 &&
      (rating.response_rate || 0) >= 90 ? (
        <Tooltip title={t("listing.responsiveBadge")}>
          <AccessTimeRounded color={"success"} />
        </Tooltip>
      ) : null}
      {rating.rating_streak >= 10 ? (
        <Tooltip title={t("listing.tenPlusFiveStarStreak")}>
          <Box>
            <svg width={0} height={0}>
              <linearGradient
                id="linearColors"
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
                fill: "url(#linearColors)",
              }}
            />
          </Box>
        </Tooltip>
      ) : rating.rating_streak >= 5 ? (
        <Tooltip title={t("listing.fivePlusFiveStarStreak")}>
          <WhatshotRounded color={"primary"} />
        </Tooltip>
      ) : null}
    </>
  )
}

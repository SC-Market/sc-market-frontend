import { MinimalUser } from "../../datatypes/User"
import { MinimalContractor } from "../../datatypes/Contractor"
import {
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

export function SellerRatingCount(props: {
  user?: MinimalUser | null
  contractor?: MinimalContractor | null
}) {
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
      },
    [user, contractor],
  )

  return (
    <>
      ({rating.rating_count.toLocaleString(undefined)}){" "}
      {rating.total_orders >= 25 ? (
        rating.avg_rating >= 47.5 ? (
          <Tooltip title={"95%+ rating and 25+ transactions"}>
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
          <Tooltip title={"90%+ rating and 25+ transactions"}>
            <AutoGraphOutlined color={"primary"} />
          </Tooltip>
        ) : null
      ) : null}
      {rating.streak >= 10 ? (
        <Tooltip title={"10+ 5 star streak"}>
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
        <Tooltip title={"5+ 5 star streak"}>
          <WhatshotRounded color={"primary"} />
        </Tooltip>
      ) : null}
    </>
  )
}

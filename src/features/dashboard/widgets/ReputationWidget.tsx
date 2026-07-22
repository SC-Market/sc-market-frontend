/**
 * ReputationWidget — the current user's seller reputation (rating, streak,
 * volume, badges). There's no dedicated rating hook: the self-profile carries
 * the username but not the rating, so we read the username from the profile and
 * fetch the full user record (which does carry `rating` + `badges`).
 *
 * Personal-only (`me` scope) — reputation is a property of a person, not an
 * org/shop context.
 */

import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material"
import type { TFunction } from "i18next"
import {
  useGetUserProfileQuery,
  useGetUserByUsernameQuery,
} from "../../profile/api/profileApi"
import { MarketListingRating } from "../../../components/rating/ListingRating"

export function ReputationWidget({ t }: { t: TFunction }) {
  const { data: profile } = useGetUserProfileQuery()
  const { data: user, isLoading } = useGetUserByUsernameQuery(
    profile?.username ?? "",
    { skip: !profile?.username },
  )

  if (!profile || isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (!user) {
    return (
      <Alert severity="error" variant="outlined">
        {t("dashboard.reputationError", "Couldn't load your reputation.")}
      </Alert>
    )
  }

  const rating = user.rating

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h5" component="div">
          {rating.avg_rating.toFixed(1)}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            / 5
          </Typography>
        </Typography>
        <MarketListingRating
          avg_rating={rating.avg_rating}
          rating_count={rating.rating_count}
          total_rating={rating.total_rating}
          rating_streak={rating.streak}
          total_orders={rating.total_orders ?? 0}
          total_assignments={rating.total_assignments ?? 0}
          response_rate={rating.response_rate ?? 0}
          badge_ids={user.badges?.badge_ids ?? null}
        />
      </Box>
      <Stack direction="row" spacing={3}>
        <Stat
          label={t("dashboard.reputationOrders", "Orders")}
          value={(rating.total_orders ?? 0).toLocaleString()}
        />
        <Stat
          label={t("dashboard.reputationReviews", "Reviews")}
          value={rating.rating_count.toLocaleString()}
        />
        <Stat
          label={t("dashboard.reputationStreak", "5★ streak")}
          value={rating.streak.toLocaleString()}
        />
      </Stack>
    </Stack>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="h6" component="div">
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}

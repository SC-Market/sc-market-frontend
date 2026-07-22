/**
 * WishlistWidget — the user's shopping lists with per-list progress. Wraps
 * useGetWishlistsQuery, which returns each list's progress_percentage /
 * completed_items / item_count directly. Personal-only (`me` scope).
 */

import { Link as RouterLink } from "react-router-dom"
import {
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material"
import type { TFunction } from "i18next"
import { useGetWishlistsQuery } from "../../../store/api/v2/market"

export function WishlistWidget({ t }: { t: TFunction }) {
  const { data, isLoading, isError } = useGetWishlistsQuery()

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (isError || !data) {
    return (
      <Alert severity="error" variant="outlined">
        {t("dashboard.wishlistError", "Couldn't load your shopping lists.")}
      </Alert>
    )
  }
  if (data.wishlists.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        {t("dashboard.wishlistEmpty", "You have no shopping lists yet.")}
      </Alert>
    )
  }

  return (
    <Stack spacing={2}>
      {data.wishlists.map((wishlist) => (
        <Box key={wishlist.wishlist_id}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 1,
            }}
          >
            <MuiLink
              component={RouterLink}
              to={`/shopping-lists/${wishlist.wishlist_id}`}
              variant="subtitle2"
              noWrap
            >
              {wishlist.wishlist_name}
            </MuiLink>
            <Typography variant="caption" color="text.secondary" noWrap>
              {t("dashboard.wishlistProgress", "{{done}}/{{total}} items", {
                done: wishlist.completed_items,
                total: wishlist.item_count,
              })}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, wishlist.progress_percentage))}
            sx={{ mt: 0.5, borderRadius: 1 }}
          />
        </Box>
      ))}
    </Stack>
  )
}

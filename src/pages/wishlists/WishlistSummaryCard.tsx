import React from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material"
import {
  DeleteRounded,
  ShareRounded,
  LockRounded,
  PublicRounded,
  CheckCircleRounded,
} from "@mui/icons-material"
import { type ListWishlistsResponse } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { useFormatters } from "../../util/format"

/** One wishlist in the manager grid: name, badges, description, progress and delete. */
export function WishlistSummaryCard({
  wishlist,
  onOpen,
  onDelete,
}: {
  wishlist: ListWishlistsResponse["wishlists"][number]
  onOpen: (wishlistId: string) => void
  onDelete: (
    wishlistId: string,
    wishlistName: string,
    event: React.MouseEvent,
  ) => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
      onClick={() => onOpen(wishlist.wishlist_id)}
    >
      <CardContent>
        {/* Wishlist Name and Badges */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ flex: 1, mr: 1 }}>
            {wishlist.wishlist_name}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {wishlist.is_public ? (
              <PublicRounded
                fontSize="small"
                color="action"
                titleAccess={t("wishlistsUi.public")}
              />
            ) : (
              <LockRounded
                fontSize="small"
                color="action"
                titleAccess={t("wishlistsUi.private")}
              />
            )}
            {wishlist.is_collaborative && (
              <ShareRounded
                fontSize="small"
                color="action"
                titleAccess={t("wishlistsUi.collaborative")}
              />
            )}
          </Stack>
        </Box>

        {/* Description */}
        {wishlist.wishlist_description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {wishlist.wishlist_description}
          </Typography>
        )}

        {/* Item Count */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("wishlistsUi.manager.itemCount", {
              count: wishlist.item_count,
            })}
          </Typography>
          {wishlist.completed_items > 0 && (
            <>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Chip
                icon={<CheckCircleRounded />}
                label={t("wishlistsUi.manager.acquiredCount", {
                  count: wishlist.completed_items,
                })}
                size="small"
                color="success"
                variant="outlined"
              />
            </>
          )}
        </Box>

        {/* Progress Bar (Requirement 8.3) */}
        {wishlist.item_count > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("wishlists.progress")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {wishlist.progress_percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={wishlist.progress_percentage}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Created Date */}
        <Typography variant="caption" color="text.secondary">
          {t("wishlistsUi.manager.createdOn", {
            date: fmt.date(wishlist.created_at),
          })}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <IconButton
          size="small"
          onClick={(e) =>
            onDelete(wishlist.wishlist_id, wishlist.wishlist_name, e)
          }
          color="error"
          aria-label={t("wishlistsUi.manager.deleteNamed", {
            name: wishlist.wishlist_name,
          })}
        >
          <DeleteRounded fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  )
}

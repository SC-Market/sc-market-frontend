import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import {
  MoreVertRounded,
  CheckCircleRounded,
  RadioButtonUncheckedRounded,
  StarRounded,
  StarBorderRounded,
  BuildRounded,
  ShoppingCartRounded,
} from "@mui/icons-material"
import { type WishlistItemWithDetails } from "../../store/api/v2/market"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"

/** One wishlist item: icon, status, quantity, quality, priority, cost, notes and quick actions. */
export function WishlistItemCard({
  item,
  onMenuOpen,
  onToggleAcquired,
}: {
  item: WishlistItemWithDetails
  onMenuOpen: (
    event: React.MouseEvent<HTMLElement>,
    item: WishlistItemWithDetails,
  ) => void
  onToggleAcquired: (item: WishlistItemWithDetails) => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <Card
      sx={{
        opacity: item.is_acquired ? 0.6 : 1,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Item Icon */}
          <ImageAvatar
            src={item.game_item_icon}
            alt={item.game_item_name}
            sx={{ width: 64, height: 64 }}
            variant="rounded"
          >
            {item.game_item_name.charAt(0)}
          </ImageAvatar>

          {/* Item Details */}
          <Box sx={{ flex: 1 }}>
            {/* Item Name and Status */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {item.game_item_name}
                  {item.is_acquired && (
                    <Chip
                      icon={<CheckCircleRounded />}
                      label={t("wishlistsUi.detail.acquired")}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.game_item_type}
                </Typography>
              </Box>

              {/* Actions Menu */}
              <IconButton
                size="small"
                onClick={(e) => onMenuOpen(e, item)}
                aria-label={t("wishlistsUi.detail.itemActionsFor", {
                  name: item.game_item_name,
                })}
                aria-haspopup="menu"
              >
                <MoreVertRounded />
              </IconButton>
            </Box>

            {/* Item Properties */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mb: 1,
              }}
            >
              {/* Quantity (Requirement 53.2) */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("wishlists.quantity", "Quantity")}
                </Typography>
                <Typography variant="body2">
                  {item.acquired_quantity} / {item.desired_quantity}
                </Typography>
              </Box>

              {/* Quality Tier (Requirement 53.6) */}
              {item.desired_quality_tier && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {t("wishlists.qualityTier", "Quality Tier")}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((tier) => (
                      <Box key={tier}>
                        {tier <= item.desired_quality_tier! ? (
                          <StarRounded fontSize="small" color="primary" />
                        ) : (
                          <StarBorderRounded
                            fontSize="small"
                            color="disabled"
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Priority (Requirement 53.5) */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("wishlists.priority", "Priority")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Box
                      key={level}
                      sx={{
                        width: 8,
                        height: 16,
                        bgcolor:
                          level <= item.priority
                            ? "primary.main"
                            : "action.disabled",
                        borderRadius: 0.5,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Acquisition Mode */}
              {item.acquisition_mode === "craft" && item.blueprint_name ? (
                <Chip
                  icon={<BuildRounded />}
                  label={t("wishlistsUi.detail.craft", {
                    name: item.blueprint_name,
                  })}
                  size="small"
                  color="info"
                  variant="outlined"
                  component={Link}
                  to={GAME_DATA_PATHS.blueprint(item.blueprint_id!)}
                  clickable
                />
              ) : item.crafting_available ? (
                <Chip
                  icon={<ShoppingCartRounded />}
                  label={t("wishlistsUi.detail.buyFromMarket")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : null}

              {/* Estimated Cost */}
              {item.estimated_cost && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {t("wishlists.estCost", "Est. Cost")}
                  </Typography>
                  <Typography variant="body2">
                    {fmt.number(item.estimated_cost)} aUEC
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Notes (Requirement 53.7) */}
            {item.notes && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontStyle: "italic",
                  mt: 1,
                  p: 1,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                {item.notes}
              </Typography>
            )}

            {/* Quick Actions */}
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                size="small"
                variant={item.is_acquired ? "outlined" : "contained"}
                startIcon={
                  item.is_acquired ? (
                    <RadioButtonUncheckedRounded />
                  ) : (
                    <CheckCircleRounded />
                  )
                }
                onClick={() => onToggleAcquired(item)}
              >
                {item.is_acquired
                  ? t("wishlists.markNeeded", "Mark as Needed")
                  : t("wishlists.markAcquired", "Mark as Acquired")}
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

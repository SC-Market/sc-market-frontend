import {
  Box,
  Grid,
  Typography,
  Rating,
  Divider,
  Link as MaterialLink,
} from "@mui/material"
import { StarRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useGetShopReviewsQuery } from "../../../../store/api/v2/market"
import type { ShopReviewResponse } from "../../../../store/api/v2/market"
import { getRelativeTime } from "../../../../util/time"
import { SHOP_PATHS } from "../../../../routes/paths"

export function SellerReviews(props: {
  shopId?: string | null
  shopSlug?: string | null
  shopName?: string | null
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { shopId, shopSlug, shopName } = props

  const { data: reviewsData, isLoading } = useGetShopReviewsQuery(
    { shopId: shopId || "", pageSize: 3 },
    { skip: !shopId },
  )

  const reviews = reviewsData?.reviews || []
  const totalReviews = reviewsData?.total || 0
  const displayName = shopName || shopSlug || ""

  if (!shopId || isLoading || !reviews.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight="bold">
            {t("MarketListingView.sellerReviews", {
              seller: displayName,
              defaultValue: `Reviews for ${displayName}`,
            })}
          </Typography>
          {totalReviews > 3 && (
            <MaterialLink
              component={Link}
              to={SHOP_PATHS.profileTab(shopSlug || shopId, "reviews")}
              underline="hover"
              color="primary"
              variant="body2"
            >
              {t(
                "MarketListingView.viewAllReviews",
                "View all {{count}} reviews",
                { count: totalReviews },
              )}
            </MaterialLink>
          )}
        </Box>
        <Grid container spacing={theme.layoutSpacing.component}>
          {reviews.map((review: ShopReviewResponse) => (
            <Grid item xs={12} md={4} key={review.review_id}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Rating
                    value={review.rating}
                    max={5}
                    readOnly
                    size="small"
                    icon={<StarRounded fontSize="inherit" />}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getRelativeTime(new Date(review.created_at))}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    mb: 1,
                  }}
                >
                  {review.comment ||
                    t("MarketListingView.noReviewContent", "No review content")}
                </Typography>
                <Divider light sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {t("MarketListingView.reviewBy", "by")}{" "}
                  {review.author?.display_name ||
                    t("MarketListingView.anonymousReviewer", "Anonymous")}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  )
}

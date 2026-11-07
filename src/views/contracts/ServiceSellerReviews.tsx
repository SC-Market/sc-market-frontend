import { useMemo } from "react"
import {
  Box,
  Grid,
  Link as MaterialLink,
  Typography,
  Rating,
  Divider,
  useTheme,
} from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import { ORG_PATHS, USER_PATHS } from "../../routes/paths"
import { StarRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetUserOrderReviews } from "../../features/profile/api/profileApi"
import { useGetContractorReviewsQuery } from "../../features/contractor/api/contractorApi"
import type { OrderReview } from "../../features/orders/domain/types"
import { useFormatters, useNow } from "../../util/format"

export function ServiceSellerReviews(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
}) {
  const fmt = useFormatters()
  const now = useNow()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { userSeller, contractorSeller } = props

  // Get reviews for user or contractor
  const { data: userReviews, isLoading: userReviewsLoading } =
    useGetUserOrderReviews(userSeller?.username || "", {
      skip: !userSeller?.username,
    })

  const { data: contractorReviews, isLoading: contractorReviewsLoading } =
    useGetContractorReviewsQuery(contractorSeller?.spectrum_id || "", {
      skip: !contractorSeller?.spectrum_id,
    })

  const reviews = useMemo(() => {
    const allReviews = userReviews || contractorReviews || []
    return allReviews.slice(0, 3) // Show max 3 recent reviews
  }, [userReviews, contractorReviews])

  const isLoading = userReviewsLoading || contractorReviewsLoading
  const sellerName = userSeller?.username || contractorSeller?.spectrum_id || ""
  const totalReviews = userReviews?.length || contractorReviews?.length || 0
  const allReviewsPath = userSeller
    ? USER_PATHS.profileTab(userSeller.username, "reviews")
    : contractorSeller
      ? ORG_PATHS.profileTab(contractorSeller.spectrum_id, "reviews")
      : null

  // Don't show section if no seller info, still loading, or no reviews
  if (!sellerName || isLoading || !reviews.length) return null

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
            {t("serviceView.sellerReviews", {
              seller: sellerName,
              defaultValue: `Reviews for ${sellerName}`,
            })}
          </Typography>
          {totalReviews > 3 && allReviewsPath && (
            <MaterialLink
              component={Link}
              to={allReviewsPath}
              underline="hover"
              color="primary"
              variant="body2"
            >
              {t("serviceView.viewAllReviews", "View all {{count}} reviews", {
                count: totalReviews,
              })}
            </MaterialLink>
          )}
        </Box>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {reviews.map((review: OrderReview) => (
            <Grid item xs={12} md={4} key={review.review_id}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: (theme) =>
                    theme.spacing(theme.borderRadius.topLevel),
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
                    {fmt.relative(new Date(review.timestamp), now)}
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
                  {review.content ||
                    t("serviceView.noReviewContent", "No review content")}
                </Typography>
                <Divider light sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {t("serviceView.reviewBy", "by")}{" "}
                  {review.user_author?.display_name ||
                    review.contractor_author?.name ||
                    t("serviceView.anonymousReviewer", "Anonymous")}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  )
}

import { useMemo } from "react"
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
import { useGetUserOrderReviews } from "../../../../store/profile"
import { useGetContractorReviewsQuery } from "../../../../store/contractor"
import { OrderReview } from "../../../../datatypes/Order"
import { getRelativeTime } from "../../../../util/time"

export function SellerReviews(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { userSeller, contractorSeller } = props

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
    return allReviews.slice(0, 3)
  }, [userReviews, contractorReviews])

  const isLoading = userReviewsLoading || contractorReviewsLoading
  const sellerName = userSeller?.username || contractorSeller?.spectrum_id || ""
  const totalReviews = userReviews?.length || contractorReviews?.length || 0

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
            {t("MarketListingView.sellerReviews", {
              seller: sellerName,
              defaultValue: `Reviews for ${sellerName}`,
            })}
          </Typography>
          {totalReviews > 3 && (
            <MaterialLink
              component={Link}
              to={
                userSeller
                  ? `/user/${userSeller.username}/reviews`
                  : `/contractor/${contractorSeller?.spectrum_id}/reviews`
              }
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
          {reviews.map((review: OrderReview) => (
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
                    {getRelativeTime(new Date(review.timestamp))}
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
                    t("MarketListingView.noReviewContent", "No review content")}
                </Typography>
                <Divider light sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {t("MarketListingView.reviewBy", "by")}{" "}
                  {review.user_author?.display_name ||
                    review.contractor_author?.name ||
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

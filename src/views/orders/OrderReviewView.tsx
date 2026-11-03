import React, { useMemo } from "react"
import {
  Box,
  CardActionArea,
  CardMedia,
  Grid,
  Link as MaterialLink,
  Rating,
  Typography,
} from "@mui/material"
import { Section } from "../../components/paper/Section"
import { StarRounded } from "@mui/icons-material"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { Order } from "../../features/orders/domain/types"
import { useTranslation } from "react-i18next"
import { ReviewRevisionButton } from "../../components/reviews/ReviewRevisionButton"
import { EditableReview } from "../../components/reviews/EditableReview"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useFormatters, useNow } from "../../util/format"
import { useOrderViewerRoles } from "../../features/orders/hooks/useOrderViewerRoles"
import {
  canEditReview,
  canRequestReviewRevision,
} from "../../features/orders/domain/reviewPermissions"

export function OrderReviewView(props: {
  customer?: boolean
  contractor?: boolean
  order: Order
}) {
  const fmt = useFormatters()
  const now = useNow()
  const { order } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: currentUser } = useGetUserProfileQuery()

  const viewerRoles = useOrderViewerRoles({
    customer: order.customer,
    assignedTo: order.assigned_to,
    contractor: order.contractor,
  })

  const review = useMemo(
    () => (props.customer ? order.customer_review! : order.contractor_review!),
    [order.contractor_review, order.customer_review, props.customer],
  )

  return (
    <>
      <Section xs={12} title={t("orderReviewView.review")}>
        <Grid item xs={8}>
          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: "1" }}>
            <MaterialLink
              component={Link}
              to={
                review.user_author
                  ? `/user/${review.user_author.username}`
                  : `/contractor/${review.contractor_author?.spectrum_id}`
              }
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink
                color={"text.primary"}
                variant={"h6"}
                sx={{
                  fontWeight: "600",
                }}
              >
                {review.user_author?.display_name ||
                  review.contractor_author!.name}
              </UnderlineLink>
            </MaterialLink>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              {fmt.relative(new Date(review.timestamp!), now)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <CardActionArea
            component={Link}
            to={
              review.user_author
                ? `/user/${review.user_author.username}`
                : `/contractor/${review.contractor_author?.spectrum_id}`
            }
          >
            <CardMedia
              component="img"
              loading="lazy"
              sx={{ width: 96, objectFit: "cover", borderRadius: 2 }}
              image={
                review.user_author
                  ? review.user_author.avatar
                  : review.contractor_author!.avatar
              }
              alt={
                review.user_author
                  ? review.user_author.display_name
                  : review.contractor_author!.name
              }
            />
          </CardActionArea>
        </Grid>
        <Grid item xs={12}>
          <Typography>{review.content}</Typography>
          <br />

          <Typography
            sx={{ textAlign: "left", verticalAlign: "middle" }}
            color={"text.secondary"}
          >
            {t("orderReviewView.ratingLabel")}
          </Typography>
          <Rating
            name="half-rating"
            defaultValue={0}
            value={review.rating}
            readOnly
            precision={0.5}
            size={"large"}
            icon={<StarRounded fontSize="inherit" />}
            emptyIcon={
              <StarRounded
                style={{ color: theme.palette.text.primary }}
                fontSize="inherit"
              />
            }
          />
        </Grid>

        {/* Review Revision Button */}
        {canRequestReviewRevision(review, viewerRoles) && (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <ReviewRevisionButton review={review} orderId={order.order_id} />
          </Grid>
        )}

        {/* Editable Review Component */}
        {canEditReview(review, currentUser?.username, viewerRoles) && (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <EditableReview review={review} />
          </Grid>
        )}
      </Section>
    </>
  )
}

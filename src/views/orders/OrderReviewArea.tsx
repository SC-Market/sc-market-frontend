import React from "react"
import { Button, Grid, Rating, TextField, Typography } from "@mui/material"
import { Section } from "../../components/paper/Section"
import { AddRounded, StarRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Order, OrderStatus } from "../../features/orders/domain/types"
import { useTranslation } from "react-i18next"
import { useOrderReview } from "../../features/orders/hooks/useOrderReview"

/** Reviews are accepted once an order is finished (matches the backend gate). */
export const REVIEWABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  "fulfilled",
  "cancelled",
]

/** An order still open this many days after it started is reviewable too. */
export const REVIEW_OPEN_ORDER_AFTER_DAYS = 14

/** Mirrors the backend's isOrderReviewable (orders.timestamp = start). */
export function isOrderReviewable(
  order: Pick<Order, "status" | "timestamp">,
  now: Date = new Date(),
): boolean {
  if (REVIEWABLE_ORDER_STATUSES.includes(order.status)) return true
  const started = new Date(order.timestamp).getTime()
  if (Number.isNaN(started)) return false
  return (
    now.getTime() - started >=
    REVIEW_OPEN_ORDER_AFTER_DAYS * 24 * 60 * 60 * 1000
  )
}

export function OrderReviewArea(props: {
  asCustomer?: boolean
  asContractor?: boolean
  order: Order
}) {
  const { order } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const role = props.asCustomer ? "customer" : "contractor"
  const { content, setContent, rating, setRating, submitReview } =
    useOrderReview(order.order_id, role)
  const finished = isOrderReviewable(order)

  return (
    <>
      <Section xs={12} title={t("orderReviewArea.review")}>
        <Grid item xs={12}>
          {t("orderReviewArea.leaveFor")}{" "}
          {props.asContractor
            ? order.customer
            : order.contractor || order.assigned_to}
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            maxRows={5}
            minRows={5}
            value={content}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              setContent(event.target.value)
            }}
            color={"secondary"}
            label={t("orderReviewArea.commentLabel")}
            disabled={!finished}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography
            sx={{ textAlign: "left", verticalAlign: "middle" }}
            color={"text.secondary"}
          >
            {t("orderReviewArea.ratingLabel")}
          </Typography>
          <Rating
            name="half-rating"
            defaultValue={0}
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue!)
            }}
            precision={1}
            disabled={!finished}
            size={"large"}
            color={"white"}
            icon={<StarRounded fontSize="inherit" />}
            emptyIcon={
              <StarRounded
                style={{ color: theme.palette.text.primary }}
                fontSize="inherit"
              />
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Grid
            container
            justifyContent={"right"}
            alignItems={"center"}
            spacing={1}
          >
            {!finished && (
              <Grid item>
                <Typography variant={"body2"} color={"text.primary"}>
                  {t("orderReviewArea.notFinishedHint")}
                </Typography>
              </Grid>
            )}
            <Grid item>
              <Button
                color={"secondary"}
                startIcon={<AddRounded />}
                onClick={submitReview}
                variant={"contained"}
                disabled={!finished}
              >
                {t("orderReviewArea.leaveReviewButton")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  )
}

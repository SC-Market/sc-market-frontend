import React from "react"
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material"
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { type OrgStorefront } from "../../../store/api/v2/market"
import { useGetContractorReviewsQuery } from "../../contractor/api/contractorApi"
import { ORG_PATHS } from "../../../routes/paths"

export function SectionTitle(props: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 1 }}
      spacing={1}
    >
      <Typography variant="h6" component="h2" color="text.secondary">
        {props.children}
      </Typography>
      {props.action}
    </Stack>
  )
}

export function LatestReviews(props: { spectrumId: string }) {
  const { t } = useTranslation()
  const { data } = useGetContractorReviewsQuery(props.spectrumId)
  const reviews = (data ?? []).filter((r) => r.content?.trim()).slice(0, 3)
  if (reviews.length === 0) return null
  return (
    <Box component="section" aria-labelledby="storefront-reviews">
      <SectionTitle
        action={
          <Button
            component={Link}
            to={ORG_PATHS.profileTab(props.spectrumId, "reviews")}
            size="small"
          >
            {t("storefront.allReviews", "All reviews")}
          </Button>
        }
      >
        <span id="storefront-reviews">
          {t("storefront.reviews", "Reviews")}
        </span>
      </SectionTitle>
      <Grid container spacing={1}>
        {reviews.map((review) => (
          <Grid item xs={12} md={4} key={review.review_id}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Rating
                value={review.rating}
                readOnly
                size="small"
                precision={0.5}
              />
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ mt: 0.5, overflowWrap: "anywhere" }}
              >
                {review.content.length > 240
                  ? `${review.content.slice(0, 239)}…`
                  : review.content}
              </Typography>
              <Typography variant="caption" color="text.primary">
                {review.user_author?.display_name ??
                  review.contractor_author?.name ??
                  ""}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

/** The org's SC Orgs page as a recruiting card (headline, members, focus). */
export function RecruitingCard(props: { storefront: OrgStorefront }) {
  const { t } = useTranslation()
  const recruiting = props.storefront.recruiting
  if (!recruiting || !recruiting.url.startsWith("https://sc-orgs.space/"))
    return null
  const tags = [...recruiting.focus_tags, ...recruiting.playstyle_tags].slice(
    0,
    6,
  )
  return (
    <Paper variant="outlined" sx={{ p: 2 }} data-testid="storefront-recruiting">
      <Typography variant="subtitle2" color="text.secondary">
        {t("storefront.recruiting.title", "Recruiting on SC Orgs")}
      </Typography>
      {recruiting.headline && (
        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
          {recruiting.headline}
        </Typography>
      )}
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        spacing={0.5}
        sx={{ mt: 1 }}
      >
        {recruiting.member_count !== null &&
          recruiting.member_count !== undefined && (
            <Chip
              size="small"
              label={t("storefront.recruiting.members", {
                n: recruiting.member_count,
                defaultValue: "Members on SC Orgs: {{n}}",
              })}
            />
          )}
        {tags.map((tag) => (
          <Chip key={tag} size="small" variant="outlined" label={tag} />
        ))}
      </Stack>
      <Button
        sx={{ mt: 1.5 }}
        variant="contained"
        size="small"
        href={recruiting.url}
        target="_blank"
        rel="noopener"
        endIcon={<OpenInNewRounded />}
      >
        {t("storefront.recruiting.join", "Join via SC Orgs")}
      </Button>
    </Paper>
  )
}

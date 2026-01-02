import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Fade,
  Grid,
  IconButton,
  Link as MaterialLink,
  Rating,
  Skeleton,
  Typography,
} from "@mui/material"
import React, { useMemo } from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { CreateRounded, StarRounded } from "@mui/icons-material"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { RecruitingPost } from "../../store/recruiting"
import { RecruitmentVotes } from "../../components/button/RecruitmentVotes"
import { useGetUserProfileQuery } from "../../store/profile"
import { Link } from "react-router-dom"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { contractorKindIcons } from "../contractor/ContractorList"
import { has_permission } from "../contractor/OrgRoles"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { useTranslation } from "react-i18next"
import { ReportButton } from "../../components/button/ReportButton"

export function RecruitingPostView(props: { post: RecruitingPost }) {
  const { post } = props
  const { contractor } = post
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()
  const amContractorManager = useMemo(
    () =>
      has_permission(
        currentOrg,
        profile,
        "manage_recruiting",
        profile?.contractors,
      ),
    [contractor, profile],
  )

  return (
    <Grid item xs={12} lg={12}>
      <Fade
        in={true}
        style={{ transitionDelay: `50ms`, transitionDuration: "500ms" }}
      >
        <Card
          sx={{
            borderRadius: (theme) => theme.spacing(theme.borderRadius.image),
            padding: 3,
          }}
        >
          <CardHeader
            avatar={
              <MaterialLink
                component={Link}
                to={`/contractor/${contractor.spectrum_id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Avatar
                  src={contractor.avatar}
                  aria-label={t("recruiting_post.contractor", {
                    defaultValue: "Contractor",
                  })}
                  variant={"rounded"}
                  sx={{
                    maxHeight: theme.spacing(12),
                    maxWidth: theme.spacing(12),
                    // maxWidth:'100%',
                    // maxHeight:'100%',
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </MaterialLink>
            }
            title={
              <MaterialLink
                component={Link}
                to={`/contractor/${contractor.spectrum_id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <UnderlineLink
                  color={"text.secondary"}
                  variant={"subtitle1"}
                  fontWeight={"bold"}
                >
                  {contractor.name}
                </UnderlineLink>
              </MaterialLink>
            }
            subheader={
              <Box>
                <Grid
                  container
                  alignItems={"center"}
                  spacing={theme.layoutSpacing.compact}
                >
                  <Grid item>
                    <PeopleAltRoundedIcon
                      style={{ color: theme.palette.text.primary }}
                    />
                  </Grid>
                  <Grid item>
                    <Typography
                      sx={{ marginLeft: 1 }}
                      color={"text.primary"}
                      fontWeight={"bold"}
                    >
                      {contractor.size}
                    </Typography>
                  </Grid>
                </Grid>

                <ListingSellerRating contractor={contractor} />

                <Typography color={"text.primary"} variant={"subtitle2"}>
                  <ReportButton
                    reportedUrl={`/recruiting/post/${post.post_id}`}
                  />
                </Typography>
              </Box>
            }
            action={
              <>
                <RecruitmentVotes post={post} />
                {currentOrg && amContractorManager && (
                  <Link
                    to={`/recruiting/post/${post.post_id}/update`}
                    style={{ marginLeft: 2 }}
                  >
                    <IconButton sx={{ color: theme.palette.background.light }}>
                      <CreateRounded />
                    </IconButton>
                  </Link>
                )}
              </>
            }
          />
          <CardContent>
            <Typography
              variant={"h4"}
              sx={{ width: "100%" }}
              textAlign={"center"}
            >
              <b>{post.title}</b>
            </Typography>
            <Typography variant={"body2"}>
              <MarkdownRender text={post.body} />
            </Typography>
          </CardContent>
          <CardActions>
            <Box>
              {contractor.fields.map((field) => (
                <Chip
                  key={field}
                  color={"primary"}
                  label={t(`contractor.fields.${field}`, field)}
                  sx={{
                    marginRight: 1,
                    marginBottom: 1,
                    padding: 1,
                    textTransform: "capitalize",
                  }}
                  variant={"outlined"}
                  icon={contractorKindIcons[field]}
                  onClick={
                    (event) => event.stopPropagation() // Don't highlight cell if button clicked
                  }
                />
              ))}
            </Box>
          </CardActions>
        </Card>
      </Fade>
    </Grid>
  )
}

// RecruitingPostViewSkeleton is now exported from components/skeletons

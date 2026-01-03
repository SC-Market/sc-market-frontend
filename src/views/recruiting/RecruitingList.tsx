import React, { useMemo } from "react"
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Fade,
  Grid,
  Link as MaterialLink,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { UnderlineLink } from "../../components/typography/UnderlineLink"

import { Link } from "react-router-dom"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { RecruitingPost } from "../../store/recruiting"
import { contractorKindIcons } from "../contractor/ContractorList"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { RecruitmentVotes } from "../../components/button/RecruitmentVotes"
import { useTranslation } from "react-i18next"
import { LongPressMenu } from "../../components/gestures"
import { ShareRounded, VisibilityRounded, BusinessRounded } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

export const RecruitingPostItem = React.memo(
  function RecruitingPostItem(props: { post: RecruitingPost; index: number }) {
    const { post, index } = props
    const { contractor } = post
    const theme = useTheme<ExtendedTheme>()
    const { t } = useTranslation()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))
    const navigate = useNavigate()

    // Long-press menu actions
    const longPressActions = useMemo(() => {
      const recruitingUrl = `/contractor/${contractor.spectrum_id}/recruiting`
      const contractorUrl = `/contractor/${contractor.spectrum_id}`
      
      return [
        {
          label: t("recruiting.viewDetails", { defaultValue: "View Details" }),
          icon: <VisibilityRounded />,
          onClick: () => navigate(recruitingUrl),
        },
        {
          label: t("recruiting.viewContractor", { defaultValue: "View Contractor" }),
          icon: <BusinessRounded />,
          onClick: () => navigate(contractorUrl),
        },
        {
          label: t("recruiting.share", { defaultValue: "Share" }),
          icon: <ShareRounded />,
          onClick: () => {
            const url = `${window.location.origin}${recruitingUrl}`
            if (navigator.share) {
              navigator.share({
                title: post.title,
                text: post.title,
                url,
              }).catch(() => {
                // User cancelled or error occurred
              })
            } else {
              // Fallback: copy to clipboard
              navigator.clipboard.writeText(url)
            }
          },
        },
      ]
    }, [post, contractor, navigate, t])

    const cardInnerContent = (
      <Link
        to={`/contractor/${contractor.spectrum_id}/recruiting`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Fade
          in={true}
          style={{
            transitionDelay: `${50 + 50 * index}ms`,
            transitionDuration: "500ms",
          }}
        >
          <Box
            sx={{
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: theme.spacing(2),
                right: theme.spacing(2),
                zIndex: 2,
              }}
            >
              <RecruitmentVotes post={post} />
            </Box>
            <CardActionArea
              sx={{
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <Card
                sx={{
                  borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  padding: 1,
                  border: `1px solid ${theme.palette.outline.main}`,
                }}
              >
                <CardHeader
                  avatar={
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
                    </Box>
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
                  <Typography
                    sx={{
                      "-webkit-box-orient": "vertical",
                      display: "-webkit-box",
                      "-webkit-line-clamp": "10",
                      overflow: "hidden",
                      lineClamp: "10",
                      textOverflow: "ellipsis",
                      // whiteSpace: "pre-line"
                    }}
                    variant={"body2"}
                    component="div"
                  >
                    <MarkdownRender text={post.body} plainText />
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
                          (event) => {
                            event.stopPropagation()
                            event.preventDefault()
                          } // Don't highlight cell if button clicked
                        }
                      />
                    ))}
                  </Box>
                </CardActions>
              </Card>
            </CardActionArea>
          </Box>
        </Fade>
      </Link>
    )

    // Wrap inner content with LongPressMenu on mobile, then wrap in Grid item
    const wrappedContent = isMobile && longPressActions.length > 0 ? (
      <LongPressMenu actions={longPressActions} enabled={isMobile}>
        {cardInnerContent}
      </LongPressMenu>
    ) : cardInnerContent

    return (
      <Grid item xs={12} lg={12}>
        {wrappedContent}
      </Grid>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if post data actually changed
    return (
      prevProps.post.post_id === nextProps.post.post_id &&
      prevProps.index === nextProps.index
    )
  },
)

// RecruitingPostSkeleton is now exported from components/skeletons

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
  Skeleton,
  Typography,
} from "@mui/material"
import React from "react"
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

export function RecruitingPostItem(props: {
  post: RecruitingPost
  index: number
}) {
  const { post, index } = props
  const { contractor } = post
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={12}>
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
                borderRadius: 2,
              }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  padding: 1,
                  border: `1px solid ${theme.palette.outline.main}`,
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      src={contractor.avatar}
                      aria-label="contractor"
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
                      <Grid container alignItems={"center"} spacing={1}>
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
                        label={field}
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
    </Grid>
  )
}

export function RecruitingPostSkeleton() {
  return (
    <Grid item xs={12} lg={12}>
      <Skeleton
        variant={"rectangular"}
        sx={{
          borderRadius: 3,
          height: 350,
          width: "100%",
        }}
      />
    </Grid>
  )
}

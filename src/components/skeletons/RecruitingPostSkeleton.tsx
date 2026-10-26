import React from "react"
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"

export interface RecruitingPostSkeletonProps {
  /**
   * Whether to show the vote button skeleton in the top right
   */
  showVoteButton?: boolean
}

/** Rendered size of the org avatar in a recruiting card (RSI logos are square). */
export const RECRUITING_AVATAR_SIZE = 76

/**
 * The org's name, member count and rating, as in a recruiting card's header
 * (RecruitingPostItem / RecruitingPostView).
 */
export function RecruitingPostHeaderSkeleton(props: { extraLine?: boolean }) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Box>
      <Typography variant="subtitle1">
        <Skeleton variant="text" width={180} />
      </Typography>
      <Grid container alignItems={"center"} spacing={theme.layoutSpacing.compact}>
        <Grid item>
          <PeopleAltRoundedIcon style={{ color: theme.palette.text.primary }} />
        </Grid>
        <Grid item>
          <Typography sx={{ marginLeft: 1 }}>
            <Skeleton variant="text" width={32} />
          </Typography>
        </Grid>
      </Grid>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Skeleton variant="text" width={110} height={20} />
      </Stack>
      {props.extraLine && (
        <Typography variant="subtitle2">
          <Skeleton variant="text" width={60} />
        </Typography>
      )}
    </Box>
  )
}

/** A row of org-tag chips, as in a recruiting card's footer. */
export function RecruitingTagChipsSkeleton() {
  return (
    <CardActions>
      <Stack direction="row" spacing={1}>
        {[96, 112, 88].map((w, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={w}
            height={32}
            sx={{ borderRadius: 4, marginBottom: 1 }}
          />
        ))}
      </Stack>
    </CardActions>
  )
}

/**
 * One card of the /recruiting list (RecruitingPostItem) while posts load:
 * the same card, paddings and avatar, a two-line title and the body's
 * ten-line clamp, so the list doesn't jump when posts arrive.
 */
export function RecruitingPostSkeleton(
  props: RecruitingPostSkeletonProps = {},
) {
  const { showVoteButton = true } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={12}>
      <Box sx={{ position: "relative" }}>
        {showVoteButton && (
          <Box
            sx={{
              position: "absolute",
              top: theme.spacing(2),
              right: theme.spacing(2),
              zIndex: 2,
            }}
          >
            <Skeleton
              variant="rounded"
              width={64}
              height={31}
              sx={{ borderRadius: 4 }}
            />
          </Box>
        )}
        <Card
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            padding: 1,
            border: `1px solid ${theme.palette.outline.main}`,
          }}
        >
          <CardHeader
            avatar={
              <Skeleton
                variant="rounded"
                width={RECRUITING_AVATAR_SIZE}
                height={RECRUITING_AVATAR_SIZE}
              />
            }
            title={<RecruitingPostHeaderSkeleton />}
            disableTypography
          />
          <CardContent>
            <Typography variant={"h4"} textAlign={"center"}>
              <Skeleton variant="text" width="85%" sx={{ mx: "auto" }} />
              <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
            </Typography>
            <Typography variant={"body2"} component="div">
              {[100, 96, 100, 92, 98, 100, 90, 97, 94, 70].map((w, i) => (
                <Skeleton key={i} variant="text" width={`${w}%`} />
              ))}
            </Typography>
          </CardContent>
          <RecruitingTagChipsSkeleton />
        </Card>
      </Box>
    </Grid>
  )
}

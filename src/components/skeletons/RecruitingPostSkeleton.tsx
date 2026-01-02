import React from "react"
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Stack,
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

export function RecruitingPostSkeleton(
  props: RecruitingPostSkeletonProps = {},
) {
  const { showVoteButton = true } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={12}>
      <Box
        sx={{
          position: "relative",
        }}
      >
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
              variant="rectangular"
              width={60}
              height={40}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        )}
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
                <Skeleton
                  variant="rectangular"
                  sx={{
                    maxHeight: theme.spacing(12),
                    maxWidth: theme.spacing(12),
                    width: "100%",
                    height: "100%",
                    borderRadius: theme.spacing(theme.borderRadius.image),
                  }}
                />
              }
              title={
                <Skeleton
                  variant="text"
                  width={200}
                  height={24}
                  sx={{ mb: 0.5 }}
                />
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
                      <Skeleton
                        variant="text"
                        width={40}
                        height={20}
                        sx={{ marginLeft: 1 }}
                      />
                    </Grid>
                  </Grid>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ mt: 0.5 }}
                  >
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton variant="text" width={60} height={16} />
                  </Stack>
                </Box>
              }
            />
            <CardContent>
              <Skeleton
                variant="text"
                width="80%"
                height={32}
                sx={{ mx: "auto", mb: 2 }}
              />
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="90%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="85%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton variant="text" width="75%" height={20} />
            </CardContent>
            <CardActions>
              <Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={32}
                    sx={{
                      borderRadius: 1,
                      marginBottom: 1,
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={32}
                    sx={{
                      borderRadius: 1,
                      marginBottom: 1,
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={32}
                    sx={{
                      borderRadius: 1,
                      marginBottom: 1,
                    }}
                  />
                </Stack>
              </Box>
            </CardActions>
          </Card>
        </CardActionArea>
      </Box>
    </Grid>
  )
}

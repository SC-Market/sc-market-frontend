import React from "react"
import {
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

export interface ContractorSkeletonProps {
  /**
   * Whether to show the dark mode gradient overlay
   */
  showDarkOverlay?: boolean
}

export function ContractorSkeleton(props: ContractorSkeletonProps = {}) {
  const { showDarkOverlay = true } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={12}>
      <CardActionArea
        sx={{
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
        }}
      >
        <Card
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            ...(theme.palette.mode === "dark" && showDarkOverlay
              ? {
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}),
          }}
        >
          <Box
            sx={{
              ...(theme.palette.mode === "dark" && showDarkOverlay
                ? {
                    background: `linear-gradient(to bottom, ${theme.palette.background.default}AA, ${theme.palette.background.default} 100%)`,
                  }
                : {}),
              height: "100%",
              width: "100%",
              padding: 1,
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
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton variant="text" width={60} height={16} />
                  </Stack>
                </Box>
              }
            />
            <CardContent>
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
                width="80%"
                height={20}
              />
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
          </Box>
        </Card>
      </CardActionArea>
    </Grid>
  )
}

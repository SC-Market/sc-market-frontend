import React from "react"
import {
  Avatar,
  Box,
  Card,
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

export function RecruitingPostViewSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={12}>
      <Card
        sx={{
          borderRadius: (theme) => theme.spacing(theme.borderRadius.image),
          padding: 3,
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
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{ mt: 0.5 }}
              />
            </Box>
          }
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton
                variant="rectangular"
                width={60}
                height={40}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="circular"
                width={40}
                height={40}
              />
            </Stack>
          }
        />
        <CardContent>
          <Skeleton
            variant="text"
            width="70%"
            height={40}
            sx={{ mx: "auto", mb: 3 }}
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
            width="100%"
            height={20}
            sx={{ mb: 0.5 }}
          />
          <Skeleton
            variant="text"
            width="95%"
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
          <Skeleton
            variant="text"
            width="80%"
            height={20}
            sx={{ mb: 0.5 }}
          />
          <Skeleton
            variant="text"
            width="75%"
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
    </Grid>
  )
}

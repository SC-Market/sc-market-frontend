import React from "react"
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
} from "@mui/material"
import {
  CreateRounded,
  DesignServicesRounded,
  InfoRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { OpenLayout } from "../../../components/layout/ContainerGrid"

export function ProfileSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <OpenLayout sidebarOpen={true}>
      <Box sx={{ position: "relative" }}>
        <Skeleton
          variant="rectangular"
          sx={{
            height: theme.palette.mode === "dark" ? 500 : 250,
            width: "100%",
            borderRadius: 0,
          }}
        />
        <Container
          maxWidth={"xl"}
          sx={{
            ...(theme.palette.mode === "dark"
              ? { position: "relative", top: -500 }
              : { position: "relative", top: -250 }),
          }}
        >
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Grid
                spacing={theme.layoutSpacing.layout}
                container
                justifyContent={"space-between"}
                alignItems={"end"}
                sx={{
                  marginTop: 1,
                  [theme.breakpoints.up("lg")]: { height: 400 },
                }}
              >
                <Grid item lg={6}>
                  <Grid
                    container
                    spacing={theme.layoutSpacing.component}
                    alignItems={"end"}
                  >
                    <Grid item>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          height: 80,
                          width: 80,
                          borderRadius: theme.spacing(theme.borderRadius.image),
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Skeleton
                        variant="text"
                        width={200}
                        height={28}
                        sx={{ mb: 1 }}
                      />
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Skeleton variant="circular" width={16} height={16} />
                        <Skeleton variant="text" width={60} height={16} />
                      </Stack>
                      <Skeleton variant="text" width={150} height={20} />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sx={{ maxHeight: 200, overflowX: "scroll" }}
                    >
                      <Stack direction="row" spacing={1}>
                        <Skeleton
                          variant="rectangular"
                          width={120}
                          height={80}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={120}
                          height={80}
                          sx={{ borderRadius: 1 }}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item lg={6}>
                  <Paper
                    sx={{
                      padding: 2,
                      paddingTop: 1,
                      position: "relative",
                      maxHeight: 350,
                      overflowY: "scroll",
                    }}
                  >
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
                      width="80%"
                      height={20}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
                <Tabs
                  value={0}
                  aria-label="Profile tabs"
                  variant="scrollable"
                  textColor="secondary"
                  indicatorColor="secondary"
                >
                  <Tab label={<Skeleton width={60} />} icon={<StorefrontRounded />} />
                  <Tab label={<Skeleton width={60} />} icon={<DesignServicesRounded />} />
                  <Tab label={<Skeleton width={60} />} icon={<InfoRounded />} />
                  <Tab label={<Skeleton width={60} />} icon={<CreateRounded />} />
                  <Tab label={<Skeleton width={60} />} icon={<StarRounded />} />
                </Tabs>
              </Box>
              <Divider light />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={400}
                  sx={{
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </OpenLayout>
  )
}

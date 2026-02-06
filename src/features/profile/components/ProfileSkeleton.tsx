import React from "react"
import {
  Box,
  Container,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Tabs,
} from "@mui/material"
import { HapticTab } from "../../../components/haptic"
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
            {/* Header: left = avatar + username/discord (lg=8), right = ratings summary (lg=4) */}
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
                <Grid item xs={12} lg={8}>
                  <Grid
                    container
                    spacing={theme.layoutSpacing.component}
                    alignItems={"end"}
                    justifyContent={"flex-start"}
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
                        sx={{ mb: 0.5 }}
                      />
                      <Skeleton
                        variant="text"
                        width={120}
                        height={20}
                        sx={{ display: "block" }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      height: 120,
                      width: "100%",
                      borderRadius: 1,
                      maxWidth: 320,
                      ml: "auto",
                    }}
                  />
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
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<StorefrontRounded />}
                  />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<DesignServicesRounded />}
                  />
                  <HapticTab label={<Skeleton width={60} />} icon={<InfoRounded />} />
                  <HapticTab
                    label={<Skeleton width={60} />}
                    icon={<CreateRounded />}
                  />
                  <HapticTab label={<Skeleton width={60} />} icon={<StarRounded />} />
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

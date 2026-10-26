import { Box, Container, Grid, Skeleton, Stack, Tabs } from "@mui/material"
import {
  BANNER_HEIGHT,
  BANNER_OVERLAP,
} from "../../features/profile/components/BannerContainers"
import { useTheme } from "@mui/material/styles"
import {
  DesignServicesRounded,
  InfoRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { HapticTab } from "../haptic"
import { a11yProps } from "../tabs/Tabs"
import { ListingSkeleton } from "./ListingSkeleton"

/** Columns of the shop page's listing grid (store tab). */
export const SHOP_LISTING_GRID_BREAKPOINTS = {
  xs: 6,
  sm: 4,
  md: 3,
  lg: 2.4,
} as const

/** The store tab's listing grid while listings load (same cards as loaded). */
export function ShopListingsGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item {...SHOP_LISTING_GRID_BREAKPOINTS} key={i}>
          <ListingSkeleton index={i} />
        </Grid>
      ))}
    </Grid>
  )
}

/** ShopListingsTab: search + sort row above the listing grid. */
export function ShopListingsTabSkeleton() {
  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" height={40} sx={{ minWidth: 140 }} />
      </Stack>
      <ShopListingsGridSkeleton />
    </Box>
  )
}

/**
 * Whole shop page (features/shops/components/ShopProfile) while the shop
 * loads: banner, header block, tab strip and the store tab.
 */
export function ShopProfileSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Box sx={{ position: "relative" }}>
      <Skeleton
        variant="rectangular"
        sx={{
          height: BANNER_HEIGHT[theme.palette.mode],
          width: "100%",
          borderRadius: 0,
        }}
      />
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          top: -BANNER_OVERLAP[theme.palette.mode],
        }}
      >
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12}>
            <Grid
              container
              spacing={theme.layoutSpacing.component}
              alignItems="flex-end"
              justifyContent="space-between"
              minHeight={375}
            >
              <Grid item xs={12} md={8}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                  flexWrap="wrap"
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      height: theme.spacing(12),
                      width: theme.spacing(12),
                      flexShrink: 0,
                      borderRadius: 2,
                    }}
                  />
                  <Stack spacing={0.5}>
                    <Skeleton variant="text" width={200} height={28} />
                    <Skeleton variant="text" width={120} height={20} />
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={28}
                        sx={{ borderRadius: 1 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={28}
                        sx={{ borderRadius: 1 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={28}
                        sx={{ borderRadius: 1 }}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
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
              <Tabs value={0} aria-label="Shop tabs" variant="scrollable">
                <HapticTab
                  label={<Skeleton width={60} />}
                  icon={<StorefrontRounded />}
                  {...a11yProps(0)}
                />
                <HapticTab
                  label={<Skeleton width={60} />}
                  icon={<DesignServicesRounded />}
                  {...a11yProps(1)}
                />
                <HapticTab
                  label={<Skeleton width={60} />}
                  icon={<StarRounded />}
                  {...a11yProps(2)}
                />
                <HapticTab
                  label={<Skeleton width={60} />}
                  icon={<InfoRounded />}
                  {...a11yProps(3)}
                />
              </Tabs>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* The default (store) tab, in its own container like ShopTabContent */}
      <Container
        maxWidth="xl"
        sx={{
          mt: 3,
          position: "relative",
          top: -BANNER_OVERLAP[theme.palette.mode],
        }}
      >
        <ShopListingsTabSkeleton />
      </Container>
    </Box>
  )
}

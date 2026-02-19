import { Box, Container, Grid, Stack } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { HorizontalListingSkeleton } from "./HorizontalListingSkeleton"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { LandingPageLayout } from "../landing/LandingPageLayout"

/**
 * Skeleton for landing page
 * Uses the same LandingPageLayout component as the actual page for consistent structure
 */
export function LandingPageSkeleton() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <LandingPageLayout
      hero={
        <Box sx={{ pb: 8 }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              alignItems="center"
              justifyContent="center"
            >
              {/* Logo and title */}
              <Stack alignItems="center" spacing={2} sx={{ flex: 1 }}>
                <BaseSkeleton variant="circular" width={192} height={192} />
                <BaseSkeleton variant="text" width={300} height={48} />
                <BaseSkeleton variant="text" width={400} height={32} />
              </Stack>

              {/* Login area */}
              <Box sx={{ width: { xs: "100%", md: 480 } }}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    height: 300,
                  }}
                />
              </Box>
            </Stack>
          </Container>
        </Box>
      }
      statistics={
        <Grid container spacing={3} justifyContent="center">
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  height: 120,
                  textAlign: "center",
                }}
              >
                <BaseSkeleton
                  variant="text"
                  width="80%"
                  height={20}
                  sx={{ mx: "auto", mb: 1 }}
                />
                <BaseSkeleton
                  variant="text"
                  width="60%"
                  height={40}
                  sx={{ mx: "auto" }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      }
      recentListings={
        <Box sx={{ display: "flex", gap: 2, pb: 2 }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ minWidth: 280 }}>
              <HorizontalListingSkeleton />
            </Box>
          ))}
        </Box>
      }
      features={
        <Grid container spacing={4} justifyContent="center">
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Stack spacing={2} alignItems="center">
                <BaseSkeleton
                  variant="rectangular"
                  width="100%"
                  height={200}
                  sx={{ borderRadius: 2 }}
                />
                <BaseSkeleton variant="text" width="80%" height={28} />
                <BaseSkeleton variant="text" width="100%" height={20} />
                <BaseSkeleton variant="text" width="90%" height={20} />
              </Stack>
            </Grid>
          ))}
        </Grid>
      }
      orgFeatures={
        <Box sx={{ width: "100%", mt: 4 }}>
          <BaseSkeleton variant="text" width={250} height={32} sx={{ mb: 3 }} />
          <Grid container spacing={3} justifyContent="center">
            {[...Array(3)].map((_, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Stack spacing={2} alignItems="center">
                  <BaseSkeleton
                    variant="rectangular"
                    width="100%"
                    height={200}
                    sx={{ borderRadius: 2 }}
                  />
                  <BaseSkeleton variant="text" width="80%" height={28} />
                  <BaseSkeleton variant="text" width="100%" height={20} />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      }
      supporters={
        <Box sx={{ width: "100%", mt: 6 }}>
          <BaseSkeleton
            variant="text"
            width={200}
            height={32}
            sx={{ mx: "auto", mb: 3 }}
          />
          <Grid container spacing={3} justifyContent="center">
            {[...Array(3)].map((_, i) => (
              <Grid item key={i}>
                <BaseSkeleton
                  variant="rectangular"
                  width={120}
                  height={120}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      }
      faq={
        <Box sx={{ width: "100%", mt: 6 }}>
          <BaseSkeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
          {[...Array(5)].map((_, i) => (
            <Box
              key={i}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                height: 60,
                mb: 2,
              }}
            />
          ))}
        </Box>
      }
      footer={
        <Box sx={{ mt: 4, height: 200 }}>
          <BaseSkeleton variant="rectangular" width="100%" height="100%" />
        </Box>
      }
    />
  )
}


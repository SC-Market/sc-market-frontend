import { Grid, Box, Container } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"

/**
 * Skeleton for fleet page
 * Matches Fleet layout: ships grid + active deliveries
 */
export function FleetSkeleton() {
  return (
    <Container maxWidth="xxl" sx={{ py: 3 }}>
      <BaseSkeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />

      <Grid container spacing={4}>
        {/* Ships section */}
        <Grid item xs={12} xl={5}>
          <BaseSkeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    height: 200,
                  }}
                >
                  <BaseSkeleton
                    variant="rectangular"
                    width="100%"
                    height={100}
                    sx={{ mb: 1, borderRadius: 1 }}
                  />
                  <BaseSkeleton variant="text" width="80%" height={20} />
                  <BaseSkeleton variant="text" width="60%" height={16} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Active deliveries section */}
        <Grid item xs={12} xl={7}>
          <BaseSkeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                mb: 2,
                height: 120,
              }}
            >
              <BaseSkeleton variant="text" width="70%" height={24} />
              <BaseSkeleton
                variant="text"
                width="50%"
                height={20}
                sx={{ mt: 1 }}
              />
              <BaseSkeleton
                variant="text"
                width="40%"
                height={20}
                sx={{ mt: 1 }}
              />
            </Box>
          ))}
        </Grid>
      </Grid>
    </Container>
  )
}

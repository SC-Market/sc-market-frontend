import { Grid, Box, Container } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ServiceListingSkeleton } from "./ServiceListingSkeleton"

/**
 * Skeleton for my services page
 * Matches MyServicesPage layout: header with create button, active/inactive service sections
 */
export function ServicesListSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header with create button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <BaseSkeleton variant="text" width={200} height={40} />
        <BaseSkeleton
          variant="rectangular"
          width={160}
          height={40}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="rectangular" width="100%" height={1} />
      </Box>

      {/* Active services section */}
      <Box sx={{ mb: 4 }}>
        <BaseSkeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} key={i}>
              <ServiceListingSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Inactive services section */}
      <Box>
        <BaseSkeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[...Array(2)].map((_, i) => (
            <Grid item xs={12} key={i}>
              <ServiceListingSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}

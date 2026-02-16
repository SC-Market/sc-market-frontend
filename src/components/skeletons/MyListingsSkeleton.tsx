import { Grid, Box, Container } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ListingSkeleton } from "./ListingSkeleton"

/**
 * Skeleton for my market listings page
 * Matches MyMarketListings layout: header with actions, nav tabs, listings grid
 */
export function MyListingsSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        <BaseSkeleton variant="text" width={250} height={20} />
      </Box>

      {/* Header with actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <BaseSkeleton variant="text" width={250} height={40} />
        <Box sx={{ display: "flex", gap: 2 }}>
          <BaseSkeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
          <BaseSkeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>

      {/* Nav tabs */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", gap: 3, borderBottom: 1, borderColor: "divider", pb: 1 }}>
          <BaseSkeleton variant="rectangular" width={100} height={40} />
          <BaseSkeleton variant="rectangular" width={100} height={40} />
          <BaseSkeleton variant="rectangular" width={100} height={40} />
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <BaseSkeleton variant="rectangular" width="100%" height={1} />
      </Box>

      {/* Listings grid */}
      <Grid container spacing={2}>
        {[...Array(8)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <ListingSkeleton />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

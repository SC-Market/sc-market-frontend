import { Grid, Box, Container } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ContractorSkeleton } from "./ContractorSkeleton"

/**
 * Skeleton for contractors list page
 * Matches Contractors layout: grid of contractor cards with pagination
 */
export function ContractorsListSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with filter button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <BaseSkeleton variant="text" width={200} height={40} />
        <BaseSkeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Contractor cards grid */}
      <Grid container spacing={3}>
        {[...Array(10)].map((_, i) => (
          <Grid item xs={12} key={i}>
            <ContractorSkeleton />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <BaseSkeleton variant="rectangular" width={400} height={52} sx={{ borderRadius: 1 }} />
      </Box>
    </Container>
  )
}

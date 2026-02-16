import { Grid, Box, Container } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { RecruitingPostSkeleton } from "./RecruitingPostSkeleton"

/**
 * Skeleton for recruiting list page
 * Matches Recruiting layout: list of recruiting post cards with pagination
 */
export function RecruitingListSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with create button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <BaseSkeleton variant="text" width={200} height={40} />
        <BaseSkeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Recruiting post cards */}
      <Grid container spacing={3}>
        {[...Array(8)].map((_, i) => (
          <Grid item xs={12} key={i}>
            <RecruitingPostSkeleton />
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

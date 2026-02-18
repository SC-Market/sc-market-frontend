import { Grid, Box, Container, Tabs } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"

/**
 * Skeleton for contracts list page
 * Matches Contracts layout: tabs + contract cards with filters
 */
export function ContractsListSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          <BaseSkeleton variant="rectangular" width={120} height={48} />
          <BaseSkeleton variant="rectangular" width={120} height={48} />
          <BaseSkeleton variant="rectangular" width={120} height={48} />
        </Box>
      </Box>

      {/* Filter button */}
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton
          variant="rectangular"
          width={140}
          height={40}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      {/* Contract cards */}
      <Grid container spacing={2}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} key={i}>
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                height: 140,
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <BaseSkeleton variant="text" width="60%" height={24} />
                <BaseSkeleton
                  variant="rectangular"
                  width={80}
                  height={32}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              <BaseSkeleton variant="text" width="40%" height={20} />
              <BaseSkeleton
                variant="text"
                width="30%"
                height={20}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <BaseSkeleton
          variant="rectangular"
          width={400}
          height={52}
          sx={{ borderRadius: 1 }}
        />
      </Box>
    </Container>
  )
}

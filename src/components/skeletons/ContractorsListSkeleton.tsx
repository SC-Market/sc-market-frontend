import { Box, Container, Grid, Skeleton, Stack, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ContractorSkeleton } from "./ContractorSkeleton"

/**
 * Skeleton for contractors list page.
 * Matches SidebarPageLayout structure: sidebar + content area.
 */
export function ContractorsListSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Container maxWidth="xxl" sx={{ py: 3 }}>
      {/* Page title */}
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {isMobile ? (
          /* Mobile: stacked layout */
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              {[...Array(6)].map((_, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <ContractorSkeleton />
                </Box>
              ))}
            </Grid>
          </Grid>
        ) : (
          /* Desktop: sidebar + content */
          <Stack
            direction="row"
            justifyContent="center"
            spacing={theme.layoutSpacing.layout}
            sx={{ width: "100%", maxWidth: "xxl" }}
          >
            {/* Sidebar skeleton */}
            <Box sx={{ width: 280, flexShrink: 0 }}>
              <Skeleton variant="text" width={140} height={32} sx={{ mb: 2 }} />
              {/* Search field */}
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, mb: 2 }} />
              {/* Filter sections */}
              <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1, mb: 1 }} />
              ))}
              <Skeleton variant="text" width={80} height={24} sx={{ mt: 2, mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Content area */}
            <Box sx={{ flex: 1, maxWidth: "md" }}>
              <Grid container spacing={2}>
                {[...Array(6)].map((_, i) => (
                  <Grid item xs={12} key={i}>
                    <ContractorSkeleton />
                  </Grid>
                ))}
              </Grid>
              {/* Pagination skeleton */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Skeleton variant="rectangular" width={350} height={48} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </Stack>
        )}
      </Box>
    </Container>
  )
}

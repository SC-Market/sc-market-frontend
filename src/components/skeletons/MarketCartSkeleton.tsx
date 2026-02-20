import { Grid, Box, Container } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"

/**
 * Skeleton for market cart page
 * Matches MarketCart layout: cart items list + checkout sidebar
 */
export function MarketCartSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <BaseSkeleton variant="text" width={200} height={40} />
      </Box>

      <Grid container spacing={3}>
        {/* Cart items - Left side */}
        <Grid item xs={12} md={8}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Item image */}
                <Grid item>
                  <BaseSkeleton
                    variant="rectangular"
                    width={128}
                    height={128}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>

                {/* Item details */}
                <Grid item xs>
                  <BaseSkeleton variant="text" width="70%" height={24} />
                  <BaseSkeleton
                    variant="text"
                    width="40%"
                    height={20}
                    sx={{ mt: 1 }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mt: 2,
                      alignItems: "center",
                    }}
                  >
                    <BaseSkeleton
                      variant="rectangular"
                      width={120}
                      height={40}
                      sx={{ borderRadius: 1 }}
                    />
                    <BaseSkeleton variant="text" width={80} height={24} />
                  </Box>
                </Grid>

                {/* Remove button */}
                <Grid item>
                  <BaseSkeleton variant="circular" width={40} height={40} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, mb: 2 }}>
                <BaseSkeleton variant="rectangular" width="100%" height={1} />
              </Box>
            </Box>
          ))}
        </Grid>

        {/* Checkout sidebar - Right side */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              height: 300,
            }}
          >
            <BaseSkeleton
              variant="text"
              width="60%"
              height={28}
              sx={{ mb: 2 }}
            />
            <BaseSkeleton
              variant="text"
              width="100%"
              height={20}
              sx={{ mb: 1 }}
            />
            <BaseSkeleton
              variant="text"
              width="100%"
              height={20}
              sx={{ mb: 1 }}
            />
            <BaseSkeleton
              variant="text"
              width="100%"
              height={20}
              sx={{ mb: 3 }}
            />
            <BaseSkeleton
              variant="rectangular"
              width="100%"
              height={48}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

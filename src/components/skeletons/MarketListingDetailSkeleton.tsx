import { Grid, Box, Container } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { CardSkeleton } from "./CardSkeleton"

/**
 * Skeleton for market listing detail page
 * Matches ViewMarketListing layout: image gallery + info sidebar + description
 */
export function MarketListingDetailSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        <BaseSkeleton variant="text" width={200} height={20} />
      </Box>

      {/* Header with title and cart button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <BaseSkeleton variant="text" width="50%" height={40} />
        <BaseSkeleton
          variant="rectangular"
          width={140}
          height={40}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Image Gallery - Left side */}
        <Grid item xs={12} md={6}>
          <BaseSkeleton
            variant="rectangular"
            width="100%"
            height={400}
            sx={{ borderRadius: 2 }}
          />
          {/* Thumbnail strip */}
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            {[...Array(4)].map((_, i) => (
              <BaseSkeleton
                key={i}
                variant="rectangular"
                width={80}
                height={80}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        </Grid>

        {/* Product Info - Right side */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Price */}
            <BaseSkeleton variant="text" width="40%" height={48} />

            {/* Quantity available */}
            <BaseSkeleton variant="text" width="30%" height={24} />

            {/* Seller info card */}
            <CardSkeleton height={120} />

            {/* Action buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <BaseSkeleton
                variant="rectangular"
                width="60%"
                height={48}
                sx={{ borderRadius: 1 }}
              />
              <BaseSkeleton
                variant="rectangular"
                width="38%"
                height={48}
                sx={{ borderRadius: 1 }}
              />
            </Box>

            {/* Additional info */}
            <Box sx={{ mt: 2 }}>
              <BaseSkeleton variant="text" width="100%" height={20} />
              <BaseSkeleton variant="text" width="80%" height={20} />
            </Box>
          </Box>
        </Grid>

        {/* Description - Full width below */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <BaseSkeleton
              variant="text"
              width={150}
              height={28}
              sx={{ mb: 2 }}
            />
            <BaseSkeleton variant="text" width="100%" height={20} />
            <BaseSkeleton variant="text" width="95%" height={20} />
            <BaseSkeleton variant="text" width="90%" height={20} />
            <BaseSkeleton variant="text" width="85%" height={20} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

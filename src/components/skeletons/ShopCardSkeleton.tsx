import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Grid,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import {
  SHOP_DIRECTORY_PAGE_SIZE,
  SHOP_GRID_BREAKPOINTS,
  SHOP_TAGS,
} from "../../features/shops/shopDirectoryConfig"

/**
 * One shop card (features/shops/components/ShopCard) as a placeholder: logo +
 * name/owner, rating, stats line and the two-line description, with the same
 * paddings and gaps, so it is as tall as a typical card.
 */
export function ShopCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <Fade in timeout={400} style={{ transitionDelay: `${50 + 30 * index}ms` }}>
      <Card sx={{ height: "100%" }}>
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BaseSkeleton
              variant="rounded"
              width={48}
              height={48}
              sx={{ flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <BaseSkeleton variant="text" width="70%" height={28} />
              <BaseSkeleton variant="text" width="45%" height={20} />
            </Box>
          </Box>
          <BaseSkeleton variant="text" width={110} height={18} />
          <BaseSkeleton variant="text" width="60%" height={20} />
          <Box>
            <BaseSkeleton variant="text" width="100%" height={20} />
            <BaseSkeleton variant="text" width="75%" height={20} />
          </Box>
        </CardContent>
      </Card>
    </Fade>
  )
}

/** The shop directory's card grid while a page of shops loads. */
export function ShopCardGridSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: SHOP_DIRECTORY_PAGE_SIZE }).map((_, i) => (
        <Grid item {...SHOP_GRID_BREAKPOINTS} key={i}>
          <ShopCardSkeleton index={i} />
        </Grid>
      ))}
    </Grid>
  )
}

/**
 * Route skeleton for /shops, mirroring ShopDirectory: title, search + sort
 * row, the tag chips (the real labels; they are static) and the card grid.
 */
export function ShopDirectorySkeleton() {
  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
      <BaseSkeleton variant="text" width={240} height={42} sx={{ mb: 3 }} />
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <BaseSkeleton
          variant="rounded"
          height={56}
          sx={{ flexGrow: 1, minWidth: 240 }}
        />
        <BaseSkeleton variant="rounded" width={180} height={56} />
      </Box>
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {SHOP_TAGS.map((tag) => (
          <Chip key={tag} label={tag} variant="outlined" color="primary" />
        ))}
      </Box>
      <ShopCardGridSkeleton />
    </Container>
  )
}

/** Grid cell of the shop cards on a user's / org's store tab (ProfileStoreView). */
export const OWNER_SHOP_GRID_BREAKPOINTS = { xs: 12, sm: 6, md: 4 } as const

/** A user's / org's store tab while their shops load. */
export function ShopListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item {...OWNER_SHOP_GRID_BREAKPOINTS} key={i}>
          <ShopCardSkeleton index={i} />
        </Grid>
      ))}
    </Grid>
  )
}

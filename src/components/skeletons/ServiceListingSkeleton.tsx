import {
  Grid,
  Card,
  CardActionArea,
  CardHeader,
  CardContent,
  Box,
  Stack,
  Avatar,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

/**
 * Services per page in ServiceListings (its first page), and so the number of
 * card skeletons every services loading state shows: route skeleton, chunk
 * fallbacks and the list's own loading state all match.
 */
export const SERVICE_LISTINGS_PAGE_SIZE = 20

export interface ServiceListingSkeletonProps {
  /** Kept for callers; cards no longer fade in one after the other. */
  index?: number
}

/**
 * Skeleton component for service listing cards
 * Matches the exact structure of actual service cards
 *
 * No fade-in: a page passes through several loading boundaries (route
 * skeleton, chunk fallbacks, the list loading its data), and each one mounts
 * its own copy of these cards. With a fade, every swap blanked the cards and
 * faded them back in, so one load looked like several skeletons in a row.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `index` is accepted, not used
export function ServiceListingSkeleton(_props: ServiceListingSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={6}>
      <CardActionArea
        sx={{
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
        }}
      >
        <Card
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          <CardHeader
            disableTypography
            sx={{
              overflow: "hidden",
              paddingBottom: 1,
              "& .MuiCardHeader-content": {
                overflow: "hidden",
              },
            }}
            title={
              <Box display="flex" alignItems="center">
                {/* Optional "NEW" chip */}
                <BaseSkeleton
                  variant="rectangular"
                  width={50}
                  height={24}
                  sx={{
                    marginRight: 1,
                    borderRadius: 1,
                  }}
                />
                {/* Service name */}
                <BaseSkeleton variant="text" width={200} height={28} />
              </Box>
            }
            subheader={
              <Box>
                {/* ListingNameAndRating - user/contractor name and rating */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <BaseSkeleton variant="text" width={100} height={20} />
                  <BaseSkeleton variant="circular" width={16} height={16} />
                  <BaseSkeleton variant="text" width={40} height={18} />
                </Stack>
                {/* Price with payment type */}
                <BaseSkeleton variant="text" width={150} height={20} />
              </Box>
            }
          />
          <CardContent sx={{ padding: 2, paddingTop: 0 }}>
            <Stack
              spacing={theme.layoutSpacing.text}
              direction="row"
              justifyContent="space-between"
            >
              {/* Description text (6 lines) */}
              <Box sx={{ flex: 1 }}>
                <BaseSkeleton variant="text" width="100%" height={18} />
                <BaseSkeleton variant="text" width="95%" height={18} />
                <BaseSkeleton variant="text" width="90%" height={18} />
                <BaseSkeleton variant="text" width="85%" height={18} />
                <BaseSkeleton variant="text" width="92%" height={18} />
                <BaseSkeleton variant="text" width="88%" height={18} />
              </Box>
              {/* Service photo (Avatar) */}
              <Avatar
                variant="rounded"
                sx={{
                  height: 128 + 32,
                  width: 128 + 32,
                  bgcolor: "action.disabledBackground",
                }}
              >
                <BaseSkeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{ borderRadius: 1 }}
                />
              </Avatar>
            </Stack>
          </CardContent>
          {/* Bottom chips section */}
          <Box sx={{ padding: 2, paddingTop: 0 }}>
            <Stack
              direction="row"
              spacing={theme.layoutSpacing.compact}
              flexWrap="wrap"
            >
              {/* Service kind chip (primary, outlined). The rush and
                    language chips are optional; most cards show just this
                    one row, so the placeholder does too. */}
              <BaseSkeleton
                variant="rectangular"
                width={120}
                height={32}
                sx={{ borderRadius: 4, marginBottom: 1 }}
              />
            </Stack>
          </Box>
        </Card>
      </CardActionArea>
    </Grid>
  )
}

import { Box, Stack, Divider } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"

export interface DetailSkeletonProps {
  showImage?: boolean
  showActions?: boolean
  sections?: number
}

/**
 * Skeleton component for detail page loading states
 * Matches the layout of detail pages with image, title, description, etc.
 */
export function DetailSkeleton({
  showImage = true,
  showActions = true,
  sections = 2,
}: DetailSkeletonProps) {
  return (
    <Stack spacing={3}>
      {/* Image section */}
      {showImage && (
        <BaseSkeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
      )}

      {/* Title and actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <BaseSkeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
          <BaseSkeleton variant="text" width="40%" height={24} />
        </Box>
        {showActions && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <BaseSkeleton variant="rectangular" width={100} height={36} />
            <BaseSkeleton variant="rectangular" width={100} height={36} />
          </Box>
        )}
      </Box>

      <Divider />

      {/* Description section */}
      <Stack spacing={1}>
        <BaseSkeleton variant="text" width="100%" height={20} />
        <BaseSkeleton variant="text" width="100%" height={20} />
        <BaseSkeleton variant="text" width="80%" height={20} />
      </Stack>

      {/* Additional sections */}
      {Array.from({ length: sections }).map((_, i) => (
        <Box key={i}>
          <Divider sx={{ my: 2 }} />
          <BaseSkeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <BaseSkeleton variant="text" width="100%" height={20} />
            <BaseSkeleton variant="text" width="90%" height={20} />
            <BaseSkeleton variant="text" width="95%" height={20} />
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

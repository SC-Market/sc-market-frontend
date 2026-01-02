import { Stack, Box } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"

export interface FormSkeletonProps {
  fields?: number
  showSubmit?: boolean
}

/**
 * Skeleton component for form loading states
 * Matches the layout of form fields
 */
export function FormSkeleton({ fields = 4, showSubmit = true }: FormSkeletonProps) {
  return (
    <Stack spacing={3}>
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i}>
          <BaseSkeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
          <BaseSkeleton variant="rectangular" width="100%" height={56} />
        </Box>
      ))}
      {showSubmit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
          <BaseSkeleton variant="rectangular" width={100} height={36} />
          <BaseSkeleton variant="rectangular" width={100} height={36} />
        </Box>
      )}
    </Stack>
  )
}

import { Card, CardContent, CardHeader, Box, Stack } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"

export interface CardSkeletonProps {
  showHeader?: boolean
  showActions?: boolean
  lines?: number
  height?: number
}

/**
 * Skeleton component for card-based layouts
 * Matches the layout of Material-UI Card components
 */
export function CardSkeleton({
  showHeader = true,
  showActions = false,
  lines = 3,
  height,
}: CardSkeletonProps) {
  return (
    <Card sx={height ? { height } : undefined}>
      {showHeader && (
        <CardHeader
          avatar={<BaseSkeleton variant="circular" width={40} height={40} />}
          title={<BaseSkeleton variant="text" width="60%" height={24} />}
          subheader={<BaseSkeleton variant="text" width="40%" height={20} />}
          action={
            showActions ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <BaseSkeleton variant="circular" width={32} height={32} />
                <BaseSkeleton variant="circular" width={32} height={32} />
              </Box>
            ) : undefined
          }
        />
      )}
      <CardContent>
        <Stack spacing={1}>
          {Array.from({ length: lines }).map((_, i) => (
            <BaseSkeleton
              key={i}
              variant="text"
              width={i === lines - 1 ? "80%" : "100%"}
              height={20}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

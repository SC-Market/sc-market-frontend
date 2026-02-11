import { Box, Paper, Stack } from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"

export interface DataGridSkeletonProps {
  /**
   * Number of rows to show in skeleton
   */
  rows?: number
  /**
   * Number of columns to show in skeleton
   */
  columns?: number
  /**
   * Height of each row in pixels
   */
  rowHeight?: number
  /**
   * Whether to show the header row
   */
  showHeader?: boolean
}

/**
 * Skeleton component for data grids and tables
 * Prevents layout shift while data loads
 */
export function DataGridSkeleton({
  rows = 5,
  columns = 4,
  rowHeight = 52,
  showHeader = true,
}: DataGridSkeletonProps) {
  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      {showHeader && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            minHeight: rowHeight,
            alignItems: "center",
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Box
              key={`header-${colIndex}`}
              sx={{
                flex: colIndex === 0 ? 2 : 1,
              }}
            >
              <BaseSkeleton
                variant="text"
                width={colIndex === 0 ? "80%" : "60%"}
                height={20}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Data rows */}
      <Stack>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box
            key={`row-${rowIndex}`}
            sx={{
              display: "flex",
              gap: 2,
              p: 2,
              borderBottom: rowIndex < rows - 1 ? 1 : 0,
              borderColor: "divider",
              minHeight: rowHeight,
              alignItems: "center",
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Box
                key={`cell-${rowIndex}-${colIndex}`}
                sx={{
                  flex: colIndex === 0 ? 2 : 1,
                }}
              >
                <BaseSkeleton
                  variant="text"
                  width={`${60 + Math.random() * 30}%`}
                  height={16}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}

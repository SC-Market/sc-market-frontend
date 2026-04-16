import { Box, BoxProps } from "@mui/material"
import { ReactNode } from "react"

export interface ReservedSpaceProps extends Omit<BoxProps, "children"> {
  /**
   * Minimum height to reserve (in pixels or CSS units)
   */
  minHeight: number | string
  /**
   * Width to reserve (in pixels or CSS units)
   */
  width?: number | string
  /**
   * Content to render inside the reserved space
   */
  children?: ReactNode
  /**
   * Whether to show a loading skeleton while content loads
   */
  showSkeleton?: boolean
}

/**
 * Container that reserves space for dynamic content to prevent layout shifts
 * Useful for async content, ads, or dynamically sized elements
 */
export function ReservedSpace({
  minHeight,
  width,
  children,
  showSkeleton = false,
  sx,
  ...props
}: ReservedSpaceProps) {
  return (
    <Box
      sx={{
        minHeight,
        width: width || "100%",
        position: "relative",
        ...(showSkeleton && {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.11)"
              : "rgba(0, 0, 0, 0.11)",
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": {
              opacity: 1,
            },
            "50%": {
              opacity: 0.5,
            },
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

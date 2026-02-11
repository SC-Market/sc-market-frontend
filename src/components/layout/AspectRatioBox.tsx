import { Box, BoxProps } from "@mui/material"
import { ReactNode } from "react"

export interface AspectRatioBoxProps extends Omit<BoxProps, "children"> {
  /**
   * Aspect ratio as width/height (e.g., 16/9, 4/3, 1)
   */
  ratio: number
  /**
   * Content to render inside the aspect ratio container
   */
  children?: ReactNode
}

/**
 * Container that maintains a specific aspect ratio to prevent layout shifts
 * Uses CSS aspect-ratio property with fallback for older browsers
 */
export function AspectRatioBox({
  ratio,
  children,
  sx,
  ...props
}: AspectRatioBoxProps) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        // Fallback for browsers without aspect-ratio support
        "&::before": {
          content: '""',
          display: "block",
          paddingTop: `${(1 / ratio) * 100}%`,
        },
        "& > *": {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

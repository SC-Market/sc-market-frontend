import { Skeleton, SkeletonProps } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

export interface BaseSkeletonProps extends Omit<SkeletonProps, "variant"> {
  variant?: "text" | "rectangular" | "circular"
  width?: number | string
  height?: number | string
  animation?: "pulse" | "wave" | false
}

/**
 * Base skeleton component with consistent styling and theme support
 */
export function BaseSkeleton({
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
  sx,
  ...props
}: BaseSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      sx={{
        bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.11)" : "rgba(0, 0, 0, 0.11)",
        ...sx,
      }}
      {...props}
    />
  )
}

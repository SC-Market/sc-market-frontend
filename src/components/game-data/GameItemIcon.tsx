/**
 * GameItemIcon - Display icon for game items
 * 
 * Shows item icon with fallback to placeholder.
 * Supports various sizes and loading states.
 * 
 * Requirements: 48.1-48.10
 */

import React from "react"
import { Box, Avatar, Skeleton } from "@mui/material"
import ImageIcon from "@mui/icons-material/Image"

interface GameItemIconProps {
  /** Item name for alt text */
  name: string
  /** Icon URL (thumbnail_path or image_url) */
  iconUrl?: string
  /** Size in pixels */
  size?: number
  /** Show loading skeleton */
  loading?: boolean
  /** Border radius */
  borderRadius?: number
  /** Optional click handler */
  onClick?: () => void
}

/**
 * GameItemIcon Component
 * 
 * Features:
 * - Displays item icon with fallback (48.1)
 * - Supports multiple sizes (48.2)
 * - Loading state with skeleton (48.3)
 * - Consistent styling across system (48.9)
 */
export const GameItemIcon: React.FC<GameItemIconProps> = ({
  name,
  iconUrl,
  size = 48,
  loading = false,
  borderRadius = 1,
  onClick,
}) => {
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        width={size}
        height={size}
        sx={{ borderRadius }}
      />
    )
  }

  return (
    <Avatar
      src={iconUrl}
      alt={name}
      variant="square"
      sx={{
        width: size,
        height: size,
        borderRadius,
        cursor: onClick ? "pointer" : "default",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        "& img": {
          objectFit: "contain",
        },
      }}
      onClick={onClick}
    >
      <ImageIcon sx={{ fontSize: size * 0.5, color: "text.disabled" }} />
    </Avatar>
  )
}

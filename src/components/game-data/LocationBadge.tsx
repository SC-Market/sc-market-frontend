/**
 * LocationBadge - Display location badge
 * 
 * Shows star system, planet, or location with icon.
 * Used for mission locations and resource locations.
 * 
 * Requirements: 48.1-48.10
 */

import React from "react"
import { Chip, Tooltip } from "@mui/material"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import PublicIcon from "@mui/icons-material/Public"
import PlaceIcon from "@mui/icons-material/Place"

interface LocationBadgeProps {
  /** Location name */
  location: string
  /** Location type for icon selection */
  type?: "system" | "planet" | "location"
  /** Size variant */
  size?: "small" | "medium"
  /** Optional full location path for tooltip */
  fullPath?: string
}

/**
 * LocationBadge Component
 * 
 * Features:
 * - Displays location with appropriate icon (48.1, 48.4)
 * - Tooltip with full path if provided (48.10)
 * - Consistent styling (48.9)
 */
export const LocationBadge: React.FC<LocationBadgeProps> = ({
  location,
  type = "location",
  size = "small",
  fullPath,
}) => {
  // Get icon based on type
  const getIcon = () => {
    const iconSize = size === "small" ? 14 : 16
    
    switch (type) {
      case "system":
        return <PublicIcon sx={{ fontSize: iconSize }} />
      case "planet":
        return <LocationOnIcon sx={{ fontSize: iconSize }} />
      case "location":
      default:
        return <PlaceIcon sx={{ fontSize: iconSize }} />
    }
  }

  const badge = (
    <Chip
      icon={getIcon()}
      label={location}
      size={size}
      variant="outlined"
      sx={{
        fontSize: size === "small" ? "0.7rem" : "0.8rem",
        height: size === "small" ? 20 : 24,
      }}
    />
  )

  if (fullPath) {
    return <Tooltip title={fullPath}>{badge}</Tooltip>
  }

  return badge
}

/**
 * GameItemAvatar — reusable avatar for game items that handles:
 * - Photo/image URLs: objectFit cover, fills the avatar
 * - SVG icons (game-icons/): objectFit contain with padding
 * - Text fallback: initials at default text size
 */

import React from "react"
import { Avatar, AvatarProps } from "@mui/material"
import { getResourceCategoryIcon, getCommodityColor } from "../../util/gameIcons"

function initials(name: string | undefined): string {
  if (!name) return "?"
  return name.split(/[\s_-]+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

function isSvgIcon(url: string | undefined): boolean {
  if (!url) return false
  return url.includes("/game-icons/") || url.endsWith(".svg")
}

interface GameItemAvatarProps extends Omit<AvatarProps, "src" | "children"> {
  /** Item name (for initials fallback) */
  name?: string
  /** Direct image/icon URL */
  iconUrl?: string
  /** Item sub_type for resource category icon fallback */
  subType?: string
  /** Item type for resource category icon fallback */
  itemType?: string
  /** Size in px (default 28) */
  size?: number
  /** Use commodity color for background */
  useCommodityColor?: boolean
}

export function GameItemAvatar({
  name,
  iconUrl,
  subType,
  itemType,
  size = 28,
  useCommodityColor = true,
  sx,
  ...rest
}: GameItemAvatarProps) {
  // Resolve icon: direct URL → sub_type category icon → type category icon → null
  const resolvedIcon = iconUrl || getResourceCategoryIcon(subType) || getResourceCategoryIcon(itemType) || undefined
  const isSvg = isSvgIcon(resolvedIcon)
  const bgColor = useCommodityColor ? (getCommodityColor(subType) || getCommodityColor(itemType) || undefined) : undefined

  return (
    <Avatar
      src={resolvedIcon}
      variant="rounded"
      sx={{
        width: size,
        height: size,
        bgcolor: bgColor || "secondary.main",
        // SVG icons get padding, photos fill the avatar
        ...(resolvedIcon && isSvg ? { p: size * 0.15 / 8 } : {}),
        ...sx,
      }}
      imgProps={{
        style: {
          objectFit: isSvg ? "contain" : "cover",
        },
      }}
      {...rest}
    >
      {initials(name)}
    </Avatar>
  )
}

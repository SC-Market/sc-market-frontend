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
  const words = name.split(/[\s_-]+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  // Single word: first two chars
  return name.slice(0, 2).toUpperCase()
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
  const resolvedIcon = iconUrl || getResourceCategoryIcon(subType) || getResourceCategoryIcon(itemType) || undefined
  const isSvg = isSvgIcon(resolvedIcon)
  const bgColor = useCommodityColor ? (getCommodityColor(subType) || getCommodityColor(itemType) || undefined) : undefined

  // Scale font size relative to avatar size — smaller for text fallback
  const fontSize = size <= 16 ? "0.4rem" : size <= 24 ? "0.5rem" : size <= 32 ? "0.6rem" : "0.7rem"

  return (
    <Avatar
      src={resolvedIcon}
      variant="rounded"
      sx={{
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        color: "#fff !important", // Force white text on colored bg
        bgcolor: bgColor || "secondary.main",
        ...(resolvedIcon && isSvg ? { p: Math.max(2, size * 0.12) + "px" } : {}),
        flexShrink: 0,
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

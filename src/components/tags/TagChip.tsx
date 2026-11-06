/**
 * TagChip: a Chip coloured by its tag type (see ./tagColors). Soft tint,
 * coloured text and a 1px border for palette hues; the quality scale for
 * rarity; the neutral outlined chip for manufacturer.
 *
 * Any Chip prop passes through (link props, onClick, icon, size), and so
 * does the ref, so it works under a Tooltip. `sx` is merged after the tag
 * colour, for layout only (height, font size, width).
 */

import React from "react"
import { Chip, type ChipProps } from "@mui/material"
import type { SxProps, Theme } from "@mui/material"
import { isNeutralTag, tagSx, type TagType } from "./tagColors"

export type TagChipProps = Omit<ChipProps, "color" | "variant"> & {
  tag: TagType
  /** For `tag="rarity"`: the rarity name (Common..Legendary). */
  rarity?: string
  /** Render as another element (a router link); `to` goes with it. */
  component?: React.ElementType
  to?: string
}

export const TagChip = React.forwardRef<HTMLDivElement, TagChipProps>(
  function TagChip({ tag, rarity, sx, ...rest }, ref) {
    const neutral = isNeutralTag(tag, rarity)
    const merged: SxProps<Theme> = [
      tagSx(tag, rarity),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]
    return (
      <Chip
        data-tag-type={tag}
        size="small"
        variant={neutral ? "outlined" : "filled"}
        {...(rest as ChipProps)}
        ref={ref}
        sx={merged}
      />
    )
  },
)

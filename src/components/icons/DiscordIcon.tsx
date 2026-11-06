import React from "react"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"

/**
 * The Discord mark. MUI icons have no Discord, so this one is borrowed.
 *
 * Source: Tabler Icons `brand-discord` (outline),
 * https://github.com/tabler/tabler-icons/blob/main/icons/outline/brand-discord.svg
 * Licence: MIT, Copyright (c) 2020-2026 Paweł Kuna,
 * https://github.com/tabler/tabler-icons/blob/main/LICENSE
 */
export function DiscordIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
        <path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
        <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-.972 1.923a11.913 11.913 0 0 0 -4.053 0l-.975 -1.923c-1.5 .16 -3.043 .485 -4.5 1.5c-2 5.667 -2.167 9.833 -1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2 -2 2 -3" />
        <path d="M7 16.5c3.5 1 6.5 1 10 0" />
      </g>
    </SvgIcon>
  )
}

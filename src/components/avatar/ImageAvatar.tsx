import React, { forwardRef } from "react"
import { Avatar, type AvatarProps } from "@mui/material"

export type ImageAvatarProps = Omit<AvatarProps, "alt"> & {
  /**
   * Required text alternative. Describe the image, or pass "" when the
   * avatar is decorative (a visible name or title sits right next to it).
   */
  alt: string
}

/**
 * The avatar for anything that isn't a whole user or org block (items,
 * listings, shops, icons, small inline faces). Same look and props as MUI's
 * Avatar, but the alt text can't be forgotten. For a user or an org with
 * its name and profile link, use UserAvatar / ContractorAvatar.
 */
export const ImageAvatar = forwardRef<HTMLDivElement, ImageAvatarProps>(
  function ImageAvatar(props, ref) {
    return <Avatar ref={ref} {...props} />
  },
)

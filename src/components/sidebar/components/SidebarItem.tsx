import React from "react"
import { SidebarDropdown } from "./SidebarDropdown"
import { SidebarLink } from "./SidebarLink"
import { SidebarItemWithStarProps } from "../types"

/**
 * Router component that renders either a dropdown or a link
 */
export function SidebarItem(props: SidebarItemWithStarProps) {
  return (
    <React.Fragment>
      {props.children ? (
        <SidebarDropdown
          {...props}
          starredItems={props.starredItems}
          onToggleStar={props.onToggleStar}
        />
      ) : (
        <SidebarLink
          {...props}
          to={props.to || "a"}
          isStarred={props.isStarred}
          onToggleStar={props.onToggleStar}
        />
      )}
    </React.Fragment>
  )
}

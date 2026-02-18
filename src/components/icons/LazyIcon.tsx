import React, { lazy, Suspense, ComponentType } from "react"
import { SvgIconProps } from "@mui/material/SvgIcon"
import CircularProgress from "@mui/material/CircularProgress"

/**
 * Lazy load Material-UI icons for admin pages to reduce initial bundle size.
 * This wrapper provides a fallback while the icon loads.
 *
 * Usage:
 * const AddIcon = lazyIcon(() => import('@mui/icons-material/AddRounded'))
 * <AddIcon />
 */
export function lazyIcon(
  importFunc: () => Promise<{ default: ComponentType<SvgIconProps> }>,
): ComponentType<SvgIconProps> {
  const LazyIconComponent = lazy(importFunc)

  return function LazyIconWrapper(props: SvgIconProps) {
    return (
      <Suspense
        fallback={
          <CircularProgress
            size={props.fontSize === "small" ? 16 : 24}
            sx={{ display: "inline-block", verticalAlign: "middle" }}
          />
        }
      >
        <LazyIconComponent {...props} />
      </Suspense>
    )
  }
}

/**
 * Pre-configured lazy-loaded admin icons.
 * These are commonly used in admin pages and can be lazy loaded to reduce initial bundle.
 */
export const AdminIcons = {
  Add: lazyIcon(() => import("@mui/icons-material/AddRounded")),
  Edit: lazyIcon(() => import("@mui/icons-material/EditRounded")),
  Delete: lazyIcon(() => import("@mui/icons-material/DeleteRounded")),
  CloudDownload: lazyIcon(
    () => import("@mui/icons-material/CloudDownloadRounded"),
  ),
  CheckCircle: lazyIcon(() => import("@mui/icons-material/CheckCircleRounded")),
  Error: lazyIcon(() => import("@mui/icons-material/ErrorRounded")),
  Warning: lazyIcon(() => import("@mui/icons-material/WarningRounded")),
  ExpandMore: lazyIcon(() => import("@mui/icons-material/ExpandMore")),
  ExpandLess: lazyIcon(() => import("@mui/icons-material/ExpandLess")),
}

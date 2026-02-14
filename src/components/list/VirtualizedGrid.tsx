import React, { useMemo, useRef, useEffect } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Box, useTheme, useMediaQuery } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface VirtualizedGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?:
    | number
    | {
        xs?: number
        sm?: number
        md?: number
        lg?: number
        xl?: number
        xxl?: number
      }
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
  gap?:
    | number
    | {
        xs?: number
        sm?: number
        md?: number
        lg?: number
        xl?: number
        xxl?: number
      }
  overscan?: number
  containerRef?: React.RefObject<HTMLDivElement>
}

/**
 * Virtualized grid component for rendering large lists efficiently
 * Only renders visible items + overscan, dramatically improving performance
 */
export function VirtualizedGrid<T>(props: VirtualizedGridProps<T>) {
  const {
    items,
    renderItem,
    itemHeight = 400,
    columns = { xs: 1, sm: 2, md: 3, lg: 4 },
    gap = 2,
    overscan = 5,
    containerRef: externalRef,
  } = props

  const theme = useTheme<ExtendedTheme>()
  const isXs = useMediaQuery(theme.breakpoints.down("sm"))
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"))
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"))
  const isLg = useMediaQuery(theme.breakpoints.between("lg", "xl"))
  const isXl = useMediaQuery(theme.breakpoints.between("xl", "xxl"))
  const isXxl = useMediaQuery(theme.breakpoints.up("xxl"))
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md")) // < 900px

  // Determine number of columns based on breakpoint
  // On medium devices (<900px), ensure 2 columns to prevent layout issues
  const cols = useMemo(() => {
    if (isXs) return columns.xs || 1
    if (isBelowMd) return columns.sm || 2 // Force 2 columns on <900px
    if (isMd) return columns.md || 3
    if (isLg) return columns.lg || 4
    if (isXl) return columns.xl || 4
    if (isXxl) return columns.xxl || 5
    return columns.xs || 1
  }, [isXs, isSm, isMd, isLg, isXl, isXxl, isBelowMd, columns])

  // Determine gap value based on breakpoint
  const gapValue = useMemo(() => {
    if (typeof gap === "number") return gap
    if (typeof gap === "object") {
      if (isXs)
        return gap.xs ?? gap.sm ?? gap.md ?? gap.lg ?? gap.xl ?? gap.xxl ?? 2
      if (isBelowMd)
        return gap.sm ?? gap.md ?? gap.lg ?? gap.xl ?? gap.xxl ?? gap.xs ?? 2 // Use sm gap for <900px
      if (isMd)
        return gap.md ?? gap.lg ?? gap.xl ?? gap.xxl ?? gap.sm ?? gap.xs ?? 2
      if (isLg)
        return gap.lg ?? gap.xl ?? gap.xxl ?? gap.md ?? gap.sm ?? gap.xs ?? 2
      if (isXl)
        return gap.xl ?? gap.xxl ?? gap.lg ?? gap.md ?? gap.sm ?? gap.xs ?? 2
      if (isXxl)
        return gap.xxl ?? gap.xl ?? gap.lg ?? gap.md ?? gap.sm ?? gap.xs ?? 2
      return gap.xs ?? 2
    }
    return 2 // Default
  }, [isXs, isSm, isMd, isLg, isXl, isXxl, isBelowMd, gap])

  // Determine item height based on breakpoint
  const heightValue = useMemo(() => {
    if (typeof itemHeight === "number") return itemHeight
    if (typeof itemHeight === "object") {
      if (isXs)
        return (
          itemHeight.xs ??
          itemHeight.sm ??
          itemHeight.md ??
          itemHeight.lg ??
          itemHeight.xl ??
          itemHeight.xxl ??
          400
        )
      if (isBelowMd)
        return (
          itemHeight.sm ??
          itemHeight.md ??
          itemHeight.lg ??
          itemHeight.xl ??
          itemHeight.xxl ??
          itemHeight.xs ??
          400
        )
      if (isMd)
        return (
          itemHeight.md ??
          itemHeight.lg ??
          itemHeight.xl ??
          itemHeight.xxl ??
          itemHeight.sm ??
          itemHeight.xs ??
          400
        )
      if (isLg)
        return (
          itemHeight.lg ??
          itemHeight.xl ??
          itemHeight.xxl ??
          itemHeight.md ??
          itemHeight.sm ??
          itemHeight.xs ??
          400
        )
      if (isXl)
        return (
          itemHeight.xl ??
          itemHeight.xxl ??
          itemHeight.lg ??
          itemHeight.md ??
          itemHeight.sm ??
          itemHeight.xs ??
          400
        )
      if (isXxl)
        return (
          itemHeight.xxl ??
          itemHeight.xl ??
          itemHeight.lg ??
          itemHeight.md ??
          itemHeight.sm ??
          itemHeight.xs ??
          400
        )
      return itemHeight.xs ?? 400
    }
    return 400 // Default
  }, [isXs, isSm, isMd, isLg, isXl, isXxl, isBelowMd, itemHeight])

  // Calculate number of rows
  const rowCount = Math.ceil(items.length / cols)

  // Internal ref if external one not provided
  const internalRef = useRef<HTMLDivElement>(null)
  const parentRef = externalRef || internalRef

  // On mobile and medium devices (<900px), use document element scroll instead of container scroll for better UX
  const getScrollElement = (): Element | null => {
    if (isBelowMd) {
      return typeof document !== "undefined"
        ? (document.documentElement as Element)
        : null
    }
    return parentRef.current
  }

  // Create virtualizer for rows
  // Convert spacing to number (spacing returns string like "16px")
  const gapPx = gapValue * 8 // 8px per spacing unit
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement,
    estimateSize: () => heightValue + gapPx,
    overscan,
  })

  // Calculate total height
  const totalHeight = rowVirtualizer.getTotalSize()

  // Get visible rows
  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <Box
      ref={isBelowMd ? undefined : parentRef} // Don't attach ref on <900px devices since we use window scroll
      sx={{
        height: isBelowMd ? "auto" : "100%", // Auto height on <900px devices for natural flow
        width: "100%",
        overflow: isBelowMd ? "visible" : "auto", // No overflow on <900px devices, use window scroll
        // Smooth scrolling
        scrollBehavior: "smooth",
      }}
    >
      <Box
        sx={{
          height: isBelowMd ? "auto" : `${totalHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * cols
          const endIndex = Math.min(startIndex + cols, items.length)
          const rowItems = items.slice(startIndex, endIndex)

          return (
            <Box
              key={virtualRow.key}
              sx={{
                position: isBelowMd ? "relative" : "absolute",
                top: isBelowMd ? undefined : 0,
                left: isBelowMd ? undefined : 0,
                width: "100%",
                height: isBelowMd ? "auto" : `${virtualRow.size}px`,
                transform: isBelowMd
                  ? undefined
                  : `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: theme.spacing(gapValue),
                marginBottom: isBelowMd ? theme.spacing(gapValue) : undefined,
                paddingX: {
                  xs: theme.spacing(1),
                  sm: theme.spacing(gapValue / 2),
                },
                boxSizing: "border-box",
              }}
            >
              {rowItems.map((item, colIndex) => {
                const index = startIndex + colIndex
                return (
                  <Box key={index} sx={{ height: heightValue, width: "100%" }}>
                    {renderItem(item, index)}
                  </Box>
                )
              })}
              {/* Fill empty cells in last row */}
              {rowItems.length < cols &&
                Array.from({ length: cols - rowItems.length }).map((_, i) => (
                  <Box key={`empty-${i}`} />
                ))}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

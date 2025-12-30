import React, { useMemo, useRef, useEffect } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Box, useTheme, useMediaQuery } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface VirtualizedGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  columns?: { xs?: number; sm?: number; md?: number; lg?: number }
  gap?: number
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
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))

  // Determine number of columns based on breakpoint
  const cols = useMemo(() => {
    if (isXs) return columns.xs || 1
    if (isSm) return columns.sm || 2
    if (isMd) return columns.md || 3
    if (isLg) return columns.lg || 4
    return columns.xs || 1
  }, [isXs, isSm, isMd, isLg, columns])

  // Calculate number of rows
  const rowCount = Math.ceil(items.length / cols)

  // Internal ref if external one not provided
  const internalRef = useRef<HTMLDivElement>(null)
  const parentRef = externalRef || internalRef

  // Create virtualizer for rows
  // Convert spacing to number (spacing returns string like "16px")
  const gapPx = typeof gap === "number" ? gap * 8 : 16 // Default 8px per spacing unit
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gapPx,
    overscan,
  })

  // Calculate total height
  const totalHeight = rowVirtualizer.getTotalSize()

  // Get visible rows
  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <Box
      ref={parentRef}
      sx={{
        height: "100%",
        width: "100%",
        overflow: "auto",
        // Smooth scrolling
        scrollBehavior: "smooth",
      }}
    >
      <Box
        sx={{
          height: `${totalHeight}px`,
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
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: theme.spacing(gap),
                paddingX: theme.spacing(gap / 2),
              }}
            >
              {rowItems.map((item, colIndex) => {
                const index = startIndex + colIndex
                return (
                  <Box key={index} sx={{ height: itemHeight, width: "100%" }}>
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

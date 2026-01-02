import React, { ReactNode } from "react"
import { Box, CircularProgress, Fade } from "@mui/material"
import { usePullToRefresh, UsePullToRefreshOptions } from "../../hooks/gestures/usePullToRefresh"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { RefreshRounded } from "@mui/icons-material"

export interface PullToRefreshProps extends UsePullToRefreshOptions {
  /**
   * Children to wrap with pull-to-refresh
   */
  children: ReactNode
  /**
   * Custom refresh indicator component
   */
  refreshIndicator?: ReactNode
  /**
   * Whether to show the refresh indicator
   * Default: true
   */
  showIndicator?: boolean
}

/**
 * Pull-to-refresh component wrapper
 *
 * Wraps children with pull-to-refresh functionality.
 * Shows a refresh indicator when pulled past threshold.
 *
 * @example
 * ```tsx
 * <PullToRefresh
 *   onRefresh={async () => {
 *     await refetch()
 *   }}
 * >
 *   <List>
 *     {items.map(item => <ListItem key={item.id}>{item.name}</ListItem>)}
 *   </List>
 * </PullToRefresh>
 * ```
 */
export function PullToRefresh({
  children,
  refreshIndicator,
  showIndicator = true,
  ...options
}: PullToRefreshProps) {
  const theme = useTheme<ExtendedTheme>()
  const {
    isRefreshing,
    pullDistance,
    isPulledPastThreshold,
    handlers,
  } = usePullToRefresh(options)

  const defaultIndicator = (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        zIndex: theme.zIndex.appBar,
        pointerEvents: "none",
      }}
    >
      {isRefreshing ? (
        <CircularProgress size={24} color="primary" />
      ) : (
        <Fade in={isPulledPastThreshold}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <RefreshRounded
              sx={{
                fontSize: 24,
                color: "primary.main",
                transform: `rotate(${pullDistance * 2}deg)`,
                transition: "transform 0.2s ease-out",
              }}
            />
          </Box>
        </Fade>
      )}
    </Box>
  )

  return (
    <Box
      sx={{
        position: "relative",
        touchAction: "pan-y", // Allow vertical scrolling
        bgcolor: "transparent", // Ensure no background color
      }}
      onTouchStart={handlers.onTouchStart}
      onTouchMove={handlers.onTouchMove}
      onTouchEnd={handlers.onTouchEnd}
    >
      {showIndicator && (refreshIndicator || defaultIndicator)}
      <Box
        sx={{
          bgcolor: "transparent", // Ensure no background color
        }}
        style={{
          transform: `translateY(${Math.max(0, pullDistance)}px)`,
          transition: isRefreshing ? "transform 0.3s ease-out" : "none",
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

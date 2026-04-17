/**
 * ListingRefreshButtonV2 Component
 *
 * Allows sellers to "bump" their listings to the top of search results by updating
 * the timestamp. Enforces a 24-hour cooldown period between refreshes to prevent abuse.
 *
 * Requirements:
 * - 49.6: Provide ListingRefreshButtonV2 React component
 * - 49.7: Maintain visual parity with V1 refresh button
 * - 49.8: Show cooldown timer
 * - 49.9: Disable button during cooldown
 * - 49.10: Use RTK_Query_Client for API calls
 */

import React, { useState, useEffect, useMemo } from "react"
import { Fab, Tooltip } from "@mui/material"
import { RefreshRounded } from "@mui/icons-material"
import { useRefreshListingMutation } from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

interface ListingRefreshButtonV2Props {
  listingId: string
  updatedAt: string // ISO 8601 timestamp
}

/**
 * Calculates time remaining until next refresh is allowed
 * @param updatedAt ISO 8601 timestamp of last update
 * @returns Object with canRefresh flag and formatted time remaining
 */
function useRefreshCooldown(updatedAt: string) {
  const COOLDOWN_HOURS = 24
  const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000

  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [canRefresh, setCanRefresh] = useState<boolean>(false)

  useEffect(() => {
    const updateCooldown = () => {
      const now = new Date().getTime()
      const lastUpdate = new Date(updatedAt).getTime()
      const timeSinceUpdate = now - lastUpdate
      const timeUntilRefresh = cooldownMs - timeSinceUpdate

      if (timeUntilRefresh <= 0) {
        setCanRefresh(true)
        setTimeRemaining("")
      } else {
        setCanRefresh(false)

        // Format time remaining
        const hoursRemaining = Math.floor(timeUntilRefresh / (60 * 60 * 1000))
        const minutesRemaining = Math.floor(
          (timeUntilRefresh % (60 * 60 * 1000)) / (60 * 1000),
        )

        if (hoursRemaining > 0) {
          setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m`)
        } else {
          setTimeRemaining(`${minutesRemaining}m`)
        }
      }
    }

    // Update immediately
    updateCooldown()

    // Update every minute
    const interval = setInterval(updateCooldown, 60 * 1000)

    return () => clearInterval(interval)
  }, [updatedAt, cooldownMs])

  return { canRefresh, timeRemaining }
}

/**
 * Refresh button component for V2 listings
 *
 * Maintains visual parity with V1 refresh button (Fab with RefreshRounded icon).
 * Shows cooldown timer in tooltip when refresh is not available.
 * Disables button during cooldown period.
 */
export function ListingRefreshButtonV2(props: ListingRefreshButtonV2Props) {
  const { listingId, updatedAt } = props
  const [refreshListing, { isLoading }] = useRefreshListingMutation()
  const issueAlert = useAlertHook()
  const { canRefresh, timeRemaining } = useRefreshCooldown(updatedAt)

  // Tooltip message (Requirement 49.8)
  const tooltipTitle = useMemo(() => {
    if (isLoading) {
      return "Refreshing..."
    }
    if (!canRefresh) {
      return `Refresh available in ${timeRemaining}`
    }
    return "Refresh listing to bump to top of search results"
  }, [canRefresh, timeRemaining, isLoading])

  const handleRefresh = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!canRefresh || isLoading) {
      return
    }

    try {
      await refreshListing({ id: listingId }).unwrap()
      issueAlert({
        message: "Listing refreshed successfully",
        severity: "success",
      })
    } catch (error: any) {
      // Handle validation errors with cooldown information
      if (error?.data?.errors) {
        const cooldownError = error.data.errors.find(
          (e: any) => e.field === "updated_at",
        )
        if (cooldownError) {
          issueAlert({
            message: cooldownError.message,
            severity: "warning",
          })
          return
        }
      }

      issueAlert({
        message: error?.data?.message || "Failed to refresh listing",
        severity: "error",
      })
    }
  }

  return (
    <Tooltip title={tooltipTitle} arrow>
      <span>
        <Fab
          sx={{ position: "absolute", right: 8, top: 8 }}
          color="primary"
          size="small"
          onClick={handleRefresh}
          disabled={!canRefresh || isLoading}
        >
          <RefreshRounded />
        </Fab>
      </span>
    </Tooltip>
  )
}

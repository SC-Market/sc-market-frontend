/**
 * Periodic Background Sync Hook
 * Registers periodic background sync for data synchronization
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PeriodicBackgroundSync
 */

import { useEffect, useState } from "react"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface PeriodicSyncManager {
  register: (tag: string, options?: { minInterval?: number }) => Promise<void>
  getTags: () => Promise<string[]>
  unregister: (tag: string) => Promise<void>
}

/**
 * Hook to register and manage periodic background sync
 */
export function usePeriodicBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const checkRegistrationStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const periodicSync = (registration as any).periodicSync as
        | PeriodicSyncManager
        | undefined

      if (periodicSync) {
        const tags = await periodicSync.getTags()
        setIsRegistered(tags.length > 0)
      }
    } catch (error) {
      console.debug("Failed to check periodic sync registration:", error)
    }
  }

  useEffect(() => {
    // Check if Periodic Background Sync is supported
    const checkSupport = async () => {
      if (!("serviceWorker" in navigator)) {
        setIsSupported(false)
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready
        if ("periodicSync" in registration) {
          setIsSupported(true)
          await checkRegistrationStatus()
        } else {
          setIsSupported(false)
          console.debug("Periodic Background Sync not supported")
        }
      } catch (error) {
        setIsSupported(false)
        console.debug(
          "Failed to check Periodic Background Sync support:",
          error,
        )
      }
    }

    checkSupport()
  }, [])

  const registerPeriodicSync = async (
    tag: string = "sync-data",
    minInterval: number = 86400000, // 24 hours in milliseconds
  ) => {
    if (!isSupported) {
      console.debug("Periodic Background Sync not supported")
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const periodicSync = (registration as any).periodicSync as
        | PeriodicSyncManager
        | undefined

      if (!periodicSync) {
        console.debug("PeriodicSync API not available")
        return false
      }

      // Request permission (required for periodic sync)
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({
          name: "periodic-background-sync" as PermissionName,
        })

        if (permission.state === "denied") {
          console.debug("Periodic Background Sync permission denied")
          return false
        }
      }

      // Register periodic sync
      await periodicSync.register(tag, {
        minInterval, // Minimum interval between syncs (24 hours)
      })

      setIsRegistered(true)
      console.debug(`Periodic Background Sync registered: ${tag}`)
      return true
    } catch (error) {
      console.debug("Failed to register periodic sync:", error)
      return false
    }
  }

  const unregisterPeriodicSync = async (tag: string = "sync-data") => {
    if (!isSupported) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const periodicSync = (registration as any).periodicSync as
        | PeriodicSyncManager
        | undefined

      if (periodicSync) {
        await periodicSync.unregister(tag)
        setIsRegistered(false)
        console.debug(`Periodic Background Sync unregistered: ${tag}`)
        return true
      }
      return false
    } catch (error) {
      console.debug("Failed to unregister periodic sync:", error)
      return false
    }
  }

  return {
    isSupported,
    isRegistered,
    registerPeriodicSync,
    unregisterPeriodicSync,
  }
}

import { useEffect, useState, useCallback } from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Global state to share the deferred prompt across components
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null
const globalPromptListeners: Set<() => void> = new Set()

/**
 * Hook to manage PWA install prompt
 * Provides functionality to trigger the install prompt manually
 */
export function usePWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      globalDeferredPrompt = promptEvent
      setDeferredPrompt(promptEvent)
      // Notify all listeners
      globalPromptListeners.forEach((listener) => listener())
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      globalDeferredPrompt = null
      setDeferredPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    // Check if we already have a deferred prompt
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt)
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      )
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const triggerInstall = useCallback(async () => {
    const prompt = deferredPrompt || globalDeferredPrompt
    if (!prompt) {
      return false
    }

    try {
      // Show the install prompt
      await prompt.prompt()

      // Wait for user response
      const { outcome } = await prompt.userChoice

      if (outcome === "accepted") {
        setIsInstalled(true)
        globalDeferredPrompt = null
        setDeferredPrompt(null)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Failed to show install prompt:", error)
      return false
    }
  }, [deferredPrompt])

  const canInstall =
    !isInstalled && (deferredPrompt !== null || globalDeferredPrompt !== null)

  return {
    canInstall,
    isInstalled,
    triggerInstall,
  }
}

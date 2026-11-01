import { useEffect, useState, useCallback } from "react"
import { isPWAInstalled } from "../../util/pwa-detection"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Shared across every component using the hook. The listeners are attached
// when this module loads (Root imports it through InstallPrompt), not when a
// component mounts: Chrome fires `beforeinstallprompt` once, early, often
// before React has rendered, and a later listener never sees it.
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null
let globalInstalled = false
const listeners: Set<() => void> = new Set()
const notify = () => listeners.forEach((listener) => listener())

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault()
    globalDeferredPrompt = e as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener("appinstalled", () => {
    globalInstalled = true
    globalDeferredPrompt = null
    notify()
  })
}

/**
 * The PWA install prompt: `canInstall` when the browser offered a deferred
 * `beforeinstallprompt` (Chromium browsers), `isInstalled` when running as
 * the installed app or once the user installed it this session.
 *
 * Both start false and are read after mount, so a prerendered page and its
 * hydration render agree.
 */
export function usePWAInstallPrompt() {
  const [, setTick] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const listener = () => setTick((n) => n + 1)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const isInstalled = mounted && (globalInstalled || isPWAInstalled())

  const triggerInstall = useCallback(async () => {
    const prompt = globalDeferredPrompt
    if (!prompt) {
      return false
    }

    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      // A deferred prompt can only be shown once.
      globalDeferredPrompt = null
      if (outcome === "accepted") globalInstalled = true
      notify()
      return outcome === "accepted"
    } catch (error) {
      console.error("Failed to show install prompt:", error)
      return false
    }
  }, [])

  const canInstall = mounted && !isInstalled && globalDeferredPrompt !== null

  return {
    canInstall,
    isInstalled,
    triggerInstall,
  }
}

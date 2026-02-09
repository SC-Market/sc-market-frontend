import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { onOpenUrl } from "@tauri-apps/plugin-deep-link"

/**
 * Hook to handle deep link callbacks from OAuth flows
 * Listens for scmarket:// URLs and navigates to the appropriate route
 */
export function useDeepLinkHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    // Only run in Tauri
    if (typeof window === "undefined" || !("__TAURI__" in window)) {
      return
    }

    // Listen for deep link URLs
    const unlisten = onOpenUrl((urls) => {
      for (const url of urls) {
        console.log("Deep link received:", url)

        // Parse the URL
        try {
          const parsed = new URL(url)

          // Handle scmarket:// URLs
          if (parsed.protocol === "scmarket:") {
            // Extract path and query params
            // Example: scmarket://auth/callback?token=xxx&path=/dashboard
            const path = parsed.pathname
            const searchParams = parsed.searchParams

            // Get redirect path from query params
            const redirectPath = searchParams.get("path") || "/"

            // Navigate to the redirect path
            navigate(redirectPath)

            // Reload to ensure auth state is updated
            window.location.reload()
          }
        } catch (error) {
          console.error("Failed to parse deep link URL:", error)
        }
      }
    })

    // Cleanup listener on unmount
    return () => {
      unlisten.then((fn) => fn())
    }
  }, [navigate])
}

import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { serviceApi } from "../../../store/service"
import { tokensApi } from "../../api-tokens/api/tokensApi"
import { PATHS } from "../../../routes/paths"
import { useLogoutMutation } from "../api/profileApi"

/**
 * Log out from the profile menu: clear the service worker's authenticated
 * caches and the RTK Query cache, end the session, then go home (also when
 * the request fails: the session may be cleared anyway).
 */
export function useLogout() {
  const [logout] = useLogoutMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useCallback(async () => {
    try {
      // Clear service worker caches
      if ("serviceWorker" in navigator && "caches" in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map((cacheName) => {
              // Clear API cache and other caches that might contain authenticated data
              if (
                cacheName.includes("api") ||
                cacheName.includes("pages") ||
                cacheName.includes("mutations")
              ) {
                return caches.delete(cacheName)
              }
              return Promise.resolve()
            }),
          )
        } catch (error) {
          console.error("Failed to clear service worker caches:", error)
        }
      }

      // Clear RTK Query cache (also done in mutation's onQueryStarted, but do it here too for immediate effect)
      dispatch(serviceApi.util.resetApiState())
      dispatch(tokensApi.util.resetApiState())

      // Call logout mutation
      await logout().unwrap()

      // Navigate to home page after successful logout
      // Using navigate instead of window.location to avoid full page reload
      navigate(PATHS.home, { replace: true })
    } catch (error) {
      // Even if logout fails, navigate to home (session might be cleared anyway)
      console.error("Logout error:", error)
      navigate(PATHS.home, { replace: true })
    }
  }, [logout, dispatch, navigate])
}

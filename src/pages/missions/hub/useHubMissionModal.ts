import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { GAME_DATA_PATHS } from "../../../routes/paths"

interface OpenMission {
  id: string
  path: string
}

/**
 * Desktop: a hub mission opens in MissionDetailModal over the hub. The URL
 * becomes /missions/<code> (a history entry pushed without a router
 * navigation, so the hub stays mounted, scrolled where it was); closing,
 * Escape or Back return to the hub's URL. Reloading or sharing the URL
 * opens the mission page as usual. A router navigation from inside the
 * modal (a link in it) closes it.
 */
export function useHubMissionModal() {
  const [open, setOpen] = useState<OpenMission | null>(null)
  const openRef = useRef<OpenMission | null>(null)
  openRef.current = open
  const location = useLocation()

  const openMission = useCallback(
    (m: { mission_id: string; mission_code: string }) => {
      const path = GAME_DATA_PATHS.mission(encodeURIComponent(m.mission_code))
      // Same state as the hub's entry (React Router's key/idx): going back to
      // it is a no-op for the router.
      window.history.pushState(window.history.state, "", path)
      setOpen({ id: m.mission_id, path })
    },
    [],
  )

  const close = useCallback(() => {
    const current = openRef.current
    setOpen(null)
    if (current && window.location.pathname === current.path) {
      window.history.back()
    }
  }, [])

  /** Close and put the hub's URL back without a history step (before a navigation). */
  const dismiss = useCallback(() => {
    const current = openRef.current
    setOpen(null)
    if (current && window.location.pathname === current.path) {
      window.history.replaceState(
        window.history.state,
        "",
        `${location.pathname}${location.search}${location.hash}`,
      )
    }
  }, [location.pathname, location.search, location.hash])

  // Back (or forward) away from the mission's URL closes the modal.
  useEffect(() => {
    if (!open) return
    const onPop = () => {
      if (window.location.pathname !== open.path) setOpen(null)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [open])

  // A router navigation (a link inside the modal) closes it.
  const key = location.key
  const keyRef = useRef(key)
  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key
      setOpen(null)
    }
  }, [key])

  return { openId: open?.id ?? null, openMission, close, dismiss }
}

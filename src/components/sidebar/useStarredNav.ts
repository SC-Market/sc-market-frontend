import { useMemo } from "react"
import { useCookies } from "react-cookie"
import { haptic } from "../../util/haptics"

/** The nav destinations the user pinned (a cookie), and a pin toggle. */
export function useStarredNav() {
  const [cookies, setCookie] = useCookies(["starred_nav_v2"])
  const starred: string[] = useMemo(
    () => cookies.starred_nav_v2 || [],
    [cookies.starred_nav_v2],
  )
  const toggleStar = (path: string) => {
    haptic.light()
    const next = starred.includes(path)
      ? starred.filter((p) => p !== path)
      : [...starred, path]
    setCookie("starred_nav_v2", next, { path: "/", maxAge: 31536000 })
  }
  return { starred, toggleStar }
}

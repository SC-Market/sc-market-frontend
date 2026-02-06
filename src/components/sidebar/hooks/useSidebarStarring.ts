import { useCookies } from "react-cookie"

/**
 * Hook for managing starred sidebar items
 */
export function useSidebarStarring() {
  const [cookies, setCookie] = useCookies(["starred_sidebar"])
  const starredItems: string[] = cookies.starred_sidebar || []

  const toggleStar = (itemPath: string) => {
    const newStarred = starredItems.includes(itemPath)
      ? starredItems.filter((p) => p !== itemPath)
      : [...starredItems, itemPath]
    setCookie("starred_sidebar", newStarred, { path: "/", maxAge: 31536000 })
  }

  return { starredItems, toggleStar }
}

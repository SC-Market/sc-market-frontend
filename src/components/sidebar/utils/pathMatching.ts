/**
 * Check if a sidebar path is currently selected based on the current pathname
 */
export function isSidebarPathSelected(
  pathOnly: string,
  pathname: string,
): boolean {
  if (pathOnly === pathname) return true
  if (pathname.startsWith(pathOnly + "/")) return true
  if (pathOnly === "/market" && pathname.startsWith("/market/")) return true
  return false
}

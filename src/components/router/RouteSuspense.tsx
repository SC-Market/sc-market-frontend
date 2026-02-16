import React, { PropsWithChildren, Suspense } from "react"
import { useLocation } from "react-router-dom"
import { getSkeletonForRoute } from "../../router/routeSkeletons"

/**
 * Smart Suspense wrapper that shows route-appropriate skeletons
 * Prevents CLS by matching skeleton structure to the loading page
 */
export function RouteSuspense({ children }: PropsWithChildren) {
  const location = useLocation()
  const SkeletonComponent = getSkeletonForRoute(location.pathname)

  return <Suspense fallback={<SkeletonComponent />}>{children}</Suspense>
}

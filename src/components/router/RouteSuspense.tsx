import React, { PropsWithChildren, Suspense } from "react"
import { useLocation } from "react-router-dom"
import { getSkeletonForRoute } from "../../router/routeSkeletons"
import { usePageReady } from "../metadata/PageReady"

/**
 * The skeleton for the current route (see routeSkeletonMap). Used for every
 * loading boundary that stands in for a whole page — the route Suspense
 * below, each route's HydrateFallback on the first page load, and the
 * MarketRouter gates — so a page always gets the same placeholder no matter
 * which boundary catches it.
 *
 * While it shows, the page is busy (`main[aria-busy="true"]`): the skeleton
 * and the page-ready signal always agree.
 */
export function RouteSkeletonFallback() {
  usePageReady(true)
  const location = useLocation()
  const SkeletonComponent = getSkeletonForRoute(location.pathname)
  return <SkeletonComponent />
}

/**
 * Smart Suspense wrapper that shows route-appropriate skeletons
 * Prevents CLS by matching skeleton structure to the loading page
 */
export function RouteSuspense({ children }: PropsWithChildren) {
  return <Suspense fallback={<RouteSkeletonFallback />}>{children}</Suspense>
}

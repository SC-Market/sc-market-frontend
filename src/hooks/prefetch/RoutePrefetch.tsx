import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { prefetchModule } from "../../util/prefetch"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Define prefetch strategies for different routes
const routePrefetchMap: Record<string, () => Promise<void>> = {
  // When on market page, prefetch related market components
  "/market": async () => {
    await Promise.allSettled([
      prefetchModule(
        () => import("../../pages/market/MarketCreate"),
        "MarketCreate",
      ),
      prefetchModule(
        () => import("../../pages/market/ViewMarketListing"),
        "ViewMarketListing",
      ),
      prefetchModule(
        () => import("../../pages/market/ViewMarketAggregate"),
        "ViewMarketAggregate",
      ),
      prefetchModule(
        () => import("../../pages/market/ManageStock"),
        "ManageStock",
      ),
    ])
  },

  // When on contracts page, prefetch related contract components
  "/contracts": async () => {
    await Promise.allSettled([
      prefetchModule(
        () => import("../../pages/contracting/CreateOrder"),
        "CreateOrder",
      ),
      prefetchModule(
        () => import("../../pages/contracting/ViewOrder"),
        "ViewOrder",
      ),
      prefetchModule(
        () => import("../../pages/contracting/CreateService"),
        "CreateService",
      ),
    ])
  },

  // When on profile/people pages, prefetch user-related components
  "/people": async () => {
    await Promise.allSettled([
      prefetchModule(() => import("../../pages/people/Profile"), "Profile"),
      prefetchModule(() => import("../../pages/people/MyProfile"), "MyProfile"),
      prefetchModule(() => import("../../views/people/AllUsers"), "AllUsers"),
    ])
  },

  // When on contractor pages, prefetch org-related components
  "/contractor": async () => {
    await Promise.allSettled([
      prefetchModule(
        () => import("../../pages/contractor/OrgManage"),
        "OrgManage",
      ),
      prefetchModule(
        () => import("../../pages/contractor/MemberDashboard"),
        "MemberDashboard",
      ),
      prefetchModule(() => import("../../pages/contractor/ViewOrg"), "ViewOrg"),
    ])
  },

  // When on recruiting pages, prefetch recruiting components
  "/recruiting": async () => {
    await Promise.allSettled([
      prefetchModule(
        () => import("../../pages/recruiting/CreateRecruitingPostPage"),
        "CreateRecruitingPostPage",
      ),
      prefetchModule(
        () => import("../../pages/recruiting/RecruitingPostPage"),
        "RecruitingPostPage",
      ),
    ])
  },
}

export function useRoutePrefetch() {
  const location = useLocation()

  useEffect(() => {
    const currentPath = location.pathname

    // Find matching prefetch strategy
    const matchingRoute = Object.keys(routePrefetchMap).find((route) =>
      currentPath.startsWith(route),
    )

    if (matchingRoute) {
      // Delay prefetching to not interfere with current page load
      const timeoutId = setTimeout(() => {
        routePrefetchMap[matchingRoute]()
          .then(() =>
            console.debug(`Prefetched components for route: ${matchingRoute}`),
          )
          .catch((error) =>
            console.warn(
              `Failed to prefetch for route ${matchingRoute}:`,
              error,
            ),
          )
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [location.pathname])
}

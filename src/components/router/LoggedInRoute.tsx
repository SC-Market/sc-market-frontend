import { Navigate, Outlet, useLocation } from "react-router-dom"
import React, { useEffect, useMemo } from "react"
import LoadingBar from "react-top-loading-bar"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useSession } from "../../hooks/login/useSession"
import { BACKEND_URL } from "../../util/constants"
import { useTheme } from "@mui/material/styles"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { useCookies } from "react-cookie"
import { has_permission } from "../../views/contractor/OrgRoles"
import type { Contractor, ContractorRole } from "../../features/contractor/domain/types"
import type { UserProfileState } from "../../hooks/login/UserProfile"
import { getBugsnagInstance } from "../../util/monitoring/bugsnagLoader"
import { isSiteAdmin } from "../../util/siteRole"
import { RouteSkeletonFallback } from "./RouteSuspense"
import { isMfaLockedAdmin } from "../../features/mfa/adminLock"

const MfaAdminGate = React.lazy(() =>
  import("../../features/mfa/components/MfaAdminGate").then((m) => ({ default: m.MfaAdminGate })),
)

export function LoggedInRoute() {
  const session = useSession()
  const location = useLocation()
  const theme = useTheme()

  // Full-page redirect to the frontend login page, carrying the current path.
  useEffect(() => {
    if (session.status === "anonymous") {
      // Keep the query string: email links such as /settings?tab=email must
      // still open the right tab after signing in.
      window.location.href = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
    }
  }, [session.status, location.pathname, location.search])

  if (session.status === "unknown") {
    // Keep the page's skeleton up while the session resolves (the profile
    // request can take seconds); a bare loading bar left the page area empty
    // and then swapped straight to the page.
    return (
      <>
        <LoadingBar color={theme.palette.primary.main} progress={0.5} />
        <RouteSkeletonFallback />
      </>
    )
  } else if (session.status === "authenticated") {
    const { profile } = session
    if (
      !profile.rsi_confirmed &&
      !["/settings", "/accountlink"].includes(location.pathname)
    ) {
      return <Navigate to={"/settings"} />
    } else if (
      !profile.onboarding_completed_at &&
      !["/settings", "/accountlink", "/onboarding"].includes(location.pathname)
    ) {
      return <Navigate to={"/onboarding"} />
    } else {
      return <Outlet />
    }
  } else {
    return null
  }
}

export function SiteAdminRoute() {
  const session = useSession()

  if (session.status === "unknown") return <RouteSkeletonFallback />
  if (session.status === "authenticated") {
    if (isSiteAdmin(session.profile)) return <Outlet />
    // A site admin whose admin power is held back until two-factor is set up
    // or verified: prompt in place instead of a 404.
    const lock = session.profile.admin_locked
    if (lock && isMfaLockedAdmin(session.profile)) {
      return (
        <React.Suspense fallback={<RouteSkeletonFallback />}>
          <MfaAdminGate lock={lock} />
        </React.Suspense>
      )
    }
  }
  return <Navigate to={"/404"} />
}

export function OrgRoute() {
  const [cookies] = useCookies(["current_contractor"])
  const { isSuccess, isLoading, isError } = useGetContractorBySpectrumIDQuery(
    cookies.current_contractor,
    {
      skip: !cookies.current_contractor,
    },
  )

  if (isLoading) {
    return <RouteSkeletonFallback />
  } else if (isSuccess) {
    return <Outlet />
  } else if (isError) {
    return <Navigate to={"/"} />
  }
}

export function OrgAdminRoute(props: {
  permission?: keyof ContractorRole
  anyPermission?: (keyof ContractorRole)[]
  /** Custom check, e.g. canOpenOrgManage. */
  allow?: (contractor: Contractor, profile: UserProfileState) => boolean
}) {
  const { permission, anyPermission, allow } = props
  const [cookies] = useCookies(["current_contractor"])
  const {
    data: contractor,
    isLoading,
    isSuccess,
    isError,
  } = useGetContractorBySpectrumIDQuery(cookies.current_contractor, {
    skip: !cookies.current_contractor,
  })

  const { data: profile } = useGetUserProfileQuery()

  useEffect(() => {
    if (profile) {
      const Bugsnag = getBugsnagInstance()
      if (Bugsnag) {
        Bugsnag.setUser(profile?.username)
      }
    }
  }, [profile])

  const canView = useMemo(() => {
    if (allow) {
      return !!contractor && !!profile && allow(contractor, profile)
    } else if (permission) {
      return has_permission(
        contractor!,
        profile!,
        permission,
        profile?.contractors,
      )
    } else if (anyPermission) {
      return anyPermission.some((perm) =>
        has_permission(contractor!, profile!, perm, profile?.contractors),
      )
    } else {
      return false
    }
  }, [allow, anyPermission, contractor, permission, profile])

  if (isLoading) {
    return <RouteSkeletonFallback />
  } else if (isSuccess && canView) {
    return <Outlet />
  } else if (isError) {
    return <Navigate to={"/"} />
  }
}

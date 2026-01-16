import { Navigate, Outlet, useLocation } from "react-router-dom"
import React, { useEffect, useMemo } from "react"
import LoadingBar from "react-top-loading-bar"
import { useGetUserProfileQuery } from "../../store/profile"
import { BACKEND_URL } from "../../util/constants"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { useCookies } from "react-cookie"
import { has_permission } from "../../views/contractor/OrgRoles"
import { ContractorRole } from "../../datatypes/Contractor"
import Bugsnag from "@bugsnag/js"

export function LoggedInRoute() {
  // const [profile, setProfile] = useUserProfile()
  const { data: profile, isLoading, isSuccess } = useGetUserProfileQuery()
  const location = useLocation()

  if (isLoading) {
    return <LoadingBar color="#f11946" progress={0.5} />
  } else if (isSuccess) {
    if (
      !profile.rsi_confirmed &&
      !["/settings", "/accountlink"].includes(location.pathname)
    ) {
      return <Navigate to={"/settings"} />
    } else {
      return <Outlet />
    }
  } else {
    // Redirect to frontend login page with current path as redirect parameter
    window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`
    return null
  }
}

export function SiteAdminRoute() {
  const profile = useGetUserProfileQuery()

  return profile.isSuccess && profile.data.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to={"/404"} />
  )
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
    return null
  } else if (isSuccess) {
    return <Outlet />
  } else if (isError) {
    return <Navigate to={"/"} />
  }
}

export function OrgAdminRoute(props: {
  permission?: keyof ContractorRole
  anyPermission?: (keyof ContractorRole)[]
}) {
  const { permission, anyPermission } = props
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
      Bugsnag.setUser(profile?.username)
    }
  }, [profile])

  const canView = useMemo(() => {
    if (permission) {
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
  }, [anyPermission, contractor, permission, profile])

  if (isLoading) {
    return null
  } else if (isSuccess && canView) {
    return <Outlet />
  } else if (isError) {
    return <Navigate to={"/"} />
  }
}

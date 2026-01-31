import React, { useEffect, useRef, useState } from "react"
import { Outlet, useParams } from "react-router-dom"
import { useCookies } from "react-cookie"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { useGetUserProfileQuery } from "../../store/profile"
import LoadingBar from "react-top-loading-bar"
import { Navigate } from "react-router-dom"

/**
 * When rendered under a route with :contractor_id (e.g. /org/:contractor_id/manage),
 * fetches that contractor and sets currentOrg context and current_contractor cookie
 * so that org management pages and OrgRoute/OrgAdminRoute work correctly.
 * Renders child route outlet once the org is set.
 */
export function OrgContextFromRoute() {
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const currentOrgState = useCurrentOrg()
  const setCurrentOrg =
    typeof currentOrgState?.[1] === "function" ? currentOrgState[1] : null
  const [, setCookie] = useCookies(["current_contractor"])
  const { data: profile } = useGetUserProfileQuery()
  const [ready, setReady] = useState(false)
  const prevContractorId = useRef<string | undefined>(undefined)
  const {
    data: contractor,
    isLoading,
    isSuccess,
    isError,
  } = useGetContractorBySpectrumIDQuery(contractor_id!, {
    skip: !contractor_id,
  })

  useEffect(() => {
    if (contractor_id !== prevContractorId.current) {
      prevContractorId.current = contractor_id
      setReady(false)
    }
  }, [contractor_id])

  useEffect(() => {
    if (!contractor_id || !profile || !contractor || !isSuccess) return

    const isMember = profile.contractors.some(
      (c) => c.spectrum_id === contractor_id,
    )
    if (!isMember) return
    if (contractor.archived) return

    if (setCurrentOrg) {
      setCurrentOrg(contractor)
    }
    setCookie("current_contractor", contractor_id, {
      path: "/",
      sameSite: "strict",
      maxAge: 31536000,
    })
    setReady(true)
  }, [
    contractor_id,
    contractor,
    isSuccess,
    profile,
    setCurrentOrg,
    setCookie,
  ])

  if (!contractor_id) {
    return <Navigate to="/" replace />
  }
  if (isLoading) {
    return <LoadingBar color="#f11946" progress={0.5} />
  }
  if (isError || !contractor) {
    return <Navigate to="/" replace />
  }
  if (contractor.archived) {
    return <Navigate to="/" replace />
  }
  if (!profile?.contractors.some((c) => c.spectrum_id === contractor_id)) {
    return <Navigate to="/" replace />
  }

  if (!ready) {
    return <LoadingBar color="#f11946" progress={0.5} />
  }

  return <Outlet />
}

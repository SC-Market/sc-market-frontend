import React from "react"
import { Navigate } from "react-router-dom"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { ORG_PATHS } from "../../routes/paths"

type SingleArgOrgPath = {
  [K in keyof typeof ORG_PATHS]: (typeof ORG_PATHS)[K] extends (id: string) => string ? K : never
}[keyof typeof ORG_PATHS]

/**
 * Reads the current org from context and redirects to the explicit
 * org-scoped URL (/org/:spectrumId/:subpath). Falls back to / if no org.
 */
export function OrgRedirect({ subpath }: { subpath: SingleArgOrgPath }) {
  const [currentOrg] = useCurrentOrg()

  if (currentOrg?.spectrum_id) {
    const pathFn = ORG_PATHS[subpath] as (id: string) => string
    return <Navigate to={pathFn(currentOrg.spectrum_id)} replace />
  }

  return <Navigate to="/" replace />
}

export function OrgRedirectManage() {
  return <OrgRedirect subpath="manage" />
}

export function OrgRedirectOrders() {
  return <OrgRedirect subpath="orders" />
}

export function OrgRedirectMoney() {
  return <OrgRedirect subpath="money" />
}

export function OrgRedirectFleet() {
  return <OrgRedirect subpath="fleet" />
}

export function OrgRedirectSend() {
  return <OrgRedirect subpath="send" />
}

export function OrgRedirectMembers() {
  return <OrgRedirect subpath="members" />
}

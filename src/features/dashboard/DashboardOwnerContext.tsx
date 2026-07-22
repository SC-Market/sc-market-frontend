/**
 * DashboardOwnerContext — makes the current dashboard's owner available to the
 * widget tree. Scope resolution and the add-widget picker read this so that a
 * shared org/shop dashboard resolves scopes relative to the OWNER (the org/shop
 * the dashboard belongs to), not the viewer (see docs/customizable-dashboard-plan.md §7).
 *
 * Personal dashboards default to a `user` owner; the context is optional so the
 * hook is safe to call outside a provider.
 */

import { createContext, useContext } from "react"
import type { DashboardOwnerRef } from "./types"

const DashboardOwnerContext = createContext<DashboardOwnerRef | null>(null)

export const DashboardOwnerProvider = DashboardOwnerContext.Provider

/** Returns the owner of the dashboard being rendered, or null outside a provider. */
export function useDashboardOwner(): DashboardOwnerRef | null {
  return useContext(DashboardOwnerContext)
}

/** True for org/shop dashboards, which are shared across members. */
export function isSharedOwner(owner: DashboardOwnerRef | null): boolean {
  return owner != null && owner.ownerType !== "user"
}

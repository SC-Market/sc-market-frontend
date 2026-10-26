import React, { Suspense, lazy } from "react"
import { useSession } from "../../../hooks/login/useSession"
import { isSiteAdmin } from "../../../util/siteRole"
import { isMfaLockedAdmin } from "../adminLock"
import { retryDynamicImport } from "../../../util/retryDynamicImport"
import { ErrorBoundary } from "../../../components/error-boundaries/ErrorBoundary"

// Mounted in HookProvider, around EVERY page (the error page too). A stale
// chunk here must not take the app down: retryDynamicImport retries, then
// spends the shared rate-limited reload budget, and the boundary below renders
// nothing if it still fails. Unguarded, one failed fetch of this chunk after a
// deploy crashed the whole app for admins, on every page.
const MfaChallengeDialogHost = lazy(() =>
  retryDynamicImport(() => import("./MfaChallengeDialogHost")).then((m) => ({
    default: m.MfaChallengeDialogHost,
  })),
)

const renderNothing = () => null

/**
 * Mounts the two-factor prompt for site admins only (lazy-loaded), so
 * nothing changes for anyone else.
 */
export function AdminMfaHost() {
  const session = useSession()
  const profile =
    session.status === "authenticated" ? session.profile : undefined
  if (!profile || !(isSiteAdmin(profile) || isMfaLockedAdmin(profile)))
    return null
  return (
    <ErrorBoundary name="AdminMfaHost" fallback={renderNothing}>
      <Suspense fallback={null}>
        <MfaChallengeDialogHost />
      </Suspense>
    </ErrorBoundary>
  )
}

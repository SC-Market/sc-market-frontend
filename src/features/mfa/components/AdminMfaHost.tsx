import React, { Suspense } from "react"
import { useSession } from "../../../hooks/login/useSession"
import { isSiteAdmin } from "../../../util/siteRole"
import { isMfaLockedAdmin } from "../adminLock"
import { ErrorBoundary } from "../../../components/error-boundaries/ErrorBoundary"
import { lazyWithRetry } from "../../../util/lazyWithRetry"

// Mounted in HookProvider, around EVERY page (the error page too). A stale
// chunk here must not take the app down: lazyWithRetry retries, then spends
// the shared rate-limited reload budget, and the boundary below renders
// nothing if it still fails. Unguarded, one failed fetch of this chunk after a
// deploy crashed the whole app for admins, on every page.
const MfaChallengeDialogHost = lazyWithRetry(() =>
  import("./MfaChallengeDialogHost").then((m) => ({
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

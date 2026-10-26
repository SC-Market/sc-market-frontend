import React, { Suspense, lazy } from "react"
import { useSession } from "../../../hooks/login/useSession"
import { isSiteAdmin } from "../../../util/siteRole"
import { isMfaLockedAdmin } from "../adminLock"

const MfaChallengeDialogHost = lazy(() =>
  import("./MfaChallengeDialogHost").then((m) => ({ default: m.MfaChallengeDialogHost })),
)

/**
 * Mounts the two-factor prompt for site admins only (lazy-loaded), so
 * nothing changes for anyone else.
 */
export function AdminMfaHost() {
  const session = useSession()
  const profile = session.status === "authenticated" ? session.profile : undefined
  if (!profile || !(isSiteAdmin(profile) || isMfaLockedAdmin(profile))) return null
  return (
    <Suspense fallback={null}>
      <MfaChallengeDialogHost />
    </Suspense>
  )
}

import { useMemo } from "react"
import {
  useAuthSessionCheckQuery,
  useGetUserProfileQuery,
} from "../../features/profile/api/profileApi"
import type { UserProfileState } from "./UserProfile"
import { useHydrated } from "../ssr/useHydrated"

export type SessionStatus = "unknown" | "anonymous" | "authenticated"

export type Session =
  | { status: "unknown"; profile: undefined }
  | { status: "anonymous"; profile: undefined }
  | { status: "authenticated"; profile: UserProfileState }

const UNKNOWN: Session = { status: "unknown", profile: undefined }
const ANONYMOUS: Session = { status: "anonymous", profile: undefined }

/**
 * The current login state, safe to render on a server and to hydrate.
 *
 * - `"unknown"`: on the server, during the hydration render, and while the
 *   profile request has not settled yet. Render the same thing the logged-out
 *   or loading UI renders, never the logged-in chrome.
 * - `"authenticated"`: the profile query succeeded; `profile` is set.
 * - `"anonymous"`: the session check (GET /api/auth/session) said logged
 *   out, or the profile query failed (401 — answered locally, without a
 *   request, once the check says anonymous — or any other error, the same
 *   rule `LoggedInRoute` and the sidebar filters already applied).
 *
 * A profile seeded from localStorage (src/entry.client.tsx) reports "authenticated"
 * immediately, so returning users get no logged-out flash; the profile
 * refetch behind it waits for the session check and flips to "anonymous" if
 * the session turned out to be gone.
 *
 * A server render is always logged out, while the client may start with a
 * profile seeded from localStorage. Reading `useGetUserProfileQuery().data`
 * directly would make the first client render disagree with the server HTML;
 * this hook reports `"unknown"` for that render instead (see `useHydrated`).
 * In the client-only SPA there is no hydration render, so the status is the
 * query's status from the first render on.
 *
 * Use this — not `useGetUserProfileQuery` — wherever you decide between
 * logged-in and logged-out UI:
 *
 *   const session = useSession()
 *   if (session.status === "unknown") return <Skeleton />   // or logged-out UI
 *   if (session.status === "anonymous") return <SignInButtons />
 *   return <Avatar src={session.profile.avatar} />
 *
 * Code that only needs profile fields after the user is known to be logged in
 * (handlers, pages behind `LoggedInRoute`) can keep calling
 * `useGetUserProfileQuery` until it is migrated.
 */
export function useSession(): Session {
  const hydrated = useHydrated()
  const { data: check } = useAuthSessionCheckQuery()
  const { data, isSuccess, isError } = useGetUserProfileQuery()

  return useMemo<Session>(() => {
    if (!hydrated) return UNKNOWN
    if (check === "anonymous") return ANONYMOUS
    if (isSuccess) return { status: "authenticated", profile: data }
    if (isError) return ANONYMOUS
    return UNKNOWN
  }, [hydrated, check, isSuccess, isError, data])
}

/**
 * Whether auth-only queries (e.g. GET /api/v2/shops/mine) should run: the
 * session check confirmed a logged-in session. Use it as their `skip` gate so
 * anonymous visitors never send them (each would be a 401 console error):
 *
 *   const isAuthenticated = useIsAuthenticated()
 *   useGetMyShopsQuery(undefined, { skip: !isAuthenticated })
 *
 * Unlike useSession() this does not trust a localStorage-seeded profile, so
 * a stale cache cannot fire auth-only requests for a visitor who is no longer
 * logged in. When the check is unavailable ("unsupported": backend without
 * /api/auth/session) it falls back to "the profile loaded".
 */
export function useIsAuthenticated(): boolean {
  const hydrated = useHydrated()
  const { data: check } = useAuthSessionCheckQuery()
  const { isSuccess } = useGetUserProfileQuery(undefined, {
    skip: check !== "unsupported",
  })
  if (!hydrated) return false
  if (check === "authenticated") return true
  if (check === "unsupported") return isSuccess
  return false
}

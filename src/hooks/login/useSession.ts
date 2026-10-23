import { useMemo } from "react"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
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
 * - `"anonymous"`: the profile query failed (401, or any other error — the
 *   same rule `LoggedInRoute` and the sidebar filters already applied).
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
  const { data, isSuccess, isError } = useGetUserProfileQuery()

  return useMemo<Session>(() => {
    if (!hydrated) return UNKNOWN
    if (isSuccess) return { status: "authenticated", profile: data }
    if (isError) return ANONYMOUS
    return UNKNOWN
  }, [hydrated, isSuccess, isError, data])
}

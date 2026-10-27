import type { AppStore } from "../../store/store"
import type { UserProfileState } from "../../hooks/login/UserProfile"
import { userApi } from "./api/profileApi"
import { loadProfileCache } from "./profileCache"

/**
 * Seeds the profile query from the localStorage copy so a returning signed-in
 * visitor gets the signed-in UI (sidebar, hero, menus) on the first render,
 * then refetches it behind the seeded value. The refetch waits for the session
 * check, so a stale copy flips to anonymous without auth-only requests.
 *
 * The refetch is started directly, not through invalidateTags: invalidating
 * an entry that has no subscriber yet REMOVES it (RTK Query), and the app's
 * first render (createRoot is asynchronous) usually comes after a
 * setTimeout(0). The seeded profile was dropped before anything read it, so
 * every signed-in page first rendered the signed-out sidebar and reflowed when
 * the profile arrived.
 *
 * `refetchAfter` delays the refetch (entry.client.tsx: until the startup
 * gate opens, util/startupDeferral.ts). The first render uses the seeded
 * copy; the session check alone decides signed in or out before it, and the
 * refetch only reconciles the copy (a changed avatar, a new org) once the
 * page has shown its content, instead of landing in the middle of the
 * first render and forcing a second one.
 */
export function seedCachedProfile(
  store: AppStore,
  profile: UserProfileState | null = loadProfileCache(),
  refetchAfter: Promise<unknown> = Promise.resolve(),
): Promise<unknown> {
  if (!profile) return Promise.resolve()
  return Promise.all([
    store.dispatch(
      userApi.util.upsertQueryData("profileGetUserProfile", undefined, profile),
    ),
    refetchAfter,
  ]).then(() =>
    store.dispatch(
      userApi.endpoints.profileGetUserProfile.initiate(undefined, {
        subscribe: false,
        forceRefetch: true,
      }),
    ),
  )
}

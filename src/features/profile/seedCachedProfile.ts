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
 */
export function seedCachedProfile(
  store: AppStore,
  profile: UserProfileState | null = loadProfileCache(),
): Promise<unknown> {
  if (!profile) return Promise.resolve()
  return Promise.resolve(
    store.dispatch(
      userApi.util.upsertQueryData("profileGetUserProfile", undefined, profile),
    ),
  ).then(() =>
    store.dispatch(
      userApi.endpoints.profileGetUserProfile.initiate(undefined, {
        subscribe: false,
        forceRefetch: true,
      }),
    ),
  )
}

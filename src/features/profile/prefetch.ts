/**
 * Data prefetch for /user/:username[/:tab]. Args mirror the components'
 * `use*Query` calls exactly so the page's subscriptions hit the warm cache.
 * See src/router/dataPrefetch.ts for the contract.
 */
import { userApi } from "./api/profileApi"
import { marketV2Api } from "../../store/api/v2/market"
import { PrefetchDispatch, settleQuery } from "../../router/dataPrefetch"

/**
 * Profile (usePageUserProfile) loads the user, then ViewProfile renders every
 * tab panel with `preload`, so all tabs' queries run on first render
 * regardless of :tab. Children key their queries on the resolved username:
 * - UserReviewSummary, UserReviews: the user's order reviews
 * - ProfileStoreView, UserShopRedirect: shops by owner (same cache entry)
 *
 * Skipped (auth-only): getUserProfile (useProfileData, ProfileBannerArea,
 * BannerPageLayout).
 */
export async function prefetchUserProfilePage(
  dispatch: PrefetchDispatch,
  params: { username?: string },
): Promise<void> {
  const { username } = params
  if (!username) return

  const { data: user } = await settleQuery(
    dispatch(userApi.endpoints.profileGetUserByName.initiate(username)),
  )
  if (!user) return

  await Promise.all([
    settleQuery(
      dispatch(
        userApi.endpoints.profileGetUserOrderReviews.initiate(user.username),
      ),
    ),
    settleQuery(
      dispatch(
        marketV2Api.endpoints.getShopsByOwner.initiate({
          username: user.username,
        }),
      ),
    ),
  ])
}

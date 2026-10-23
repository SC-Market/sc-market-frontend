/**
 * Data prefetch for /contractor/:id[/:tab]. Args mirror the components'
 * `use*Query` calls exactly so the page's subscriptions hit the warm cache.
 * See src/router/dataPrefetch.ts for the contract.
 */
import { contractorsApi } from "./api/contractorApi"
import { recruitingApi } from "../recruiting/api/recruitingApi"
import { marketV2Api } from "../../store/api/v2/market"
import { PrefetchDispatch, settleQuery } from "../../router/dataPrefetch"
import { MEMBER_LIST_PAGE_SIZE } from "./domain/constants"

/**
 * ViewOrg (usePageOrg) loads the org, then OrgInfo renders every tab panel
 * with `preload`, so all tabs' queries run on first render regardless of
 * :tab. Children key their queries on the resolved spectrum_id:
 * - OrgInfo, RecruitingPostArea: recruiting post (+ its comments)
 * - OrgStoreView, OrgShopRedirect: shops by owner (same cache entry)
 * - MemberList: first page of members
 * - ContractorReviewSummary, OrgReviews: contractor reviews
 *
 * Skipped (auth-only): getUserProfile (OrgHeader, OrgBannerArea,
 * BannerPageLayout), getNotifications (OrgHeader invite check),
 * getContractorBySpectrumID in RecruitingPostView (org members only).
 */
export async function prefetchOrgPage(
  dispatch: PrefetchDispatch,
  params: { id?: string },
): Promise<void> {
  const { id } = params
  if (!id) return

  const { data: contractor } = await settleQuery(
    dispatch(contractorsApi.endpoints.getContractorBySpectrumID.initiate(id)),
  )
  if (!contractor) return
  const spectrumId = contractor.spectrum_id

  const recruiting = settleQuery(
    dispatch(recruitingApi.endpoints.recruitingGetPostByOrg.initiate(spectrumId)),
  ).then(({ data: post }) => {
    if (!post?.post_id) return
    return settleQuery(
      dispatch(
        recruitingApi.endpoints.recruitingGetPostCommentsByID.initiate(
          post.post_id,
        ),
      ),
    )
  })

  await Promise.all([
    recruiting,
    settleQuery(
      dispatch(marketV2Api.endpoints.getShopsByOwner.initiate({ spectrumId })),
    ),
    settleQuery(
      dispatch(
        contractorsApi.endpoints.getContractorMembers.initiate({
          spectrum_id: spectrumId,
          page: 0,
          page_size: MEMBER_LIST_PAGE_SIZE,
          search: "",
          role_filter: "",
          sort: "username",
        }),
      ),
    ),
    settleQuery(
      dispatch(contractorsApi.endpoints.getContractorReviews.initiate(spectrumId)),
    ),
  ])
}

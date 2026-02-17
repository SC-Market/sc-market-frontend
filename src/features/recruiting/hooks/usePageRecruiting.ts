import { useRecruitingGetAllPostsQuery, useRecruitingGetPostByOrgQuery } from "../../../store/recruiting"
import { RecruitingSearchState } from "../../../hooks/recruiting/RecruitingSearch"

interface UsePageRecruitingParams {
  page: number
  perPage: number
  searchState: RecruitingSearchState
  currentOrgSpectrumId?: string
}

interface UsePageRecruitingResult {
  data:
    | {
        posts: ReturnType<typeof useRecruitingGetAllPostsQuery>["data"]
        myPost: ReturnType<typeof useRecruitingGetPostByOrgQuery>["data"]
        alreadyPosted: boolean
      }
    | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageRecruiting(
  params: UsePageRecruitingParams,
): UsePageRecruitingResult {
  const { page, perPage, searchState, currentOrgSpectrumId } = params

  const postsQuery = useRecruitingGetAllPostsQuery({
    index: page,
    pageSize: perPage,
    ...searchState,
    language_codes:
      searchState.language_codes && searchState.language_codes.length > 0
        ? searchState.language_codes.join(",")
        : undefined,
  })

  const myPostQuery = useRecruitingGetPostByOrgQuery(currentOrgSpectrumId!, {
    skip: !currentOrgSpectrumId,
  })

  return {
    data: postsQuery.data
      ? {
          posts: postsQuery.data,
          myPost: myPostQuery.data,
          alreadyPosted: myPostQuery.isSuccess,
        }
      : undefined,
    isLoading: postsQuery.isLoading,
    isFetching: postsQuery.isFetching || myPostQuery.isFetching,
    error: postsQuery.error || myPostQuery.error,
    refetch: () => {
      postsQuery.refetch()
      if (currentOrgSpectrumId) {
        myPostQuery.refetch()
      }
    },
  }
}

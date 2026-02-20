import {
  useRecruitingGetPostByIDQuery,
  useRecruitingGetPostCommentsByIDQuery,
} from "../../../store/recruiting"

interface UsePageRecruitingPostResult {
  data:
    | {
        post: ReturnType<typeof useRecruitingGetPostByIDQuery>["data"]
        comments: ReturnType<
          typeof useRecruitingGetPostCommentsByIDQuery
        >["data"]
      }
    | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageRecruitingPost(
  postId: string,
): UsePageRecruitingPostResult {
  const postQuery = useRecruitingGetPostByIDQuery(postId)
  const commentsQuery = useRecruitingGetPostCommentsByIDQuery(postId)

  return {
    data:
      postQuery.data && commentsQuery.data
        ? {
            post: postQuery.data,
            comments: commentsQuery.data,
          }
        : undefined,
    isLoading: postQuery.isLoading || commentsQuery.isLoading,
    isFetching: postQuery.isFetching || commentsQuery.isFetching,
    error: postQuery.error || commentsQuery.error,
    refetch: () => {
      postQuery.refetch()
      commentsQuery.refetch()
    },
  }
}

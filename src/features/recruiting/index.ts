import "./api/recruitingApi"
import "./api/commentsApi"

export type { Comment, RecruitingPost } from "./domain/types"

export {
  recruitingApi, useRecruitingCreatePostMutation, useRecruitingGetAllPostsQuery,
  useRecruitingGetPostByIDQuery, useRecruitingGetPostByOrgQuery,
  useRecruitingUpvotePostMutation, useRecruitingDownvotePostMutation,
  useRecruitingUpdatePostMutation, useRecruitingCommentOnPostMutation,
  useRecruitingGetPostCommentsByIDQuery,
} from "./api/recruitingApi"

export {
  commentsApi, useCommentsReplyMutation, useCommentsDeleteMutation,
  useCommentsUpvoteMutation, useCommentsDownvoteMutation,
} from "./api/commentsApi"

export { usePageRecruiting } from "./hooks/usePageRecruiting"
export { usePageRecruitingPost } from "./hooks/usePageRecruitingPost"

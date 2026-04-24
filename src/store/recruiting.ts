/**
 * @deprecated Import from "features/recruiting/api/recruitingApi" instead.
 */
import "../features/recruiting/api/recruitingApi"

export type {
  Comment,
  RecruitingPost,
} from "../features/recruiting/api/recruitingApi"

export {
  recruitingApi,
  useRecruitingCreatePostMutation,
  useRecruitingGetAllPostsQuery,
  useRecruitingGetPostByIDQuery,
  useRecruitingGetPostByOrgQuery,
  useRecruitingUpvotePostMutation,
  useRecruitingDownvotePostMutation,
  useRecruitingUpdatePostMutation,
  useRecruitingCommentOnPostMutation,
  useRecruitingGetPostCommentsByIDQuery,
} from "../features/recruiting/api/recruitingApi"

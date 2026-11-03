import React from "react"
import {
  useRecruitingGetPostByOrgQuery,
  useRecruitingGetPostCommentsByIDQuery,
} from "../api/recruitingApi"
import { RecruitingPostViewSkeleton } from "../../../components/skeletons"
import { RecruitingPostView } from "../../../views/recruiting/RecruitingPostView"
import { PostCommentArea } from "./PostCommentArea"
import { isAwaitingData } from "../../../util/queryLoading"
import { skipToken } from "@reduxjs/toolkit/query/react"

export function RecruitingPostArea(props: { spectrum_id: string }) {
  const {
    data: post,
    isFetching,
    currentData,
  } = useRecruitingGetPostByOrgQuery(props.spectrum_id)

  const { data: comments } = useRecruitingGetPostCommentsByIDQuery(
    post?.post_id || skipToken,
  )

  return (
    <>
      {isAwaitingData({ isFetching, currentData }) ? (
        <RecruitingPostViewSkeleton />
      ) : post ? (
        <>
          <RecruitingPostView post={post} />
          <PostCommentArea post={post} comments={comments || []} />
        </>
      ) : null}
    </>
  )
}

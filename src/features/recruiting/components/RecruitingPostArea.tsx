import React from "react"
import { useRecruitingGetPostByOrgQuery, useRecruitingGetPostCommentsByIDQuery } from "../../../store/recruiting"
import { RecruitingPostViewSkeleton } from "../../../components/skeletons"
import { RecruitingPostView } from "../../../views/recruiting/RecruitingPostView"
import { PostCommentArea } from "./PostCommentArea"

export function RecruitingPostArea(props: { spectrum_id: string }) {
  const {
    data: post,
    isLoading,
    isFetching,
  } = useRecruitingGetPostByOrgQuery(props.spectrum_id)
  
  const { data: comments } = useRecruitingGetPostCommentsByIDQuery(post?.post_id!, {
    skip: !post?.post_id,
  })

  return (
    <>
      {isLoading || isFetching ? (
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

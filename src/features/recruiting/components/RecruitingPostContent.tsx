import React from "react"
import { RecruitingPost } from "../api/recruitingApi"
import { RecruitingPostView } from "../../../views/recruiting/RecruitingPostView"
import { PostCommentArea } from "./PostCommentArea"
import { Comment } from "../api/recruitingApi"
import { FRONTEND_URL } from "../../../util/constants"
import { buildRecruitingPostHead } from "../../../seo/entityHeads"
import { SeoHead } from "../../../seo/SeoHead"

interface RecruitingPostContentProps {
  post: RecruitingPost
  comments: Comment[]
}

export function RecruitingPostContent(props: RecruitingPostContentProps) {
  const { post, comments } = props

  return (
    <>
      <SeoHead head={buildRecruitingPostHead(post, FRONTEND_URL)} />
      <RecruitingPostView post={post} />
      <PostCommentArea post={post} comments={comments} />
    </>
  )
}

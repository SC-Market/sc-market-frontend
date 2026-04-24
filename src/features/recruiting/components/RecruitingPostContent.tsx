import React from "react"
import { Grid } from "@mui/material"
import { RecruitingPost } from "../api/recruitingApi"
import { RecruitingPostView } from "../../../views/recruiting/RecruitingPostView"
import { PostCommentArea } from "./PostCommentArea"
import { Comment } from "../api/recruitingApi"

interface RecruitingPostContentProps {
  post: RecruitingPost
  comments: Comment[]
}

export function RecruitingPostContent(props: RecruitingPostContentProps) {
  const { post, comments } = props

  return (
    <>
      <RecruitingPostView post={post} />
      <PostCommentArea post={post} comments={comments} />
    </>
  )
}

import React from "react"
import { Grid } from "@mui/material"
import { RecruitingPost } from "../../../store/recruiting"
import { RecruitingPostView } from "../../../views/recruiting/RecruitingPostView"
import { PostCommentArea } from "./PostCommentArea"
import { Comment } from "../../../store/recruiting"

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

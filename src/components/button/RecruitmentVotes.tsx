import {
  RecruitingPost,
  useRecruitingUpvotePostMutation,
} from "../../store/recruiting"
import { Button } from "@mui/material"
import { KeyboardArrowUpRounded } from "@mui/icons-material"
import React, { useState } from "react"
import { useGetUserProfileQuery } from "../../store/profile"
import { BACKEND_URL } from "../../util/constants"
import { useTranslation } from "react-i18next"

export function RecruitmentVotes(props: { post: RecruitingPost }) {
  const { post } = props
  const { t } = useTranslation()

  const [
    doUpvote, // This is the mutation trigger
  ] = useRecruitingUpvotePostMutation()

  const { data: profile } = useGetUserProfileQuery()
  const [pressed, setPressed] = useState(0)

  return (
    <Button
      color={"success"}
      startIcon={<KeyboardArrowUpRounded />}
      onClick={async (event) => {
        event.stopPropagation()
        event.preventDefault()
        if (profile) {
          //const resp = await doUpvote(post.post_id) as {data: {already_voted: boolean}}
          doUpvote(post.post_id)
          // if (resp.data && !resp.data.already_voted) {
          //     setPressed(1)
          // }
        } else {
          // Redirect to frontend login page with current path as redirect parameter
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        }
        return false
      }}
      variant={"contained"}
      size={"small"}
      title={t("recruitmentVotes.upvoteButtonTooltip", "Upvote this post")}
      aria-label={t(
        "accessibility.upvoteRecruitmentPost",
        "Upvote this recruitment post",
      )}
      aria-describedby={`recruitment-upvote-count-${post.post_id}`}
    >
      <span id={`recruitment-upvote-count-${post.post_id}`} className="sr-only">
        {t("accessibility.recruitmentUpvoteCount", "Upvotes: {{count}}", {
          count: post.upvotes + pressed,
        })}
      </span>
      {post.upvotes + pressed}
    </Button>
  )
}

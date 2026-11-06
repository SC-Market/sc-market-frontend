import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useRecruitingCreatePostMutation,
  useRecruitingUpdatePostMutation,
  type RecruitingPost,
} from "../api/recruitingApi"

/**
 * Publish a recruiting post: a new one for the org `contractorSpectrumId`,
 * or the edit of `post`. Alerts and opens the post once saved.
 */
export function useSubmitRecruitingPost(post: RecruitingPost | undefined) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const [createPost] = useRecruitingCreatePostMutation()
  const [updatePost] = useRecruitingUpdatePostMutation()

  return useCallback(
    async (
      content: { title: string; body: string },
      contractorSpectrumId: string | undefined,
    ) => {
      let request
      if (!post) {
        if (!contractorSpectrumId) return
        request = createPost({ ...content, contractor: contractorSpectrumId })
      } else {
        request = updatePost({ body: content, post_id: post.post_id })
      }

      try {
        const res = await request.unwrap()
        issueAlert({
          message: t("recruiting_post.alert.submitted"),
          severity: "success",
        })
        navigate(`/recruiting/post/${res.post_id}`)
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
      }
    },
    [post, createPost, updatePost, issueAlert, navigate, t],
  )
}

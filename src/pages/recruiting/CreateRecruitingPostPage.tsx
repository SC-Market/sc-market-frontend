import React from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { CreateRecruitingPost } from "../../views/recruiting/CreateRecruitingPost"
import { useRecruitingGetPostByIDQuery } from "../../store/recruiting"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { RecruitingPostViewSkeleton } from "../../components/skeletons"

export function CreateRecruitingPostPage() {
  const { t } = useTranslation()

  return (
    <FormPageLayout
      formTitle={t("recruiting_post.page.createPost")}
      title={t("recruiting_post.page.createPost")}
      sidebarOpen={true}
      maxWidth="md"
    >
      <CreateRecruitingPost />
    </FormPageLayout>
  )
}

export function UpdateRecruitingPostPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const { t } = useTranslation()

  const {
    data: post,
    error,
    isLoading,
  } = useRecruitingGetPostByIDQuery(post_id!)
  const [currentOrg] = useCurrentOrg()

  return (
    <FormPageLayout
      formTitle={t("recruiting_post.page.updatePost")}
      title={t("recruiting_post.page.updatePost")}
      isLoading={isLoading}
      error={error}
      skeleton={<RecruitingPostViewSkeleton />}
      sidebarOpen={true}
      maxWidth="md"
    >
      {currentOrg && post && <CreateRecruitingPost post={post} />}
    </FormPageLayout>
  )
}

import React, { Suspense } from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { CreateRecruitingPost } from "../../views/recruiting/CreateRecruitingPost"
import { useRecruitingGetPostByIDQuery } from "../../features/recruiting/api/recruitingApi"
import {
  CreateRecruitingPostIntro,
  RecruitingPostFormSkeleton,
} from "../../components/skeletons/RecruitingPageSkeletons"
import { PageBusy } from "../../components/metadata/PageReady"
import { HelpLink } from "../../features/help/components/HelpLink"

/**
 * The form's preview and editor use the lazy Markdown chunk: show the form
 * skeleton (and keep the page busy) until it loads, instead of suspending
 * the whole page into the route skeleton.
 */
function FormSuspense(props: { empty?: boolean; children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <>
          <PageBusy />
          <RecruitingPostFormSkeleton empty={props.empty} />
        </>
      }
    >
      {props.children}
    </Suspense>
  )
}

export function CreateRecruitingPostPage() {
  const { t } = useTranslation()

  return (
    <FormPageLayout
      formTitle={t("recruiting_post.page.createPost")}
      title={t("recruiting_post.page.createPost")}
      breadcrumbs={[
        { label: t("recruiting.title", "Recruiting"), href: "/recruiting" },
        { label: t("recruiting_post.page.createPost") },
      ]}
      showOrgInBreadcrumbs={true}
      sidebarOpen={true}
      maxWidth="md"
      headerActions={<HelpLink guide="orgRecruiting" />}
    >
      <CreateRecruitingPostIntro />
      <FormSuspense empty>
        <CreateRecruitingPost />
      </FormSuspense>
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

  return (
    <FormPageLayout
      formTitle={t("recruiting_post.page.updatePost")}
      title={t("recruiting_post.page.updatePost")}
      isLoading={isLoading}
      error={error}
      skeleton={<RecruitingPostFormSkeleton />}
      sidebarOpen={true}
      maxWidth="md"
    >
      {post && (
        <FormSuspense>
          <CreateRecruitingPost post={post} />
        </FormSuspense>
      )}
    </FormPageLayout>
  )
}

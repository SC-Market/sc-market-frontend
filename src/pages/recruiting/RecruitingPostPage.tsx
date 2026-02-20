import React, { lazy } from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { usePageRecruitingPost } from "../../features/recruiting/hooks/usePageRecruitingPost"
import { RecruitingPostContentSkeleton } from "../../features/recruiting/components/RecruitingPostContent.skeleton"

const RecruitingPostContent = lazy(() =>
  import("../../features/recruiting/components/RecruitingPostContent").then(
    (m) => ({ default: m.RecruitingPostContent }),
  ),
)

export function RecruitingPostPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const { t } = useTranslation()
  const pageData = usePageRecruitingPost(post_id!)

  return (
    <DetailPageLayout
      title={pageData.data?.post.title || t("recruiting_post.page.createPost")}
      breadcrumbs={[
        {
          label: t("recruiting.title", "Recruiting"),
          href: "/recruiting",
        },
        {
          label:
            pageData.data?.post.title || t("recruiting_post.page.createPost"),
        },
      ]}
      entityTitle={pageData.data?.post.title}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<RecruitingPostContentSkeleton />}
      sidebarOpen={true}
      maxWidth="md"
    >
      {pageData.data && (
        <LazySection
          component={RecruitingPostContent}
          componentProps={{
            post: pageData.data.post,
            comments: pageData.data.comments,
          }}
          skeleton={RecruitingPostContentSkeleton}
        />
      )}
    </DetailPageLayout>
  )
}

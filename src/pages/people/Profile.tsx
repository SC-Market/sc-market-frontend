import React, { lazy } from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { BannerPageLayout } from "../../components/layout/BannerPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { ProfileSkeleton } from "../../features/profile/components/ProfileSkeleton"
import { usePageUserProfile } from "../../features/profile/hooks/usePageUserProfile"

const ViewProfile = lazy(
  () => import("../../features/profile/components/ViewProfile"),
)

export function Profile() {
  const { t } = useTranslation()
  const { username } = useParams<{ username: string }>()
  const pageData = usePageUserProfile(username!)

  return (
    <BannerPageLayout
      title={
        pageData.data?.user?.display_name
          ? `${pageData.data.user.display_name} - ${t("viewProfile.store_tab")}`
          : t("viewProfile.store_tab")
      }
      breadcrumbs={[
        { label: t("people.title", "People"), href: "/people" },
        {
          label: pageData.data?.user?.display_name || t("viewProfile.loading"),
        },
      ]}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<ProfileSkeleton />}
      sidebarOpen={true}
    >
      {pageData.data && (
        <LazySection
          component={ViewProfile}
          componentProps={{ profile: pageData.data.user }}
          skeleton={ProfileSkeleton}
        />
      )}
    </BannerPageLayout>
  )
}

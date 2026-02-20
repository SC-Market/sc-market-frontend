import React, { lazy } from "react"
import { useTranslation } from "react-i18next"
import { BannerPageLayout } from "../../components/layout/BannerPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { ProfileSkeleton } from "../../features/profile/components/ProfileSkeleton"
import { usePageMyProfile } from "../../features/profile/hooks/usePageMyProfile"

const ViewProfile = lazy(
  () => import("../../features/profile/components/ViewProfile"),
)

export function MyProfile() {
  const { t } = useTranslation()
  const pageData = usePageMyProfile()

  return (
    <BannerPageLayout
      title={t("viewProfile.myProfile")}
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

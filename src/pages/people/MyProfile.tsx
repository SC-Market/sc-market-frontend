import React, { lazy, Suspense } from "react"
import { useTranslation } from "react-i18next"
import { BannerPageLayout } from "../../components/layout/BannerPageLayout"
import { ProfileSkeleton } from "../../features/profile/components/ProfileSkeleton"
import { usePageMyProfile } from "../../features/profile/hooks/usePageMyProfile"

const ViewProfile = lazy(
  () => import("../../features/profile/components/ViewProfile")
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
        <Suspense fallback={<ProfileSkeleton />}>
          <ViewProfile profile={pageData.data.user} />
        </Suspense>
      )}
    </BannerPageLayout>
  )
}

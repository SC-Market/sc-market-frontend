import React, { lazy, Suspense } from "react"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ProfileSkeleton } from "../../features/profile/components/ProfileSkeleton"
import { usePageMyProfile } from "../../features/profile/hooks/usePageMyProfile"

const ViewProfile = lazy(
  () => import("../../features/profile/components/ViewProfile")
)

export function MyProfile() {
  const { t } = useTranslation()
  const pageData = usePageMyProfile()

  return (
    <StandardPageLayout
      title={t("viewProfile.myProfile")}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<ProfileSkeleton />}
      sidebarOpen={true}
      maxWidth={false}
      noMobilePadding={true}
    >
      {pageData.error && <Navigate to={"/"} />}
      {pageData.data && (
        <Suspense fallback={<ProfileSkeleton />}>
          <ViewProfile profile={pageData.data.user} />
        </Suspense>
      )}
    </StandardPageLayout>
  )
}

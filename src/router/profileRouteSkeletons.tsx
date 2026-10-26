import React from "react"
import { useTranslation } from "react-i18next"
import { BannerPageLayout } from "../components/layout/BannerPageLayout"
import { ProfileSkeleton as ProfileContentSkeleton } from "../features/profile/components/ProfileSkeleton"
import { OrgInfoSkeleton } from "../features/contractor/components/OrgInfo"

/**
 * Route-level skeleton for user profile pages: the same BannerPageLayout,
 * breadcrumbs (with their loading label) and content skeleton the Profile
 * page shows while the user loads.
 */
export function ProfileRouteSkeleton() {
  const { t } = useTranslation()
  return (
    <BannerPageLayout
      noFooter
      title={t("viewProfile.store_tab")}
      breadcrumbs={[
        { label: t("people.title", "People"), href: "/people" },
        { label: t("viewProfile.loading") },
      ]}
      sidebarOpen={true}
    >
      <ProfileContentSkeleton />
    </BannerPageLayout>
  )
}

/**
 * Route-level skeleton for org detail pages: the same BannerPageLayout,
 * breadcrumbs and OrgInfoSkeleton ViewOrg shows while the org loads.
 */
export function OrgRouteSkeleton() {
  const { t } = useTranslation()
  return (
    <BannerPageLayout
      noFooter
      title={t("org.orgTitle")}
      breadcrumbs={[
        {
          label: t("contractors.title", "Contractors"),
          href: "/contractors",
        },
        { label: t("org.loading") },
      ]}
      sidebarOpen={true}
    >
      <OrgInfoSkeleton />
    </BannerPageLayout>
  )
}

/** /profile (MyProfile): same frame, no breadcrumbs. */
export function MyProfileRouteSkeleton() {
  const { t } = useTranslation()
  return (
    <BannerPageLayout
      noFooter
      title={t("viewProfile.myProfile")}
      sidebarOpen={true}
    >
      <ProfileContentSkeleton />
    </BannerPageLayout>
  )
}

/** /myorg (MyOrg): same frame, no breadcrumbs. */
export function MyOrgRouteSkeleton() {
  const { t } = useTranslation()
  return (
    <BannerPageLayout noFooter title={t("org.myOrgTitle")} sidebarOpen={true}>
      <OrgInfoSkeleton />
    </BannerPageLayout>
  )
}

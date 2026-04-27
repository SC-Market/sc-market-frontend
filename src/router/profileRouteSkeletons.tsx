import React from "react"
import { BannerPageLayout } from "../components/layout/BannerPageLayout"
import { ProfileSkeleton as ProfileContentSkeleton } from "../features/profile/components/ProfileSkeleton"
import { OrgInfoSkeleton } from "../features/contractor/components/OrgInfo"

/**
 * Route-level skeleton for user profile pages.
 * Wraps the feature ProfileSkeleton in BannerPageLayout for identical header.
 */
export function ProfileRouteSkeleton() {
  return (
    <BannerPageLayout title="Profile" sidebarOpen={true}>
      <ProfileContentSkeleton />
    </BannerPageLayout>
  )
}

/**
 * Route-level skeleton for org detail pages.
 * Wraps OrgInfoSkeleton in BannerPageLayout for identical header.
 */
export function OrgRouteSkeleton() {
  return (
    <BannerPageLayout title="Organization" sidebarOpen={true}>
      <OrgInfoSkeleton />
    </BannerPageLayout>
  )
}

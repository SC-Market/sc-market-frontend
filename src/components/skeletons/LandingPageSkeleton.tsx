import React from "react"
import { LandingPageLayout } from "../landing/LandingPageLayout"
import {
  LandingHeroSkeleton,
  OrderStatisticsSkeleton,
  LandingFeaturesSkeleton,
  LandingOrgFeaturesSkeleton,
  SupportersSectionSkeleton,
  FAQSectionSkeleton,
} from "../landing"
import { RecentListingsSkeleton } from "../landing/RecentListingsSkeleton"
import { Footer } from "../footer/Footer"

/**
 * Skeleton for landing page
 * Uses the same LandingPageLayout and individual component skeletons
 * to ensure consistency between route-level and component-level loading states
 */
export function LandingPageSkeleton() {
  return (
    <LandingPageLayout
      hero={<LandingHeroSkeleton />}
      statistics={<OrderStatisticsSkeleton />}
      recentListings={<RecentListingsSkeleton />}
      features={<LandingFeaturesSkeleton />}
      orgFeatures={<LandingOrgFeaturesSkeleton />}
      supporters={<SupportersSectionSkeleton />}
      faq={<FAQSectionSkeleton />}
      footer={<Footer />}
    />
  )
}

import React from "react"
import { useTheme } from "@mui/material/styles"
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
import { StandardPageLayout } from "../layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"

/**
 * Skeleton for landing page
 * Uses the same StandardPageLayout as LandingPage so the top bar spacer and
 * container structure match, preventing reflow/flash when the real page loads.
 * Uses the same LandingPageLayout and individual component skeletons for content.
 */
export function LandingPageSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <StandardPageLayout
      title="SC Market"
      sidebarOpen={true}
      noFooter={true}
      maxWidth={false}
      ContainerProps={{
        style: {
          position: "relative",
          overflowY: "scroll",
          overflowX: "hidden",
          paddingTop: 20,
          background: `radial-gradient(at 100% 0%, ${theme.palette.primary.main}80 0px, transparent 60%),radial-gradient(at 0% 0%, ${theme.palette.secondary.main}80 0px, transparent 60%)`,
        },
      }}
    >
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
    </StandardPageLayout>
  )
}

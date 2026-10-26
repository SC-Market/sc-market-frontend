import React from "react"
import { useTheme } from "@mui/material/styles"
import { LandingPageLayout } from "../landing/LandingPageLayout"
// Direct imports, not the components/landing barrel, which also re-exports
// the page's lazy-loaded sections.
import { LandingHeroSkeleton } from "../landing/LandingHero.skeleton"
import { OrderStatisticsSkeleton } from "../landing/OrderStatistics.skeleton"
import { LandingFeaturesSkeleton } from "../landing/LandingFeatures.skeleton"
import { LandingOrgFeaturesSkeleton } from "../landing/LandingOrgFeatures.skeleton"
import { SupportersSectionSkeleton } from "../landing/SupportersSection.skeleton"
import { FAQSectionSkeleton } from "../landing/FAQSection.skeleton"
import { RecentListingsSkeleton } from "../landing/RecentListingsSkeleton"
import { Footer } from "../footer/Footer"
import { StandardPageLayout } from "../layout/StandardPageLayout"
import { ExtendedTheme, radialGlowGradient } from "../../hooks/styles/Theme"

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
          background: radialGlowGradient(theme),
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

import React, { lazy, Suspense } from "react"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { Footer } from "../../components/footer/Footer"
import { LandingPageLayout } from "../../components/landing/LandingPageLayout"
import {
  LandingHeroSkeleton,
  OrderStatisticsSkeleton,
  LandingFeaturesSkeleton,
  LandingOrgFeaturesSkeleton,
  SupportersSectionSkeleton,
  FAQSectionSkeleton,
  RecentListings,
} from "../../components/landing"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

// Lazy load content sections
const LandingHero = lazy(() =>
  import("../../components/landing/LandingHero").then((m) => ({
    default: m.LandingHero,
  })),
)
const OrderStatistics = lazy(() =>
  import("../../components/landing/OrderStatistics").then((m) => ({
    default: m.OrderStatistics,
  })),
)
const LandingFeatures = lazy(() =>
  import("../../components/landing/LandingFeatures").then((m) => ({
    default: m.LandingFeatures,
  })),
)
const LandingOrgFeatures = lazy(() =>
  import("../../components/landing/LandingOrgFeatures").then((m) => ({
    default: m.LandingOrgFeatures,
  })),
)
const SupportersSection = lazy(() =>
  import("../../components/landing/SupportersSection").then((m) => ({
    default: m.SupportersSection,
  })),
)
const FAQSection = lazy(() =>
  import("../../components/landing/FAQSection").then((m) => ({
    default: m.FAQSection,
  })),
)

export function LandingPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Handle custom org redirect
  if (CURRENT_CUSTOM_ORG) {
    return <Navigate to={`/contractor/${CURRENT_CUSTOM_ORG}`} />
  }

  return (
    <StandardPageLayout
      title={t("landing.title", "SC Market")}
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
        hero={
          <Suspense fallback={<LandingHeroSkeleton />}>
            <LandingHero />
          </Suspense>
        }
        statistics={
          <Suspense fallback={<OrderStatisticsSkeleton />}>
            <OrderStatistics />
          </Suspense>
        }
        recentListings={<RecentListings />}
        features={
          <Suspense fallback={<LandingFeaturesSkeleton />}>
            <LandingFeatures />
          </Suspense>
        }
        orgFeatures={
          <Suspense fallback={<LandingOrgFeaturesSkeleton />}>
            <LandingOrgFeatures />
          </Suspense>
        }
        supporters={
          <Suspense fallback={<SupportersSectionSkeleton />}>
            <SupportersSection />
          </Suspense>
        }
        faq={
          <Suspense fallback={<FAQSectionSkeleton />}>
            <FAQSection />
          </Suspense>
        }
        footer={<Footer />}
      />
    </StandardPageLayout>
  )
}

export default LandingPage

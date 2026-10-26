import React, { Suspense } from "react"
import {
  useCustomDomain,
  getWhiteLabelConfig,
} from "../../hooks/contractor/CustomDomain"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { Footer } from "../../components/footer/Footer"
import { LandingPageLayout } from "../../components/landing/LandingPageLayout"
// Direct imports, not the components/landing barrel: the barrel also
// re-exports the lazy sections below.
import { LandingHero } from "../../components/landing/LandingHero"
import { OrderStatistics } from "../../components/landing/OrderStatistics"
import { RecentListings } from "../../components/landing/RecentListings"
import { LandingFeaturesSkeleton } from "../../components/landing/LandingFeatures.skeleton"
import { LandingOrgFeaturesSkeleton } from "../../components/landing/LandingOrgFeatures.skeleton"
import { SupportersSectionSkeleton } from "../../components/landing/SupportersSection.skeleton"
import { FAQSectionSkeleton } from "../../components/landing/FAQSection.skeleton"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme, radialGlowGradient } from "../../hooks/styles/Theme"
import { PATHS, ORG_PATHS } from "../../routes/paths"
import { homeSeoText } from "../../seo/siteHeads"
import { lazyWithRetry } from "../../util/lazyWithRetry"
import { safeRedirectPath } from "../../util/safeRedirect"

/*
 * Below the fold: each section is its own chunk, so the homepage's first
 * render only needs the hero, the stats and the recent listings. The
 * fallbacks are the sections' skeletons (the same ones the route skeleton
 * uses), so the page keeps its length while they load.
 */
const LandingFeatures = lazyWithRetry(() =>
  import("../../components/landing/LandingFeatures").then((m) => ({
    default: m.LandingFeatures,
  })),
)
const LandingOrgFeatures = lazyWithRetry(() =>
  import("../../components/landing/LandingOrgFeatures").then((m) => ({
    default: m.LandingOrgFeatures,
  })),
)
const SupportersSection = lazyWithRetry(() =>
  import("../../components/landing/SupportersSection").then((m) => ({
    default: m.SupportersSection,
  })),
)
const FAQSection = lazyWithRetry(() =>
  import("../../components/landing/FAQSection").then((m) => ({
      default: m.FAQSection,
    })),
)

export function LandingPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Handle custom org redirect
  const { customOrg } = useCustomDomain()
  if (customOrg) {
    const config = getWhiteLabelConfig()
    const homepagePath = safeRedirectPath(config?.homepage_path, "")
    if (homepagePath) {
      return <Navigate to={homepagePath} />
    }
    if (config?.focus_mode === "internal") {
      return <Navigate to={PATHS.dashboard} />
    }
    return <Navigate to={ORG_PATHS.profile(customOrg)} />
  }

  const seo = homeSeoText(t)

  return (
    <StandardPageLayout
      title={seo.title}
      description={seo.description}
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
        hero={<LandingHero />}
        statistics={<OrderStatistics />}
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

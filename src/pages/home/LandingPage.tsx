import React from "react"
import { useCustomDomain, getWhiteLabelConfig } from "../../hooks/contractor/CustomDomain"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { Footer } from "../../components/footer/Footer"
import { LandingPageLayout } from "../../components/landing/LandingPageLayout"
import {
  LandingHero,
  OrderStatistics,
  LandingFeatures,
  LandingOrgFeatures,
  SupportersSection,
  FAQSection,
  RecentListings,
} from "../../components/landing"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme, radialGlowGradient } from "../../hooks/styles/Theme"
import { PATHS, ORG_PATHS } from "../../routes/paths"
import { homeSeoText } from "../../seo/siteHeads"

export function LandingPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Handle custom org redirect
  const { customOrg } = useCustomDomain()
  if (customOrg) {
    const config = getWhiteLabelConfig()
    if (config?.homepage_path) {
      return <Navigate to={config.homepage_path} />
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
        features={<LandingFeatures />}
        orgFeatures={<LandingOrgFeatures />}
        supporters={<SupportersSection />}
        faq={<FAQSection />}
        footer={<Footer />}
      />
    </StandardPageLayout>
  )
}

export default LandingPage

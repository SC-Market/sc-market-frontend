import React from "react"
import { CURRENT_CUSTOM_ORG, getWhiteLabelConfig } from "../../hooks/contractor/CustomDomain"
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

export function LandingPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Handle custom org redirect
  if (CURRENT_CUSTOM_ORG) {
    const config = getWhiteLabelConfig()
    if (config?.homepage_path) {
      return <Navigate to={config.homepage_path} />
    }
    if (config?.focus_mode === "internal") {
      return <Navigate to="/dashboard" />
    }
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

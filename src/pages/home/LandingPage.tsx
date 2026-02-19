import React from "react"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
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
import { ExtendedTheme } from "../../hooks/styles/Theme"

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

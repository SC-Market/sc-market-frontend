import React, { lazy } from "react"
import { Box, Container, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { Footer } from "../../components/footer/Footer"
import {
  LandingHeroSkeleton,
  OrderStatisticsSkeleton,
  LandingFeaturesSkeleton,
  LandingOrgFeaturesSkeleton,
  SupportersSectionSkeleton,
  FAQSectionSkeleton,
} from "../../components/landing"
import { RecentListings } from "../../components/landing"

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
      noTopSpacer={true}
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
      <Stack
        direction={"column"}
        sx={{
          maxWidth: "100%",
          paddingBottom: theme.spacing(4),
          paddingTop: theme.spacing(2),
        }}
      >
        {/* Hero Section */}
        <LazySection component={LandingHero} skeleton={LandingHeroSkeleton} />

        <Container>
          <Stack
            spacing={theme.spacing(6)}
            alignItems={"center"}
            justifyContent={"center"}
            direction={"column"}
          >
            {/* Order Statistics */}
            <LazySection
              component={OrderStatistics}
              skeleton={OrderStatisticsSkeleton}
            />

            {/* Recent Listings */}
            <Box
              maxWidth={"100%"}
              sx={{
                overflowX: "scroll",
              }}
            >
              <RecentListings />
            </Box>

            {/* Features Section */}
            <LazySection
              component={LandingFeatures}
              skeleton={LandingFeaturesSkeleton}
            />
          </Stack>
        </Container>

        <Container>
          {/* Org Features Section */}
          <LazySection
            component={LandingOrgFeatures}
            skeleton={LandingOrgFeaturesSkeleton}
          />

          {/* Supporters Section */}
          <LazySection
            component={SupportersSection}
            skeleton={SupportersSectionSkeleton}
          />

          {/* FAQ Section */}
          <LazySection component={FAQSection} skeleton={FAQSectionSkeleton} />
        </Container>

        <Footer />
      </Stack>
    </StandardPageLayout>
  )
}

export default LandingPage

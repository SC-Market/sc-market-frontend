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
// Direct imports, not the components/landing barrel.
import { LandingHero } from "../../components/landing/LandingHero"
import { WantedNowSkeleton } from "../../components/landing/WantedNow.skeleton"
import { TopRatedShopsSkeleton } from "../../components/landing/TopRatedShops.skeleton"
import { StartSelling } from "../../components/landing/StartSelling"
import { LandingGameData } from "../../components/landing/LandingGameData"
import { LandingTrust } from "../../components/landing/LandingTrust"
import { FAQSection } from "../../components/landing/FAQSection"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme, radialGlowGradient } from "../../hooks/styles/Theme"
import { useSession } from "../../hooks/login/useSession"
import { PATHS, ORG_PATHS } from "../../routes/paths"
import { homeSeoText } from "../../seo/siteHeads"
import { lazyWithRetry } from "../../util/lazyWithRetry"
import { safeRedirectPath } from "../../util/safeRedirect"

/*
 * Below the fold, the two data sections are their own chunks (they bring
 * the buy-order and shop cards); their fallbacks are their skeletons, the
 * same size as the loaded sections. The static sections after them are
 * plain markup in this chunk: no skeleton to swap, so nothing to shift, and
 * the page is complete HTML for a later prerender.
 */
const WantedNow = lazyWithRetry(() =>
  import("../../components/landing/WantedNow").then((m) => ({
    default: m.WantedNow,
  })),
)
const TopRatedShops = lazyWithRetry(() =>
  import("../../components/landing/TopRatedShops").then((m) => ({
    default: m.TopRatedShops,
  })),
)

export function LandingPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const session = useSession()
  const signedIn = session.status === "authenticated"

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
        wantedNow={
          <Suspense fallback={<WantedNowSkeleton />}>
            <WantedNow />
          </Suspense>
        }
        topShops={
          <Suspense fallback={<TopRatedShopsSkeleton />}>
            <TopRatedShops />
          </Suspense>
        }
        startSelling={<StartSelling signedIn={signedIn} />}
        gameData={<LandingGameData />}
        trust={<LandingTrust />}
        faq={<FAQSection />}
        footer={<Footer />}
      />
    </StandardPageLayout>
  )
}

export default LandingPage

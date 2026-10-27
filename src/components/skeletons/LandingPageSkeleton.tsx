import React from "react"
import { useTheme } from "@mui/material/styles"
import { LandingPageLayout } from "../landing/LandingPageLayout"
// Direct imports, not the components/landing barrel.
import { LandingHeroSkeleton } from "../landing/LandingHero.skeleton"
import { WantedNowSkeleton } from "../landing/WantedNow.skeleton"
import { TopRatedShopsSkeleton } from "../landing/TopRatedShops.skeleton"
import { StartSelling } from "../landing/StartSelling"
import { LandingGameData } from "../landing/LandingGameData"
import { LandingTrust } from "../landing/LandingTrust"
import { FAQSection } from "../landing/FAQSection"
import { Footer } from "../footer/Footer"
import { StandardPageLayout } from "../layout/StandardPageLayout"
import { ExtendedTheme, radialGlowGradient } from "../../hooks/styles/Theme"
import { useSession } from "../../hooks/login/useSession"

/**
 * Skeleton for the landing page: the same StandardPageLayout and
 * LandingPageLayout as LandingPage, the data sections as their skeletons and
 * the static sections as themselves, so nothing moves when the page loads.
 */
export function LandingPageSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const session = useSession()
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
        wantedNow={<WantedNowSkeleton />}
        topShops={<TopRatedShopsSkeleton />}
        startSelling={
          <StartSelling signedIn={session.status === "authenticated"} />
        }
        gameData={<LandingGameData />}
        trust={<LandingTrust />}
        faq={<FAQSection />}
        footer={<Footer />}
      />
    </StandardPageLayout>
  )
}

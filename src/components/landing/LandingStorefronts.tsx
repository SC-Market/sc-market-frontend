import React from "react"
import { Box, Button, Skeleton } from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useGetStorefrontsQuery } from "../../features/storefront/api/storefrontApi"
import { LandingSection, LandingSectionHeader } from "./LandingSection"
import {
  StorefrontCard,
  STOREFRONT_CARD_HEIGHT,
} from "../../features/storefront/components/StorefrontCard"
import { PATHS } from "../../routes/paths"
import { landingStorefrontsArgs } from "../../features/storefront/domain"

/** The homepage's "Org storefronts" row: featured orgs (landingStorefrontsArgs), ranked by recent trading. */
export function LandingStorefronts() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetStorefrontsQuery(landingStorefrontsArgs())
  const storefronts = data?.storefronts ?? []
  if (!isLoading && storefronts.length === 0) return null
  return (
    <LandingSection
      labelledBy="landing-storefronts-title"
      testId="landing-storefronts"
    >
      <LandingSectionHeader
        id="landing-storefronts-title"
        title={t("storefront.landing.title", "Org storefronts")}
        subtitle={t(
          "storefront.landing.subtitle",
          "Verified orgs' shops, services and recruiting.",
        )}
        actions={
          <Button
            component={Link}
            to={PATHS.storefronts}
            variant="outlined"
            color="neutral"
          >
            {t("landing.seeAll")}
          </Button>
        }
      />
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridAutoFlow: { xs: "column", md: "row" },
          gridAutoColumns: { xs: "min(80vw, 300px)", md: "auto" },
          gridTemplateColumns: { md: "repeat(3, minmax(0, 1fr))" },
          overflowX: { xs: "auto", md: "visible" },
        }}
      >
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={STOREFRONT_CARD_HEIGHT}
              />
            ))
          : storefronts.map((s) => (
              <StorefrontCard key={s.spectrum_id} storefront={s} />
            ))}
      </Box>
    </LandingSection>
  )
}

export default LandingStorefronts

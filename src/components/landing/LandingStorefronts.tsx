import React from "react"
import { Box, Button, Skeleton } from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useGetStorefrontsQuery } from "../../store/api/v2/market"
import { LandingSection, LandingSectionHeader } from "./LandingSection"
import {
  StorefrontCard,
  STOREFRONT_CARD_HEIGHT,
} from "../../features/storefront/components/StorefrontCard"
import { PATHS } from "../../routes/paths"
import { storefrontsHubArgs } from "../../features/storefront/domain"

/** The homepage's "Org storefronts" row: the first 6 of the Storefronts hub's page 1 (same query). */
export const LANDING_STOREFRONTS = 6

export function LandingStorefronts() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetStorefrontsQuery(storefrontsHubArgs())
  const storefronts = (data?.storefronts ?? []).slice(0, LANDING_STOREFRONTS)
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
            color="secondary"
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

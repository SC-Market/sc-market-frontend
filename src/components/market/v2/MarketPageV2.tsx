import React from "react"
import { Page } from "../../../components/metadata/Page"
import { useTranslation } from "react-i18next"
import { ListingSearchV2 } from "./ListingSearchV2"

/**
 * MarketPageV2 - V2 market experience component
 * 
 * Main page for the V2 market system with:
 * - Unified listing model
 * - Variant system with quality tiers
 * - Per-variant pricing
 * - Advanced search and filtering
 */
export function MarketPageV2() {
  const { t } = useTranslation()

  return (
    <Page title={t("market.market")} dontUseDefaultCanonUrl={true}>
      <ListingSearchV2 />
    </Page>
  )
}

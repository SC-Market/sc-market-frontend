import React from "react"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ReceivedOffersArea } from "../../views/offers/ReceivedOffersArea"
import { useTranslation } from "react-i18next"

export function ReceivedOffersPage() {
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("offers.receivedOffers")}
      breadcrumbs={[
        { label: t("offers.dashboard"), href: "/dashboard" },
        { label: t("offers.receivedOffers") },
      ]}
      headerTitle={t("offers.receivedOffers")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <ReceivedOffersArea />
    </StandardPageLayout>
  )
}

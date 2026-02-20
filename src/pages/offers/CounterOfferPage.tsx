import React from "react"
import { useParams } from "react-router-dom"
import { Grid, Skeleton } from "@mui/material"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { OfferDetailSkeleton } from "../../components/skeletons"
import { OfferDetailsEditArea } from "../../views/offers/OfferDetailsEditArea"
import { CounterOfferSubmitArea } from "../../views/offers/CounterOfferSubmitArea"
import { CounterOfferDetailsContext } from "../../hooks/offer/CounterOfferDetails"
import { OfferServiceEditArea } from "../../views/offers/OfferServiceEditArea"
import { OfferMarketListingsEditArea } from "../../views/offers/OfferMarketListingsEditArea"
import { useTranslation } from "react-i18next"
import { usePageCounterOffer } from "../../features/offers/hooks/usePageCounterOffer"

export function CounterOfferPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const pageData = usePageCounterOffer(id)

  return (
    <FormPageLayout
      title={t("offers.viewOffer")}
      breadcrumbs={[
        { label: t("offers.dashboard", "Dashboard"), href: "/dashboard" },
        { label: t("offers.receivedOffers", "Received Offers"), href: "/offers/received" },
        {
          label: `${t("offers.offer", "Offer")} ${(id || "").substring(0, 8).toUpperCase()}`,
          href: `/offer/${id}`,
        },
        { label: t("offers.counterOffer", "Counter Offer") },
      ]}
      formTitle={t("offers.viewOffer")}
      backButton={true}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={
        <>
          <Grid item xs={12} lg={8} md={6}>
            <OfferDetailSkeleton
              showContract={!!pageData.data?.session?.contractor}
              showAssigned={!!pageData.data?.session?.assigned_to}
              showContractLink={!!pageData.data?.session?.contract_id}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton width={"100%"} height={400} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Skeleton width={"100%"} height={400} />
          </Grid>
        </>
      }
      sidebarOpen={true}
      maxWidth="xl"
    >
      {pageData.data && (
        <CounterOfferDetailsContext.Provider
          value={[pageData.data.counterOffer, pageData.data.setCounterOffer]}
        >
          <OfferDetailsEditArea session={pageData.data.session} />
          <OfferServiceEditArea offer={pageData.data.session} />
          <OfferMarketListingsEditArea offer={pageData.data.session} />
          <CounterOfferSubmitArea session={pageData.data.session} />
        </CounterOfferDetailsContext.Provider>
      )}
    </FormPageLayout>
  )
}

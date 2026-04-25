import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  OfferDetailsArea,
  OfferMessagesArea,
} from "../../views/offers/OfferDetailsArea"
import { Grid, Skeleton, Tabs, useMediaQuery, useTheme } from "@mui/material"
import { HapticTab } from "../../components/haptic"
import { OfferDetailSkeleton } from "../../components/skeletons"
import { OfferMarketListingsV2Items } from "../../views/offers/OfferMarketListingsV2Items"
import { OfferMarketListingsV1Items } from "../../views/offers/OfferMarketListingsV1Items"
import { OfferServiceArea } from "../../views/offers/OfferServiceArea"
import { OrderAvailabilityArea } from "../../views/orders/OrderAvailabilityArea"
import { useTranslation } from "react-i18next"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { usePageOffer } from "../../features/offers/hooks/usePageOffer"

export function ViewOfferPage() {
  const { id } = useParams<{ id: string }>()
  const { data, error, isLoading, isFetching } = usePageOffer(id)
  const session = data?.session
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [activeTab, setActiveTab] = useState(0)

  // Redirect to order if offer has an associated order
  useEffect(() => {
    if (session?.order_id) {
      navigate(`/contract/${session.order_id}`, { replace: true })
    }
  }, [session?.order_id, navigate])

  const firstOffer = session?.offers[0]
  const hasV2Listings = (firstOffer?.market_listings_v2?.length ?? 0) > 0
  const hasV1Listings = (firstOffer?.market_listings?.length ?? 0) > 0
  const hasMarketListings = hasV2Listings || hasV1Listings

  return (
    <DetailPageLayout
      title={t("offers.viewOffer")}
      error={error}
      breadcrumbs={[
        { label: t("offers.dashboard", "Dashboard"), href: "/dashboard" },
        {
          label: `${t("offers.offer", "Offer")} ${(id || "").substring(0, 8).toUpperCase()}`,
          href: `/offer/${id}`,
        },
      ]}
      maxWidth="xl"
    >
      {session ? (
        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              marginBottom: 1,
            }}
          >
            <HapticTab label={t("offers.details", "Details")} />
            {isMobile && <HapticTab label={t("offers.messages", "Messages")} />}
            {firstOffer?.service && (
              <HapticTab label={t("offers.service", "Service")} />
            )}
            {hasMarketListings && (
              <HapticTab label={t("offers.marketListings", "Items")} />
            )}
            <HapticTab label={t("offers.availability", "Availability")} />
          </Tabs>
        </Grid>
      ) : null}

      {/* Details Tab */}
      {activeTab === 0 && (
        <>
          {!(isLoading || isFetching) && session ? (
            <OfferDetailsArea session={session} />
          ) : (
            <Grid item xs={12} lg={8} md={6}>
              <OfferDetailSkeleton
                showContract={!!session?.contractor}
                showAssigned={!!session?.assigned_to}
                showContractLink={!!session?.contract_id}
              />
            </Grid>
          )}
          {!isMobile && (
            <>
              {session ? (
                <OfferMessagesArea session={session} />
              ) : (
                <Grid item xs={12} lg={4} md={6}>
                  <Skeleton width={"100%"} height={400} />
                </Grid>
              )}
            </>
          )}
        </>
      )}

      {/* Dynamic tabs */}
      {(() => {
        if (isLoading || isFetching || !session) return null

        let tabIndex = 0
        tabIndex++ // details
        const messagesTab = isMobile ? tabIndex++ : -1
        const serviceTab = firstOffer?.service ? tabIndex++ : -1
        const marketListingsTab = hasMarketListings ? tabIndex++ : -1
        const availabilityTab = tabIndex++

        return (
          <>
            {isMobile && activeTab === messagesTab && (
              <OfferMessagesArea session={session} />
            )}

            {firstOffer?.service && activeTab === serviceTab && (
              <OfferServiceArea session={session} />
            )}

            {hasMarketListings && activeTab === marketListingsTab && (
              hasV2Listings
                ? <OfferMarketListingsV2Items items={firstOffer!.market_listings_v2} />
                : <OfferMarketListingsV1Items items={firstOffer!.market_listings} />
            )}

            {activeTab === availabilityTab && (
              <OrderAvailabilityArea session={session} />
            )}
          </>
        )
      })()}
    </DetailPageLayout>
  )
}

export default ViewOfferPage

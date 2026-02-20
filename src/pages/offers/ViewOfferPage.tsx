import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  OfferDetailsArea,
  OfferMessagesArea,
} from "../../views/offers/OfferDetailsArea"
import { Grid, Skeleton, Tabs, useMediaQuery, useTheme } from "@mui/material"
import { HapticTab } from "../../components/haptic"
import { OfferDetailSkeleton } from "../../components/skeletons"
import { OfferMarketListings } from "../../views/offers/OfferMarketListings"
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
            {session.offers[0]?.service && (
              <HapticTab label={t("offers.service", "Service")} />
            )}
            {session.offers[0]?.market_listings &&
              session.offers[0].market_listings.length > 0 && (
                <HapticTab
                  label={t("offers.marketListings", "Market Listings")}
                />
              )}
            {session.availability && (
              <HapticTab label={t("offers.availability", "Availability")} />
            )}
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
          {/* Messages on desktop in details tab */}
          {!isMobile && (
            <>
              {session ? (
                <OfferMessagesArea offer={session} />
              ) : (
                <Grid item xs={12} lg={4} md={6}>
                  <Skeleton width={"100%"} height={400} />
                </Grid>
              )}
            </>
          )}
        </>
      )}

      {/* Calculate tab indices dynamically */}
      {(() => {
        if (isLoading || isFetching || !session) return null

        let tabIndex = 0
        const detailsTab = tabIndex++
        const messagesTab = isMobile ? tabIndex++ : -1
        const serviceTab = session.offers[0]?.service ? tabIndex++ : -1
        const marketListingsTab =
          session.offers[0]?.market_listings &&
          session.offers[0].market_listings.length > 0
            ? tabIndex++
            : -1
        const availabilityTab = session.availability ? tabIndex++ : -1

        return (
          <>
            {/* Messages Tab - mobile only */}
            {isMobile && activeTab === messagesTab && (
              <>
                {session ? (
                  <OfferMessagesArea offer={session} />
                ) : (
                  <Grid item xs={12} lg={4} md={6}>
                    <Skeleton width={"100%"} height={400} />
                  </Grid>
                )}
              </>
            )}

            {/* Service Tab */}
            {session.offers[0]?.service && activeTab === serviceTab && (
              <>
                {session ? (
                  <OfferServiceArea offer={session} />
                ) : (
                  <Grid item xs={12} lg={4}>
                    <Skeleton width={"100%"} height={400} />
                  </Grid>
                )}
              </>
            )}

            {/* Market Listings Tab */}
            {session.offers[0]?.market_listings &&
              session.offers[0].market_listings.length > 0 &&
              activeTab === marketListingsTab && (
                <>
                  {session ? (
                    <OfferMarketListings offer={session} />
                  ) : (
                    <Grid item xs={12} lg={4}>
                      <Skeleton width={"100%"} height={400} />
                    </Grid>
                  )}
                </>
              )}

            {/* Availability Tab */}
            {session.availability && activeTab === availabilityTab && (
              <OrderAvailabilityArea order={session} />
            )}
          </>
        )
      })()}
    </DetailPageLayout>
  )
}

export default ViewOfferPage

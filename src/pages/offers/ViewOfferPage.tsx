import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  OfferDetailsArea,
  OfferMessagesArea,
} from "../../views/offers/OfferDetailsArea"
import { Grid, Skeleton, Tabs, useMediaQuery, useTheme, FormControl, InputLabel, Select, MenuItem, Stack } from "@mui/material"
import { HapticTab } from "../../components/haptic"
import { OfferDetailSkeleton } from "../../components/skeletons"
import { OfferMarketListingsV2Items } from "../../views/offers/OfferMarketListingsV2Items"
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
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0)

  useEffect(() => {
    if (session?.order_id) {
      navigate(`/contract/${session.order_id}`, { replace: true })
    }
  }, [session?.order_id, navigate])

  const selectedOffer = session?.offers[selectedOfferIndex]
  const hasV2Listings = (selectedOffer?.market_listings_v2?.length ?? 0) > 0
  const hasV1Listings = (selectedOffer?.market_listings?.length ?? 0) > 0
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
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: "divider", flex: 1 }}
            >
              <HapticTab label={t("offers.details", "Details")} />
              {isMobile && <HapticTab label={t("offers.messages", "Messages")} />}
              {selectedOffer?.service && (
                <HapticTab label={t("offers.service", "Service")} />
              )}
              {hasMarketListings && (
                <HapticTab label={t("offers.marketListings", "Items")} />
              )}
              <HapticTab label={t("offers.availability", "Availability")} />
            </Tabs>
            {session.offers.length > 1 && (
              <FormControl size="small" sx={{ minWidth: 160, ml: 2 }}>
                <InputLabel>Version</InputLabel>
                <Select
                  value={selectedOfferIndex}
                  label="Version"
                  onChange={(e) => setSelectedOfferIndex(Number(e.target.value))}
                >
                  {session.offers.map((_, index) => (
                    <MenuItem key={index} value={index}>
                      {index === 0 ? "Most Recent" : `Offer ${session.offers.length - index}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Grid>
      ) : null}

      {/* Details Tab */}
      {activeTab === 0 && (
        <>
          {!(isLoading || isFetching) && session ? (
            <OfferDetailsArea session={session} selectedOfferIndex={selectedOfferIndex} />
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
        const serviceTab = selectedOffer?.service ? tabIndex++ : -1
        const marketListingsTab = hasMarketListings ? tabIndex++ : -1
        const availabilityTab = tabIndex++

        return (
          <>
            {isMobile && activeTab === messagesTab && (
              <OfferMessagesArea session={session} />
            )}

            {selectedOffer?.service && activeTab === serviceTab && (
              <OfferServiceArea session={session} />
            )}

            {hasMarketListings && activeTab === marketListingsTab && (
              hasV2Listings
                ? <OfferMarketListingsV2Items items={selectedOffer!.market_listings_v2} />
                : <OfferMarketListingsV2Items items={selectedOffer!.market_listings.map((ml) => ({
                    listing_id: ml.listing_id,
                    quantity: ml.quantity,
                    title: ml.title,
                    price: ml.price,
                    v2_variants: [],
                  }))} />
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

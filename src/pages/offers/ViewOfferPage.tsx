import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import React, { useEffect, useState } from "react"
import { useGetOfferSessionByIDQuery } from "../../store/offer"
import { Link, useParams, useNavigate, Navigate } from "react-router-dom"
import {
  OfferDetailsArea,
  OfferMessagesArea,
} from "../../views/offers/OfferDetailsArea"
import {
  Breadcrumbs,
  Grid,
  Link as MaterialLink,
  Skeleton,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { OfferDetailSkeleton } from "../../components/skeletons"
import { OfferMarketListings } from "../../views/offers/OfferMarketListings"
import { OfferServiceArea } from "../../views/offers/OfferServiceArea"
import { OrderAvailabilityArea } from "../../views/orders/OrderAvailabilityArea"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../store/notification"

export function ViewOfferPage() {
  const { id } = useParams<{ id: string }>()
  const {
    data: session,
    error,
    isLoading,
    isFetching,
  } = useGetOfferSessionByIDQuery(id!)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [activeTab, setActiveTab] = useState(0)

  // Get and delete message notifications for this offer
  const { data: notificationsData } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "offer_message",
    entityId: id,
  })
  const notifications = notificationsData?.notifications || []
  const [deleteNotification] = useNotificationDeleteMutation()

  // Delete message notifications when the page is viewed
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const notificationIds = notifications.map((n) => n.notification_id)
      deleteNotification(notificationIds)
    }
  }, [notifications, deleteNotification])

  // Redirect to order if offer has an associated order
  useEffect(() => {
    if (session?.order_id) {
      navigate(`/contract/${session.order_id}`, { replace: true })
    }
  }, [session?.order_id, navigate])

  return (
    <Page title={t("offers.viewOffer")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <Grid item xs={12}>
          <Breadcrumbs>
            <MaterialLink
              component={Link}
              to={"/dashboard"}
              underline="hover"
              color={"text.primary"}
            >
              {t("offers.dashboard")}
            </MaterialLink>
            <MaterialLink
              component={Link}
              to={`/offer/${id}`}
              underline="hover"
              color={"text.secondary"}
            >
              {t("offers.offer")} {(id || "").substring(0, 8).toUpperCase()}
            </MaterialLink>
          </Breadcrumbs>
        </Grid>

        <HeaderTitle lg={12} xl={12}>
          {t("offers.viewOffer")}
        </HeaderTitle>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}

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
              <Tab label={t("offers.details", "Details")} />
              {isMobile && <Tab label={t("offers.messages", "Messages")} />}
              {session.offers[0]?.service && (
                <Tab label={t("offers.service", "Service")} />
              )}
              {session.offers[0]?.market_listings &&
                session.offers[0].market_listings.length > 0 && (
                  <Tab label={t("offers.marketListings", "Market Listings")} />
                )}
              {session.availability && (
                <Tab label={t("offers.availability", "Availability")} />
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
      </ContainerGrid>
    </Page>
  )
}

export default ViewOfferPage

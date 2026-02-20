import { useParams, useNavigate } from "react-router-dom"
import React, { useMemo, useState, lazy } from "react"
import {
  Grid,
  Skeleton,
  Stack,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { HapticTab } from "../../components/haptic"
import { OrderDetailSkeleton } from "../../components/skeletons"
import { useGetUserProfileQuery } from "../../store/profile"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { has_permission } from "../../views/contractor/OrgRoles"
import { useTranslation } from "react-i18next"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { usePageOrder } from "../../features/contracting"

// Lazy load content sections
const OrderDetailsArea = lazy(() =>
  import("../../views/orders/OrderDetailsArea").then((module) => ({
    default: module.OrderDetailsArea,
  })),
)
const OrderMessagesArea = lazy(() =>
  import("../../views/orders/OrderDetailsArea").then((module) => ({
    default: module.OrderMessagesArea,
  })),
)
const OrderReviewArea = lazy(() =>
  import("../../views/orders/OrderReviewArea").then((module) => ({
    default: module.OrderReviewArea,
  })),
)
const OrderReviewView = lazy(() =>
  import("../../views/orders/OrderReviewView").then((module) => ({
    default: module.OrderReviewView,
  })),
)
const OfferMarketListings = lazy(() =>
  import("../../views/offers/OfferMarketListings").then((module) => ({
    default: module.OfferMarketListings,
  })),
)
const OfferServiceArea = lazy(() =>
  import("../../views/offers/OfferServiceArea").then((module) => ({
    default: module.OfferServiceArea,
  })),
)
const SplitAllocationView = lazy(() =>
  import("../../features/market/components/allocation").then((module) => ({
    default: module.SplitAllocationView,
  })),
)
const OrderAvailabilityArea = lazy(() =>
  import("../../views/orders/OrderAvailabilityArea").then((module) => ({
    default: module.OrderAvailabilityArea,
  })),
)

export function ViewOrder() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [activeTab, setActiveTab] = useState(0)
  const navigate = useNavigate()

  const pageData = usePageOrder(id!)
  const order = pageData.data?.order
  const chatObj = pageData.data?.chat
  const session = pageData.data?.offerSession

  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  const amCustomer = useMemo(
    () => !!profile && order?.customer === profile?.username,
    [order, profile],
  )
  const amAssigned = useMemo(
    () => order && order.assigned_to === profile?.username,
    [order, profile],
  )
  const amContractor = useMemo(
    () => currentOrg?.spectrum_id === order?.contractor,
    [currentOrg?.spectrum_id, order?.contractor],
  )
  const amRelated = useMemo(
    () => amCustomer || amAssigned || amContractor,
    [amCustomer, amAssigned, amContractor],
  )

  const amContractorManager = useMemo(
    () =>
      amContractor &&
      has_permission(
        currentOrg,
        profile,
        "manage_orders",
        profile?.contractors,
      ),
    [currentOrg, profile, amContractor],
  )

  const isAssigned = useMemo(() => {
    if (!order) {
      return false
    }

    return !!(order.contractor || order.assigned_to)
  }, [order])

  const displayApply = useMemo(() => {
    if (!order) {
      return false
    }

    return (
      profile &&
      !(order.contractor || order.assigned_to) &&
      order.status === "not-started"
    )
  }, [order, profile])

  const displayApplicants = useMemo(() => {
    if (!order) {
      return false
    }

    return (
      amCustomer &&
      !order.assigned_to &&
      !order.contractor &&
      order.status === "not-started"
    )
  }, [amCustomer, order])

  return (
    <DetailPageLayout
      title={
        order?.title
          ? order.title
          : order?.order_id
            ? `Order ${order.order_id.substring(0, 8).toUpperCase()}`
            : "Order"
      }
      breadcrumbs={[
        { label: t("dashboard.title", "Dashboard"), href: "/dashboard" },
        ...(order?.offer_session_id
          ? [
              {
                label: t("orders.offerShort", {
                  id: order.offer_session_id.substring(0, 8).toUpperCase(),
                }),
                href: `/offer/${order.offer_session_id}`,
              },
            ]
          : []),
        {
          label: order?.title || `Order ${id?.substring(0, 8).toUpperCase()}`,
        },
      ]}
      entityTitle={order?.title || `Order ${id?.substring(0, 8).toUpperCase()}`}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<OrderDetailSkeleton showContractor showAssigned />}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {order && (
        <>
          <Grid item xs={12}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => {
                // Calculate messages tab index
                let tabIndex = 0
                const detailsTab = tabIndex++
                const messagesTab = isMobile && isAssigned ? tabIndex++ : -1

                // If clicking messages tab on mobile, navigate to chat
                if (isMobile && newValue === messagesTab && chatObj?.chat_id) {
                  navigate(`/messages/${chatObj.chat_id}`)
                  return
                }

                setActiveTab(newValue)
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                marginBottom: 1,
              }}
            >
              <HapticTab label={t("orders.details", "Details")} />
              {isMobile && isAssigned && (
                <HapticTab label={t("orders.messages", "Messages")} />
              )}
              {session?.offers[0]?.service && (
                <HapticTab label={t("orders.service", "Service")} />
              )}
              {session?.offers[0]?.market_listings &&
                session.offers[0].market_listings.length > 0 && (
                  <HapticTab
                    label={t("orders.marketListings", "Market Listings")}
                  />
                )}
              {amContractorManager && (
                <HapticTab label={t("orders.allocation", "Stock Allocation")} />
              )}
              {amRelated && (
                <HapticTab label={t("orders.availability", "Availability")} />
              )}
            </Tabs>
          </Grid>

          {/* Calculate tab indices */}
          {(() => {
            let tabIndex = 0
            const detailsTab = tabIndex++
            const messagesTab = isMobile && isAssigned ? tabIndex++ : -1
            const serviceTab = session?.offers[0]?.service ? tabIndex++ : -1
            const marketListingsTab =
              session?.offers[0]?.market_listings &&
              session.offers[0].market_listings.length > 0
                ? tabIndex++
                : -1
            const allocationTab = amContractorManager ? tabIndex++ : -1
            const availabilityTab = amRelated ? tabIndex++ : -1

            return (
              <>
                {/* Details Tab */}
                {activeTab === detailsTab && (
                  <>
                    {!(pageData.isLoading || pageData.isFetching) && order ? (
                      <OrderDetailsArea order={order} />
                    ) : (
                      <Grid item xs={12} lg={8} md={6}>
                        <OrderDetailSkeleton showContractor showAssigned />
                      </Grid>
                    )}
                    {/* Right column: Messages and Reviews on desktop */}
                    {!isMobile && (
                      <Grid item xs={12} lg={4} md={6}>
                        <Stack spacing={2}>
                          {isAssigned &&
                            (!(pageData.isLoading || pageData.isFetching) &&
                            order ? (
                              <OrderMessagesArea order={order} />
                            ) : (
                              <Skeleton width={"100%"} height={400} />
                            ))}
                          {order && (
                            <>
                              {amCustomer && !order.customer_review && (
                                <OrderReviewArea asCustomer order={order} />
                              )}
                              {(amContractorManager || amAssigned) &&
                                !order.contractor_review && (
                                  <OrderReviewArea asContractor order={order} />
                                )}
                              {order.customer_review && (
                                <OrderReviewView customer order={order} />
                              )}
                              {order.contractor_review && (
                                <OrderReviewView contractor order={order} />
                              )}
                            </>
                          )}
                        </Stack>
                      </Grid>
                    )}
                    {/* Reviews on mobile */}
                    {isMobile && order && (
                      <>
                        {amCustomer && !order.customer_review && (
                          <OrderReviewArea asCustomer order={order} />
                        )}
                        {(amContractorManager || amAssigned) &&
                          !order.contractor_review && (
                            <OrderReviewArea asContractor order={order} />
                          )}
                        {order.customer_review && (
                          <OrderReviewView customer order={order} />
                        )}
                        {order.contractor_review && (
                          <OrderReviewView contractor order={order} />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Messages Tab - mobile only */}
                {isMobile && activeTab === messagesTab && (
                  <>
                    {!(pageData.isLoading || pageData.isFetching) && order ? (
                      isAssigned ? (
                        <Grid item xs={12}>
                          <OrderMessagesArea order={order} />
                        </Grid>
                      ) : null
                    ) : (
                      <Grid item xs={12} lg={4} md={6}>
                        <Skeleton width={"100%"} height={400} />
                      </Grid>
                    )}
                  </>
                )}

                {/* Service Tab */}
                {session?.offers[0]?.service &&
                  activeTab === serviceTab &&
                  (!(pageData.isLoading || pageData.isFetching) && session ? (
                    <Grid item xs={12}>
                      <OfferServiceArea offer={session} />
                    </Grid>
                  ) : (
                    <Grid item xs={12} lg={4}>
                      <Skeleton width={"100%"} height={400} />
                    </Grid>
                  ))}

                {/* Market Listings Tab */}
                {session?.offers[0]?.market_listings &&
                  session.offers[0].market_listings.length > 0 &&
                  activeTab === marketListingsTab &&
                  (!(pageData.isLoading || pageData.isFetching) && session ? (
                    <Grid item xs={12}>
                      <OfferMarketListings offer={session} />
                    </Grid>
                  ) : (
                    <Grid item xs={12} lg={4}>
                      <Skeleton width={"100%"} height={400} />
                    </Grid>
                  ))}

                {/* Stock Allocation Tab */}
                {amContractorManager &&
                  order &&
                  activeTab === allocationTab && (
                    <Grid item xs={12}>
                      <SplitAllocationView
                        orderId={order.order_id}
                        listings={
                          order.market_listings?.map((listing: any) => ({
                            listing_id:
                              typeof listing.listing_id === "string"
                                ? listing.listing_id
                                : listing.listing_id?.listing_id,
                            quantity: listing.quantity,
                          })) || []
                        }
                      />
                    </Grid>
                  )}

                {/* Availability Tab */}
                {amRelated && order && activeTab === availabilityTab && (
                  <Grid item xs={12}>
                    <OrderAvailabilityArea order={order} />
                  </Grid>
                )}
              </>
            )
          })()}
        </>
      )}
    </DetailPageLayout>
  )
}

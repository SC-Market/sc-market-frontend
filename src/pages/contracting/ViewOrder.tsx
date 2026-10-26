import { useParams, useNavigate } from "react-router-dom"
import React, { useMemo, useState } from "react"
import {
  Grid,
  Skeleton,
  Stack,
  Tabs,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { HapticTab } from "../../components/haptic"
import { OrderDetailSkeleton } from "../../components/skeletons"
import { OrderPageBodySkeleton } from "../../components/skeletons/AccountPageSkeletons"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useGetOrderDetailQuery } from "../../store/api/v2/market"
import { has_permission } from "../../views/contractor/OrgRoles"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { useTranslation } from "react-i18next"
import { DetailPageLayout } from "../../components/layout/DetailPageLayout"
import { usePageOrder } from "../../features/contracting"
import { PATHS, ORDER_PATHS } from "../../routes/paths"
import { HelpLink } from "../../features/help/components/HelpLink"
import { lazyWithRetry } from "../../util/lazyWithRetry"

// Lazy load content sections
const OrderDetailsArea = lazyWithRetry(() =>
  import("../../views/orders/OrderDetailsArea").then((module) => ({
    default: module.OrderDetailsArea,
  })),
)
const OrderMessagesArea = lazyWithRetry(() =>
  import("../../views/orders/OrderDetailsArea").then((module) => ({
    default: module.OrderMessagesArea,
  })),
)
const OrderReviewArea = lazyWithRetry(() =>
  import("../../views/orders/OrderReviewArea").then((module) => ({
    default: module.OrderReviewArea,
  })),
)
const OrderReviewView = lazyWithRetry(() =>
  import("../../views/orders/OrderReviewView").then((module) => ({
    default: module.OrderReviewView,
  })),
)
const OfferMarketListingsV2Items = lazyWithRetry(() =>
  import("../../views/offers/OfferMarketListingsV2Items").then((module) => ({
    default: module.OfferMarketListingsV2Items,
  })),
)
const OfferServiceArea = lazyWithRetry(() =>
  import("../../views/offers/OfferServiceArea").then((module) => ({
    default: module.OfferServiceArea,
  })),
)
const SplitAllocationView = lazyWithRetry(() =>
  import("../../features/market/components/allocation").then((module) => ({
    default: module.SplitAllocationView,
  })),
)
const OrderAvailabilityArea = lazyWithRetry(() =>
  import("../../views/orders/OrderAvailabilityArea").then((module) => ({
    default: module.OrderAvailabilityArea,
  })),
)

export function ViewOrder() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState(0)
  const navigate = useNavigate()

  const pageData = usePageOrder(id!)
  const order = pageData.data?.order
  const chatObj = pageData.data?.chat
  const session = pageData.data?.offerSession

  const { data: orderDetailV2, isLoading: orderDetailV2Loading } = useGetOrderDetailQuery({ orderId: id! }, { skip: !id })
  const { data: profile } = useGetUserProfileQuery()

  const belongsToOrderOrg = useMemo(
    () => !!order?.contractor && !!profile?.contractors?.some(c => c.spectrum_id === order.contractor),
    [order?.contractor, profile?.contractors],
  )
  const { data: orderContractor } = useGetContractorBySpectrumIDQuery(
    order?.contractor!,
    { skip: !order?.contractor || !belongsToOrderOrg },
  )

  const amCustomer = useMemo(
    () => !!profile && order?.customer === profile?.username,
    [order, profile],
  )
  const amAssigned = useMemo(
    () => order && order.assigned_to === profile?.username,
    [order, profile],
  )
  const amContractor = useMemo(
    () => belongsToOrderOrg,
    [belongsToOrderOrg],
  )
  const amRelated = useMemo(
    () => amCustomer || amAssigned || amContractor,
    [amCustomer, amAssigned, amContractor],
  )

  const amContractorManager = useMemo(
    () =>
      amContractor &&
      !!orderContractor &&
      has_permission(
        orderContractor,
        profile,
        "manage_orders",
        profile?.contractors,
      ),
    [orderContractor, profile, amContractor],
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
      headerActions={<HelpLink guide="howOrdersWork" />}
      title={
        order?.title
          ? order.title
          : order?.order_id
            ? `Order ${order.order_id.substring(0, 8).toUpperCase()}`
            : "Order"
      }
      breadcrumbs={[
        { label: t("dashboard.title", "Dashboard"), href: PATHS.dashboard },
        ...(order?.offer_session_id
          ? [
              {
                label: t("orders.offerShort", {
                  id: order.offer_session_id.substring(0, 8).toUpperCase(),
                }),
                href: ORDER_PATHS.offer(order.offer_session_id),
              },
            ]
          : []),
        {
          label: order?.title || `Order ${id?.substring(0, 8).toUpperCase()}`,
        },
      ]}
      showOrgInBreadcrumbs={true}
      entityTitle={order?.title || `Order ${id?.substring(0, 8).toUpperCase()}`}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={<OrderPageBodySkeleton />}
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
              {((session?.offers[0]?.market_listings &&
                session.offers[0].market_listings.length > 0) ||
                (orderDetailV2?.market_listings_v2 && orderDetailV2.market_listings_v2.length > 0)) && (
                  <HapticTab
                    label={t("orders.marketListings", "Items")}
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
            const hasItems =
              (session?.offers[0]?.market_listings &&
              session.offers[0].market_listings.length > 0) ||
              (orderDetailV2?.market_listings_v2 && orderDetailV2.market_listings_v2.length > 0)
            const marketListingsTab = hasItems ? tabIndex++ : -1
            const allocationTab = amContractorManager ? tabIndex++ : -1
            const availabilityTab = amRelated ? tabIndex++ : -1

            return (
              <>
                {/* Details Tab */}
                {activeTab === detailsTab && (
                  <>
                    {/* Gate on data, not isFetching: a background refetch
                        (e.g. after the message notifications are cleared)
                        must keep the loaded details on screen. */}
                    {order ? (
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
                            (order ? (
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
                    {order ? (
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
                  (session ? (
                    <Grid item xs={12}>
                      <OfferServiceArea offer={session} />
                    </Grid>
                  ) : (
                    <Grid item xs={12} lg={4}>
                      <Skeleton width={"100%"} height={400} />
                    </Grid>
                  ))}

                {/* Market Listings / Items Tab */}
                {hasItems &&
                  activeTab === marketListingsTab &&
                  (!orderDetailV2Loading ? (
                    <Grid item xs={12}>
                      {orderDetailV2?.market_listings_v2 && orderDetailV2.market_listings_v2.length > 0 && (
                        <OfferMarketListingsV2Items items={orderDetailV2.market_listings_v2} />
                      )}
                    </Grid>
                  ) : (
                    <Grid item xs={12} lg={4}>
                      <Skeleton width={"100%"} height={400} />
                    </Grid>
                  ))}

                {/* Stock Allocation Tab */}
                {amContractorManager &&
                  order?.contractor &&
                  activeTab === allocationTab && (
                    <Grid item xs={12}>
                      <SplitAllocationView
                        orderId={order.order_id}
                        spectrumId={order.contractor}
                        listings={
                          // Use V2 order items if available, fall back to V1
                          (orderDetailV2?.items?.length
                            ? orderDetailV2.items.map((item) => ({
                                listing_id: item.listing_id,
                                quantity: item.quantity,
                              }))
                            : order.market_listings?.map((listing: { listing_id: string | { listing_id: string }; quantity: number }) => ({
                                listing_id:
                                  typeof listing.listing_id === "string"
                                    ? listing.listing_id
                                    : listing.listing_id?.listing_id,
                                quantity: listing.quantity,
                              }))) || []
                        }
                      />
                    </Grid>
                  )}

                {/* Availability Tab */}
                {amRelated && order && activeTab === availabilityTab && (
                  <>
                    <Grid item xs={12} lg={isAssigned ? 8 : 12}>
                      <OrderAvailabilityArea order={order} />
                    </Grid>
                    {isAssigned && (
                      <Grid item xs={12} lg={4}>
                        <OrderMessagesArea order={order} />
                      </Grid>
                    )}
                  </>
                )}
              </>
            )
          })()}
        </>
      )}
    </DetailPageLayout>
  )
}

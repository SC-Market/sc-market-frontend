import { Link, Navigate, useParams } from "react-router-dom"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React, { useMemo, useEffect, useState } from "react"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useGetOrderByIdQuery } from "../../store/orders"
import { Page } from "../../components/metadata/Page"
import { BackArrow } from "../../components/button/BackArrow"
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
import { OrderDetailSkeleton } from "../../components/skeletons"
import {
  OrderDetailsArea,
  OrderMessagesArea,
} from "../../views/orders/OrderDetailsArea"
import { useGetUserProfileQuery } from "../../store/profile"
import { OrderAvailabilityArea } from "../../views/orders/OrderAvailabilityArea"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { MemberAssignArea } from "../../views/orders/MemberAssignArea"
import { has_permission } from "../../views/contractor/OrgRoles"
import { OrderReviewArea } from "../../views/orders/OrderReviewArea"
import { OrderReviewView } from "../../views/orders/OrderReviewView"
import { useGetOfferSessionByIDQuery } from "../../store/offer"
import { OfferMarketListings } from "../../views/offers/OfferMarketListings"
import { OfferServiceArea } from "../../views/offers/OfferServiceArea"
import { OrderAllocationView } from "../../features/market/components/allocation"
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

export function ViewOrder() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [activeTab, setActiveTab] = useState(0)

  const {
    data: order,
    error,
    isLoading,
    isFetching,
  } = useGetOrderByIdQuery(id!)
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  // Get and delete message notifications for this order
  const { data: notificationsData } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "order_message",
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

  const { data: session } = useGetOfferSessionByIDQuery(
    order?.offer_session_id!,
    { skip: !order?.offer_session_id },
  )

  return (
    <Page
      title={
        order?.title
          ? order.title
          : order?.order_id
            ? `Order ${order.order_id.substring(0, 8).toUpperCase()}`
            : "Order"
      }
    >
      <ContainerGrid sidebarOpen={true} maxWidth={"xl"}>
        <Grid item xs={12}>
          <Breadcrumbs>
            <MaterialLink
              component={Link}
              to={"/dashboard"}
              underline="hover"
              color={"text.primary"}
            >
              {t("dashboard.title")}
            </MaterialLink>
            {order?.offer_session_id && (
              <MaterialLink
                component={Link}
                to={`/offer/${order?.offer_session_id}`}
                underline="hover"
                color={"text.secondary"}
              >
                {t("orders.offerShort", {
                  id: (order?.offer_session_id || "")
                    .substring(0, 8)
                    .toUpperCase(),
                })}
              </MaterialLink>
            )}

            <MaterialLink
              component={Link}
              to={`/contracts/${id}`}
              underline="hover"
              color={"text.secondary"}
            >
              {t("orders.orderShort", {
                id: (id || "").substring(0, 8).toUpperCase(),
              })}
            </MaterialLink>
          </Breadcrumbs>
        </Grid>

        <HeaderTitle lg={12} xl={12}>
          <BackArrow />{" "}
          {order?.title || `Order ${id?.substring(0, 8).toUpperCase()}`}
        </HeaderTitle>

        {shouldRedirectTo404(error) ? <Navigate to={"/404"} /> : null}
        {shouldShowErrorPage(error) ? <ErrorPage /> : null}

        {order ? (
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
              <Tab label={t("orders.details", "Details")} />
              {isMobile && isAssigned && (
                <Tab label={t("orders.messages", "Messages")} />
              )}
              {session?.offers[0]?.service && (
                <Tab label={t("orders.service", "Service")} />
              )}
              {session?.offers[0]?.market_listings &&
                session.offers[0].market_listings.length > 0 && (
                  <Tab label={t("orders.marketListings", "Market Listings")} />
                )}
              {((order && amCustomer && !order.customer_review) ||
                (order &&
                  (amContractorManager || amAssigned) &&
                  !order.contractor_review) ||
                order?.customer_review ||
                order?.contractor_review) && (
                <Tab label={t("orders.reviews", "Reviews")} />
              )}
              {amContractorManager && (
                <Tab label={t("orders.allocation", "Stock Allocation")} />
              )}
              {amRelated && (
                <Tab label={t("orders.availability", "Availability")} />
              )}
            </Tabs>
          </Grid>
        ) : null}

        {/* Calculate tab indices */}
        {(() => {
          if (!order) return null

          let tabIndex = 0
          const detailsTab = tabIndex++
          const messagesTab = isAssigned ? tabIndex++ : -1
          const serviceTab = session?.offers[0]?.service ? tabIndex++ : -1
          const marketListingsTab =
            session?.offers[0]?.market_listings &&
            session.offers[0].market_listings.length > 0
              ? tabIndex++
              : -1
          const reviewsTab =
            (order && amCustomer && !order.customer_review) ||
            (order &&
              (amContractorManager || amAssigned) &&
              !order.contractor_review) ||
            order?.customer_review ||
            order?.contractor_review
              ? tabIndex++
              : -1
          const allocationTab = amContractorManager ? tabIndex++ : -1
          const availabilityTab = amRelated ? tabIndex++ : -1

          return (
            <>
              {/* Details Tab */}
              {activeTab === detailsTab && (
                <>
                  {!(isLoading || isFetching) && order ? (
                    <OrderDetailsArea order={order} />
                  ) : (
                    <Grid item xs={12} lg={8} md={6}>
                      <OrderDetailSkeleton showContractor showAssigned />
                    </Grid>
                  )}
                  {/* Messages on desktop in details tab */}
                  {!isMobile && isAssigned && (
                    <>
                      {!(isLoading || isFetching) && order ? (
                        <OrderMessagesArea order={order} />
                      ) : (
                        <Grid item xs={12} lg={4} md={6}>
                          <Skeleton width={"100%"} height={400} />
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Messages Tab - mobile only */}
              {isMobile && activeTab === messagesTab && (
                <>
                  {!(isLoading || isFetching) && order ? (
                    isAssigned ? (
                      <OrderMessagesArea order={order} />
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
                (!(isLoading || isFetching) && session ? (
                  <OfferServiceArea offer={session} />
                ) : (
                  <Grid item xs={12} lg={4}>
                    <Skeleton width={"100%"} height={400} />
                  </Grid>
                ))}

              {/* Market Listings Tab */}
              {session?.offers[0]?.market_listings &&
                session.offers[0].market_listings.length > 0 &&
                activeTab === marketListingsTab &&
                (!(isLoading || isFetching) && session ? (
                  <OfferMarketListings offer={session} />
                ) : (
                  <Grid item xs={12} lg={4}>
                    <Skeleton width={"100%"} height={400} />
                  </Grid>
                ))}

              {/* Reviews Tab */}
              {order &&
                ((amCustomer && !order.customer_review) ||
                  ((amContractorManager || amAssigned) &&
                    !order.contractor_review) ||
                  order.customer_review ||
                  order.contractor_review) &&
                activeTab === reviewsTab && (
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

              {/* Stock Allocation Tab */}
              {amContractorManager && order && activeTab === allocationTab && (
                <Grid item xs={12}>
                  <OrderAllocationView orderId={order.order_id} />
                </Grid>
              )}

              {/* Availability Tab */}
              {amRelated && order && activeTab === availabilityTab && (
                <OrderAvailabilityArea order={order} />
              )}

              {/* Member Assign Area - always show on desktop */}
              {amContractorManager &&
                order &&
                !["cancelled", "fulfilled"].includes(order.status) && (
                  <MemberAssignArea order={order} />
                )}
            </>
          )
        })()}
      </ContainerGrid>
    </Page>
  )
}

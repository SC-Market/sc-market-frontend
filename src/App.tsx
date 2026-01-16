import React, { createElement, Suspense, useEffect } from "react"

import { HookProvider } from "./hooks/HookProvider"
import { Root } from "./components/layout/Root"
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom"
import { PageFallback } from "./components/metadata/Page"
import { FrontendErrorElement } from "./pages/errors/FrontendError"
import { RouteErrorFallback } from "./components/error-boundaries"
import { startBackgroundPrefetch } from "./util/prefetch"
import { SharedIntersectionObserver } from "./hooks/prefetch/usePrefetchOnVisible"
import {
  LoggedInRoute,
  SiteAdminRoute,
  OrgRoute,
  OrgAdminRoute,
} from "./components/router/LoggedInRoute"
import { store } from "./store/store"
import { notificationApi } from "./store/notification"
import { usePeriodicBackgroundSync } from "./hooks/pwa/usePeriodicBackgroundSync"
import { useWebVitals } from "./hooks/performance/useWebVitals"

import "./util/i18n.ts"

function App() {
  const { registerPeriodicSync, isSupported: periodicSyncSupported } =
    usePeriodicBackgroundSync()

  // Track Core Web Vitals
  useWebVitals()

  useEffect(() => {
    // Start background prefetching after the app loads
    startBackgroundPrefetch()

    // Register periodic background sync if supported
    if (periodicSyncSupported) {
      // Register sync for notifications (every 12 hours)
      registerPeriodicSync("sync-notifications", 12 * 60 * 60 * 1000).catch(
        () => {
          // Silently fail if registration fails (permission denied, etc.)
        },
      )

      // Register sync for general data (every 24 hours)
      registerPeriodicSync("sync-data", 24 * 60 * 60 * 1000).catch(() => {
        // Silently fail if registration fails
      })
    }

    // Set up push notification handling
    if ("serviceWorker" in navigator) {
      // Listen for messages from service worker
      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === "PUSH_NOTIFICATION_RECEIVED") {
          // Invalidate notification cache to trigger refetch
          store.dispatch(
            notificationApi.util.invalidateTags(["Notifications" as const]),
          )
        } else if (event.data?.type === "SYNC_NOTIFICATIONS") {
          // Periodic background sync for notifications
          store.dispatch(
            notificationApi.util.invalidateTags(["Notifications" as const]),
          )
        } else if (event.data?.type === "SYNC_DATA") {
          // Periodic background sync for general data
          // Invalidate various caches to refresh data
          store.dispatch(
            notificationApi.util.invalidateTags([
              "Notifications",
              "Orders",
              "MarketListings",
            ] as const),
          )
        }
      }

      navigator.serviceWorker.addEventListener("message", messageHandler)

      // Also listen for push events directly (when app is in foreground)
      navigator.serviceWorker.ready.then((registration) => {
        // The service worker will handle push events, but we can also listen here
        // for when the app is in the foreground
        if (registration.pushManager) {
          // Push events are handled by the service worker
          // We just need to invalidate cache when notifications arrive
        }
      })

      // Cleanup function
      return () => {
        navigator.serviceWorker.removeEventListener("message", messageHandler)
        // Cleanup shared intersection observer
        SharedIntersectionObserver.getInstance().cleanup()
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      // Cleanup shared intersection observer
      SharedIntersectionObserver.getInstance().cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodicSyncSupported])

  return <RouterProvider router={router} />
}

const router = createBrowserRouter([
  // Standalone widget route (no Root layout)
  {
    path: "/widget/orders",
    lazy: async () => ({
      Component: (await import("./pages/widget/OrdersWidget")).OrdersWidget,
    }),
  },
  {
    errorElement: <FrontendErrorElement />,
    element: (
      <HookProvider>
        <Root>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </Root>
      </HookProvider>
    ),
    children: [
      {
        path: "/",
        lazy: async () => ({
          Component: (await import("./pages/home/LandingPage")).LandingPage,
        }),
      },
      {
        path: "/login",
        lazy: async () => ({
          Component: (await import("./pages/authentication/LoginPage"))
            .LoginPage,
        }),
      },
      {
        path: "/signup",
        lazy: async () => ({
          Component: (await import("./pages/authentication/SignUpPage"))
            .SignUpPage,
        }),
      },
      {
        path: "/offer/:id",
        lazy: async () => ({
          Component: (await import("./pages/offers/ViewOfferPage"))
            .ViewOfferPage,
        }),
      },
      {
        path: "/offer/:id/counteroffer",
        lazy: async () => ({
          Component: (await import("./pages/offers/CounterOfferPage"))
            .CounterOfferPage,
        }),
      },
      {
        path: "/market/:id",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await import("./pages/market/ViewMarketListing"))
            .ViewMarketListing,
        }),
      },
      {
        path: "/market/aggregate/:id",
        lazy: async () => ({
          Component: (await import("./pages/market/ViewMarketAggregate"))
            .ViewMarketAggregate,
        }),
      },
      {
        path: "/market/multiple/:id",
        lazy: async () => ({
          Component: (await import("./pages/market/ViewMarketMultiple"))
            .ViewMarketMultiple,
        }),
      },
      {
        path: "/services",
        element: <Navigate to={"/market/services"} />,
      },
      {
        path: "/market/services",
        lazy: async () => ({
          Component: (await import("./pages/market/MarketPage")).MarketPage,
        }),
      },
      {
        path: "/market/category/:name",
        lazy: async () => ({
          Component: (await import("./pages/market/MarketPage")).MarketPage,
        }),
      },
      {
        path: "/buyorder/create",
        lazy: async () => ({
          Component: (await import("./pages/market/CreateBuyOrder"))
            .CreateBuyOrder,
        }),
      },
      {
        path: "/market",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await import("./pages/market/MarketPage")).MarketPage,
        }),
      },
      {
        path: "/bulk",
        lazy: async () => ({
          Component: (await import("./pages/market/MarketPage")).BulkItems,
        }),
      },
      {
        path: "/buyorders",
        lazy: async () => ({
          Component: (await import("./pages/market/MarketPage")).BuyOrderItems,
        }),
      },
      {
        path: "/contractors",
        lazy: async () => ({
          Component: (await import("./pages/contractor/Contractors"))
            .Contractors,
        }),
      },
      {
        path: "/contracts",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await import("./pages/contracting/Contracts")).Contracts,
        }),
      },
      {
        path: "/messages",
        element: <LoggedInRoute />,
        errorElement: <RouteErrorFallback />,
        children: [
          {
            index: true,
            errorElement: <RouteErrorFallback />,
            lazy: async () => ({
              Component: (await import("./pages/messaging/MessagesList"))
                .MessagesList,
            }),
          },
          {
            path: ":chat_id",
            errorElement: <RouteErrorFallback />,
            lazy: async () => ({
              Component: (await import("./pages/messaging/Messages")).Messages,
            }),
          },
        ],
      },
      {
        path: "/contracts/public/:contract_id",
        lazy: async () => ({
          Component: (await import("./pages/contracting/ViewPublicContract"))
            .ViewPublicContract,
        }),
      },
      {
        path: "/order/service/:service_id",
        lazy: async () => ({
          Component: (await import("./pages/contracting/CreateOrder"))
            .ServiceCreateOrder,
        }),
      },
      {
        path: "/recruiting/post/:post_id",
        lazy: async () => ({
          Component: (await import("./pages/recruiting/RecruitingPostPage"))
            .RecruitingPostPage,
        }),
      },
      {
        path: "/recruiting",
        lazy: async () => ({
          Component: (await import("./pages/recruiting/Recruiting")).Recruiting,
        }),
      },
      {
        path: "/contractor/:id/:tab",
        lazy: async () => ({
          Component: (await import("./pages/contractor/ViewOrg")).ViewOrg,
        }),
      },
      {
        path: "/contractor/:id",
        lazy: async () => ({
          Component: (await import("./pages/contractor/ViewOrg")).ViewOrg,
        }),
      },
      {
        path: "/contract/:id/:tab",
        lazy: async () => ({
          Component: (await import("./pages/contracting/ViewOrder")).ViewOrder,
        }),
      },
      {
        path: "/contract/:id",
        lazy: async () => ({
          Component: (await import("./pages/contracting/ViewOrder")).ViewOrder,
        }),
      },
      {
        path: "/order/:id/:tab",
        lazy: async () => ({
          Component: (await import("./pages/contracting/ViewOrder")).ViewOrder,
        }),
      },
      {
        path: "/order/:id",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await import("./pages/contracting/ViewOrder")).ViewOrder,
        }),
      },
      {
        path: "/user/:username/:tab",
        lazy: async () => ({
          Component: (await import("./pages/people/Profile")).Profile,
        }),
      },
      {
        path: "/user/:username",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await import("./pages/people/Profile")).Profile,
        }),
      },
      {
        element: <LoggedInRoute />,
        children: [
          {
            path: "/accountlink",
            lazy: async () => ({
              Component: (
                await import("./pages/authentication/AuthenticateRSI")
              ).AuthenticateRSIPage,
            }),
          },
          {
            path: "/market/create/:tab",
            lazy: async () => ({
              Component: (await import("./pages/market/MarketCreate"))
                .MarketCreate,
            }),
          },
          {
            path: "/market/create",
            lazy: async () => ({
              Component: (await import("./pages/market/MarketCreate"))
                .MarketCreate,
            }),
          },
          {
            path: "/market/me",
            lazy: async () => ({
              Component: (await import("./pages/market/MyMarketListings"))
                .MyMarketListings,
            }),
          },
          {
            path: "/market/manage",
            lazy: async () => ({
              Component: (await import("./pages/market/ManageStock"))
                .ManageStock,
            }),
          },
          {
            path: "/market/cart",
            lazy: async () => ({
              Component: (await import("./pages/market/MarketCart")).MarketCart,
            }),
          },
          {
            path: "/market_edit/:id",
            lazy: async () => ({
              Component: (await import("./pages/market/ViewMarketListing"))
                .EditMarketListing,
            }),
          },
          {
            path: "/market/multiple/:id/edit",
            lazy: async () => ({
              Component: (await import("./pages/market/ViewMarketListing"))
                .EditMultipleListing,
            }),
          },
          {
            path: "/customers",
            lazy: async () => {
              const component = (await import("./pages/people/People"))
                .CustomerPage
              return {
                Component: () => createElement(component, { customers: true }),
              }
            },
          },
          {
            path: "/messaging",
            lazy: async () => ({
              Component: (await import("./pages/messaging/Messages")).Messages,
            }),
          },
          {
            path: "/sell",
            lazy: async () => ({
              Component: (await import("./pages/market/SellMaterials"))
                .SellMaterials,
            }),
          },
          {
            path: "/orders",
            errorElement: <RouteErrorFallback />,
            lazy: async () => ({
              Component: (await import("./pages/contracting/CreateOrder"))
                .CreateOrder,
            }),
          },
          {
            path: "/org/members",
            lazy: async () => {
              const component = (await import("./pages/people/People"))
                .CustomerPage
              return {
                Component: () => createElement(component, { members: true }),
              }
            },
          },
          {
            path: "/myfleet/import",
            lazy: async () => ({
              Component: (await import("./pages/fleet/ImportFleet"))
                .ImportFleet,
            }),
          },
          {
            path: "/myfleet",
            lazy: async () => ({
              Component: (await import("./pages/contractor/MemberFleet"))
                .MemberFleet,
            }),
          },
          {
            path: "/delivery/:delivery_id",
            lazy: async () => ({
              Component: (await import("./pages/contractor/MemberFleet"))
                .MemberFleet,
            }),
          },
          {
            path: "/dashboard",
            lazy: async () => ({
              Component: (await import("./pages/contractor/MemberDashboard"))
                .MemberDashboard,
            }),
          },
          {
            path: "/order/service/create",
            lazy: async () => ({
              Component: (await import("./pages/contracting/CreateService"))
                .CreateService,
            }),
          },
          {
            path: "/order/service/:service_id/edit",
            lazy: async () => ({
              Component: (await import("./pages/contracting/CreateService"))
                .UpdateService,
            }),
          },
          {
            path: "/order/services",
            lazy: async () => ({
              Component: (await import("./pages/contracting/MyServices"))
                .MyServicesPage,
            }),
          },
          {
            path: "/org/register",
            lazy: async () => ({
              Component: (await import("./pages/contractor/OrgRegister"))
                .OrgRegister,
            }),
          },
          {
            path: "/contractor_invite/:invite_id",
            lazy: async () => ({
              Component: (await import("./pages/contracting/AcceptOrgInvite"))
                .AcceptOrgInvite,
            }),
          },
          {
            path: "/profile/:tab",
            lazy: async () => ({
              Component: (await import("./pages/people/MyProfile")).MyProfile,
            }),
          },
          {
            path: "/profile",
            errorElement: <RouteErrorFallback />,
            lazy: async () => ({
              Component: (await import("./pages/people/MyProfile")).MyProfile,
            }),
          },
          {
            path: "/settings",
            lazy: async () => ({
              Component: (await import("./pages/people/SettingsPage"))
                .SettingsPage,
            }),
          },
          {
            path: "/email/verify/:token",
            lazy: async () => ({
              Component: (await import("./pages/email/EmailVerificationPage"))
                .EmailVerificationPage,
            }),
          },
          {
            path: "/email/verify",
            lazy: async () => ({
              Component: (await import("./pages/email/EmailVerificationPage"))
                .EmailVerificationPage,
            }),
          },
          {
            path: "/email/unsubscribe/:token",
            lazy: async () => ({
              Component: (await import("./pages/email/UnsubscribePage"))
                .UnsubscribePage,
            }),
          },
          {
            path: "/email/unsubscribe",
            lazy: async () => ({
              Component: (await import("./pages/email/UnsubscribePage"))
                .UnsubscribePage,
            }),
          },
          {
            path: "/availability",
            lazy: async () => ({
              Component: (await import("./pages/availability/Availability"))
                .Availability,
            }),
          },
          {
            path: "/send",
            lazy: async () => ({
              Component: (await import("./pages/money/SendMoney")).SendMoney,
            }),
          },
          {
            path: "/send",
            lazy: async () => ({
              Component: (await import("./pages/money/SendMoney")).SendMoney,
            }),
          },
          {
            element: <SiteAdminRoute />,
            children: [
              {
                path: "/admin/users",
                lazy: async () => ({
                  Component: (await import("./pages/people/People"))
                    .AdminUserListPage,
                }),
              },
              {
                path: "/admin/market",
                lazy: async () => ({
                  Component: (await import("./pages/admin/AllMarketListings"))
                    .AllMarketListings,
                }),
              },
              {
                path: "/admin/orders",
                lazy: async () => ({
                  Component: (await import("./pages/admin/AdminOrderStats"))
                    .AdminOrderStats,
                }),
              },
              {
                path: "/admin/moderation",
                lazy: async () => ({
                  Component: (await import("./pages/admin/AdminModeration"))
                    .AdminModeration,
                }),
              },
              {
                path: "/admin/alerts",
                lazy: async () => ({
                  Component: (await import("./pages/admin/AdminAlerts"))
                    .AdminAlerts,
                }),
              },
              {
                path: "/admin/audit-logs",
                lazy: async () => ({
                  Component: (await import("./pages/admin/AdminAuditLogs"))
                    .AdminAuditLogs,
                }),
              },
              {
                path: "/admin/notification-test",
                lazy: async () => ({
                  Component: (
                    await import("./pages/admin/AdminNotificationTest")
                  ).AdminNotificationTest,
                }),
              },
            ],
          },
          {
            element: <OrgRoute />,
            children: [
              {
                path: "/org/fleet",
                lazy: async () => ({
                  Component: (await import("./pages/fleet/Fleet")).Fleet,
                }),
              },
              {
                path: "/myorg",
                lazy: async () => ({
                  Component: (await import("./pages/contractor/ViewOrg")).MyOrg,
                }),
              },
              {
                path: "/org/send",
                lazy: async () => {
                  const component = (await import("./pages/money/SendMoney"))
                    .SendMoney
                  return {
                    Component: () => createElement(component, { org: true }),
                  }
                },
              },
            ],
          },
          {
            element: <OrgAdminRoute permission="manage_recruiting" />,
            children: [
              {
                path: "/recruiting/post/create",
                lazy: async () => ({
                  Component: (
                    await import("./pages/recruiting/CreateRecruitingPostPage")
                  ).CreateRecruitingPostPage,
                }),
              },
              {
                path: "/recruiting/post/:post_id/update",
                lazy: async () => ({
                  Component: (
                    await import("./pages/recruiting/CreateRecruitingPostPage")
                  ).UpdateRecruitingPostPage,
                }),
              },
            ],
          },
          {
            element: <OrgAdminRoute permission="manage_orders" />,
            children: [
              {
                path: "/org/orders",
                lazy: async () => ({
                  Component: (await import("./pages/contractor/OrgOrders"))
                    .OrgOrders,
                }),
              },
            ],
          },
          {
            element: <OrgRoute />,
            children: [
              {
                element: (
                  <OrgAdminRoute
                    anyPermission={[
                      "manage_org_details",
                      "manage_invites",
                      "manage_roles",
                      "manage_webhooks",
                    ]}
                  />
                ),
                children: [
                  {
                    path: "/org/manage",
                    lazy: async () => ({
                      Component: (await import("./pages/contractor/OrgManage"))
                        .OrgManage,
                    }),
                  },
                ],
              },
              {
                element: <OrgAdminRoute permission="manage_stock" />,
                children: [
                  {
                    path: "/org/money",
                    lazy: async () => ({
                      Component: (await import("./pages/contractor/OrgMoney"))
                        .OrgMoney,
                    }),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "/error",
        lazy: async () => ({
          Component: (await import("./pages/errors/FrontendError"))
            .FrontendErrorPage,
        }),
      },
      {
        path: "/*",
        lazy: async () => ({
          Component: (await import("./pages/errors/Error404")).Error404,
        }),
      },
    ],
  },
])

export default App

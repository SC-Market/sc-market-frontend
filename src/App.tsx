import React, { createElement, useEffect } from "react"

import { HookProvider } from "./hooks/HookProvider"
import { ShoppingListProvider } from "./features/wishlists/hooks/WishlistContext"
import { Root } from "./components/layout/Root"
import { WhiteLabelAuthGate } from "./components/authentication/WhiteLabelAuthGate"
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom"
import { PageFallback } from "./components/metadata/Page"
// Imported STATICALLY (not from the .lazy wrapper): this is the root
// errorElement, so it must be in the entry bundle and always available. If it
// were lazy, an error caused by a failed chunk load would try to render an
// errorElement that ALSO needs to load a chunk — which fails the same way,
// crashing with no fallback (the "FrontendError.lazy.tsx t is undefined" crash).
import { FrontendErrorElement } from "./pages/errors/FrontendError"
import { RouteSuspense } from "./components/router/RouteSuspense"
import { RouteErrorFallback } from "./components/error-boundaries"
import { startBackgroundPrefetch } from "./util/prefetch"
import { SharedIntersectionObserver } from "./hooks/prefetch/usePrefetchOnVisible"
import {
  LoggedInRoute,
  SiteAdminRoute,
  OrgRoute,
  OrgAdminRoute,
} from "./components/router/LoggedInRoute"
import { OrgContextFromRoute } from "./components/router/OrgContextFromRoute"
import { ShopContextFromRoute } from "./components/router/ShopContextFromRoute"
import {
  ShopRedirect,
  ShopRedirectListings,
  ShopRedirectStock,
} from "./components/router/ShopRedirect"
import { store } from "./store/store"
import { notificationApi } from "./features/notifications/api/notificationApi"
import { usePeriodicBackgroundSync } from "./hooks/pwa/usePeriodicBackgroundSync"
import { useWebVitals } from "./hooks/performance/useWebVitals"
import { useRoutePrefetch } from "./hooks/router/useRoutePrefetch"
import { prefetchHighPriorityRoutes } from "./router/routePrefetch"
import { usePageTitle } from "./hooks/router/usePageTitle"
import { LandingPage } from "./pages/home/LandingPage"
import { retryDynamicImport } from "./util/retryDynamicImport"

import "./util/i18n.ts"

/**
 * Component that runs inside the router context to enable route-based hooks
 */
function RouterEffects() {
  // Prefetch routes based on current location
  useRoutePrefetch()
  // Update page title based on current route
  usePageTitle()
  return null
}

function App() {
  const { registerPeriodicSync, isSupported: periodicSyncSupported } =
    usePeriodicBackgroundSync()

  // Track Core Web Vitals
  useWebVitals()

  useEffect(() => {
    // Start background prefetching after the app loads
    startBackgroundPrefetch()

    // Prefetch high-priority routes
    prefetchHighPriorityRoutes()

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

    // Set up push notification handling: service worker posts messages here;
    // we invalidate RTK Query tags so any subscribed useGetNotificationsQuery
    // (and other invalidated endpoints) refetch automatically.
    if ("serviceWorker" in navigator) {
      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === "PUSH_NOTIFICATION_RECEIVED") {
          // SW sent this after showing a push; invalidate so notification queries refetch
          store.dispatch(
            notificationApi.util.invalidateTags(["Notifications" as const]),
          )
        } else if (event.data?.type === "SYNC_NOTIFICATIONS") {
          // SW background sync fetched notifications; invalidate to refetch
          store.dispatch(
            notificationApi.util.invalidateTags(["Notifications" as const]),
          )
        } else if (event.data?.type === "SYNC_DATA") {
          // SW periodic data sync; invalidate so dashboard/orders/market refetch
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
      Component: (await retryDynamicImport(() => import("./pages/widget/OrdersWidget"))).OrdersWidget,
    }),
  },
  {
    errorElement: <FrontendErrorElement />,
    element: (
      <HookProvider>
        <ShoppingListProvider>
        <WhiteLabelAuthGate>
        <Root>
          <RouterEffects />
          <RouteSuspense>
            <Outlet />
          </RouteSuspense>
        </Root>
        </WhiteLabelAuthGate>
        </ShoppingListProvider>
      </HookProvider>
    ),
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/login",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/authentication/LoginPage")))
            .LoginPage,
        }),
      },
      {
        path: "/signup",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/authentication/SignUpPage")))
            .SignUpPage,
        }),
      },
      {
        path: "/offer/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/offers/ViewOfferPage")))
            .ViewOfferPage,
        }),
      },
      {
        path: "/offer/:id/counteroffer",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/offers/CounterOfferPage")))
            .CounterOfferPage,
        }),
      },
      {
        path: "/market/:id",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).ListingDetailGate,
        }),
      },
      {
        path: "/market/aggregate/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).AggregateDetailGate,
        }),
      },
      {
        path: "/market/multiple/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).MultipleDetailGate,
        }),
      },
      {
        path: "/services",
        element: <Navigate to={"/market/services"} />,
      },
      {
        path: "/market/services",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).MarketRouter,
        }),
      },
      {
        path: "/market/category/:name",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).MarketRouter,
        }),
      },
      {
        path: "/buyorder/create",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).CreateBuyOrderGate,
        }),
      },
      {
        path: "/market",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).MarketRouter,
        }),
      },
      {
        path: "/bulk",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).MarketRouter,
        }),
      },
      {
        path: "/buyorders",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).MarketRouter,
        }),
      },
      {
        path: "/buyorder/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./features/market/v2/BuyOrderDetailV2"))).BuyOrderDetailV2,
        }),
      },
      {
        path: "/contractors",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contractor/Contractors")))
            .Contractors,
        }),
      },
      {
        path: "/contracts/create",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (
            await retryDynamicImport(() => import("./pages/contracting/CreatePublicContractPage"))
          ).CreatePublicContractPage,
        }),
      },
      {
        path: "/contracts",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contracting/Contracts"))).Contracts,
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
              Component: (await retryDynamicImport(() => import("./pages/messaging/MessagesList")))
                .MessagesList,
            }),
          },
          {
            path: ":chat_id",
            errorElement: <RouteErrorFallback />,
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/messaging/Messages"))).Messages,
            }),
          },
        ],
      },
      {
        path: "/contracts/public/:contract_id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contracting/ViewPublicContract")))
            .ViewPublicContract,
        }),
      },
      {
        path: "/order/service/:service_id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contracting/CreateOrder")))
            .ServiceCreateOrder,
        }),
      },
      {
        path: "/recruiting/post/:post_id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/recruiting/RecruitingPostPage")))
            .RecruitingPostPage,
        }),
      },
      {
        path: "/recruiting",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/recruiting/Recruiting"))).Recruiting,
        }),
      },
      {
        path: "/shops",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./features/shops/components/ShopDirectory"))).ShopDirectory,
        }),
      },
      {
        path: "/shops/create",
        element: <LoggedInRoute />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./features/shops/components/CreateShop"))).CreateShop,
            }),
          },
        ],
      },
      {
        path: "/shops/:slug/:tab",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./features/shops/components/ShopProfile"))).ShopProfile,
        }),
      },
      {
        path: "/shops/:slug",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./features/shops/components/ShopProfile"))).ShopProfile,
        }),
      },
      {
        path: "/contractor/:id/:tab",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contractor/ViewOrg"))).ViewOrg,
        }),
      },
      {
        path: "/contractor/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contractor/ViewOrg"))).ViewOrg,
        }),
      },
      {
        path: "/contract/:id/:tab",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contracting/ViewOrder"))).ViewOrder,
        }),
      },
      {
        path: "/contract/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contracting/ViewOrder"))).ViewOrder,
        }),
      },
      {
        path: "/order/:id/:tab",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contracting/ViewOrder"))).ViewOrder,
        }),
      },
      {
        path: "/order/:id",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/contracting/ViewOrder"))).ViewOrder,
        }),
      },
      {
        path: "/user/:username/:tab",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/people/Profile"))).Profile,
        }),
      },
      {
        path: "/user/:username",
        errorElement: <RouteErrorFallback />,
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/people/Profile"))).Profile,
        }),
      },
      {
        element: <LoggedInRoute />,
        children: [
          {
            path: "/onboarding",
            lazy: async () => ({
              Component: (
                await retryDynamicImport(() => import("./pages/onboarding/OnboardingPage"))
              ).OnboardingPage,
            }),
          },
          {
            path: "/accountlink",
            lazy: async () => ({
              Component: (
                await retryDynamicImport(() => import("./pages/authentication/AuthenticateRSI"))
              ).AuthenticateRSIPage,
            }),
          },
          {
            path: "/market/create/:tab",
            element: <ShopRedirectListings suffix="/create" />,
          },
          {
            path: "/market/create",
            element: <ShopRedirectListings suffix="/create" />,
          },
          {
            path: "/market/me",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).MyListingsGate,
            }),
          },
          {
            path: "/market/manage",
            element: <ShopRedirectListings />,
          },
          {
            path: "/market/manage-stock",
            element: <ShopRedirectStock />,
          },
          {
            path: "/market/stock/:listingId",
            element: <ShopRedirectListings />,
          },
          {
            path: "/inventory",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/inventory/InventoryPage"))).default,
            }),
          },
          {
            path: "/market/cart",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).MarketCartGate,
            }),
          },
          {
            path: "/market_edit/:id",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).EditListingGate,
            }),
          },
          {
            path: "/market/multiple/:id/edit",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./components/market/MarketRouter"))).EditMultipleGate,
            }),
          },
          {
            path: "/customers",
            lazy: async () => {
              const component = (await retryDynamicImport(() => import("./pages/people/People")))
                .CustomerPage
              return {
                Component: () => createElement(component, { customers: true }),
              }
            },
          },
          {
            path: "/messaging",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/messaging/Messages"))).Messages,
            }),
          },
          {
            path: "/sell",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/market/SellMaterials")))
                .SellMaterials,
            }),
          },
          {
            path: "/dashboard/shops",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./features/shops/components/MyShops"))).MyShops,
            }),
          },
          {
            path: "/my-orgs",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contractor/MyOrgs"))).MyOrgs,
            }),
          },
          {
            path: "/orders/assigned",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/orders",
            errorElement: <RouteErrorFallback />,
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contracting/CreateOrder")))
                .CreateOrder,
            }),
          },
          {
            path: "/org/members",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./components/router/OrgRedirect")))
                .OrgRedirectMembers,
            }),
          },
          {
            path: "/myfleet/import",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/fleet/ImportFleet")))
                .ImportFleet,
            }),
          },
          {
            path: "/myfleet",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contractor/MemberFleet")))
                .MemberFleet,
            }),
          },
          {
            path: "/delivery/:delivery_id",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contractor/MemberFleet")))
                .MemberFleet,
            }),
          },
          {
            path: "/dashboard",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contractor/MemberDashboard")))
                .MemberDashboard,
            }),
          },
          {
            path: "/dashboard/overview",
            lazy: async () => ({
              Component: (
                await retryDynamicImport(() => import("./features/dashboard/DashboardPages"))
              ).PersonalDashboardPage,
            }),
          },
          {
            path: "/order/service/create",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contracting/CreateService")))
                .CreateService,
            }),
          },
          {
            path: "/order/service/:service_id/edit",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contracting/CreateService")))
                .UpdateService,
            }),
          },
          {
            path: "/order/services",
            element: <ShopRedirect subpath="services" />,
          },
          {
            path: "/org/register",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contractor/OrgRegister")))
                .OrgRegister,
            }),
          },
          {
            path: "/contractor_invite/:invite_id",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/contracting/AcceptOrgInvite")))
                .AcceptOrgInvite,
            }),
          },
          {
            path: "/profile/:tab",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/people/MyProfile"))).MyProfile,
            }),
          },
          {
            path: "/profile",
            errorElement: <RouteErrorFallback />,
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/people/MyProfile"))).MyProfile,
            }),
          },
          {
            path: "/settings",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/people/SettingsPage")))
                .SettingsPage,
            }),
          },
          {
            path: "/notifications",
            lazy: async () => ({
              Component: (
                await retryDynamicImport(() => import("./pages/notifications/NotificationsPage"))
              ).NotificationsPage,
            }),
          },
          {
            path: "/email/verify/:token",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/email/EmailVerificationPage")))
                .EmailVerificationPage,
            }),
          },
          {
            path: "/email/verify",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/email/EmailVerificationPage")))
                .EmailVerificationPage,
            }),
          },
          {
            path: "/email/unsubscribe/:token",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/email/UnsubscribePage")))
                .UnsubscribePage,
            }),
          },
          {
            path: "/email/unsubscribe",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/email/UnsubscribePage")))
                .UnsubscribePage,
            }),
          },
          {
            path: "/availability",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/availability/Availability")))
                .Availability,
            }),
          },
          {
            path: "/send",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/money/SendMoney"))).SendMoney,
            }),
          },
          {
            path: "/send",
            lazy: async () => ({
              Component: (await retryDynamicImport(() => import("./pages/money/SendMoney"))).SendMoney,
            }),
          },
          {
            element: <SiteAdminRoute />,
            children: [
              {
                path: "/admin/users",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/people/People")))
                    .AdminUserListPage,
                }),
              },
              {
                path: "/admin/market",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/admin/AllMarketListings")))
                    .AllMarketListings,
                }),
              },
              {
                path: "/admin/wipe",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/admin/AdminWipeListings")))
                    .AdminWipeListings,
                }),
              },
              {
                path: "/admin/orders",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/admin/AdminOrderStats")))
                    .AdminOrderStats,
                }),
              },
              {
                path: "/admin/moderation",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/admin/AdminModeration")))
                    .AdminModeration,
                }),
              },
              {
                path: "/admin/alerts",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/admin/AdminAlerts")))
                    .AdminAlerts,
                }),
              },
              {
                path: "/admin/audit-logs",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/admin/AdminAuditLogs")))
                    .AdminAuditLogs,
                }),
              },
              {
                path: "/admin/notification-test",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminNotificationTest"))
                  ).AdminNotificationTest,
                }),
              },
              {
                path: "/admin/attribute-definitions",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminAttributeDefinitions"))
                  ).AdminAttributeDefinitions,
                }),
              },
              {
                path: "/admin/game-item-attributes",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminGameItemAttributes"))
                  ).AdminGameItemAttributes,
                }),
              },
              {
                path: "/admin/import-monitoring",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminImportMonitoring"))
                  ).AdminImportMonitoring,
                }),
              },
              {
                path: "/admin/game-data-import",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminGameDataImport"))
                  ).AdminGameDataImport,
                }),
              },
              {
                path: "/admin/premium",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminPremiumManagement"))
                  ).AdminPremiumManagement,
                }),
              },
              {
                path: "/admin/feature-flags",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminFeatureFlags"))
                  ).AdminFeatureFlags,
                }),
              },
              {
                path: "/admin/feature-flags/:flagName",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminFeatureFlags"))
                  ).AdminFeatureFlagDetail,
                }),
              },
              {
                path: "/admin/supplier-dashboard",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminSupplierDashboard"))
                  ).AdminSupplierDashboard,
                }),
              },
              {
                path: "/admin/supplier-roster",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminSupplierRoster"))
                  ).AdminSupplierRoster,
                }),
              },
              {
                path: "/admin/requisitions",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/admin/AdminRequisitions"))
                  ).AdminRequisitions,
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
                  Component: (await retryDynamicImport(() => import("./components/router/OrgRedirect")))
                    .OrgRedirectFleet,
                }),
              },
              {
                path: "/myorg",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/contractor/ViewOrg"))).MyOrg,
                }),
              },
              {
                path: "/org/send",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./components/router/OrgRedirect")))
                    .OrgRedirectSend,
                }),
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
                    await retryDynamicImport(() => import("./pages/recruiting/CreateRecruitingPostPage"))
                  ).CreateRecruitingPostPage,
                }),
              },
              {
                path: "/recruiting/post/:post_id/update",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/recruiting/CreateRecruitingPostPage"))
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
                  Component: (await retryDynamicImport(() => import("./components/router/OrgRedirect")))
                    .OrgRedirectOrders,
                }),
              },
            ],
          },
          {
            element: <OrgRoute />,
            children: [
              {
                path: "/org/manage",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./components/router/OrgRedirect")))
                    .OrgRedirectManage,
                }),
              },
              {
                path: "/org/money",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./components/router/OrgRedirect")))
                    .OrgRedirectMoney,
                }),
              },
            ],
          },
          {
            path: "/org/:contractor_id",
            element: <OrgContextFromRoute />,
            children: [
              {
                path: "dashboard",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/contractor/MemberDashboard"))
                  ).MemberDashboard,
                }),
              },
              {
                path: "overview",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./features/dashboard/DashboardPages"))
                  ).OrgDashboardPage,
                }),
              },
              {
                path: "fleet",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/fleet/Fleet"))).Fleet,
                }),
              },
              {
                path: "send",
                lazy: async () => {
                  const component = (await retryDynamicImport(() => import("./pages/money/SendMoney")))
                    .SendMoney
                  return {
                    Component: () => createElement(component, { org: true }),
                  }
                },
              },
              {
                path: "orders",
                element: <OrgAdminRoute permission="manage_orders" />,
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await retryDynamicImport(() => import("./pages/contractor/OrgOrders")))
                        .OrgOrders,
                    }),
                  },
                ],
              },
              {
                path: "manage",
                element: (
                  <OrgAdminRoute
                    anyPermission={[
                      "manage_org_details",
                      "manage_invites",
                      "manage_roles",
                      "manage_webhooks",
                      "manage_theme",
                    ]}
                  />
                ),
                children: [
                  {
                    lazy: async () => ({
                      Component: (await retryDynamicImport(() => import("./pages/contractor/OrgManageLayout")))
                        .OrgManageLayout,
                    }),
                    children: [
                      { index: true, element: <Navigate to="about" replace /> },
                      { path: "about", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgAboutPage }) },
                      { path: "roles", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgRolesPage }) },
                      { path: "invites", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgInvitesPage }) },
                      { path: "discord", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgDiscordPage }) },
                      { path: "market", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgMarketPage }) },
                      { path: "settings", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgSettingsPage }) },
                      { path: "blocklist", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgBlocklistPage }) },
                      { path: "audit", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgAuditPage }) },
                      { path: "customers", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgCustomersPage }) },
                      { path: "theme", lazy: async () => ({ Component: (await retryDynamicImport(() => import("./pages/contractor/manage"))).OrgThemePage }) },
                    ],
                  },
                ],
              },
              {
                path: "money",
                element: <OrgAdminRoute permission="manage_stock" />,
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await retryDynamicImport(() => import("./pages/contractor/OrgMoney")))
                        .OrgMoney,
                    }),
                  },
                ],
              },
              {
                path: "members",
                lazy: async () => {
                  const component = (await retryDynamicImport(() => import("./pages/people/People")))
                    .CustomerPage
                  return {
                    Component: () =>
                      createElement(component, { members: true }),
                  }
                },
              },
              {
                path: "listings",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/market/ManageStock")))
                    .ManageStock,
                }),
              },
              {
                path: "manage-stock",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/market/ManageStockLots")))
                    .ManageStockLots,
                }),
              },
              {
                path: "services",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/contracting/MyServices")))
                    .MyServicesPage,
                }),
              },
            ],
          },
          {
            path: "/shop/:shopSlug",
            element: <ShopContextFromRoute />,
            children: [
              {
                path: "listings",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./components/market/MarketRouter")))
                    .ManageStockGate,
                }),
              },
              {
                path: "listings/create",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./components/market/MarketRouter")))
                    .CreateListingGate,
                }),
              },
              {
                path: "stock",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/market/ManageStockLots")))
                    .ManageStockLots,
                }),
              },
              {
                path: "orders",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./pages/contractor/MemberDashboard"))
                  ).MemberDashboard,
                }),
              },
              {
                path: "dashboard",
                lazy: async () => ({
                  Component: (
                    await retryDynamicImport(() => import("./features/dashboard/DashboardPages"))
                  ).ShopDashboardPage,
                }),
              },
              {
                path: "services",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./pages/contracting/MyServices")))
                    .MyServicesPage,
                }),
              },
              {
                path: "customers",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./features/shops/components/ShopCustomers")))
                    .ShopCustomers,
                }),
              },
              {
                path: "settings",
                lazy: async () => ({
                  Component: (await retryDynamicImport(() => import("./features/shops/components/ShopSettings")))
                    .ShopSettings,
                }),
              },
              {
                index: true,
                element: <Navigate to="listings" replace />,
              },
            ],
          },
        ],
      },
      {
        path: "/crafting/calculator",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/crafting/CraftingCalculator"))).CraftingCalculator,
        }),
      },
      {
        path: "/crafting/history",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/crafting/CraftingHistory"))).CraftingHistory,
        }),
      },
      {
        path: "/missions",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/missions/MissionSearch"))).MissionSearch,
        }),
      },
      {
        path: "/missions/:slug",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/missions/MissionDetailGate"))).MissionDetailGate,
        }),
      },
      {
        path: "/blueprints",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/blueprints/BlueprintBrowser"))).BlueprintBrowser,
        }),
      },
      {
        path: "/blueprints/inventory",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/blueprints/BlueprintInventory"))).BlueprintInventory,
        }),
      },
      {
        path: "/blueprints/:slug",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/blueprints/BlueprintDetailGate"))).BlueprintDetailGate,
        }),
      },
      {
        path: "/shopping-lists",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wishlists/WishlistManager"))).WishlistManager,
        }),
      },
      {
        path: "/shopping-lists/:wishlist_id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wishlists/WishlistDetail"))).WishlistDetail,
        }),
      },
      {
        path: "/shopping-lists/:wishlist_id/shopping-list",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wishlists/ShoppingList"))).ShoppingList,
        }),
      },
      {
        path: "/resources",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/resources/ResourceBrowser"))).ResourceBrowser,
        }),
      },
      {
        path: "/resources/:resource_id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/resources/ResourceDetail"))).ResourceDetail,
        }),
      },
      {
        path: "/mining",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/mining/MiningPage"))).MiningPage,
        }),
      },
      {
        path: "/mining/ores/:name",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/mining/MiningOreDetailGate"))).MiningOreDetailGate,
        }),
      },
      {
        path: "/mining/locations",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/mining/MiningPage"))).MiningPage,
        }),
      },
      {
        path: "/mining/locations/:name",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/mining/MiningLocationDetailGate"))).MiningLocationDetailGate,
        }),
      },
      {
        path: "/wiki",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiHub"))).WikiHub,
        }),
      },
      {
        path: "/wiki/items/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiItemDetail")))
            .WikiItemDetail,
        }),
      },
      {
        path: "/wiki/items",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiItemBrowser")))
            .WikiItemBrowser,
        }),
      },
      {
        path: "/wiki/ships/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiShipDetailGate")))
            .WikiShipDetailGate,
        }),
      },
      {
        path: "/wiki/ships",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiShipBrowser")))
            .WikiShipBrowser,
        }),
      },
      {
        path: "/wiki/commodities",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiCommodityBrowser")))
            .WikiCommodityBrowser,
        }),
      },
      {
        path: "/wiki/commodities/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiCommodityDetail")))
            .WikiCommodityDetail,
        }),
      },
      {
        path: "/wiki/locations",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiLocationBrowser")))
            .WikiLocationBrowser,
        }),
      },
      {
        path: "/wiki/refinery",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiRefineryPage")))
            .WikiRefineryPage,
        }),
      },
      {
        path: "/wiki/manufacturers/:id",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiManufacturerPage")))
            .WikiManufacturerPage,
        }),
      },
      {
        path: "/wiki/manufacturers",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/wiki/WikiManufacturerList")))
            .WikiManufacturerList,
        }),
      },
      {
        path: "/error",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/errors/FrontendError")))
            .FrontendErrorPage,
        }),
      },
      {
        path: "/*",
        lazy: async () => ({
          Component: (await retryDynamicImport(() => import("./pages/errors/Error404"))).Error404,
        }),
      },
    ],
  },
])

export default App

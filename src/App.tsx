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
import { startBackgroundPrefetch } from "./util/prefetch"
import { SharedIntersectionObserver } from "./hooks/prefetch/usePrefetchOnVisible"

import "./util/i18n.ts"

function App() {
  useEffect(() => {
    // Start background prefetching after the app loads
    startBackgroundPrefetch()

    // Cleanup function to prevent memory leaks
    return () => {
      // Cleanup shared intersection observer
      SharedIntersectionObserver.getInstance().cleanup()
    }
  }, [])

  return <RouterProvider router={router} />
}

const router = createBrowserRouter([
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
        lazy: async () => ({
          Component: (await import("./pages/contracting/Contracts")).Contracts,
        }),
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
        lazy: async () => ({
          Component: (await import("./pages/people/Profile")).Profile,
        }),
      },
      {
        lazy: async () => ({
          Component: (await import("./components/router/LoggedInRoute"))
            .LoggedInRoute,
        }),
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
            lazy: async () => ({
              Component: (await import("./components/router/LoggedInRoute"))
                .SiteAdminRoute,
            }),
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
            ],
          },
          {
            lazy: async () => ({
              Component: (await import("./components/router/LoggedInRoute"))
                .OrgRoute,
            }),
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
            lazy: async () => {
              const component = (
                await import("./components/router/LoggedInRoute")
              ).OrgAdminRoute
              return {
                Component: () =>
                  createElement(component, { permission: "manage_recruiting" }),
              }
            },
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
            lazy: async () => {
              const component = (
                await import("./components/router/LoggedInRoute")
              ).OrgAdminRoute
              return {
                Component: () =>
                  createElement(component, { permission: "manage_orders" }),
              }
            },
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
            lazy: async () => ({
              Component: (await import("./components/router/LoggedInRoute"))
                .OrgRoute,
            }),
            children: [
              {
                lazy: async () => {
                  const component = (
                    await import("./components/router/LoggedInRoute")
                  ).OrgAdminRoute
                  return {
                    Component: () =>
                      createElement(component, {
                        anyPermission: [
                          "manage_org_details",
                          "manage_invites",
                          "manage_roles",
                          "manage_webhooks",
                        ],
                      }),
                  }
                },
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
                lazy: async () => {
                  const component = (
                    await import("./components/router/LoggedInRoute")
                  ).OrgAdminRoute
                  return {
                    Component: () =>
                      createElement(component, {
                        permission: "manage_stock",
                      }),
                  }
                },
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

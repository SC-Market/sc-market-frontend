/**
 * The app's route table (React Router framework mode, SPA: see
 * react-router.config.ts and docs/ssr-migration-design.md, Phase 2).
 *
 * Every route is a module under src/routes/: pages/ (a lazily loaded page,
 * see definePage.tsx), elements/ (a redirect or an eagerly loaded element),
 * layouts/ (guards and the app layout). The id of a route is its file
 * without the extension; a module used by several routes gets "~2", "~3"…
 * on the later ones (entry.client.tsx maps ids back to modules that way).
 *
 * Order matters only where React Router's ranking ties (see
 * src/router/__tests__/routes.table.test.ts).
 */
import type { RouteConfig } from "@react-router/dev/routes"

export default [
  {
    id: "routes/pages/OrdersWidget",
    path: "/widget/orders",
    file: "routes/pages/OrdersWidget.tsx",
  },
  {
    id: "routes/layouts/AppLayout",
    file: "routes/layouts/AppLayout.tsx",
    children: [
      {
        id: "routes/elements/LandingPage",
        path: "/",
        file: "routes/elements/LandingPage.tsx",
      },
      {
        id: "routes/pages/LoginPage",
        path: "/login",
        file: "routes/pages/LoginPage.tsx",
      },
      {
        id: "routes/pages/SignUpPage",
        path: "/signup",
        file: "routes/pages/SignUpPage.tsx",
      },
      {
        id: "routes/pages/ViewOfferPage",
        path: "/offer/:id",
        file: "routes/pages/ViewOfferPage.tsx",
      },
      {
        id: "routes/pages/CounterOfferPage",
        path: "/offer/:id/counteroffer",
        file: "routes/pages/CounterOfferPage.tsx",
      },
      {
        id: "routes/pages/ListingDetailGate.ErrorBoundary",
        path: "/market/:id",
        file: "routes/pages/ListingDetailGate.ErrorBoundary.tsx",
      },
      {
        id: "routes/pages/AggregateDetailGate",
        path: "/market/aggregate/:id",
        file: "routes/pages/AggregateDetailGate.tsx",
      },
      {
        id: "routes/pages/MultipleDetailGate",
        path: "/market/multiple/:id",
        file: "routes/pages/MultipleDetailGate.tsx",
      },
      {
        id: "routes/elements/Navigate.market-services",
        path: "/services",
        file: "routes/elements/Navigate.market-services.tsx",
      },
      {
        id: "routes/pages/MarketRouter",
        path: "/market/services",
        file: "routes/pages/MarketRouter.tsx",
      },
      {
        id: "routes/pages/MarketRouter~2",
        path: "/market/category/:name",
        file: "routes/pages/MarketRouter.tsx",
      },
      {
        id: "routes/pages/CreateBuyOrderGate",
        path: "/buyorder/create",
        file: "routes/pages/CreateBuyOrderGate.tsx",
      },
      {
        id: "routes/pages/MarketRouter.ErrorBoundary",
        path: "/market",
        file: "routes/pages/MarketRouter.ErrorBoundary.tsx",
      },
      {
        id: "routes/pages/MarketRouter~3",
        path: "/bulk",
        file: "routes/pages/MarketRouter.tsx",
      },
      {
        id: "routes/pages/MarketRouter~4",
        path: "/buyorders",
        file: "routes/pages/MarketRouter.tsx",
      },
      {
        id: "routes/pages/BuyOrderDetailV2",
        path: "/buyorder/:id",
        file: "routes/pages/BuyOrderDetailV2.tsx",
      },
      {
        id: "routes/pages/Contractors",
        path: "/contractors",
        file: "routes/pages/Contractors.tsx",
      },
      {
        id: "routes/pages/CreatePublicContractPage.ErrorBoundary",
        path: "/contracts/create",
        file: "routes/pages/CreatePublicContractPage.ErrorBoundary.tsx",
      },
      {
        id: "routes/pages/Contracts.ErrorBoundary",
        path: "/contracts",
        file: "routes/pages/Contracts.ErrorBoundary.tsx",
      },
      {
        id: "routes/layouts/LoggedInRoute.ErrorBoundary",
        path: "/messages",
        file: "routes/layouts/LoggedInRoute.ErrorBoundary.tsx",
        children: [
          {
            id: "routes/pages/MessagesList.ErrorBoundary",
            index: true,
            file: "routes/pages/MessagesList.ErrorBoundary.tsx",
          },
          {
            id: "routes/pages/Messages.ErrorBoundary",
            path: ":chat_id",
            file: "routes/pages/Messages.ErrorBoundary.tsx",
          },
        ],
      },
      {
        id: "routes/pages/ViewPublicContract",
        path: "/contracts/public/:contract_id",
        file: "routes/pages/ViewPublicContract.tsx",
      },
      {
        id: "routes/pages/ServiceCreateOrder",
        path: "/order/service/:service_id",
        file: "routes/pages/ServiceCreateOrder.tsx",
      },
      {
        id: "routes/pages/RecruitingPostPage",
        path: "/recruiting/post/:post_id",
        file: "routes/pages/RecruitingPostPage.tsx",
      },
      {
        id: "routes/pages/Recruiting",
        path: "/recruiting",
        file: "routes/pages/Recruiting.tsx",
      },
      {
        id: "routes/pages/ShopDirectory",
        path: "/shops",
        file: "routes/pages/ShopDirectory.tsx",
      },
      {
        id: "routes/layouts/LoggedInRoute",
        path: "/shops/create",
        file: "routes/layouts/LoggedInRoute.tsx",
        children: [
          {
            id: "routes/pages/CreateShop",
            index: true,
            file: "routes/pages/CreateShop.tsx",
          },
        ],
      },
      {
        id: "routes/pages/ShopProfile",
        path: "/shops/:slug/:tab",
        file: "routes/pages/ShopProfile.tsx",
      },
      {
        id: "routes/pages/ShopProfile~2",
        path: "/shops/:slug",
        file: "routes/pages/ShopProfile.tsx",
      },
      {
        id: "routes/pages/ViewOrg",
        path: "/contractor/:id/:tab",
        file: "routes/pages/ViewOrg.tsx",
      },
      {
        id: "routes/pages/ViewOrg~2",
        path: "/contractor/:id",
        file: "routes/pages/ViewOrg.tsx",
      },
      {
        id: "routes/pages/ViewOrder",
        path: "/contract/:id/:tab",
        file: "routes/pages/ViewOrder.tsx",
      },
      {
        id: "routes/pages/ViewOrder~2",
        path: "/contract/:id",
        file: "routes/pages/ViewOrder.tsx",
      },
      {
        id: "routes/pages/ViewOrder~3",
        path: "/order/:id/:tab",
        file: "routes/pages/ViewOrder.tsx",
      },
      {
        id: "routes/pages/ViewOrder.ErrorBoundary",
        path: "/order/:id",
        file: "routes/pages/ViewOrder.ErrorBoundary.tsx",
      },
      {
        id: "routes/pages/Profile",
        path: "/user/:username/:tab",
        file: "routes/pages/Profile.tsx",
      },
      {
        id: "routes/pages/Profile.ErrorBoundary",
        path: "/user/:username",
        file: "routes/pages/Profile.ErrorBoundary.tsx",
      },
      {
        id: "routes/layouts/LoggedInRoute~2",
        file: "routes/layouts/LoggedInRoute.tsx",
        children: [
          {
            id: "routes/pages/OnboardingPage",
            path: "/onboarding",
            file: "routes/pages/OnboardingPage.tsx",
          },
          {
            id: "routes/pages/AuthenticateRSIPage",
            path: "/accountlink",
            file: "routes/pages/AuthenticateRSIPage.tsx",
          },
          {
            id: "routes/elements/ShopRedirectListings.create",
            path: "/market/create/:tab",
            file: "routes/elements/ShopRedirectListings.create.tsx",
          },
          {
            id: "routes/elements/ShopRedirectListings.create~2",
            path: "/market/create",
            file: "routes/elements/ShopRedirectListings.create.tsx",
          },
          {
            id: "routes/pages/MyListingsGate",
            path: "/market/me",
            file: "routes/pages/MyListingsGate.tsx",
          },
          {
            id: "routes/elements/ShopRedirectListings",
            path: "/market/manage",
            file: "routes/elements/ShopRedirectListings.tsx",
          },
          {
            id: "routes/elements/ShopRedirectStock",
            path: "/market/manage-stock",
            file: "routes/elements/ShopRedirectStock.tsx",
          },
          {
            id: "routes/elements/ShopRedirectListings~2",
            path: "/market/stock/:listingId",
            file: "routes/elements/ShopRedirectListings.tsx",
          },
          {
            id: "routes/pages/InventoryPage",
            path: "/inventory",
            file: "routes/pages/InventoryPage.tsx",
          },
          {
            id: "routes/pages/MarketCartGate",
            path: "/market/cart",
            file: "routes/pages/MarketCartGate.tsx",
          },
          {
            id: "routes/pages/EditListingGate",
            path: "/market_edit/:id",
            file: "routes/pages/EditListingGate.tsx",
          },
          {
            id: "routes/pages/EditMultipleGate",
            path: "/market/multiple/:id/edit",
            file: "routes/pages/EditMultipleGate.tsx",
          },
          {
            id: "routes/pages/CustomerPage.customers",
            path: "/customers",
            file: "routes/pages/CustomerPage.customers.tsx",
          },
          {
            id: "routes/pages/Messages",
            path: "/messaging",
            file: "routes/pages/Messages.tsx",
          },
          {
            id: "routes/pages/SellMaterials",
            path: "/sell",
            file: "routes/pages/SellMaterials.tsx",
          },
          {
            id: "routes/pages/MyShops",
            path: "/dashboard/shops",
            file: "routes/pages/MyShops.tsx",
          },
          {
            id: "routes/pages/MyOrgs",
            path: "/my-orgs",
            file: "routes/pages/MyOrgs.tsx",
          },
          {
            id: "routes/elements/Navigate.dashboard",
            path: "/orders/assigned",
            file: "routes/elements/Navigate.dashboard.tsx",
          },
          {
            id: "routes/pages/CreateOrder.ErrorBoundary",
            path: "/orders",
            file: "routes/pages/CreateOrder.ErrorBoundary.tsx",
          },
          {
            id: "routes/pages/OrgRedirectMembers",
            path: "/org/members",
            file: "routes/pages/OrgRedirectMembers.tsx",
          },
          {
            id: "routes/pages/ImportFleet",
            path: "/myfleet/import",
            file: "routes/pages/ImportFleet.tsx",
          },
          {
            id: "routes/pages/MemberFleet",
            path: "/myfleet",
            file: "routes/pages/MemberFleet.tsx",
          },
          {
            id: "routes/pages/MemberFleet~2",
            path: "/delivery/:delivery_id",
            file: "routes/pages/MemberFleet.tsx",
          },
          {
            id: "routes/pages/MemberDashboard",
            path: "/dashboard",
            file: "routes/pages/MemberDashboard.tsx",
          },
          {
            id: "routes/pages/PersonalDashboardPage",
            path: "/dashboard/overview",
            file: "routes/pages/PersonalDashboardPage.tsx",
          },
          {
            id: "routes/pages/CreateService",
            path: "/order/service/create",
            file: "routes/pages/CreateService.tsx",
          },
          {
            id: "routes/pages/UpdateService",
            path: "/order/service/:service_id/edit",
            file: "routes/pages/UpdateService.tsx",
          },
          {
            id: "routes/elements/ShopRedirect.services",
            path: "/order/services",
            file: "routes/elements/ShopRedirect.services.tsx",
          },
          {
            id: "routes/pages/OrgRegister",
            path: "/org/register",
            file: "routes/pages/OrgRegister.tsx",
          },
          {
            id: "routes/pages/AcceptOrgInvite",
            path: "/contractor_invite/:invite_id",
            file: "routes/pages/AcceptOrgInvite.tsx",
          },
          {
            id: "routes/pages/MyProfile",
            path: "/profile/:tab",
            file: "routes/pages/MyProfile.tsx",
          },
          {
            id: "routes/pages/MyProfile.ErrorBoundary",
            path: "/profile",
            file: "routes/pages/MyProfile.ErrorBoundary.tsx",
          },
          {
            id: "routes/pages/SettingsPage",
            path: "/settings",
            file: "routes/pages/SettingsPage.tsx",
          },
          {
            id: "routes/pages/NotificationsPage",
            path: "/notifications",
            file: "routes/pages/NotificationsPage.tsx",
          },
          {
            id: "routes/pages/EmailVerificationPage",
            path: "/email/verify/:token",
            file: "routes/pages/EmailVerificationPage.tsx",
          },
          {
            id: "routes/pages/EmailVerificationPage~2",
            path: "/email/verify",
            file: "routes/pages/EmailVerificationPage.tsx",
          },
          {
            id: "routes/pages/UnsubscribePage",
            path: "/email/unsubscribe/:token",
            file: "routes/pages/UnsubscribePage.tsx",
          },
          {
            id: "routes/pages/UnsubscribePage~2",
            path: "/email/unsubscribe",
            file: "routes/pages/UnsubscribePage.tsx",
          },
          {
            id: "routes/pages/Availability",
            path: "/availability",
            file: "routes/pages/Availability.tsx",
          },
          {
            id: "routes/pages/SendMoney",
            path: "/send",
            file: "routes/pages/SendMoney.tsx",
          },
          {
            id: "routes/pages/SendMoney~2",
            path: "/send",
            file: "routes/pages/SendMoney.tsx",
          },
          {
            id: "routes/layouts/SiteAdminRoute",
            file: "routes/layouts/SiteAdminRoute.tsx",
            children: [
              {
                id: "routes/pages/AdminUserListPage",
                path: "/admin/users",
                file: "routes/pages/AdminUserListPage.tsx",
              },
              {
                id: "routes/pages/AllMarketListings",
                path: "/admin/market",
                file: "routes/pages/AllMarketListings.tsx",
              },
              {
                id: "routes/pages/AdminWipeListings",
                path: "/admin/wipe",
                file: "routes/pages/AdminWipeListings.tsx",
              },
              {
                id: "routes/pages/AdminOrderStats",
                path: "/admin/orders",
                file: "routes/pages/AdminOrderStats.tsx",
              },
              {
                id: "routes/pages/AdminModeration",
                path: "/admin/moderation",
                file: "routes/pages/AdminModeration.tsx",
              },
              {
                id: "routes/pages/AdminAlerts",
                path: "/admin/alerts",
                file: "routes/pages/AdminAlerts.tsx",
              },
              {
                id: "routes/pages/AdminAuditLogs",
                path: "/admin/audit-logs",
                file: "routes/pages/AdminAuditLogs.tsx",
              },
              {
                id: "routes/pages/AdminTestAccounts",
                path: "/admin/test-accounts",
                file: "routes/pages/AdminTestAccounts.tsx",
              },
              {
                id: "routes/pages/AdminNotificationTest",
                path: "/admin/notification-test",
                file: "routes/pages/AdminNotificationTest.tsx",
              },
              {
                id: "routes/pages/AdminAttributeDefinitions",
                path: "/admin/attribute-definitions",
                file: "routes/pages/AdminAttributeDefinitions.tsx",
              },
              {
                id: "routes/pages/AdminGameItemAttributes",
                path: "/admin/game-item-attributes",
                file: "routes/pages/AdminGameItemAttributes.tsx",
              },
              {
                id: "routes/pages/AdminImportMonitoring",
                path: "/admin/import-monitoring",
                file: "routes/pages/AdminImportMonitoring.tsx",
              },
              {
                id: "routes/pages/AdminGameDataImport",
                path: "/admin/game-data-import",
                file: "routes/pages/AdminGameDataImport.tsx",
              },
              {
                id: "routes/pages/AdminPremiumManagement",
                path: "/admin/premium",
                file: "routes/pages/AdminPremiumManagement.tsx",
              },
              {
                id: "routes/pages/AdminFeatureFlags",
                path: "/admin/feature-flags",
                file: "routes/pages/AdminFeatureFlags.tsx",
              },
              {
                id: "routes/pages/AdminFeatureFlagDetail",
                path: "/admin/feature-flags/:flagName",
                file: "routes/pages/AdminFeatureFlagDetail.tsx",
              },
              {
                id: "routes/pages/AdminSupplierDashboard",
                path: "/admin/supplier-dashboard",
                file: "routes/pages/AdminSupplierDashboard.tsx",
              },
              {
                id: "routes/pages/AdminSupplierRoster",
                path: "/admin/supplier-roster",
                file: "routes/pages/AdminSupplierRoster.tsx",
              },
              {
                id: "routes/pages/AdminRequisitions",
                path: "/admin/requisitions",
                file: "routes/pages/AdminRequisitions.tsx",
              },
            ],
          },
          {
            id: "routes/layouts/OrgRoute",
            file: "routes/layouts/OrgRoute.tsx",
            children: [
              {
                id: "routes/pages/OrgRedirectFleet",
                path: "/org/fleet",
                file: "routes/pages/OrgRedirectFleet.tsx",
              },
              {
                id: "routes/pages/MyOrg",
                path: "/myorg",
                file: "routes/pages/MyOrg.tsx",
              },
              {
                id: "routes/pages/OrgRedirectSend",
                path: "/org/send",
                file: "routes/pages/OrgRedirectSend.tsx",
              },
            ],
          },
          {
            id: "routes/layouts/OrgAdminRoute.recruiting.manage-recruiting",
            file: "routes/layouts/OrgAdminRoute.recruiting.manage-recruiting.tsx",
            children: [
              {
                id: "routes/pages/CreateRecruitingPostPage",
                path: "/recruiting/post/create",
                file: "routes/pages/CreateRecruitingPostPage.tsx",
              },
              {
                id: "routes/pages/UpdateRecruitingPostPage",
                path: "/recruiting/post/:post_id/update",
                file: "routes/pages/UpdateRecruitingPostPage.tsx",
              },
            ],
          },
          {
            id: "routes/layouts/OrgAdminRoute.orders.manage-orders",
            file: "routes/layouts/OrgAdminRoute.orders.manage-orders.tsx",
            children: [
              {
                id: "routes/pages/OrgRedirectOrders",
                path: "/org/orders",
                file: "routes/pages/OrgRedirectOrders.tsx",
              },
            ],
          },
          {
            id: "routes/layouts/OrgRoute~2",
            file: "routes/layouts/OrgRoute.tsx",
            children: [
              {
                id: "routes/pages/OrgRedirectManage",
                path: "/org/manage",
                file: "routes/pages/OrgRedirectManage.tsx",
              },
              {
                id: "routes/pages/OrgRedirectMoney",
                path: "/org/money",
                file: "routes/pages/OrgRedirectMoney.tsx",
              },
            ],
          },
          {
            id: "routes/layouts/OrgContextFromRoute",
            path: "/org/:contractor_id",
            file: "routes/layouts/OrgContextFromRoute.tsx",
            children: [
              {
                id: "routes/pages/MemberDashboard~2",
                path: "dashboard",
                file: "routes/pages/MemberDashboard.tsx",
              },
              {
                id: "routes/pages/OrgDashboardPage",
                path: "overview",
                file: "routes/pages/OrgDashboardPage.tsx",
              },
              {
                id: "routes/pages/Fleet",
                path: "fleet",
                file: "routes/pages/Fleet.tsx",
              },
              {
                id: "routes/pages/SendMoney.org",
                path: "send",
                file: "routes/pages/SendMoney.org.tsx",
              },
              {
                id: "routes/layouts/OrgAdminRoute.orders.manage-orders~2",
                path: "orders",
                file: "routes/layouts/OrgAdminRoute.orders.manage-orders.tsx",
                children: [
                  {
                    id: "routes/pages/OrgOrders",
                    index: true,
                    file: "routes/pages/OrgOrders.tsx",
                  },
                ],
              },
              {
                id: "routes/layouts/OrgAdminRoute.settings.canOpenOrgManage",
                path: "manage",
                file: "routes/layouts/OrgAdminRoute.settings.canOpenOrgManage.tsx",
                children: [
                  {
                    id: "routes/pages/OrgManageLayout",
                    file: "routes/pages/OrgManageLayout.tsx",
                    children: [
                      {
                        id: "routes/elements/Navigate.about",
                        index: true,
                        file: "routes/elements/Navigate.about.tsx",
                      },
                      {
                        id: "routes/pages/OrgAboutPage",
                        path: "about",
                        file: "routes/pages/OrgAboutPage.tsx",
                      },
                      {
                        id: "routes/pages/OrgRolesPage",
                        path: "roles",
                        file: "routes/pages/OrgRolesPage.tsx",
                      },
                      {
                        id: "routes/pages/OrgInvitesPage",
                        path: "invites",
                        file: "routes/pages/OrgInvitesPage.tsx",
                      },
                      {
                        id: "routes/pages/OrgDiscordPage",
                        path: "discord",
                        file: "routes/pages/OrgDiscordPage.tsx",
                      },
                      {
                        id: "routes/pages/OrgSettingsPage",
                        path: "settings",
                        file: "routes/pages/OrgSettingsPage.tsx",
                      },
                      {
                        id: "routes/pages/OrgAuditPage",
                        path: "audit",
                        file: "routes/pages/OrgAuditPage.tsx",
                      },
                      {
                        id: "routes/pages/OrgThemePage",
                        path: "theme",
                        file: "routes/pages/OrgThemePage.tsx",
                      },
                    ],
                  },
                ],
              },
              {
                id: "routes/layouts/OrgAdminRoute.money.manage-stock",
                path: "money",
                file: "routes/layouts/OrgAdminRoute.money.manage-stock.tsx",
                children: [
                  {
                    id: "routes/pages/OrgMoney",
                    index: true,
                    file: "routes/pages/OrgMoney.tsx",
                  },
                ],
              },
              {
                id: "routes/pages/CustomerPage.members",
                path: "members",
                file: "routes/pages/CustomerPage.members.tsx",
              },
              {
                id: "routes/pages/ManageStock",
                path: "listings",
                file: "routes/pages/ManageStock.tsx",
              },
              {
                id: "routes/pages/ManageStockLots",
                path: "manage-stock",
                file: "routes/pages/ManageStockLots.tsx",
              },
              {
                id: "routes/pages/MyServicesPage",
                path: "services",
                file: "routes/pages/MyServicesPage.tsx",
              },
            ],
          },
          {
            id: "routes/layouts/ShopContextFromRoute",
            path: "/shop/:shopSlug",
            file: "routes/layouts/ShopContextFromRoute.tsx",
            children: [
              {
                id: "routes/pages/ManageStockGate",
                path: "listings",
                file: "routes/pages/ManageStockGate.tsx",
              },
              {
                id: "routes/pages/CreateListingGate",
                path: "listings/create",
                file: "routes/pages/CreateListingGate.tsx",
              },
              {
                id: "routes/pages/ManageStockLots~2",
                path: "stock",
                file: "routes/pages/ManageStockLots.tsx",
              },
              {
                id: "routes/pages/MemberDashboard~3",
                path: "orders",
                file: "routes/pages/MemberDashboard.tsx",
              },
              {
                id: "routes/pages/ShopDashboardPage",
                path: "dashboard",
                file: "routes/pages/ShopDashboardPage.tsx",
              },
              {
                id: "routes/pages/MyServicesPage~2",
                path: "services",
                file: "routes/pages/MyServicesPage.tsx",
              },
              {
                id: "routes/pages/ShopCustomers",
                path: "customers",
                file: "routes/pages/ShopCustomers.tsx",
              },
              {
                id: "routes/pages/ShopSettings",
                path: "settings",
                file: "routes/pages/ShopSettings.tsx",
              },
              {
                id: "routes/elements/Navigate.listings",
                index: true,
                file: "routes/elements/Navigate.listings.tsx",
              },
            ],
          },
        ],
      },
      {
        id: "routes/pages/CraftingCalculator",
        path: "/crafting/calculator",
        file: "routes/pages/CraftingCalculator.tsx",
      },
      {
        id: "routes/pages/CraftingHistory",
        path: "/crafting/history",
        file: "routes/pages/CraftingHistory.tsx",
      },
      {
        id: "routes/pages/MissionSearch",
        path: "/missions",
        file: "routes/pages/MissionSearch.tsx",
      },
      {
        id: "routes/pages/MissionDetailGate",
        path: "/missions/:slug",
        file: "routes/pages/MissionDetailGate.tsx",
      },
      {
        id: "routes/pages/BlueprintBrowser",
        path: "/blueprints",
        file: "routes/pages/BlueprintBrowser.tsx",
      },
      {
        id: "routes/pages/BlueprintInventory",
        path: "/blueprints/inventory",
        file: "routes/pages/BlueprintInventory.tsx",
      },
      {
        id: "routes/pages/BlueprintDetailGate",
        path: "/blueprints/:slug",
        file: "routes/pages/BlueprintDetailGate.tsx",
      },
      {
        id: "routes/pages/WishlistManager",
        path: "/shopping-lists",
        file: "routes/pages/WishlistManager.tsx",
      },
      {
        id: "routes/pages/WishlistDetail",
        path: "/shopping-lists/:wishlist_id",
        file: "routes/pages/WishlistDetail.tsx",
      },
      {
        id: "routes/pages/ShoppingList",
        path: "/shopping-lists/:wishlist_id/shopping-list",
        file: "routes/pages/ShoppingList.tsx",
      },
      {
        id: "routes/pages/ResourceBrowser",
        path: "/resources",
        file: "routes/pages/ResourceBrowser.tsx",
      },
      {
        id: "routes/pages/ResourceDetail",
        path: "/resources/:resource_id",
        file: "routes/pages/ResourceDetail.tsx",
      },
      {
        id: "routes/pages/MiningPage",
        path: "/mining",
        file: "routes/pages/MiningPage.tsx",
      },
      {
        id: "routes/pages/MiningOreDetailGate",
        path: "/mining/ores/:name",
        file: "routes/pages/MiningOreDetailGate.tsx",
      },
      {
        id: "routes/pages/MiningPage~2",
        path: "/mining/locations",
        file: "routes/pages/MiningPage.tsx",
      },
      {
        id: "routes/pages/MiningLocationDetailGate",
        path: "/mining/locations/:name",
        file: "routes/pages/MiningLocationDetailGate.tsx",
      },
      {
        id: "routes/pages/WikiHub",
        path: "/wiki",
        file: "routes/pages/WikiHub.tsx",
      },
      {
        id: "routes/pages/WikiItemDetail",
        path: "/wiki/items/:id",
        file: "routes/pages/WikiItemDetail.tsx",
      },
      {
        id: "routes/pages/WikiItemBrowser",
        path: "/wiki/items",
        file: "routes/pages/WikiItemBrowser.tsx",
      },
      {
        id: "routes/pages/WikiShipDetailGate",
        path: "/wiki/ships/:id",
        file: "routes/pages/WikiShipDetailGate.tsx",
      },
      {
        id: "routes/pages/WikiShipBrowser",
        path: "/wiki/ships",
        file: "routes/pages/WikiShipBrowser.tsx",
      },
      {
        id: "routes/pages/WikiCommodityBrowser",
        path: "/wiki/commodities",
        file: "routes/pages/WikiCommodityBrowser.tsx",
      },
      {
        id: "routes/pages/WikiCommodityDetail",
        path: "/wiki/commodities/:id",
        file: "routes/pages/WikiCommodityDetail.tsx",
      },
      {
        id: "routes/pages/WikiLocationBrowser",
        path: "/wiki/locations",
        file: "routes/pages/WikiLocationBrowser.tsx",
      },
      {
        id: "routes/pages/WikiRefineryPage",
        path: "/wiki/refinery",
        file: "routes/pages/WikiRefineryPage.tsx",
      },
      {
        id: "routes/pages/WikiManufacturerPage",
        path: "/wiki/manufacturers/:id",
        file: "routes/pages/WikiManufacturerPage.tsx",
      },
      {
        id: "routes/pages/WikiManufacturerList",
        path: "/wiki/manufacturers",
        file: "routes/pages/WikiManufacturerList.tsx",
      },
      {
        id: "routes/pages/FrontendErrorPage",
        path: "/error",
        file: "routes/pages/FrontendErrorPage.tsx",
      },
      {
        id: "routes/pages/GuidesHub",
        path: "/guides",
        file: "routes/pages/GuidesHub.tsx",
      },
      {
        id: "routes/pages/GuideCategory",
        path: "/guides/:category",
        file: "routes/pages/GuideCategory.tsx",
      },
      {
        id: "routes/pages/GuidePage",
        path: "/guides/:category/:slug",
        file: "routes/pages/GuidePage.tsx",
      },
      {
        id: "routes/pages/AboutPage",
        path: "/about",
        file: "routes/pages/AboutPage.tsx",
      },
      {
        id: "routes/elements/Navigate.guides",
        path: "/help",
        file: "routes/elements/Navigate.guides.tsx",
      },
      {
        id: "routes/pages/Error404",
        path: "/*",
        file: "routes/pages/Error404.tsx",
      },
    ],
  },
] satisfies RouteConfig

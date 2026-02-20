/**
 * Route Registry - Central registry for all route lazy imports
 * This enables prefetching and dynamic loading of route components
 */

export type RouteImportFunction = () => Promise<any>

/**
 * Registry of all route imports by path
 * Key: route path, Value: lazy import function
 */
export const routeRegistry: Record<string, RouteImportFunction> = {
  // Public routes
  "/": () => import("../pages/home/LandingPage"),
  "/login": () => import("../pages/authentication/LoginPage"),
  "/signup": () => import("../pages/authentication/SignUpPage"),
  "/market": () => import("../features/market"),
  "/market/services": () => import("../features/market"),
  "/bulk": () => import("../features/market-bulk"),
  "/buyorders": () => import("../features/market-buy-orders"),
  "/contractors": () => import("../pages/contractor/Contractors"),
  "/contracts": () => import("../pages/contracting/Contracts"),
  "/contracts/create": () =>
    import("../pages/contracting/CreatePublicContractPage"),
  "/recruiting": () => import("../pages/recruiting/Recruiting"),

  // Market routes
  "/market/:id": () => import("../pages/market/ViewMarketListing"),
  "/market/aggregate/:id": () => import("../pages/market/ViewMarketAggregate"),
  "/market/multiple/:id": () => import("../pages/market/ViewMarketMultiple"),
  "/market/category/:name": () => import("../features/market"),
  "/buyorder/create": () => import("../pages/market/CreateBuyOrder"),

  // Contractor routes
  "/contractor/:id": () => import("../pages/contractor/ViewOrg"),
  "/contractor/:id/:tab": () => import("../pages/contractor/ViewOrg"),

  // Contract/Order routes
  "/contract/:id": () => import("../pages/contracting/ViewOrder"),
  "/contract/:id/:tab": () => import("../pages/contracting/ViewOrder"),
  "/order/:id": () => import("../pages/contracting/ViewOrder"),
  "/order/:id/:tab": () => import("../pages/contracting/ViewOrder"),
  "/contracts/public/:contract_id": () =>
    import("../pages/contracting/ViewPublicContract"),
  "/order/service/:service_id": () =>
    import("../pages/contracting/CreateOrder"),

  // User routes
  "/user/:username": () => import("../pages/people/Profile"),
  "/user/:username/:tab": () => import("../pages/people/Profile"),

  // Recruiting routes
  "/recruiting/post/:post_id": () =>
    import("../pages/recruiting/RecruitingPostPage"),

  // Offer routes
  "/offer/:id": () => import("../pages/offers/ViewOfferPage"),
  "/offer/:id/counteroffer": () => import("../pages/offers/CounterOfferPage"),

  // Authenticated routes
  "/dashboard": () => import("../pages/contractor/MemberDashboard"),
  "/profile": () => import("../pages/people/MyProfile"),
  "/profile/:tab": () => import("../pages/people/MyProfile"),
  "/settings": () => import("../pages/people/SettingsPage"),
  "/notifications": () => import("../pages/notifications/NotificationsPage"),
  "/messages": () => import("../pages/messaging/MessagesList"),
  "/messages/:chat_id": () => import("../pages/messaging/Messages"),
  "/accountlink": () => import("../pages/authentication/AuthenticateRSI"),

  // Market management routes
  "/market/create": () => import("../pages/market/MarketCreate"),
  "/market/create/:tab": () => import("../pages/market/MarketCreate"),
  "/market/me": () => import("../pages/market/MyMarketListings"),
  "/market/manage": () => import("../pages/market/ManageStock"),
  "/market/manage-stock": () => import("../pages/market/ManageStockLots"),
  "/market/stock/:listingId": () =>
    import("../pages/market/ManageListingStock"),
  "/market/cart": () => import("../pages/market/MarketCart"),
  "/market_edit/:id": () => import("../pages/market/ViewMarketListing"),
  "/market/multiple/:id/edit": () =>
    import("../pages/market/ViewMarketListing"),
  "/sell": () => import("../pages/market/SellMaterials"),

  // Order routes
  "/orders": () => import("../pages/contracting/CreateOrder"),
  "/order/service/create": () => import("../pages/contracting/CreateService"),
  "/order/service/:service_id/edit": () =>
    import("../pages/contracting/CreateService"),
  "/order/services": () => import("../pages/contracting/MyServices"),

  // Organization routes
  "/org/register": () => import("../pages/contractor/OrgRegister"),
  "/org/members": () => import("../pages/people/People"),
  "/org/fleet": () => import("../pages/fleet/Fleet"),
  "/myorg": () => import("../pages/contractor/ViewOrg"),
  "/org/send": () => import("../pages/money/SendMoney"),
  "/org/orders": () => import("../pages/contractor/OrgOrders"),
  "/org/manage": () => import("../pages/contractor/OrgManage"),
  "/org/money": () => import("../pages/contractor/OrgMoney"),

  // Fleet routes
  "/myfleet": () => import("../pages/contractor/MemberFleet"),
  "/myfleet/import": () => import("../pages/fleet/ImportFleet"),
  "/delivery/:delivery_id": () => import("../pages/contractor/MemberFleet"),

  // Recruiting management routes
  "/recruiting/post/create": () =>
    import("../pages/recruiting/CreateRecruitingPostPage"),
  "/recruiting/post/:post_id/update": () =>
    import("../pages/recruiting/CreateRecruitingPostPage"),

  // People routes
  "/customers": () => import("../pages/people/People"),

  // Email routes
  "/email/verify": () => import("../pages/email/EmailVerificationPage"),
  "/email/verify/:token": () => import("../pages/email/EmailVerificationPage"),
  "/email/unsubscribe": () => import("../pages/email/UnsubscribePage"),
  "/email/unsubscribe/:token": () => import("../pages/email/UnsubscribePage"),

  // Other routes
  "/availability": () => import("../pages/availability/Availability"),
  "/send": () => import("../pages/money/SendMoney"),
  "/contractor_invite/:invite_id": () =>
    import("../pages/contracting/AcceptOrgInvite"),

  // Admin routes
  "/admin/users": () => import("../pages/people/People"),
  "/admin/market": () => import("../pages/admin/AllMarketListings"),
  "/admin/orders": () => import("../pages/admin/AdminOrderStats"),
  "/admin/moderation": () => import("../pages/admin/AdminModeration"),
  "/admin/alerts": () => import("../pages/admin/AdminAlerts"),
  "/admin/audit-logs": () => import("../pages/admin/AdminAuditLogs"),
  "/admin/notification-test": () =>
    import("../pages/admin/AdminNotificationTest"),
  "/admin/attribute-definitions": () =>
    import("../pages/admin/AdminAttributeDefinitions"),
  "/admin/game-item-attributes": () =>
    import("../pages/admin/AdminGameItemAttributes"),
  "/admin/import-monitoring": () =>
    import("../pages/admin/AdminImportMonitoring"),

  // Widget routes
  "/widget/orders": () => import("../pages/widget/OrdersWidget"),

  // Error routes
  "/error": () => import("../pages/errors/FrontendError"),
  "/*": () => import("../pages/errors/Error404"),
}

/**
 * Get the import function for a route path
 */
export function getRouteImport(path: string): RouteImportFunction | undefined {
  return routeRegistry[path]
}

/**
 * Check if a route is registered
 */
export function isRouteRegistered(path: string): boolean {
  return path in routeRegistry
}

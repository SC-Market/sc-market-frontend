import React from "react"
import {
  PageSkeleton,
  MarketPageSkeleton,
  DashboardSkeleton,
  ProfileSkeleton,
  ListPageSkeleton,
  DetailPageSkeleton,
  FormPageSkeleton,
  AdminPageSkeleton,
  MessageListSkeleton,
  OrderDetailSkeleton,
  ContractDetailSkeleton,
  RecruitingPostViewSkeleton,
  OfferDetailSkeleton,
  MarketListingDetailSkeleton,
  MarketCartSkeleton,
  ContractorsListSkeleton,
  FleetSkeleton,
  RecruitingListSkeleton,
  ContractsListSkeleton,
  LandingPageSkeleton,
} from "../components/skeletons"

/**
 * Maps route paths to their appropriate skeleton components
 * Prevents CLS by showing structure-matching skeletons during lazy loading
 */
export const routeSkeletonMap: Record<string, React.ComponentType> = {
  // Market routes
  "/market": MarketPageSkeleton,
  "/market/services": MarketPageSkeleton,
  "/market/category/:name": MarketPageSkeleton,
  "/bulk": MarketPageSkeleton,
  "/buyorders": MarketPageSkeleton,
  "/market/:id": MarketListingDetailSkeleton,
  "/market/aggregate/:id": MarketListingDetailSkeleton,
  "/market/multiple/:id": MarketListingDetailSkeleton,
  "/market_edit/:id": FormPageSkeleton,
  "/market/multiple/:id/edit": FormPageSkeleton,
  "/market/create": FormPageSkeleton,
  "/market/create/:tab": FormPageSkeleton,
  "/market/me": ListPageSkeleton,
  "/market/manage": ListPageSkeleton,
  "/market/manage-stock": ListPageSkeleton,
  "/market/stock/:listingId": ListPageSkeleton,
  "/market/cart": MarketCartSkeleton,
  "/buyorder/create": FormPageSkeleton,
  "/sell": FormPageSkeleton,

  // Contractor routes
  "/contractors": ContractorsListSkeleton,
  "/contractor/:id": ProfileSkeleton,
  "/contractor/:id/:tab": ProfileSkeleton,
  "/myorg": ProfileSkeleton,
  "/org/register": FormPageSkeleton,
  "/contractor_invite/:invite_id": PageSkeleton,

  // Contracting routes
  "/contracts": ContractsListSkeleton,
  "/contracts/create": FormPageSkeleton,
  "/contracts/public/:contract_id": ContractDetailSkeleton,
  "/contract/:id": OrderDetailSkeleton,
  "/contract/:id/:tab": OrderDetailSkeleton,
  "/order/:id": OrderDetailSkeleton,
  "/order/:id/:tab": OrderDetailSkeleton,
  "/order/service/:service_id": FormPageSkeleton,
  "/order/service/create": FormPageSkeleton,
  "/order/service/:service_id/edit": FormPageSkeleton,
  "/order/services": ListPageSkeleton,
  "/orders": FormPageSkeleton,

  // Recruiting routes
  "/recruiting": RecruitingListSkeleton,
  "/recruiting/post/:post_id": RecruitingPostViewSkeleton,
  "/recruiting/post/create": FormPageSkeleton,
  "/recruiting/post/:post_id/update": FormPageSkeleton,

  // Offer routes
  "/offer/:id": OfferDetailSkeleton,
  "/offer/:id/counteroffer": FormPageSkeleton,

  // User routes
  "/user/:username": ProfileSkeleton,
  "/user/:username/:tab": ProfileSkeleton,
  "/profile": ProfileSkeleton,
  "/profile/:tab": ProfileSkeleton,
  "/settings": FormPageSkeleton,

  // Dashboard routes
  "/dashboard": DashboardSkeleton,

  // Messaging routes
  "/messages": MessageListSkeleton,
  "/messages/:chat_id": MessageListSkeleton,
  "/messaging": MessageListSkeleton,

  // People routes
  "/customers": ListPageSkeleton,
  "/org/members": ListPageSkeleton,

  // Fleet routes
  "/myfleet": FleetSkeleton,
  "/myfleet/import": FormPageSkeleton,
  "/org/fleet": FleetSkeleton,
  "/delivery/:delivery_id": ListPageSkeleton,

  // Org management routes
  "/org/orders": ListPageSkeleton,
  "/org/manage": FormPageSkeleton,
  "/org/money": ListPageSkeleton,
  "/org/send": FormPageSkeleton,
  "/org/:contractor_id/dashboard": DashboardSkeleton,
  "/org/:contractor_id/fleet": FleetSkeleton,
  "/org/:contractor_id/send": FormPageSkeleton,
  "/org/:contractor_id/orders": ListPageSkeleton,
  "/org/:contractor_id/manage": FormPageSkeleton,
  "/org/:contractor_id/money": ListPageSkeleton,
  "/org/:contractor_id/members": ListPageSkeleton,
  "/org/:contractor_id/listings": ListPageSkeleton,
  "/org/:contractor_id/manage-stock": ListPageSkeleton,
  "/org/:contractor_id/services": ListPageSkeleton,

  // Admin routes
  "/admin/users": AdminPageSkeleton,
  "/admin/market": AdminPageSkeleton,
  "/admin/orders": AdminPageSkeleton,
  "/admin/moderation": AdminPageSkeleton,
  "/admin/alerts": AdminPageSkeleton,
  "/admin/audit-logs": AdminPageSkeleton,
  "/admin/notification-test": AdminPageSkeleton,
  "/admin/attribute-definitions": AdminPageSkeleton,
  "/admin/game-item-attributes": AdminPageSkeleton,
  "/admin/import-monitoring": AdminPageSkeleton,

  // Other routes
  "/notifications": ListPageSkeleton,
  "/availability": FormPageSkeleton,
  "/send": FormPageSkeleton,
  "/accountlink": FormPageSkeleton,
  "/email/verify": PageSkeleton,
  "/email/verify/:token": PageSkeleton,
  "/email/unsubscribe": PageSkeleton,
  "/email/unsubscribe/:token": PageSkeleton,

  // Auth routes
  "/login": PageSkeleton,
  "/signup": PageSkeleton,

  // Landing
  "/": LandingPageSkeleton,
}

/**
 * Get the appropriate skeleton component for a route path
 * Matches exact paths and parameterized routes
 */
export function getSkeletonForRoute(pathname: string): React.ComponentType {
  // Try exact match first
  if (routeSkeletonMap[pathname]) {
    return routeSkeletonMap[pathname]
  }

  // Try pattern matching for parameterized routes
  for (const [pattern, Skeleton] of Object.entries(routeSkeletonMap)) {
    if (matchRoute(pattern, pathname)) {
      return Skeleton
    }
  }

  // Default fallback
  return PageSkeleton
}

/**
 * Simple route pattern matcher
 * Matches :param patterns in routes
 */
function matchRoute(pattern: string, pathname: string): boolean {
  const patternParts = pattern.split("/")
  const pathParts = pathname.split("/")

  if (patternParts.length !== pathParts.length) {
    return false
  }

  return patternParts.every((part, i) => {
    return part.startsWith(":") || part === pathParts[i]
  })
}

import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

/**
 * Route-to-title mapping for automatic page title updates
 * Maps route patterns to translation keys
 */
const ROUTE_TITLES: Record<string, string> = {
  "/": "pages.home.title",
  "/login": "pages.login.title",
  "/signup": "pages.signup.title",
  "/market": "pages.market.title",
  "/market/services": "pages.services.title",
  "/market/create": "pages.createListing.title",
  "/market/me": "pages.myListings.title",
  "/market/manage": "pages.manageStock.title",
  "/market/manage-stock": "pages.manageStockLots.title",
  "/market/cart": "pages.cart.title",
  "/bulk": "pages.bulkItems.title",
  "/buyorders": "pages.buyOrders.title",
  "/contractors": "pages.contractors.title",
  "/contracts": "pages.contracts.title",
  "/contracts/create": "pages.createContract.title",
  "/messages": "pages.messages.title",
  "/recruiting": "pages.recruiting.title",
  "/recruiting/post/create": "pages.createRecruitingPost.title",
  "/orders": "pages.orders.title",
  "/dashboard": "pages.dashboard.title",
  "/profile": "pages.profile.title",
  "/settings": "pages.settings.title",
  "/notifications": "pages.notifications.title",
  "/myfleet": "pages.myFleet.title",
  "/availability": "pages.availability.title",
  "/myorg": "pages.myOrg.title",
  "/org/fleet": "pages.orgFleet.title",
  "/org/orders": "pages.orgOrders.title",
  "/org/manage": "pages.orgManage.title",
  "/org/money": "pages.orgMoney.title",
  "/org/members": "pages.orgMembers.title",
  "/org/register": "pages.orgRegister.title",
  "/admin/users": "pages.admin.users.title",
  "/admin/market": "pages.admin.market.title",
  "/admin/orders": "pages.admin.orders.title",
  "/admin/moderation": "pages.admin.moderation.title",
  "/admin/alerts": "pages.admin.alerts.title",
  "/admin/audit-logs": "pages.admin.auditLogs.title",
  "/admin/attribute-definitions": "pages.admin.attributeDefinitions.title",
  "/admin/game-item-attributes": "pages.admin.gameItemAttributes.title",
  "/admin/import-monitoring": "pages.admin.importMonitoring.title",
}

/**
 * Hook that automatically updates the document title based on the current route
 * Falls back to a generic title if no specific mapping exists
 * 
 * This ensures WCAG 2.1 Level AA compliance for Requirement 2.8:
 * "Page title changes during navigation"
 */
export function usePageTitle() {
  const location = useLocation()
  const { t } = useTranslation()

  useEffect(() => {
    // Get the current pathname
    const pathname = location.pathname

    // Try to find an exact match first
    let titleKey = ROUTE_TITLES[pathname]

    // If no exact match, try to find a partial match for dynamic routes
    if (!titleKey) {
      // Check for dynamic routes (e.g., /market/:id, /user/:username)
      const matchingRoute = Object.keys(ROUTE_TITLES).find((route) => {
        // Convert route pattern to regex
        const pattern = route.replace(/:[^/]+/g, "[^/]+")
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(pathname)
      })

      if (matchingRoute) {
        titleKey = ROUTE_TITLES[matchingRoute]
      }
    }

    // Update the document title
    if (titleKey) {
      const title = t(titleKey, { defaultValue: "SC Market" })
      document.title = `${title} - SC Market`
    } else {
      // Fallback: Generate a title from the pathname
      const segments = pathname.split("/").filter(Boolean)
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1]
        const title = lastSegment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
        document.title = `${title} - SC Market`
      } else {
        document.title = "SC Market"
      }
    }
  }, [location.pathname, t])
}

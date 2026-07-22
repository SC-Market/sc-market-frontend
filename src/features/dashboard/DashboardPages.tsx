/**
 * Route entry points for the customizable dashboard (behind the
 * `customizable_dashboard` flag). Each resolves the dashboard owner from its
 * route context and renders CustomizableDashboard. These are NEW, dedicated
 * "Dashboard" tabs — the legacy pages (Assigned to Me, shop Orders, the org
 * dashboard) are left untouched. When the flag is off the routes redirect to
 * their legacy equivalents so bookmarks degrade gracefully.
 */

import { Navigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useFeatureFlag } from "../../hooks/market"
import { useOptionalShopRouteContext } from "../../components/router/ShopContextFromRoute"
import { PATHS, SHOP_PATHS, ORG_PATHS } from "../../routes/paths"
import { CustomizableDashboard } from "./CustomizableDashboard"
import { useOrgDashboardOwner } from "./useOrgDashboardOwner"

/** Personal customizable dashboard — /dashboard/overview. */
export function PersonalDashboardPage() {
  const { flags } = useFeatureFlag()
  if (!flags.customizable_dashboard) {
    return <Navigate to={PATHS.dashboard} replace />
  }
  return <CustomizableDashboard />
}

/** Shop shared dashboard — /shop/:shopSlug/dashboard. */
export function ShopDashboardPage() {
  const { flags } = useFeatureFlag()
  const shopCtx = useOptionalShopRouteContext()

  if (!shopCtx) {
    return <Navigate to={PATHS.dashboardShops} replace />
  }
  if (!flags.customizable_dashboard) {
    return <Navigate to={SHOP_PATHS.orders(shopCtx.shop.slug)} replace />
  }
  return (
    <CustomizableDashboard
      owner={{ ownerType: "shop", ownerId: shopCtx.shop.shop_id }}
      canEdit={shopCtx.shop.permissions?.can_manage === true}
      title={shopCtx.shop.name}
    />
  )
}

/** Org shared dashboard — /org/:contractor_id/overview. */
export function OrgDashboardPage() {
  const { t } = useTranslation()
  const { flags } = useFeatureFlag()
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const spectrumId = contractor_id ?? ""
  const { owner, canEdit, orgName } = useOrgDashboardOwner(spectrumId)

  if (!flags.customizable_dashboard) {
    return <Navigate to={ORG_PATHS.dashboard(spectrumId)} replace />
  }
  return (
    <CustomizableDashboard
      owner={owner}
      canEdit={canEdit}
      title={t("dashboard.orgTitle", {
        name: orgName,
        defaultValue: `${orgName} Dashboard`,
      })}
    />
  )
}

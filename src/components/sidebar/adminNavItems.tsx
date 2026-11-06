/** The sidebar's admin-context destinations, grouped by area. */
import type { TFunction } from "i18next"
import {
  BadgeRounded,
  CampaignRounded,
  CategoryRounded,
  EventBusyRounded,
  GavelRounded,
  HistoryRounded,
  InventoryRounded,
  ListAltRounded,
  LocalShippingRounded,
  ManageAccountsRounded,
  MessageRounded,
  MonitorHeartRounded,
  PeopleRounded,
  PersonAddRounded,
  PhonelinkLockRounded,
  ScienceRounded,
  SettingsRounded,
  StorefrontRounded,
  TuneRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material"
import { ADMIN_PATHS, PATHS } from "../../routes/paths"
import type { NavItem } from "./sidebarNavItems"

export function adminNavItems(t: TFunction): NavItem[] {
  const ops = t("nav.groupAdminOps", "Operations")
  const data = t("nav.groupAdminData", "Data & Config")
  const security = t("nav.groupAdminSecurity", "Security & Testing")
  return [
    {
      label: t("nav.adminOrders", "Orders"),
      to: ADMIN_PATHS.orders,
      icon: <LocalShippingRounded />,
      group: ops,
    },
    {
      label: t("nav.adminUsers", "Users"),
      to: ADMIN_PATHS.users,
      icon: <PeopleRounded />,
      group: ops,
    },
    {
      label: t("nav.adminMarket", "Market"),
      to: ADMIN_PATHS.market,
      icon: <StorefrontRounded />,
      group: ops,
    },
    {
      label: t("nav.adminWipe", "Expire Listings"),
      to: ADMIN_PATHS.wipe,
      icon: <EventBusyRounded />,
      group: ops,
    },
    {
      label: t("nav.adminPremium", "Premium"),
      to: ADMIN_PATHS.premium,
      icon: <WorkspacePremiumRounded />,
      group: ops,
    },
    {
      label: t("nav.adminAlerts", "Alerts"),
      to: ADMIN_PATHS.alerts,
      icon: <CampaignRounded />,
      group: ops,
    },
    {
      label: t("nav.adminModeration", "Moderation"),
      to: ADMIN_PATHS.moderation,
      icon: <GavelRounded />,
      group: ops,
    },
    {
      label: t("nav.adminSupplierDashboard", "Supplier Dashboard"),
      to: ADMIN_PATHS.supplierDashboard,
      icon: <InventoryRounded />,
      group: ops,
    },
    {
      label: t("nav.adminSupplierRoster", "Supplier Roster"),
      to: ADMIN_PATHS.supplierRoster,
      icon: <BadgeRounded />,
      group: ops,
    },
    {
      label: t("nav.adminRequisitions", "Requisitions"),
      to: ADMIN_PATHS.requisitions,
      icon: <ListAltRounded />,
      group: ops,
    },
    {
      label: t("nav.adminFeatureFlags", "Feature Flags"),
      to: ADMIN_PATHS.featureFlags,
      icon: <SettingsRounded />,
      group: data,
    },
    {
      label: t("nav.adminGameData", "Game Data Import"),
      to: ADMIN_PATHS.gameDataImport,
      icon: <ScienceRounded />,
      group: data,
    },
    {
      label: t("nav.adminAttributes", "Attributes"),
      to: ADMIN_PATHS.attributeDefinitions,
      icon: <TuneRounded />,
      group: data,
    },
    {
      label: t("nav.adminGameItemAttrs", "Game Item Attributes"),
      to: ADMIN_PATHS.gameItemAttributes,
      icon: <CategoryRounded />,
      group: data,
    },
    {
      label: t("nav.adminImportMonitoring", "Import Monitoring"),
      to: ADMIN_PATHS.importMonitoring,
      icon: <MonitorHeartRounded />,
      group: data,
    },
    {
      label: t("nav.adminIdentity", "Identity"),
      to: ADMIN_PATHS.identity,
      icon: <ManageAccountsRounded />,
      group: security,
    },
    {
      label: t("nav.adminTestAccounts", "Test Accounts"),
      to: ADMIN_PATHS.testAccounts,
      icon: <PersonAddRounded />,
      group: security,
    },
    {
      label: t("nav.adminAuditLogs", "Audit Logs"),
      to: ADMIN_PATHS.auditLogs,
      icon: <HistoryRounded />,
      group: security,
    },
    {
      label: t("nav.adminNotificationTest", "Notification Test"),
      to: ADMIN_PATHS.notificationTest,
      icon: <MessageRounded />,
      group: security,
    },
    {
      label: t("nav.adminTwoFactor", "Two-factor"),
      to: `${PATHS.settings}?mfa=1`,
      icon: <PhonelinkLockRounded />,
      group: security,
    },
  ]
}

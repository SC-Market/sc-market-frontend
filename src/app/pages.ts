/**
 * Every page a route renders (src/routes/pages/*: definePage("Name")): the
 * chunk to load and the export to render. Only the client entry imports
 * this (see src/routes/definePage.tsx for why the import()s live here).
 */
import { pageEntry } from "../routes/definePage"

export const pages = {
  AboutPage: pageEntry(
    () => import("../pages/about/AboutPage"),
    (m) => m.AboutPage,
  ),
  AcceptOrgInvite: pageEntry(
    () => import("../pages/contracting/AcceptOrgInvite"),
    (m) => m.AcceptOrgInvite,
  ),
  AdminAlerts: pageEntry(
    () => import("../pages/admin/AdminAlerts"),
    (m) => m.AdminAlerts,
  ),
  AdminAttributeDefinitions: pageEntry(
    () => import("../pages/admin/AdminAttributeDefinitions"),
    (m) => m.AdminAttributeDefinitions,
  ),
  AdminAuditLogs: pageEntry(
    () => import("../pages/admin/AdminAuditLogs"),
    (m) => m.AdminAuditLogs,
  ),
  AdminFeatureFlagDetail: pageEntry(
    () => import("../pages/admin/AdminFeatureFlags"),
    (m) => m.AdminFeatureFlagDetail,
  ),
  AdminFeatureFlags: pageEntry(
    () => import("../pages/admin/AdminFeatureFlags"),
    (m) => m.AdminFeatureFlags,
  ),
  AdminGameDataImport: pageEntry(
    () => import("../pages/admin/AdminGameDataImport"),
    (m) => m.AdminGameDataImport,
  ),
  AdminGameItemAttributes: pageEntry(
    () => import("../pages/admin/AdminGameItemAttributes"),
    (m) => m.AdminGameItemAttributes,
  ),
  AdminImportMonitoring: pageEntry(
    () => import("../pages/admin/AdminImportMonitoring"),
    (m) => m.AdminImportMonitoring,
  ),
  AdminModeration: pageEntry(
    () => import("../pages/admin/AdminModeration"),
    (m) => m.AdminModeration,
  ),
  AdminNotificationTest: pageEntry(
    () => import("../pages/admin/AdminNotificationTest"),
    (m) => m.AdminNotificationTest,
  ),
  AdminOrderStats: pageEntry(
    () => import("../pages/admin/AdminOrderStats"),
    (m) => m.AdminOrderStats,
  ),
  AdminPremiumManagement: pageEntry(
    () => import("../pages/admin/AdminPremiumManagement"),
    (m) => m.AdminPremiumManagement,
  ),
  AdminRequisitions: pageEntry(
    () => import("../pages/admin/AdminRequisitions"),
    (m) => m.AdminRequisitions,
  ),
  AdminSupplierDashboard: pageEntry(
    () => import("../pages/admin/AdminSupplierDashboard"),
    (m) => m.AdminSupplierDashboard,
  ),
  AdminSupplierRoster: pageEntry(
    () => import("../pages/admin/AdminSupplierRoster"),
    (m) => m.AdminSupplierRoster,
  ),
  AdminIdentity: pageEntry(
    () => import("../pages/admin/AdminIdentity"),
    (m) => m.AdminIdentity,
  ),
  AdminTestAccounts: pageEntry(
    () => import("../pages/admin/AdminTestAccounts"),
    (m) => m.AdminTestAccounts,
  ),
  AdminUserListPage: pageEntry(
    () => import("../pages/people/People"),
    (m) => m.AdminUserListPage,
  ),
  AdminWipeListings: pageEntry(
    () => import("../pages/admin/AdminWipeListings"),
    (m) => m.AdminWipeListings,
  ),
  AggregateDetailGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.AggregateDetailGate,
  ),
  AllMarketListings: pageEntry(
    () => import("../pages/admin/AllMarketListings"),
    (m) => m.AllMarketListings,
  ),
  AuthenticateRSIPage: pageEntry(
    () => import("../pages/authentication/AuthenticateRSI"),
    (m) => m.AuthenticateRSIPage,
  ),
  Availability: pageEntry(
    () => import("../pages/availability/Availability"),
    (m) => m.Availability,
  ),
  BlueprintBrowser: pageEntry(
    () => import("../pages/blueprints/BlueprintBrowser"),
    (m) => m.BlueprintBrowser,
  ),
  BlueprintDetailGate: pageEntry(
    () => import("../pages/blueprints/BlueprintDetailGate"),
    (m) => m.BlueprintDetailGate,
  ),
  BlueprintInventory: pageEntry(
    () => import("../pages/blueprints/BlueprintInventory"),
    (m) => m.BlueprintInventory,
  ),
  BuyOrderDetailV2: pageEntry(
    () => import("../features/market/v2/BuyOrderDetailV2"),
    (m) => m.BuyOrderDetailV2,
  ),
  Contractors: pageEntry(
    () => import("../pages/contractor/Contractors"),
    (m) => m.Contractors,
  ),
  Contracts: pageEntry(
    () => import("../pages/contracting/Contracts"),
    (m) => m.Contracts,
  ),
  CounterOfferPage: pageEntry(
    () => import("../pages/offers/CounterOfferPage"),
    (m) => m.CounterOfferPage,
  ),
  CraftingCalculator: pageEntry(
    () => import("../pages/crafting/CraftingCalculator"),
    (m) => m.CraftingCalculator,
  ),
  CraftingHistory: pageEntry(
    () => import("../pages/crafting/CraftingHistory"),
    (m) => m.CraftingHistory,
  ),
  CreateBuyOrderGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.CreateBuyOrderGate,
  ),
  CreateListingGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.CreateListingGate,
  ),
  CreateOrder: pageEntry(
    () => import("../pages/contracting/CreateOrder"),
    (m) => m.CreateOrder,
  ),
  CreatePublicContractPage: pageEntry(
    () => import("../pages/contracting/CreatePublicContractPage"),
    (m) => m.CreatePublicContractPage,
  ),
  CreateRecruitingPostPage: pageEntry(
    () => import("../pages/recruiting/CreateRecruitingPostPage"),
    (m) => m.CreateRecruitingPostPage,
  ),
  CreateService: pageEntry(
    () => import("../pages/contracting/CreateService"),
    (m) => m.CreateService,
  ),
  CreateShop: pageEntry(
    () => import("../features/shops/components/CreateShop"),
    (m) => m.CreateShop,
  ),
  CustomerPage: pageEntry(
    () => import("../pages/people/People"),
    (m) => m.CustomerPage,
  ),
  EditListingGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.EditListingGate,
  ),
  EditMultipleGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.EditMultipleGate,
  ),
  EmailVerificationPage: pageEntry(
    () => import("../pages/email/EmailVerificationPage"),
    (m) => m.EmailVerificationPage,
  ),
  Error404: pageEntry(
    () => import("../pages/errors/Error404"),
    (m) => m.Error404,
  ),
  Fleet: pageEntry(
    () => import("../pages/fleet/Fleet"),
    (m) => m.Fleet,
  ),
  FrontendErrorPage: pageEntry(
    () => import("../pages/errors/FrontendError"),
    (m) => m.FrontendErrorPage,
  ),
  GuideCategory: pageEntry(
    () => import("../pages/guides/GuideCategory"),
    (m) => m.GuideCategory,
  ),
  GuidePage: pageEntry(
    () => import("../pages/guides/GuidePage"),
    (m) => m.GuidePage,
  ),
  GuidesHub: pageEntry(
    () => import("../pages/guides/GuidesHub"),
    (m) => m.GuidesHub,
  ),
  ImportFleet: pageEntry(
    () => import("../pages/fleet/ImportFleet"),
    (m) => m.ImportFleet,
  ),
  InventoryPage: pageEntry(
    () => import("../pages/inventory/InventoryPage"),
    (m) => m.default,
  ),
  ListingDetailGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.ListingDetailGate,
  ),
  LoginPage: pageEntry(
    () => import("../pages/authentication/LoginPage"),
    (m) => m.LoginPage,
  ),
  ManageStock: pageEntry(
    () => import("../pages/market/ManageStock"),
    (m) => m.ManageStock,
  ),
  ManageStockGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.ManageStockGate,
  ),
  ManageStockLots: pageEntry(
    () => import("../pages/market/ManageStockLots"),
    (m) => m.ManageStockLots,
  ),
  MarketCartGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.MarketCartGate,
  ),
  MarketRouter: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.MarketRouter,
  ),
  MemberDashboard: pageEntry(
    () => import("../pages/contractor/MemberDashboard"),
    (m) => m.MemberDashboard,
  ),
  MemberFleet: pageEntry(
    () => import("../pages/contractor/MemberFleet"),
    (m) => m.MemberFleet,
  ),
  Messages: pageEntry(
    () => import("../pages/messaging/Messages"),
    (m) => m.Messages,
  ),
  MessagesList: pageEntry(
    () => import("../pages/messaging/MessagesList"),
    (m) => m.MessagesList,
  ),
  MiningLocationDetailGate: pageEntry(
    () => import("../pages/mining/MiningLocationDetailGate"),
    (m) => m.MiningLocationDetailGate,
  ),
  MiningOreDetailGate: pageEntry(
    () => import("../pages/mining/MiningOreDetailGate"),
    (m) => m.MiningOreDetailGate,
  ),
  MiningPage: pageEntry(
    () => import("../pages/mining/MiningPage"),
    (m) => m.MiningPage,
  ),
  MissionDetailGate: pageEntry(
    () => import("../pages/missions/MissionDetailGate"),
    (m) => m.MissionDetailGate,
  ),
  MissionSearch: pageEntry(
    () => import("../pages/missions/MissionSearch"),
    (m) => m.MissionSearch,
  ),
  MultipleDetailGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.MultipleDetailGate,
  ),
  MyListingsGate: pageEntry(
    () => import("../components/market/MarketRouter"),
    (m) => m.MyListingsGate,
  ),
  MyOrg: pageEntry(
    () => import("../pages/contractor/ViewOrg"),
    (m) => m.MyOrg,
  ),
  MyOrgs: pageEntry(
    () => import("../pages/contractor/MyOrgs"),
    (m) => m.MyOrgs,
  ),
  MyProfile: pageEntry(
    () => import("../pages/people/MyProfile"),
    (m) => m.MyProfile,
  ),
  MyServicesPage: pageEntry(
    () => import("../pages/contracting/MyServices"),
    (m) => m.MyServicesPage,
  ),
  MyShops: pageEntry(
    () => import("../features/shops/components/MyShops"),
    (m) => m.MyShops,
  ),
  NotificationsPage: pageEntry(
    () => import("../pages/notifications/NotificationsPage"),
    (m) => m.NotificationsPage,
  ),
  OnboardingPage: pageEntry(
    () => import("../pages/onboarding/OnboardingPage"),
    (m) => m.OnboardingPage,
  ),
  OrdersWidget: pageEntry(
    () => import("../pages/widget/OrdersWidget"),
    (m) => m.OrdersWidget,
  ),
  OrgAboutPage: pageEntry(
    () => import("../pages/contractor/manage"),
    (m) => m.OrgAboutPage,
  ),
  OrgAuditPage: pageEntry(
    () => import("../pages/contractor/manage"),
    (m) => m.OrgAuditPage,
  ),
  OrgDashboardPage: pageEntry(
    () => import("../features/dashboard/DashboardPages"),
    (m) => m.OrgDashboardPage,
  ),
  OrgDiscordPage: pageEntry(
    () => import("../pages/contractor/manage"),
    (m) => m.OrgDiscordPage,
  ),
  OrgInvitesPage: pageEntry(
    () => import("../pages/contractor/manage"),
    (m) => m.OrgInvitesPage,
  ),
  OrgManageLayout: pageEntry(
    () => import("../pages/contractor/OrgManageLayout"),
    (m) => m.OrgManageLayout,
  ),
  OrgMoney: pageEntry(
    () => import("../pages/contractor/OrgMoney"),
    (m) => m.OrgMoney,
  ),
  OrgOrders: pageEntry(
    () => import("../pages/contractor/OrgOrders"),
    (m) => m.OrgOrders,
  ),
  OrgRedirectFleet: pageEntry(
    () => import("../components/router/OrgRedirect"),
    (m) => m.OrgRedirectFleet,
  ),
  OrgRedirectManage: pageEntry(
    () => import("../components/router/OrgRedirect"),
    (m) => m.OrgRedirectManage,
  ),
  OrgRedirectMembers: pageEntry(
    () => import("../components/router/OrgRedirect"),
    (m) => m.OrgRedirectMembers,
  ),
  OrgRedirectMoney: pageEntry(
    () => import("../components/router/OrgRedirect"),
    (m) => m.OrgRedirectMoney,
  ),
  OrgRedirectOrders: pageEntry(
    () => import("../components/router/OrgRedirect"),
    (m) => m.OrgRedirectOrders,
  ),
  OrgRedirectSend: pageEntry(
    () => import("../components/router/OrgRedirect"),
    (m) => m.OrgRedirectSend,
  ),
  OrgRegister: pageEntry(
    () => import("../pages/contractor/OrgRegister"),
    (m) => m.OrgRegister,
  ),
  OrgRolesPage: pageEntry(
    () => import("../pages/contractor/manage"),
    (m) => m.OrgRolesPage,
  ),
  OrgSettingsPage: pageEntry(
    () => import("../pages/contractor/manage"),
    (m) => m.OrgSettingsPage,
  ),
  OrgThemePage: pageEntry(
    () => import("../pages/contractor/manage"),
    (m) => m.OrgThemePage,
  ),
  PersonalDashboardPage: pageEntry(
    () => import("../features/dashboard/DashboardPages"),
    (m) => m.PersonalDashboardPage,
  ),
  Profile: pageEntry(
    () => import("../pages/people/Profile"),
    (m) => m.Profile,
  ),
  Recruiting: pageEntry(
    () => import("../pages/recruiting/Recruiting"),
    (m) => m.Recruiting,
  ),
  RecruitingPostPage: pageEntry(
    () => import("../pages/recruiting/RecruitingPostPage"),
    (m) => m.RecruitingPostPage,
  ),
  ResourceBrowser: pageEntry(
    () => import("../pages/resources/ResourceBrowser"),
    (m) => m.ResourceBrowser,
  ),
  ResourceDetail: pageEntry(
    () => import("../pages/resources/ResourceDetail"),
    (m) => m.ResourceDetail,
  ),
  SellMaterials: pageEntry(
    () => import("../pages/market/SellMaterials"),
    (m) => m.SellMaterials,
  ),
  SendMoney: pageEntry(
    () => import("../pages/money/SendMoney"),
    (m) => m.SendMoney,
  ),
  ServiceCreateOrder: pageEntry(
    () => import("../pages/contracting/CreateOrder"),
    (m) => m.ServiceCreateOrder,
  ),
  SettingsPage: pageEntry(
    () => import("../pages/people/SettingsPage"),
    (m) => m.SettingsPage,
  ),
  ShopCustomers: pageEntry(
    () => import("../features/shops/components/ShopCustomers"),
    (m) => m.ShopCustomers,
  ),
  ShopDashboardPage: pageEntry(
    () => import("../features/dashboard/DashboardPages"),
    (m) => m.ShopDashboardPage,
  ),
  ShopDirectory: pageEntry(
    () => import("../features/shops/components/ShopDirectory"),
    (m) => m.ShopDirectory,
  ),
  ShoppingList: pageEntry(
    () => import("../pages/wishlists/ShoppingList"),
    (m) => m.ShoppingList,
  ),
  ShopProfile: pageEntry(
    () => import("../features/shops/components/ShopProfile"),
    (m) => m.ShopProfile,
  ),
  ShopSettings: pageEntry(
    () => import("../features/shops/components/ShopSettings"),
    (m) => m.ShopSettings,
  ),
  SignUpPage: pageEntry(
    () => import("../pages/authentication/SignUpPage"),
    (m) => m.SignUpPage,
  ),
  UnsubscribePage: pageEntry(
    () => import("../pages/email/UnsubscribePage"),
    (m) => m.UnsubscribePage,
  ),
  UpdateRecruitingPostPage: pageEntry(
    () => import("../pages/recruiting/CreateRecruitingPostPage"),
    (m) => m.UpdateRecruitingPostPage,
  ),
  UpdateService: pageEntry(
    () => import("../pages/contracting/CreateService"),
    (m) => m.UpdateService,
  ),
  ViewOfferPage: pageEntry(
    () => import("../pages/offers/ViewOfferPage"),
    (m) => m.ViewOfferPage,
  ),
  ViewOrder: pageEntry(
    () => import("../pages/contracting/ViewOrder"),
    (m) => m.ViewOrder,
  ),
  ViewOrg: pageEntry(
    () => import("../pages/contractor/ViewOrg"),
    (m) => m.ViewOrg,
  ),
  ViewPublicContract: pageEntry(
    () => import("../pages/contracting/ViewPublicContract"),
    (m) => m.ViewPublicContract,
  ),
  WikiCommodityBrowser: pageEntry(
    () => import("../pages/wiki/WikiCommodityBrowser"),
    (m) => m.WikiCommodityBrowser,
  ),
  WikiCommodityDetail: pageEntry(
    () => import("../pages/wiki/WikiCommodityDetail"),
    (m) => m.WikiCommodityDetail,
  ),
  WikiHub: pageEntry(
    () => import("../pages/wiki/WikiHub"),
    (m) => m.WikiHub,
  ),
  WikiItemBrowser: pageEntry(
    () => import("../pages/wiki/WikiItemBrowser"),
    (m) => m.WikiItemBrowser,
  ),
  WikiItemDetail: pageEntry(
    () => import("../pages/wiki/WikiItemDetail"),
    (m) => m.WikiItemDetail,
  ),
  WikiLocationBrowser: pageEntry(
    () => import("../pages/wiki/WikiLocationBrowser"),
    (m) => m.WikiLocationBrowser,
  ),
  WikiManufacturerList: pageEntry(
    () => import("../pages/wiki/WikiManufacturerList"),
    (m) => m.WikiManufacturerList,
  ),
  WikiManufacturerPage: pageEntry(
    () => import("../pages/wiki/WikiManufacturerPage"),
    (m) => m.WikiManufacturerPage,
  ),
  WikiRefineryPage: pageEntry(
    () => import("../pages/wiki/WikiRefineryPage"),
    (m) => m.WikiRefineryPage,
  ),
  WikiShipBrowser: pageEntry(
    () => import("../pages/wiki/WikiShipBrowser"),
    (m) => m.WikiShipBrowser,
  ),
  WikiShipDetailGate: pageEntry(
    () => import("../pages/wiki/WikiShipDetailGate"),
    (m) => m.WikiShipDetailGate,
  ),
  WishlistDetail: pageEntry(
    () => import("../pages/wishlists/WishlistDetail"),
    (m) => m.WishlistDetail,
  ),
  WishlistManager: pageEntry(
    () => import("../pages/wishlists/WishlistManager"),
    (m) => m.WishlistManager,
  ),
}

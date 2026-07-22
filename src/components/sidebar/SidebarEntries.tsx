import DashboardIcon from "@mui/icons-material/DashboardRounded"
import LocalShipping from "@mui/icons-material/LocalShipping"
import ForumRoundedIcon from "@mui/icons-material/ForumRounded"
import GavelIcon from "@mui/icons-material/GavelRounded"
import {
  AssignmentTurnedInRounded,
  CableRounded,
  CalendarMonthRounded,
  CloudDownloadRounded,
  DashboardCustomizeRounded,
  DesignServicesRounded,
  HomeRounded,
  InventoryRounded,
  ListAltRounded,
  ManageAccountsRounded,
  PersonAddRounded,
  RequestQuoteRounded,
  ShieldRounded,
  StoreRounded,
  WarehouseRounded,
  SecurityRounded,
  SyncRounded,
  StarRounded,
  ToggleOnRounded,
  MenuBookRounded,
  RocketLaunchRounded,
  CategoryRounded,
  PublicRounded,
  BusinessCenterRounded,
  ScienceRounded,
  ExploreRounded,
  ConstructionRounded,
  ChecklistRounded,
  TerrainRounded,
  HardwareRounded,
} from "@mui/icons-material"
import PaidIcon from "@mui/icons-material/PaidRounded"
import CreateIcon from "@mui/icons-material/CreateRounded"
import AssignmentIcon from "@mui/icons-material/AssignmentRounded"
import BusinessIcon from "@mui/icons-material/BusinessRounded"
import SettingsIcon from "@mui/icons-material/SettingsRounded"
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded"
import FolderOpenIcon from "@mui/icons-material/FolderOpenRounded"
import PeopleAltIcon from "@mui/icons-material/PeopleAltRounded"
import NotificationsIcon from "@mui/icons-material/NotificationsRounded"
import React from "react"
import { SidebarSectionProps } from "./types"
import { Pistol } from "mdi-material-ui"
import { ModerationSidebarEntry } from "./ModerationSidebarEntry"
import {
  PATHS,
  SHOP_PATHS,
  MARKET_PATHS,
  ORDER_PATHS,
  WIKI_PATHS,
  GAME_DATA_PATHS,
  ADMIN_PATHS,
} from "../../routes/paths"

export const all_sidebar_entries: SidebarSectionProps[] = [
  {
    title: "sidebar.market.title",
    items: [
      {
        text: "sidebar.player_market",
        icon: <StoreRounded />,
        tab_key: "market",
        children: [
          {
            to: MARKET_PATHS.search,
            text: "sidebar.everything",
            icon: <HomeRounded />,
          },
          {
            to: MARKET_PATHS.category("weapon"),
            params: "type=weapon",
            text: "sidebar.weapons",
            icon: <Pistol />,
          },
          {
            to: MARKET_PATHS.category("armor"),
            text: "sidebar.armor",
            params: "type=armor",
            icon: <ShieldRounded />,
          },
          {
            to: MARKET_PATHS.category("component"),
            text: "sidebar.components",
            params: "type=component",
            icon: <CableRounded />,
          },
          {
            to: MARKET_PATHS.buyOrders,
            text: "sidebar.buy_orders",
            icon: <RequestQuoteRounded />,
          },
        ],
      },

      {
        to: MARKET_PATHS.services,
        text: "sidebar.contractor_services", tab_key: "services",
        icon: <DesignServicesRounded />,
      },
      {
        to: SHOP_PATHS.directory,
        text: "sidebar.browse_shops",
        icon: <StoreRounded />,
      },
      {
        to: PATHS.contracts,
        text: "sidebar.open_contracts", tab_key: "contracts",
        icon: <AssignmentIcon />,
        custom: false,
      },
      {
        to: PATHS.contracts,
        text: "sidebar.open_contracts", tab_key: "contracts",
        icon: <AssignmentIcon />,
        custom: true,
        org: true,
      },
      {
        to: "/sell",
        text: "sidebar.sell_materials",
        icon: <PaidIcon />,
        hidden: true,
        logged_in: true,
      },
    ],
  },
  {
    title: "sidebar.orders.title",
    items: [
      {
        to: PATHS.myOrders,
        text: "sidebar.orders_ive_placed",
        icon: <CreateIcon />,
        logged_in: true,
      },
      {
        to: PATHS.dashboard,
        text: "sidebar.orders_assigned_to_me", tab_key: "orders_assigned",
        icon: <AssignmentTurnedInRounded />,
        logged_in: true,
        custom: false,
        orgRouteRest: "dashboard",
      },
      {
        to: PATHS.dashboard,
        text: "sidebar.orders_assigned_to_me", tab_key: "orders_assigned",
        icon: <AssignmentTurnedInRounded />,
        logged_in: true,
        custom: true,
        org: true,
        orgRouteRest: "dashboard",
      },
      {
        to: "/org/orders",
        text: "sidebar.org_orders",
        icon: <DashboardIcon />,
        org_admin: true,
        orgRouteRest: "orders",
      },
      {
        to: PATHS.messages,
        text: "sidebar.messaging", tab_key: "messaging",
        icon: <ForumRoundedIcon />,
        logged_in: true,
      },
    ],
  },
  {
    title: "sidebar.dashboard.title",
    items: [
      {
        to: PATHS.dashboardShops,
        text: "sidebar.my_shops", tab_key: "my_shops",
        icon: <StoreRounded />,
        logged_in: true,
      },
      {
        to: PATHS.inventory,
        text: "sidebar.inventory", tab_key: "inventory",
        icon: <InventoryRounded />,
        logged_in: true,
      },
      {
        to: PATHS.availability,
        text: "sidebar.availability", tab_key: "availability",
        icon: <CalendarMonthRounded />,
        logged_in: true,
      },
    ],
  },
  {
    title: "sidebar.manage.title",
    items: [
      {
        to: MARKET_PATHS.manage,
        text: "sidebar.manage_market_listings", tab_key: "manage_listings",
        icon: <ListAltRounded />,
        logged_in: true,
        shopRouteRest: "listings",
        requiresShop: true,
      },
      {
        to: MARKET_PATHS.manageStock,
        text: "sidebar.manage_stock", tab_key: "manage_stock",
        icon: <WarehouseRounded />,
        logged_in: true,
        shopRouteRest: "stock",
        requiresShop: true,
      },
      {
        to: ORDER_PATHS.services,
        text: "sidebar.manage_services", tab_key: "manage_services",
        icon: <DashboardCustomizeRounded />,
        logged_in: true,
        shopRouteRest: "services",
        requiresShop: true,
      },
      {
        to: "/shop/orders",
        text: "sidebar.shop_orders", tab_key: "shop_orders",
        icon: <AssignmentTurnedInRounded />,
        logged_in: true,
        shopRouteRest: "orders",
        requiresShop: true,
      },
    ],
  },
  {
    title: "sidebar.organizations.title",
    items: [
      {
        to: PATHS.myOrgs,
        text: "sidebar.my_orgs",
        icon: <ManageAccountsRounded />,
        logged_in: true,
      },
      {
        to: PATHS.contractors,
        text: "sidebar.contractors",
        icon: <BusinessIcon />,
        custom: false,
      },
      {
        to: PATHS.recruiting,
        text: "sidebar.recruiting", tab_key: "recruiting",
        icon: <PersonAddRounded />,
        custom: false,
      },
      // {
      //     to: "/recruiting",
      //     text: "sidebar.join_the_org",
      //     icon: (<PersonAddRounded/>),
      //     custom: true,
      // },
      {
        to: PATHS.orgRegister,
        text: "sidebar.register",
        icon: <CreateIcon />,
        org: false,
        logged_in: true,
      },
    ],
  },
  {
    title: "sidebar.gameData.title",
    items: [
      {
        text: "sidebar.gameData.missions",
        icon: <ExploreRounded />,
        tab_key: "missions",
        to: GAME_DATA_PATHS.missions,
      },
      {
        text: "Mining",
        icon: <HardwareRounded />,
        tab_key: "mining",
        to: GAME_DATA_PATHS.mining,
      },
      {
        text: "sidebar.gameData.crafting",
        icon: <ScienceRounded />,
        tab_key: "crafting",
        children: [
          {
            text: "sidebar.gameData.blueprints",
            icon: <ConstructionRounded />,
            to: GAME_DATA_PATHS.blueprints,
          },
          {
            text: "sidebar.gameData.craftingCalculator",
            icon: <ScienceRounded />,
            to: GAME_DATA_PATHS.craftingCalculator,
          },
          {
            text: "sidebar.gameData.resources",
            icon: <TerrainRounded />,
            to: GAME_DATA_PATHS.resources,
          },
          {
            text: "Shopping Lists",
            icon: <ChecklistRounded />,
            to: PATHS.shoppingLists,
            logged_in: true,
          },
          {
            text: "sidebar.gameData.blueprintInventory",
            icon: <InventoryRounded />,
            to: GAME_DATA_PATHS.blueprintInventory,
            logged_in: true,
          },
        ],
      },
      {
        text: "sidebar.wiki.title",
        icon: <MenuBookRounded />,
        tab_key: "wiki",
        feature_flag: "wiki",
        children: [
          {
            text: "sidebar.wiki.items",
            icon: <MenuBookRounded />,
            to: WIKI_PATHS.items,
          },
          {
            text: "sidebar.wiki.vehicles",
            icon: <RocketLaunchRounded />,
            to: WIKI_PATHS.ships,
          },
          {
            text: "sidebar.wiki.commodities",
            icon: <CategoryRounded />,
            to: WIKI_PATHS.commodities,
          },
          {
            text: "sidebar.wiki.locations",
            icon: <PublicRounded />,
            to: WIKI_PATHS.locations,
          },
          {
            text: "sidebar.wiki.manufacturers",
            icon: <BusinessCenterRounded />,
            to: WIKI_PATHS.manufacturers,
          },
          {
            text: "Refining Methods",
            icon: <ScienceRounded />,
            to: WIKI_PATHS.refinery,
          },
        ],
      },
    ],
  },
  {
    title: "sidebar.admin.title",
    items: [
      {
        text: "sidebar.admin.users_market",
        icon: <PeopleAltIcon />,
        site_admin: true,
        children: [
          {
            text: "sidebar.users",
            icon: <PeopleAltIcon />,
            site_admin: true,
            to: ADMIN_PATHS.users,
          },
          {
            text: "sidebar.market.text",
            icon: <GavelIcon />,
            site_admin: true,
            to: ADMIN_PATHS.market,
          },
          {
            text: "sidebar.orders.text",
            icon: <CreateIcon />,
            site_admin: true,
            to: ADMIN_PATHS.orders,
          },
          {
            text: "sidebar.premium.text",
            icon: <StarRounded />,
            site_admin: true,
            to: ADMIN_PATHS.premium,
          },
          {
            text: "sidebar.migration",
            icon: <SyncRounded />,
            site_admin: true,
            to: "/admin/migration",
          },
        ],
      },
      {
        text: "sidebar.admin.moderation_logs",
        icon: <SecurityRounded />,
        site_admin: true,
        children: [
          {
            text: "sidebar.moderation.text",
            icon: (
              <ModerationSidebarEntry
                text="sidebar.moderation.text"
                to={ADMIN_PATHS.moderation}
              />
            ),
            site_admin: true,
            to: ADMIN_PATHS.moderation,
          },
          {
            text: "sidebar.audit_logs.text",
            icon: <SecurityRounded />,
            site_admin: true,
            to: ADMIN_PATHS.auditLogs,
          },
          {
            text: "sidebar.alerts.text",
            icon: <NotificationsIcon />,
            site_admin: true,
            to: ADMIN_PATHS.alerts,
          },
        ],
      },
      {
        text: "sidebar.admin.game_data",
        icon: <CloudDownloadRounded />,
        site_admin: true,
        children: [
          {
            text: "sidebar.attribute_definitions.text",
            icon: <CreateIcon />,
            site_admin: true,
            to: ADMIN_PATHS.attributeDefinitions,
          },
          {
            text: "sidebar.game_item_attributes.text",
            icon: <CreateIcon />,
            site_admin: true,
            to: ADMIN_PATHS.gameItemAttributes,
          },
          {
            text: "sidebar.import_monitoring.text",
            icon: <CloudDownloadRounded />,
            site_admin: true,
            to: ADMIN_PATHS.importMonitoring,
          },
          {
            text: "sidebar.game_data_import.text",
            icon: <RocketLaunchRounded />,
            site_admin: true,
            to: ADMIN_PATHS.gameDataImport,
          },
        ],
      },
      {
        text: "sidebar.admin.system",
        icon: <ToggleOnRounded />,
        site_admin: true,
        children: [
          {
            text: "sidebar.feature_flags.text",
            icon: <ToggleOnRounded />,
            site_admin: true,
            to: ADMIN_PATHS.featureFlags,
          },
          {
            text: "sidebar.notification_test.text",
            icon: <NotificationsIcon />,
            site_admin: true,
            to: ADMIN_PATHS.notificationTest,
          },
        ],
      },
    ],
  },
  {
    title: "sidebar.sc_market.title",
    items: [
      {
        text: "sidebar.sc_market_home", tab_key: "sc_market_home",
        icon: <HomeRounded />,
        custom: true,
        to: "https://sc-market.space",
        external: true,
      },
    ],
  },
]

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
            to: "/market",
            text: "sidebar.everything",
            icon: <HomeRounded />,
          },
          {
            to: "/market/category/weapon",
            params: "type=weapon",
            text: "sidebar.weapons",
            icon: <Pistol />,
          },
          {
            to: "/market/category/armor",
            text: "sidebar.armor",
            params: "type=armor",
            icon: <ShieldRounded />,
          },
          {
            to: "/market/category/component",
            text: "sidebar.components",
            params: "type=component",
            icon: <CableRounded />,
          },
          {
            to: "/bulk",
            text: "sidebar.bulk_items",
            icon: <GavelIcon />,
          },
          {
            to: "/buyorders",
            text: "sidebar.buy_orders",
            icon: <RequestQuoteRounded />,
          },
        ],
      },

      {
        to: "/market/services",
        text: "sidebar.contractor_services", tab_key: "services",
        icon: <DesignServicesRounded />,
      },
      {
        to: "/contracts",
        text: "sidebar.open_contracts", tab_key: "contracts",
        icon: <AssignmentIcon />,
        custom: false,
      },
      {
        to: "/contracts",
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
        to: "/orders",
        text: "sidebar.orders_ive_placed",
        icon: <CreateIcon />,
        logged_in: true,
      },
      {
        to: "/dashboard",
        text: "sidebar.orders_assigned_to_me", tab_key: "orders_assigned",
        icon: <AssignmentTurnedInRounded />,
        logged_in: true,
        custom: false,
        orgRouteRest: "dashboard",
      },
      {
        to: "/dashboard",
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
        to: "/messages",
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
        to: "/market/manage?quantityAvailable=0",
        text: "sidebar.manage_market_listings", tab_key: "manage_listings",
        icon: <ListAltRounded />,
        logged_in: true,
        org: false,
      },
      {
        to: "/market/manage-stock",
        text: "sidebar.manage_stock", tab_key: "manage_stock",
        icon: <WarehouseRounded />,
        logged_in: true,
        org: false,
      },
      {
        to: "/inventory",
        text: "sidebar.inventory", tab_key: "inventory",
        icon: <InventoryRounded />,
        logged_in: true,
        org: false,
      },
      {
        to: "/order/services",
        text: "sidebar.manage_services", tab_key: "manage_services",
        icon: <DashboardCustomizeRounded />,
        org: false,
        logged_in: true,
      },
      {
        to: "/availability",
        text: "sidebar.availability", tab_key: "availability",
        icon: <CalendarMonthRounded />,
        org: false,
        logged_in: true,
      },
      {
        to: "/myfleet",
        text: "sidebar.my_fleet",
        icon: <LocalShipping />,
        hidden: true,
        logged_in: true,
      },
    ],
  },
  {
    title: "sidebar.my_organization.title",
    items: [
      {
        toOrgPublic: true,
        text: "sidebar.org_public_page",
        icon: <StoreRounded />,
        org: true,
      },
      {
        to: "/availability",
        text: "sidebar.availability", tab_key: "availability",
        icon: <CalendarMonthRounded />,
        org: true,
      },
      {
        to: `/myorg`,
        text: "sidebar.my_org",
        icon: <BusinessIcon />,
        org: true,
        hidden: true,
      },
      {
        to: "/org/manage",
        text: "sidebar.settings",
        icon: <SettingsIcon />,
        org_admin: true,
        orgRouteRest: "manage",
      },
      {
        text: "sidebar.manage",
        icon: <DashboardCustomizeRounded />,
        org: true,
        org_admin: true,
        children: [
          {
            to: "/market/manage?quantityAvailable=0",
            text: "sidebar.manage_listings",
            icon: <ListAltRounded />,
            logged_in: true,
            org: true,
            org_admin: true,
            orgRouteRest: "listings",
          },
          {
            to: "/market/manage-stock",
            text: "sidebar.manage_stock", tab_key: "manage_stock",
            icon: <WarehouseRounded />,
            logged_in: true,
            org: true,
            org_admin: true,
            orgRouteRest: "manage-stock",
          },
          {
            to: "/order/services",
            text: "sidebar.manage_services", tab_key: "manage_services",
            icon: <DesignServicesRounded />,
            org_admin: true,
            orgRouteRest: "services",
          },
        ],
      },
      {
        to: "/org/money",
        text: "sidebar.money",
        icon: <AttachMoneyRoundedIcon />,
        hidden: true,
        org_admin: true,
        orgRouteRest: "money",
      },
      {
        to: "/invoices",
        text: "sidebar.invoices",
        icon: <FolderOpenIcon />,
        hidden: true,
        org_admin: true,
      },
      {
        to: "/org/fleet",
        text: "sidebar.fleet",
        icon: <LocalShipping />,
        chip: "sidebar.new_chip",
        hidden: true,
        org_admin: true,
        orgRouteRest: "fleet",
      },

      {
        text: "sidebar.people",
        icon: <PeopleAltIcon />,
        org_admin: true,
        hidden: true,
        children: [
          {
            to: "/customers",
            text: "sidebar.customers",
            hidden: true,
          },
          {
            to: "/org/members",
            text: "sidebar.members",
            hidden: true,
            orgRouteRest: "members",
          },
        ],
      },
    ],
  },
  {
    title: "sidebar.organizations.title",
    items: [
      {
        to: "/contractors",
        text: "sidebar.contractors",
        icon: <BusinessIcon />,
        custom: false,
      },
      {
        to: "/recruiting",
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
        to: "/org/register",
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
        to: "/missions",
      },
      {
        text: "Mining",
        icon: <HardwareRounded />,
        tab_key: "mining",
        to: "/mining",
      },
      {
        text: "sidebar.gameData.crafting",
        icon: <ScienceRounded />,
        tab_key: "crafting",
        children: [
          {
            text: "sidebar.gameData.blueprints",
            icon: <ConstructionRounded />,
            to: "/blueprints",
          },
          {
            text: "sidebar.gameData.craftingCalculator",
            icon: <ScienceRounded />,
            to: "/crafting/calculator",
          },
          {
            text: "sidebar.gameData.resources",
            icon: <TerrainRounded />,
            to: "/resources",
          },
          {
            text: "Shopping Lists",
            icon: <ChecklistRounded />,
            to: "/shopping-lists",
            logged_in: true,
          },
          {
            text: "sidebar.gameData.blueprintInventory",
            icon: <InventoryRounded />,
            to: "/blueprints/inventory",
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
            to: "/wiki/items",
          },
          {
            text: "sidebar.wiki.vehicles",
            icon: <RocketLaunchRounded />,
            to: "/wiki/ships",
          },
          {
            text: "sidebar.wiki.commodities",
            icon: <CategoryRounded />,
            to: "/wiki/commodities",
          },
          {
            text: "sidebar.wiki.locations",
            icon: <PublicRounded />,
            to: "/wiki/locations",
          },
          {
            text: "sidebar.wiki.manufacturers",
            icon: <BusinessCenterRounded />,
            to: "/wiki/manufacturers",
          },
          {
            text: "Refining Methods",
            icon: <ScienceRounded />,
            to: "/wiki/refinery",
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
            to: "/admin/users",
          },
          {
            text: "sidebar.market.text",
            icon: <GavelIcon />,
            site_admin: true,
            to: "/admin/market",
          },
          {
            text: "sidebar.orders.text",
            icon: <CreateIcon />,
            site_admin: true,
            to: "/admin/orders",
          },
          {
            text: "sidebar.premium.text",
            icon: <StarRounded />,
            site_admin: true,
            to: "/admin/premium",
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
                to="/admin/moderation"
              />
            ),
            site_admin: true,
            to: "/admin/moderation",
          },
          {
            text: "sidebar.audit_logs.text",
            icon: <SecurityRounded />,
            site_admin: true,
            to: "/admin/audit-logs",
          },
          {
            text: "sidebar.alerts.text",
            icon: <NotificationsIcon />,
            site_admin: true,
            to: "/admin/alerts",
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
            to: "/admin/attribute-definitions",
          },
          {
            text: "sidebar.game_item_attributes.text",
            icon: <CreateIcon />,
            site_admin: true,
            to: "/admin/game-item-attributes",
          },
          {
            text: "sidebar.import_monitoring.text",
            icon: <CloudDownloadRounded />,
            site_admin: true,
            to: "/admin/import-monitoring",
          },
          {
            text: "sidebar.game_data_import.text",
            icon: <RocketLaunchRounded />,
            site_admin: true,
            to: "/admin/game-data-import",
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
            to: "/admin/feature-flags",
          },
          {
            text: "sidebar.notification_test.text",
            icon: <NotificationsIcon />,
            site_admin: true,
            to: "/admin/notification-test",
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

import DashboardIcon from "@mui/icons-material/DashboardRounded"
import LocalShipping from "@mui/icons-material/LocalShipping"
import ForumRoundedIcon from "@mui/icons-material/ForumRounded"
import GavelIcon from "@mui/icons-material/GavelRounded"
import {
  CableRounded,
  CalendarMonthRounded,
  DashboardCustomizeRounded,
  DesignServicesRounded,
  HomeRounded,
  ManageAccountsRounded,
  PersonAddRounded,
  RequestQuoteRounded,
  ShieldRounded,
  StoreRounded,
  WarehouseRounded,
} from "@mui/icons-material"
import PaidIcon from "@mui/icons-material/PaidRounded"
import CreateIcon from "@mui/icons-material/CreateRounded"
import AssignmentIcon from "@mui/icons-material/AssignmentRounded"
import BusinessIcon from "@mui/icons-material/BusinessRounded"
import SettingsIcon from "@mui/icons-material/SettingsRounded"
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded"
import FolderOpenIcon from "@mui/icons-material/FolderOpenRounded"
import PeopleAltIcon from "@mui/icons-material/PeopleAltRounded"
import React from "react"
import { SidebarSectionProps } from "./Sidebar"
import { Pistol } from "mdi-material-ui"

export const all_sidebar_entries: SidebarSectionProps[] = [
  {
    title: "sidebar.dashboard.title",
    items: [
      {
        to: "/dashboard",
        text: "sidebar.dashboard.text",
        icon: <DashboardIcon />,
        logged_in: true,
        custom: false,
      },
      {
        to: "/dashboard",
        text: "sidebar.dashboard.text",
        icon: <DashboardIcon />,
        logged_in: true,
        custom: true,
        org: true,
      },
      {
        to: "/market/manage?quantityAvailable=0",
        text: "sidebar.manage_market_listings",
        icon: <WarehouseRounded />,
        logged_in: true,
        org: false,
      },
      {
        to: "/order/services",
        text: "sidebar.manage_services",
        icon: <DashboardCustomizeRounded />,
        org: false,
        logged_in: true,
      },
      {
        to: "/availability",
        text: "sidebar.availability",
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
      {
        to: "/messaging",
        text: "sidebar.messaging",
        icon: <ForumRoundedIcon />,
        hidden: true,
        logged_in: true,
      },
    ],
  },
  {
    title: "sidebar.my_organization.title",
    items: [
      {
        to: "/org/orders",
        text: "sidebar.orders",
        icon: <DashboardIcon />,
        // hidden: true,
        org_admin: true,
      },
      {
        to: "/availability",
        text: "sidebar.availability",
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
        text: "sidebar.manage",
        icon: <ManageAccountsRounded />,
        org_admin: true,
        children: [
          {
            to: "/org/manage",
            text: "sidebar.settings",
            icon: <SettingsIcon />,
          },
          {
            to: "/market/manage?quantityAvailable=0",
            text: "sidebar.manage_listings",
            icon: <WarehouseRounded />,
            logged_in: true,
            org: true,
          },
          {
            to: "/order/services",
            text: "sidebar.manage_services",
            icon: <DashboardCustomizeRounded />,
            org_admin: true,
          },
        ],
      },

      {
        to: "/org/money",
        text: "sidebar.money",
        icon: <AttachMoneyRoundedIcon />,
        hidden: true,
        org_admin: true,
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
          },
        ],
      },
    ],
  },

  {
    title: "sidebar.market.title",
    items: [
      {
        text: "sidebar.player_market",
        icon: <StoreRounded />,
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
        text: "sidebar.contractor_services",
        icon: <DesignServicesRounded />,
      },
      // {
      //   to: "/market/me",
      //   text: "sidebar.my_listings",
      //   icon: <ManageAccountsRounded />,
      //   logged_in: true,
      //   org: false,
      // },
      {
        to: "/market/me",
        text: "sidebar.my_org_listings",
        icon: <ManageAccountsRounded />,
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
    title: "sidebar.contracting.title",
    items: [
      {
        to: "/orders",
        text: "sidebar.my_orders",
        icon: <CreateIcon />,
        logged_in: true,
      },
      {
        to: "/contractors",
        text: "sidebar.contractors",
        icon: <BusinessIcon />,
        custom: false,
      },
      {
        to: "/contracts",
        text: "sidebar.open_contracts",
        icon: <AssignmentIcon />,
        custom: false,
      },
      {
        to: "/contracts",
        text: "sidebar.open_contracts",
        icon: <AssignmentIcon />,
        custom: true,
        org: true,
      },
    ],
  },
  {
    title: "sidebar.organizations.title",
    items: [
      {
        to: "/recruiting",
        text: "sidebar.recruiting",
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
    title: "sidebar.admin.title",
    items: [
      {
        text: "sidebar.users",
        icon: <PeopleAltIcon />,
        hidden: false,
        site_admin: true,
        to: "/admin/users",
      },
      {
        text: "sidebar.market",
        icon: <GavelIcon />,
        site_admin: true,
        to: "/admin/market",
      },
      {
        text: "sidebar.orders",
        icon: <CreateIcon />,
        site_admin: true,
        to: "/admin/orders",
      },
    ],
  },
  {
    title: "sidebar.sc_market.title",
    items: [
      {
        text: "sidebar.sc_market_home",
        icon: <HomeRounded />,
        custom: true,
        to: "https://sc-market.space",
        external: true,
      },
    ],
  },
]

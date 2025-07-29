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
    title: "Dashboard",
    items: [
      {
        to: "/dashboard",
        text: "Dashboard",
        icon: <DashboardIcon />,
        logged_in: true,
        custom: false,
      },
      {
        to: "/dashboard",
        text: "Dashboard",
        icon: <DashboardIcon />,
        logged_in: true,
        custom: true,
        org: true,
      },
      {
        to: "/market/manage?quantityAvailable=0",
        text: "Manage Market Listings",
        icon: <WarehouseRounded />,
        logged_in: true,
        org: false,
      },
      {
        to: "/order/services",
        text: "Manage Services",
        icon: <DashboardCustomizeRounded />,
        org: false,
        logged_in: true,
      },
      {
        to: "/availability",
        text: "Availability",
        icon: <CalendarMonthRounded />,
        org: false,
        logged_in: true,
      },
      {
        to: "/myfleet",
        text: "My Fleet",
        icon: <LocalShipping />,
        hidden: true,
        logged_in: true,
      },
      {
        to: "/messaging",
        text: "Messaging",
        icon: <ForumRoundedIcon />,
        hidden: true,
        logged_in: true,
      },
    ],
  },
  {
    title: "My Organization",
    items: [
      {
        to: "/org/orders",
        text: "Orders",
        icon: <DashboardIcon />,
        // hidden: true,
        org_admin: true,
      },
      {
        to: "/availability",
        text: "Availability",
        icon: <CalendarMonthRounded />,
        org: true,
      },
      {
        to: `/myorg`,
        text: "My Org",
        icon: <BusinessIcon />,
        org: true,
        hidden: true,
      },
      {
        text: "Manage",
        icon: <ManageAccountsRounded />,
        org_admin: true,
        children: [
          {
            to: "/org/manage",
            text: "Settings",
            icon: <SettingsIcon />,
          },
          {
            to: "/market/manage?quantityAvailable=0",
            text: "Manage Listings",
            icon: <WarehouseRounded />,
            logged_in: true,
            org: true,
          },
          {
            to: "/order/services",
            text: "Manage Services",
            icon: <DashboardCustomizeRounded />,
            org_admin: true,
          },
        ],
      },

      {
        to: "/org/money",
        text: "Money",
        icon: <AttachMoneyRoundedIcon />,
        hidden: true,
        org_admin: true,
      },
      {
        to: "/invoices",
        text: "Invoices",
        icon: <FolderOpenIcon />,
        hidden: true,
        org_admin: true,
      },
      {
        to: "/org/fleet",
        text: "Fleet",
        icon: <LocalShipping />,
        chip: "New!",
        hidden: true,
        org_admin: true,
      },

      {
        text: "People",
        icon: <PeopleAltIcon />,
        org_admin: true,
        hidden: true,
        children: [
          {
            to: "/customers",
            text: "Customers",
            hidden: true,
          },
          {
            to: "/org/members",
            text: "Members",
            hidden: true,
          },
        ],
      },
    ],
  },

  {
    title: "Market",
    items: [
      {
        text: "Player Market",
        icon: <StoreRounded />,
        children: [
          {
            to: "/market",
            text: "Everything",
            icon: <HomeRounded />,
          },
          {
            to: "/market/category/weapon",
            params: "type=weapon",
            text: "Weapons",
            icon: <Pistol />,
          },
          {
            to: "/market/category/armor",
            text: "Armor",
            params: "type=armor",
            icon: <ShieldRounded />,
          },
          {
            to: "/market/category/component",
            text: "Components",
            params: "type=component",
            icon: <CableRounded />,
          },
          {
            to: "/bulk",
            text: "Bulk Items",
            icon: <GavelIcon />,
          },
          {
            to: "/buyorders",
            text: "Buy Orders",
            icon: <RequestQuoteRounded />,
          },
        ],
      },

      {
        to: "/market/services",
        text: "Contractor Services",
        icon: <DesignServicesRounded />,
      },
      // {
      //   to: "/market/me",
      //   text: "My Listings",
      //   icon: <ManageAccountsRounded />,
      //   logged_in: true,
      //   org: false,
      // },
      {
        to: "/market/me",
        text: "My Org's Listings",
        icon: <ManageAccountsRounded />,
        org: true,
      },
      {
        to: "/sell",
        text: "Sell Materials",
        icon: <PaidIcon />,
        hidden: true,
        logged_in: true,
      },
    ],
  },
  {
    title: "Contracting",
    items: [
      {
        to: "/orders",
        text: "My Orders",
        icon: <CreateIcon />,
        logged_in: true,
      },
      {
        to: "/contractors",
        text: "Contractors",
        icon: <BusinessIcon />,
        custom: false,
      },
      {
        to: "/contracts",
        text: "Open Contracts",
        icon: <AssignmentIcon />,
        custom: false,
      },
      {
        to: "/contracts",
        text: "Open Contracts",
        icon: <AssignmentIcon />,
        custom: true,
        org: true,
      },
    ],
  },
  {
    title: "Organizations",
    items: [
      {
        to: "/recruiting",
        text: "Recruiting",
        icon: <PersonAddRounded />,
        custom: false,
      },
      // {
      //     to: "/recruiting",
      //     text: "Join the Org",
      //     icon: (<PersonAddRounded/>),
      //     custom: true,
      // },
      {
        to: "/org/register",
        text: "Register",
        icon: <CreateIcon />,
        org: false,
        logged_in: true,
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        text: "Users",
        icon: <PeopleAltIcon />,
        hidden: false,
        site_admin: true,
        to: "/admin/users",
      },
      {
        text: "Market",
        icon: <GavelIcon />,
        site_admin: true,
        to: "/admin/market",
      },
      {
        text: "Orders",
        icon: <CreateIcon />,
        site_admin: true,
        to: "/admin/orders",
      },
    ],
  },
  {
    title: "SC Market",
    items: [
      {
        text: "SC Market Home",
        icon: <HomeRounded />,
        custom: true,
        to: "https://sc-market.space",
        external: true,
      },
    ],
  },
]

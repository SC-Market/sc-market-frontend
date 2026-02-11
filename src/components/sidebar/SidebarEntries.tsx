import DashboardIcon from "@mui/icons-material/DashboardRounded"
import LocalShipping from "@mui/icons-material/LocalShipping"
import ForumRoundedIcon from "@mui/icons-material/ForumRounded"
import GavelIcon from "@mui/icons-material/GavelRounded"
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

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/SkeletonProps';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import CableRounded from '@mui/icons-material/CableRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import RequestQuoteRounded from '@mui/icons-material/RequestQuoteRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';

export const all_sidebar_entries: SidebarSectionProps[] = [
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
        text: "sidebar.orders_assigned_to_me",
        icon: <AssignmentTurnedInRounded />,
        logged_in: true,
        custom: false,
        orgRouteRest: "dashboard",
      },
      {
        to: "/dashboard",
        text: "sidebar.orders_assigned_to_me",
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
        text: "sidebar.messaging",
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
        text: "sidebar.manage_market_listings",
        icon: <ListAltRounded />,
        logged_in: true,
        org: false,
      },
      {
        to: "/market/manage-stock",
        text: "sidebar.manage_stock",
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
            text: "sidebar.manage_stock",
            icon: <WarehouseRounded />,
            logged_in: true,
            org: true,
            org_admin: true,
            orgRouteRest: "manage-stock",
          },
          {
            to: "/order/services",
            text: "sidebar.manage_services",
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
        text: "sidebar.alerts.text",
        icon: <NotificationsIcon />,
        site_admin: true,
        to: "/admin/alerts",
      },
      {
        text: "sidebar.audit_logs.text",
        icon: <SecurityRounded />,
        site_admin: true,
        to: "/admin/audit-logs",
      },
      {
        text: "sidebar.notification_test.text",
        icon: <NotificationsIcon />,
        site_admin: true,
        to: "/admin/notification-test",
      },
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

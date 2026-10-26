/**
 * Icons an org can pick for a white-label custom sidebar tab
 * (WhiteLabelSettings), and that SidebarV2 renders for those tabs.
 */
import React from "react"
import {
  AssignmentRounded,
  AttachMoneyRounded,
  BookRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CreateRounded,
  DashboardCustomizeRounded,
  DashboardRounded,
  DesignServicesRounded,
  FolderOpenRounded,
  ForumRounded,
  GavelRounded,
  HelpRounded,
  HomeRounded,
  InfoRounded,
  InventoryRounded,
  LinkRounded,
  ListAltRounded,
  LocalShipping,
  ManageAccountsRounded,
  MapRounded,
  NotificationsRounded,
  PaidRounded,
  PersonAddRounded,
  PhotoCameraRounded,
  PublicRounded,
  RequestQuoteRounded,
  RocketLaunchRounded,
  ScienceRounded,
  SecurityRounded,
  SettingsRounded,
  ShieldRounded,
  StarRounded,
  StoreRounded,
  ToggleOnRounded,
  WarehouseRounded,
  WorkRounded,
} from "@mui/icons-material"

export const WHITE_LABEL_TAB_ICONS: Record<string, React.ReactElement> = {
  home: <HomeRounded />,
  store: <StoreRounded />,
  dashboard: <DashboardRounded />,
  customize: <DashboardCustomizeRounded />,
  forum: <ForumRounded />,
  gavel: <GavelRounded />,
  assignment: <AssignmentRounded />,
  paid: <PaidRounded />,
  create: <CreateRounded />,
  business: <BusinessRounded />,
  settings: <SettingsRounded />,
  money: <AttachMoneyRounded />,
  folder: <FolderOpenRounded />,
  shipping: <LocalShipping />,
  calendar: <CalendarMonthRounded />,
  design: <DesignServicesRounded />,
  inventory: <InventoryRounded />,
  list: <ListAltRounded />,
  accounts: <ManageAccountsRounded />,
  recruit: <PersonAddRounded />,
  quote: <RequestQuoteRounded />,
  shield: <ShieldRounded />,
  warehouse: <WarehouseRounded />,
  security: <SecurityRounded />,
  star: <StarRounded />,
  toggle: <ToggleOnRounded />,
  link: <LinkRounded />,
  info: <InfoRounded />,
  public: <PublicRounded />,
  book: <BookRounded />,
  help: <HelpRounded />,
  map: <MapRounded />,
  notifications: <NotificationsRounded />,
  camera: <PhotoCameraRounded />,
  rocket: <RocketLaunchRounded />,
  science: <ScienceRounded />,
  work: <WorkRounded />,
}

export const DEFAULT_TAB_ICON = "link"

/** The icon for a saved custom tab (unknown keys fall back to a link). */
export function whiteLabelTabIcon(
  key: string | null | undefined,
): React.ReactElement {
  return (
    WHITE_LABEL_TAB_ICONS[key ?? ""] ?? WHITE_LABEL_TAB_ICONS[DEFAULT_TAB_ICON]
  )
}

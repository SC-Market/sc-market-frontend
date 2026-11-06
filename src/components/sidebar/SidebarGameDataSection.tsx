import React from "react"
import {
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material"
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  MenuBookRounded,
  ScienceRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { gameDataNavItems, wikiNavItems, type NavItem } from "./sidebarNavItems"
import type { useSidebarStyles } from "./sidebarStyles"

type SidebarStyles = ReturnType<typeof useSidebarStyles>

/**
 * Browse mode's Game Data section: Missions and Mining, then the collapsible
 * Crafting (Blueprints, Crafting Calculator, Resources, Shopping Lists) and
 * Wiki groups.
 */
export function SidebarGameDataSection({
  signedIn,
  renderNavItem,
  craftingOpen,
  onToggleCrafting,
  wikiOpen,
  onToggleWiki,
  itemSx,
  sectionHeaderSx,
}: {
  signedIn: boolean
  renderNavItem: (item: NavItem, nested?: boolean) => React.ReactNode
  craftingOpen: boolean
  onToggleCrafting: () => void
  wikiOpen: boolean
  onToggleWiki: () => void
  itemSx: SidebarStyles["itemSx"]
  sectionHeaderSx: SidebarStyles["sectionHeaderSx"]
}) {
  const { t } = useTranslation()
  const gameData = gameDataNavItems(t, signedIn)
  // Missions and Mining sit at the top; the rest are the Crafting group.
  const topLevel = gameData.slice(0, 2)
  const crafting = gameData.slice(2)
  return (
    <>
      <Divider sx={{ mx: 2, my: 0.5 }} />
      <Typography variant="body2" sx={sectionHeaderSx}>
        {t("sidebar.gameData.title", "Game Data")}
      </Typography>
      <List dense sx={{ px: 1 }}>
        {topLevel.map((item) => renderNavItem(item))}

        {/* Crafting — collapsible */}
        <ListItemButton sx={itemSx} onClick={onToggleCrafting}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <ScienceRounded />
          </ListItemIcon>
          <ListItemText
            primary={t("sidebar.gameData.crafting", "Crafting")}
            primaryTypographyProps={{ variant: "subtitle2" }}
          />
          {craftingOpen ? (
            <ExpandLessRounded fontSize="small" />
          ) : (
            <ExpandMoreRounded fontSize="small" />
          )}
        </ListItemButton>
        <Collapse in={craftingOpen}>
          <List dense disablePadding sx={{ pl: 2 }}>
            {crafting.map((item) => renderNavItem(item, true))}
          </List>
        </Collapse>

        {/* Wiki — collapsible */}
        <ListItemButton sx={itemSx} onClick={onToggleWiki}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <MenuBookRounded />
          </ListItemIcon>
          <ListItemText
            primary={t("sidebar.wiki.title", "Wiki")}
            primaryTypographyProps={{ variant: "subtitle2" }}
          />
          {wikiOpen ? (
            <ExpandLessRounded fontSize="small" />
          ) : (
            <ExpandMoreRounded fontSize="small" />
          )}
        </ListItemButton>
        <Collapse in={wikiOpen}>
          <List dense disablePadding sx={{ pl: 2 }}>
            {wikiNavItems(t).map((item) => renderNavItem(item, true))}
          </List>
        </Collapse>
      </List>
    </>
  )
}

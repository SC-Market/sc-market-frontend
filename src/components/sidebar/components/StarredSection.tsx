import React from "react"
import {
  List,
  ListSubheader,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { SidebarItem } from "./SidebarItem"
import { SidebarItemProps } from "../types"

interface StarredSectionProps {
  starredItems: string[]
  allItems: SidebarItemProps[]
  effectiveOrgId: string | null | undefined
  currentOrgId: string | null | undefined
  onToggleStar: (path: string) => void
  resolveItem: (item: SidebarItemProps) => SidebarItemProps
}

/**
 * Mobile-only section showing starred sidebar items
 */
export function StarredSection({
  starredItems,
  allItems,
  effectiveOrgId,
  currentOrgId,
  onToggleStar,
  resolveItem,
}: StarredSectionProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))

  if (!xs || starredItems.length === 0) {
    return null
  }

  const starredEntries = allItems
    .filter((entry) => entry.to)
    .filter((entry) => {
      const path =
        entry.orgRouteRest && effectiveOrgId
          ? `/org/${effectiveOrgId}/${entry.orgRouteRest}`
          : entry.to
      return starredItems.includes(path?.split("?")[0] || "")
    })
    .map((entry) => {
      let resolved = entry
      if (entry.toOrgPublic && currentOrgId) {
        resolved = {
          ...entry,
          to: `/contractor/${currentOrgId}`,
        }
      } else if (entry.orgRouteRest && effectiveOrgId) {
        resolved = {
          ...entry,
          to: `/org/${effectiveOrgId}/${entry.orgRouteRest}`,
        }
      }
      return resolved
    })

  return (
    <List
      sx={{ padding: xs ? 0.5 : 1 }}
      subheader={
        <ListSubheader
          sx={{
            marginBottom: xs ? 0 : 0.5,
            backgroundColor: "inherit",
          }}
        >
          <Typography
            sx={{
              bgcolor: "inherit",
              fontWeight: "bold",
              opacity: 0.7,
              textTransform: "uppercase",
              fontSize: xs ? "0.75em" : "0.85em",
              color: theme.palette.getContrastText(
                theme.palette.background.sidebar,
              ),
            }}
            variant={"body2"}
          >
            {t("sidebar.starred", "Starred")}
          </Typography>
        </ListSubheader>
      }
    >
      {starredEntries.map((entry) => (
        <SidebarItem
          {...entry}
          key={entry.text}
          isStarred={true}
          onToggleStar={onToggleStar}
          starredItems={starredItems}
        />
      ))}
    </List>
  )
}

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

interface SidebarSectionProps {
  title: string
  items: SidebarItemProps[]
  starredItems: string[]
  onToggleStar: (path: string) => void
}

/**
 * Reusable sidebar section with title and items
 */
export function SidebarSection({
  title,
  items,
  starredItems,
  onToggleStar,
}: SidebarSectionProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <List
      key={title}
      sx={{
        padding: xs ? 0.5 : 1,
        transition: "0.3s",
      }}
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
              transition: "0.3s",
            }}
            variant={"body2"}
          >
            {t(title)}
          </Typography>
        </ListSubheader>
      }
    >
      {items.map((entry) => (
        <SidebarItem
          {...entry}
          key={entry.text}
          isStarred={starredItems.includes(entry.to?.split("?")[0] || "")}
          onToggleStar={onToggleStar}
          starredItems={starredItems}
        />
      ))}
    </List>
  )
}

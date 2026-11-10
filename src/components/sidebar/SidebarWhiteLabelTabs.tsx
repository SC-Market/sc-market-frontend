import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material"
import { OpenInNewRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { SidebarConfigItem } from "../../features/contractor/api/contractorV2Api"
import { whiteLabelTabIcon } from "../../features/contractor/components/whiteLabelIcons"
import type { useSidebarStyles } from "./sidebarStyles"

type SidebarStyles = ReturnType<typeof useSidebarStyles>

/** A white-label org's own links (Sidebar Tabs › Custom Tabs). */
export function SidebarWhiteLabelTabs({
  customTabs,
  brandName,
  isActive,
  onNavigate,
  itemSx,
  sectionHeaderSx,
}: {
  customTabs: SidebarConfigItem[]
  brandName: string | undefined
  isActive: (path: string) => boolean
  onNavigate: () => void
  itemSx: SidebarStyles["itemSx"]
  sectionHeaderSx: SidebarStyles["sectionHeaderSx"]
}) {
  const { t } = useTranslation()
  return (
    <>
      <Divider sx={{ mx: 2, my: 0.5 }} />
      <Typography variant="body2" sx={sectionHeaderSx}>
        {brandName || t("nav.groupLinks", "Links")}
      </Typography>
      <List dense component="div" sx={{ px: 1 }}>
        {customTabs.map((tab) => {
          const path = tab.custom_path!
          const external = path.startsWith("https://")
          return (
            <ListItemButton
              key={`${tab.sort_order}-${path}`}
              {...(external
                ? {
                    component: "a",
                    href: path,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : {
                    component: Link,
                    to: path,
                    selected: isActive(path),
                    onClick: onNavigate,
                  })}
              sx={itemSx}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {whiteLabelTabIcon(tab.custom_icon)}
              </ListItemIcon>
              <ListItemText
                primary={tab.custom_label || path}
                primaryTypographyProps={{
                  variant: "subtitle2",
                  noWrap: true,
                }}
              />
              {external && (
                <OpenInNewRounded fontSize="small" sx={{ opacity: 0.6 }} />
              )}
            </ListItemButton>
          )
        })}
      </List>
    </>
  )
}

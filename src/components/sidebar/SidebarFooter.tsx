import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { HelpOutlineRounded, SettingsRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HELP_PATHS, PATHS } from "../../routes/paths"
import { isOfficialSite, officialHelpUrl } from "../../features/help/links"
import type { useSidebarStyles } from "./sidebarStyles"

/** The sidebar's sticky bottom block: Settings and Help & Guides. */
export function SidebarFooter({
  signedIn,
  isActive,
  onNavigate,
  itemSx,
}: {
  signedIn: boolean
  isActive: (path: string) => boolean
  onNavigate: () => void
  itemSx: ReturnType<typeof useSidebarStyles>["itemSx"]
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Sticky bottom block. Settings requires an account, so it only shows
          when logged in; Help & Guides shows for everyone and stays last so
          its position doesn't move. On white-label org domains it links out
          to the official site (the guides only render there). */}
      <Box sx={{ flexShrink: 0 }}>
        <Divider sx={{ mx: 2 }} />
        <List dense sx={{ px: 1, py: 0.5 }}>
          {signedIn && (
            <ListItemButton
              component={Link}
              to={PATHS.settings}
              selected={isActive(PATHS.settings)}
              sx={itemSx}
              onClick={onNavigate}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SettingsRounded />
              </ListItemIcon>
              <ListItemText
                primary={t("nav.settings", "Settings")}
                primaryTypographyProps={{ variant: "subtitle2" }}
              />
            </ListItemButton>
          )}
          <ListItemButton
            {...(isOfficialSite()
              ? {
                  component: Link,
                  to: HELP_PATHS.hub,
                  selected:
                    isActive(HELP_PATHS.hub) || isActive(HELP_PATHS.about),
                  onClick: onNavigate,
                }
              : {
                  component: "a",
                  href: officialHelpUrl(HELP_PATHS.hub),
                  target: "_blank",
                  rel: "noopener",
                })}
            sx={itemSx}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <HelpOutlineRounded />
            </ListItemIcon>
            <ListItemText
              primary={t("nav.helpGuides", "Help & Guides")}
              primaryTypographyProps={{ variant: "subtitle2" }}
            />
          </ListItemButton>
        </List>
      </Box>
    </>
  )
}

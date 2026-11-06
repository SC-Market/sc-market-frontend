import React from "react"
import { Box, Divider, List, Typography } from "@mui/material"
import { StarRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import type { NavItem } from "./sidebarNavItems"
import type { useSidebarStyles } from "./sidebarStyles"

/** The Pinned section: the destinations the user starred. */
export function SidebarPinnedSection({
  starredItems,
  renderNavItem,
  sectionHeaderSx,
}: {
  starredItems: NavItem[]
  renderNavItem: (item: NavItem) => React.ReactNode
  sectionHeaderSx: ReturnType<typeof useSidebarStyles>["sectionHeaderSx"]
}) {
  const { t } = useTranslation()
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          ...sectionHeaderSx,
        }}
      >
        <StarRounded sx={{ fontSize: "1em" }} />
        <Typography
          variant="body2"
          component="span"
          sx={{
            fontFamily: "inherit",
            fontWeight: "inherit",
            fontSize: "1em",
            textTransform: "uppercase",
          }}
        >
          {t("nav.pinned", "Pinned")}
        </Typography>
      </Box>
      <List dense sx={{ px: 1 }}>
        {starredItems.map((item) => renderNavItem(item))}
      </List>
      <Divider sx={{ mx: 2, my: 0.5 }} />
    </>
  )
}

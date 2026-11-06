import React from "react"
import { List, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import type { NavItem } from "./sidebarNavItems"

/** Search results: a flat filtered list across all destinations. */
export function SidebarSearchResults({
  results,
  renderNavItem,
}: {
  results: NavItem[]
  renderNavItem: (item: NavItem) => React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <List dense sx={{ px: 1 }}>
      {results.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            px: 2,
            py: 2,
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          {t("nav.noResults", "No matching pages")}
        </Typography>
      ) : (
        results.map((item) => renderNavItem(item))
      )}
    </List>
  )
}

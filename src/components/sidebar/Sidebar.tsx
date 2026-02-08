import React, { useEffect } from "react"
import { Drawer, Stack, useMediaQuery, useTheme } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { all_sidebar_entries } from "./SidebarEntries"
import { SidebarHeader } from "./components/SidebarHeader"
import { StarredSection } from "./components/StarredSection"
import { SidebarSection } from "./components/SidebarSection"
import { useSidebarStarring } from "./hooks/useSidebarStarring"
import { useSidebarSearch } from "./hooks/useSidebarSearch"
import { useSidebarItems } from "./hooks/useSidebarItems"
import { SidebarItemProps } from "./types"

/**
 * Main sidebar navigation component
 * Responsive drawer with search, starred items, and hierarchical navigation
 */
export function Sidebar() {
  const theme = useTheme<ExtendedTheme>()
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))
  const bottomNavHeight = useBottomNavHeight()

  // Custom hooks for business logic
  const { starredItems, toggleStar } = useSidebarStarring()
  const { searchQuery, setSearchQuery, filterBySearch } = useSidebarSearch()
  const {
    profile,
    currentOrgObj,
    effectiveOrgId,
    avatar,
    filterItems,
    resolveItem,
  } = useSidebarItems()

  // Track previous screen size for auto-close behavior
  const prevXs = React.useRef<boolean | undefined>(undefined)

  // Auto-close drawer on mobile when screen size changes
  useEffect(() => {
    if (prevXs.current === undefined) {
      setDrawerOpen(!xs)
      prevXs.current = xs
    } else if (prevXs.current !== xs) {
      setDrawerOpen(!xs)
      prevXs.current = xs
    }
  }, [setDrawerOpen, xs])

  // Close drawer on mobile when navigating
  const prevPathname = React.useRef<string>(window.location.pathname)
  useEffect(() => {
    if (xs && prevPathname.current !== window.location.pathname) {
      setDrawerOpen(false)
      prevPathname.current = window.location.pathname
    } else if (prevPathname.current !== window.location.pathname) {
      prevPathname.current = window.location.pathname
    }
  }, [xs, setDrawerOpen])

  // Get all items for starred section (flatten parent + children)
  const allFlattenedItems = all_sidebar_entries.flatMap((section) =>
    section.items.flatMap((item: SidebarItemProps) => [
      item,
      ...(item.children || []),
    ]),
  )

  return (
    <Drawer
      variant={xs ? "temporary" : "permanent"}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        [theme.breakpoints.up("sm")]: {
          width: drawerOpen ? sidebarDrawerWidth : 0,
        },
        [theme.breakpoints.down("sm")]: {
          width: 0,
        },
        "& .MuiDrawer-paper": {
          [theme.breakpoints.up("sm")]: {
            width: drawerOpen ? sidebarDrawerWidth : 0,
          },
          [theme.breakpoints.down("sm")]: {
            width: "85%",
            maxWidth: 320,
            borderRight: 0,
          },
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.sidebar,
          overflow: "hidden",
          borderRight: drawerOpen ? 1 : 0,
          borderColor: drawerOpen ? theme.palette.outline.main : "transparent",
          borderRadius: 0,
          scrollPadding: 0,
          display: "flex",
          flexDirection: "column",
          transition: theme.transitions.create(
            ["width", "borderRight", "borderColor"],
            {
              easing: theme.transitions.easing.easeOut,
              duration: "0.3s",
            },
          ),
        },
        position: "relative",
        whiteSpace: "nowrap",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        overflow: "hidden",
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <SidebarHeader
        avatar={avatar}
        profile={profile}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Stack
        direction={"column"}
        spacing={xs ? 0 : theme.layoutSpacing.component}
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          borderTop: 1,
          padding: xs ? 0.5 : 1,
          paddingBottom: `calc(${theme.spacing(1)} + ${bottomNavHeight}px)`,
          borderColor: theme.palette.outline.main,
          overflow: "auto",
        }}
      >
        <StarredSection
          starredItems={starredItems}
          allItems={allFlattenedItems.filter(filterItems)}
          effectiveOrgId={effectiveOrgId}
          currentOrgId={currentOrgObj?.spectrum_id}
          onToggleStar={toggleStar}
          resolveItem={resolveItem}
        />

        {all_sidebar_entries
          .filter((section) => section.items.filter(filterItems).length)
          .map((section) => {
            const filteredItems = section.items
              .filter(filterItems)
              .filter(filterBySearch)
              .map(resolveItem)

            if (!filteredItems.length) return null

            return (
              <SidebarSection
                key={section.title}
                title={section.title}
                items={filteredItems}
                starredItems={starredItems}
                onToggleStar={toggleStar}
              />
            )
          })}
      </Stack>
    </Drawer>
  )
}

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  Dialog,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
} from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { useTheme } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  SearchRounded,
  StorefrontRounded,
  AddRounded,
  MessageRounded,
  DarkModeRounded,
  LightModeRounded,
} from "@mui/icons-material"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useSearchListingsQuery } from "../../features/market/api/marketV2Api"
import { useDebounce } from "../../hooks/useDebounce"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { SHOP_PATHS } from "../../routes/paths"
import { useGetMyShopsQuery } from "../../features/shops/api/shopsApi"
import { useIsAuthenticated } from "../../hooks/login/useSession"
import { useStartupGateOpen } from "../../util/startupDeferral"

import { useFormatters } from "../../util/format"
import { navCommandItems, type CommandItem } from "./commandPaletteItems"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { data: profile } = useGetUserProfileQuery()
  const isAuthenticated = useIsAuthenticated()
  // Only needed once the palette opens: waits for the startup gate
  // (util/startupDeferral.ts) instead of competing with the first page.
  const startupDone = useStartupGateOpen()
  const { data: shops = [] } = useGetMyShopsQuery(undefined, {
    skip: !isAuthenticated || !startupDone,
  })
  const isMobile = useBreakpointDown("sm")
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const debouncedQuery = useDebounce(query, 400)

  const { data: searchResults } = useSearchListingsQuery(
    { text: debouncedQuery, pageSize: 5 },
    { skip: debouncedQuery.length < 2 },
  )

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const go = useCallback(
    (path: string) => {
      navigate(path)
      setOpen(false)
      setQuery("")
    },
    [navigate],
  )

  // Static navigation items
  const navItems = useMemo<CommandItem[]>(() => {
    return navCommandItems(t, go, Boolean(profile), shops)
  }, [profile, shops, go, t])

  // Action items
  const actionItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = []

    if (profile) {
      const primaryShop = shops[0]
      if (primaryShop) {
        items.push({
          id: "create-listing",
          label: t("appUi.commandPalette.items.createListing"),
          icon: <AddRounded />,
          action: () => go(SHOP_PATHS.create(primaryShop.slug)),
          category: "action",
          keywords: ["sell", "new", "add"],
        })
      }
      items.push({
        id: "new-message",
        label: t("appUi.commandPalette.items.newMessage"),
        icon: <MessageRounded />,
        action: () => go("/messages"),
        category: "action",
        keywords: ["chat", "dm", "send"],
      })
    }

    items.push({
      id: "toggle-theme",
      label: t("appUi.commandPalette.items.toggleDarkMode"),
      icon:
        theme.palette.mode === "dark" ? (
          <LightModeRounded />
        ) : (
          <DarkModeRounded />
        ),
      action: () => {
        const event = new CustomEvent("toggle-theme")
        window.dispatchEvent(event)
        setOpen(false)
      },
      category: "action",
      keywords: ["dark", "light", "theme", "mode"],
    })

    return items
  }, [profile, shops, go, theme.palette.mode, t])

  // Content results from search API
  const contentItems = useMemo<CommandItem[]>(() => {
    if (!searchResults?.listings) return []
    return searchResults.listings.slice(0, 5).map((listing) => ({
      id: `listing-${listing.listing_id}`,
      label: listing.title,
      description: `${listing.shop_name} · ${fmt.number(listing.price_min)} aUEC`,
      icon: <StorefrontRounded />,
      action: () => go(`/market/${listing.listing_id}`),
      category: "content" as const,
    }))
  }, [searchResults, go, fmt])

  // Filter and combine results
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) {
      return [...actionItems.slice(0, 3), ...navItems.slice(0, 8)]
    }

    const matchItem = (item: CommandItem) => {
      if (item.label.toLowerCase().includes(q)) return true
      if (item.description?.toLowerCase().includes(q)) return true
      if (item.keywords?.some((kw) => kw.includes(q))) return true
      return false
    }

    const matchedNav = navItems.filter(matchItem)
    const matchedActions = actionItems.filter(matchItem)

    return [...matchedActions, ...matchedNav, ...contentItems]
  }, [query, navItems, actionItems, contentItems])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems.length])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action()
      }
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      )
      selected?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case "navigation":
        return t("appUi.commandPalette.categories.navigation")
      case "action":
        return t("appUi.commandPalette.categories.action")
      case "content":
        return t("appUi.commandPalette.categories.content")
      default:
        return cat
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false)
        setQuery("")
      }}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          overflow: "hidden",
          maxHeight: isMobile ? "90vh" : 480,
          mt: isMobile ? 2 : 8,
          mx: isMobile ? 1 : undefined,
        },
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
        },
      }}
      TransitionProps={{ onEntered: () => inputRef.current?.focus() }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <SearchRounded sx={{ color: "text.secondary", mr: 1.5 }} />
        <InputBase
          inputRef={inputRef}
          placeholder={t("appUi.commandPalette.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          sx={{ fontSize: "1rem" }}
        />
        <Chip
          label="ESC"
          size="small"
          variant="outlined"
          sx={{ height: 22, fontSize: "0.7rem" }}
        />
      </Box>

      <List
        ref={listRef}
        dense
        sx={{ py: 0.5, maxHeight: 380, overflowY: "auto" }}
      >
        {filteredItems.length === 0 && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary" variant="body2">
              {t("appUi.commandPalette.noResults", { query })}
            </Typography>
          </Box>
        )}
        {(() => {
          let lastCategory = ""
          let globalIdx = 0
          return filteredItems.map((item) => {
            const showHeader = item.category !== lastCategory
            lastCategory = item.category
            const idx = globalIdx++
            return (
              <React.Fragment key={item.id}>
                {showHeader && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      pt: 1,
                      pb: 0.5,
                      display: "block",
                      color: "text.secondary",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                    }}
                  >
                    {categoryLabel(item.category)}
                  </Typography>
                )}
                <ListItemButton
                  data-index={idx}
                  selected={idx === selectedIndex}
                  onClick={item.action}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    py: 0.75,
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color:
                        idx === selectedIndex
                          ? "primary.main"
                          : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: idx === selectedIndex ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              </React.Fragment>
            )
          })
        })()}
      </List>

      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          gap: 2,
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          <kbd
            style={{
              padding: "1px 4px",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              fontSize: "0.7rem",
            }}
          >
            ↑↓
          </kbd>{" "}
          {t("appUi.commandPalette.hintNavigate")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <kbd
            style={{
              padding: "1px 4px",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              fontSize: "0.7rem",
            }}
          >
            ↵
          </kbd>{" "}
          {t("appUi.commandPalette.hintSelect")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <kbd
            style={{
              padding: "1px 4px",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              fontSize: "0.7rem",
            }}
          >
            ESC
          </kbd>{" "}
          {t("appUi.commandPalette.hintClose")}
        </Typography>
      </Box>
    </Dialog>
  )
}

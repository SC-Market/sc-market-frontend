/**
 * Directory of every Help & Guides page (like a wiki sidebar): the hub, each
 * category with its guides nested under it, and About. Built from the
 * compiled content index, so new guides appear automatically. Links are real
 * <a href>s; collapsed categories stay in the DOM.
 */
import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material"
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded"
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded"
import MenuBookRounded from "@mui/icons-material/MenuBookRounded"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { HELP_PATHS } from "../../../routes/paths"
import { HELP_HUB_NAME } from "../../../seo/contentHeads"
import { guidesIn, helpIndex } from "../content"

const itemSx = { borderRadius: 1, py: 0.25 }

function DirectoryList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const current = pathname.replace(/\/+$/, "") || "/"
  const currentCategory = helpIndex.categories.find(
    (c) => current === HELP_PATHS.category(c.id) || current.startsWith(`${HELP_PATHS.category(c.id)}/`),
  )?.id
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    currentCategory ? { [currentCategory]: true } : {},
  )
  // Navigating into another category expands it too.
  useEffect(() => {
    if (currentCategory) setOpen((o) => (o[currentCategory] ? o : { ...o, [currentCategory]: true }))
  }, [currentCategory])

  const link = (to: string, label: string, depth: 0 | 1, bold = false) => (
    <ListItemButton
      key={to}
      component={RouterLink}
      to={to}
      selected={current === to}
      aria-current={current === to ? "page" : undefined}
      onClick={onNavigate}
      sx={{ ...itemSx, pl: depth === 1 ? 3 : 1 }}
    >
      <ListItemText
        primary={label}
        primaryTypographyProps={{ variant: "body2", fontWeight: bold ? 700 : undefined }}
      />
    </ListItemButton>
  )

  return (
    <List dense disablePadding component="nav" aria-label="All guides">
      {link(HELP_PATHS.hub, HELP_HUB_NAME, 0, true)}
      {helpIndex.categories.map((category) => {
        const expanded = !!open[category.id]
        const listId = `guides-dir-${category.id}`
        return (
          <Box key={category.id}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {link(HELP_PATHS.category(category.id), category.title, 0, true)}
              </Box>
              <Button
                size="small"
                color="inherit"
                aria-expanded={expanded}
                aria-controls={listId}
                aria-label={`${expanded ? "Collapse" : "Expand"} ${category.title}`}
                onClick={() => setOpen((o) => ({ ...o, [category.id]: !expanded }))}
                sx={{ minWidth: 32, px: 0.5 }}
              >
                {expanded ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
              </Button>
            </Box>
            <Collapse in={expanded} id={listId}>
              {guidesIn(category.id).map((guide) =>
                link(HELP_PATHS.guide(guide.category, guide.slug), guide.title, 1),
              )}
            </Collapse>
          </Box>
        )
      })}
      {link(HELP_PATHS.about, helpIndex.about.title, 0, true)}
    </List>
  )
}

/** Sticky panel on desktop. */
export function GuidesDirectory() {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1, position: "sticky", top: 88, maxHeight: "calc(100vh - 112px)", overflowY: "auto" }}
    >
      <DirectoryList />
    </Paper>
  )
}

/** "All guides" toggle for small screens. */
export function GuidesDirectoryToggle() {
  const [open, setOpen] = useState(false)
  return (
    <Box>
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={<MenuBookRounded />}
        endIcon={open ? <ExpandLessRounded /> : <ExpandMoreRounded />}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        All guides
      </Button>
      <Collapse in={open}>
        <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
            {HELP_HUB_NAME}
          </Typography>
          <DirectoryList onNavigate={() => setOpen(false)} />
        </Paper>
      </Collapse>
    </Box>
  )
}

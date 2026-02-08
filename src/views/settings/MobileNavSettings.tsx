import React, { useState } from "react"
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Stack,
} from "@mui/material"
import {
  StoreRounded,
  DesignServicesRounded,
  DescriptionRounded,
  PersonAddRounded,
  ForumRounded,
  CreateRounded,
  DashboardRounded,
  BusinessRounded,
  CalendarMonthRounded,
  ListAltRounded,
  WarehouseRounded,
  DashboardCustomizeRounded,
  AssignmentTurnedInRounded,
} from "@mui/icons-material"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useTranslation } from "react-i18next"

interface NavTab {
  id: string
  label: string
  shortLabel: string
  icon: React.ReactElement
}

const ALL_NAV_TABS: NavTab[] = [
  {
    id: "market",
    label: "sidebar.player_market",
    shortLabel: "sidebar.market_short",
    icon: <StoreRounded />,
  },
  {
    id: "services",
    label: "sidebar.contractor_services",
    shortLabel: "sidebar.services_short",
    icon: <DesignServicesRounded />,
  },
  {
    id: "contracts",
    label: "sidebar.open_contracts",
    shortLabel: "sidebar.contracts_short",
    icon: <DescriptionRounded />,
  },
  {
    id: "recruiting",
    label: "sidebar.recruiting",
    shortLabel: "sidebar.recruiting_short",
    icon: <PersonAddRounded />,
  },
  {
    id: "messages",
    label: "sidebar.messaging",
    shortLabel: "sidebar.messaging",
    icon: <ForumRounded />,
  },
  {
    id: "orders",
    label: "sidebar.orders_ive_placed",
    shortLabel: "sidebar.orders.text",
    icon: <CreateRounded />,
  },
  {
    id: "dashboard",
    label: "sidebar.orders_assigned_to_me",
    shortLabel: "sidebar.dashboard.text",
    icon: <DashboardRounded />,
  },
  {
    id: "contractors",
    label: "sidebar.contractors",
    shortLabel: "sidebar.contractors_short",
    icon: <BusinessRounded />,
  },
  {
    id: "availability",
    label: "sidebar.availability",
    shortLabel: "sidebar.availability_short",
    icon: <CalendarMonthRounded />,
  },
  {
    id: "manage-listings",
    label: "sidebar.manage_market_listings",
    shortLabel: "sidebar.listings_short",
    icon: <ListAltRounded />,
  },
  {
    id: "manage-stock",
    label: "sidebar.manage_stock",
    shortLabel: "sidebar.stock_short",
    icon: <WarehouseRounded />,
  },
  {
    id: "manage-services",
    label: "sidebar.manage_services",
    shortLabel: "sidebar.services_short",
    icon: <DashboardCustomizeRounded />,
  },
  {
    id: "org-dashboard",
    label: "sidebar.orders_assigned_to_me",
    shortLabel: "sidebar.dashboard.text",
    icon: <AssignmentTurnedInRounded />,
  },
  {
    id: "org-public",
    label: "sidebar.org_public_page",
    shortLabel: "sidebar.org_public_page",
    icon: <StoreRounded />,
  },
  {
    id: "org-availability",
    label: "sidebar.availability",
    shortLabel: "sidebar.availability_short",
    icon: <CalendarMonthRounded />,
  },
]

const DEFAULT_TABS = ["market", "services", "messages", "orders", "dashboard"]
const STORAGE_KEY = "mobile_nav_tabs"

export function MobileNavSettings() {
  const { t } = useTranslation()

  const [selectedTabs, setSelectedTabs] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_TABS
  })

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(selectedTabs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedTabs(items)
  }

  const handleToggle = (tabId: string) => {
    if (selectedTabs.includes(tabId)) {
      if (selectedTabs.length > 1) {
        setSelectedTabs(selectedTabs.filter((id) => id !== tabId))
      }
    } else {
      if (selectedTabs.length < 5) {
        setSelectedTabs([...selectedTabs, tabId])
      }
    }
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTabs))
    window.dispatchEvent(new Event("mobile-nav-updated"))
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSelectedTabs(DEFAULT_TABS)
    window.dispatchEvent(new Event("mobile-nav-updated"))
  }

  const getTabInfo = (tabId: string) =>
    ALL_NAV_TABS.find((tab) => tab.id === tabId)

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("settings.mobileNav.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("settings.mobileNav.description")}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t("settings.mobileNav.selected")} ({selectedTabs.length}/5)
        </Typography>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="selected-tabs">
            {(provided) => (
              <Stack
                {...provided.droppableProps}
                ref={provided.innerRef}
                spacing={1}
              >
                {selectedTabs.map((tabId, index) => {
                  const tab = getTabInfo(tabId)
                  if (!tab) return null
                  return (
                    <Draggable key={tabId} draggableId={tabId} index={index}>
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            p: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            cursor: "grab",
                            "&:active": { cursor: "grabbing" },
                          }}
                          elevation={2}
                        >
                          {tab.icon}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">
                              {t(tab.shortLabel)}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => handleToggle(tabId)}
                            disabled={selectedTabs.length === 1}
                          >
                            {t("ui.remove")}
                          </Button>
                        </Paper>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t("settings.mobileNav.available")}
        </Typography>
        <Stack spacing={1}>
          {ALL_NAV_TABS.filter((tab) => !selectedTabs.includes(tab.id)).map(
            (tab) => (
              <FormControlLabel
                key={tab.id}
                control={
                  <Checkbox
                    checked={false}
                    onChange={() => handleToggle(tab.id)}
                    disabled={selectedTabs.length >= 5}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.icon}
                    <Typography variant="body2">{t(tab.shortLabel)}</Typography>
                  </Box>
                }
              />
            ),
          )}
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={handleReset} fullWidth>
          {t("ui.reset")}
        </Button>
        <Button variant="contained" onClick={handleSave} fullWidth>
          {t("ui.save")}
        </Button>
      </Stack>
    </Box>
  )
}

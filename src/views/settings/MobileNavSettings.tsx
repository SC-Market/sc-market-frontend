import React, { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useTranslation } from "react-i18next"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';

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

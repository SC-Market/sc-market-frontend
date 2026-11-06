/**
 * ContextAwareFAB Component
 * Floating Action Button that changes based on current page
 * Long-press to show all available actions
 * Positioned by FloatingActions (Root), above the bottom nav.
 */

import React, { useState, useRef } from "react"
import { Fab, SpeedDial, SpeedDialAction, useTheme } from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import {
  AddRounded,
  StoreRounded,
  MessageRounded,
  DesignServicesRounded,
  InventoryRounded,
  DescriptionRounded,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { haptic } from "../../util/haptics"
import { PATHS, MARKET_PATHS } from "../../routes/paths"

interface Action {
  icon: React.ReactNode
  name: string
  onClick: () => void
}

export function ContextAwareFAB() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useBreakpointDown("sm")
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const longPressTimer = useRef<number | undefined>(undefined)

  if (!isMobile) return null

  const allActions: Action[] = [
    {
      icon: <StoreRounded />,
      name: t("market.createListing"),
      onClick: () => {
        navigate(MARKET_PATHS.manage)
      },
    },
    {
      icon: <MessageRounded />,
      name: t("appUi.commandPalette.items.newMessage"),
      onClick: () => {
        navigate(PATHS.messages)
      },
    },
    {
      icon: <DesignServicesRounded />,
      name: t("services.createService"),
      onClick: () => {
        navigate(MARKET_PATHS.services)
      },
    },
    {
      icon: <InventoryRounded />,
      name: t("ItemStock.manageStock"),
      onClick: () => {
        navigate(MARKET_PATHS.manageStock)
      },
    },
    {
      icon: <DescriptionRounded />,
      name: t("chromeUi.fab.viewContracts"),
      onClick: () => {
        navigate(PATHS.contracts)
      },
    },
  ]

  const getPrimaryAction = (): Action | null => {
    const path = location.pathname
    if (path.includes("/market/manage")) {
      return allActions[0] // Create Listing
    }
    if (path === "/messages") {
      return allActions[1] // New Message
    }
    // Don't show on individual message pages
    if (path.includes("/messages/")) {
      return null
    }
    if (path.includes("/order/services")) {
      return allActions[2] // Create Service
    }
    if (path.includes("/market/stock")) {
      return allActions[3] // Manage Stock
    }
    // Don't show on /contracts page - it has its own FiltersFAB
    if (path === "/contracts" || path.startsWith("/contracts/public")) {
      return null
    }
    if (path.includes("/contracts")) {
      return allActions[4] // View Contracts
    }
    return null
  }

  const primaryAction = getPrimaryAction()

  // Don't show FAB if no primary action for current page
  if (!primaryAction && !speedDialOpen) return null

  const handleTouchStart = () => {
    longPressTimer.current = window.setTimeout(() => {
      setSpeedDialOpen(true)
      haptic.medium()
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
    }
  }

  const handleClick = () => {
    if (primaryAction && !speedDialOpen) {
      haptic.light()
      primaryAction.onClick()
    }
  }

  return (
    <>
      {speedDialOpen ? (
        <SpeedDial
          ariaLabel={t("chromeUi.fab.quickActions")}
          sx={{
            "& .MuiSpeedDial-fab": {
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          }}
          icon={<AddRounded />}
          onClose={() => setSpeedDialOpen(false)}
          open={speedDialOpen}
        >
          {allActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                haptic.light()
                action.onClick()
                setSpeedDialOpen(false)
              }}
            />
          ))}
        </SpeedDial>
      ) : (
        <Fab
          color="primary"
          aria-label={primaryAction?.name}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          {primaryAction?.icon}
        </Fab>
      )}
    </>
  )
}

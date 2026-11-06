import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import React from "react"
import { useMessagingSidebar } from "../hooks/MessagingSidebar"
import { MessagingSidebarContent } from "./MessagingSidebarContent"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { DockedSidePanel } from "../../../components/sidebar/DockedSidePanel"

import { messagingDrawerWidth } from "../constants"

export { messagingDrawerWidth }

// Sidebar with chat list and search/group creation controls
export function MessagingSidebar() {
  const isMobile = useIsMobile()
  const [messagingSidebar, setMessagingSidebar] = useMessagingSidebar()
  const { t } = useTranslation()

  // On mobile, use BottomSheet instead of temporary drawer
  if (isMobile) {
    return (
      <BottomSheet
        open={messagingSidebar ?? false}
        onClose={() => setMessagingSidebar(false)}
        title={t("MessagingSidebar.title", "Messages")}
        maxHeight="90vh"
      >
        <MessagingSidebarContent />
      </BottomSheet>
    )
  }

  // On desktop, a panel docked beside the navigation sidebar
  return (
    <DockedSidePanel open={!!messagingSidebar} width={messagingDrawerWidth}>
      <MessagingSidebarContent />
    </DockedSidePanel>
  )
}

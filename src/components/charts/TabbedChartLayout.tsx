import React from "react"
import { Box, Tabs, Tab } from "@mui/material"

interface TabbedChartLayoutProps {
  tabs: string[]
  selectedTab: number
  onTabChange: (newTab: number) => void
  children: React.ReactNode
}

export function TabbedChartLayout({
  tabs,
  selectedTab,
  onTabChange,
  children,
}: TabbedChartLayoutProps) {
  return (
    <Box display="flex" sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
      <Tabs
        orientation="vertical"
        value={selectedTab}
        onChange={(e, newValue) => onTabChange(newValue)}
        sx={{ borderRight: 1, borderColor: "divider", minWidth: 150 }}
      >
        {tabs.map((label, index) => (
          <Tab key={index} label={label} />
        ))}
      </Tabs>
      <Box sx={{ flexGrow: 1, width: "100%" }}>{children}</Box>
    </Box>
  )
}

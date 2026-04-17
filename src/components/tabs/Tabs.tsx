import React from "react"

export function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
    iconPosition: "start" as "top" | "bottom" | "start" | "end",
    sx: {
      minHeight: 48,
    },
  }
}

export interface TabPanelProps {
  children?: React.ReactNode
  index: number | string
  value: number | string
  preload?: boolean
}

export function TabPanel(props: TabPanelProps) {
  const { value, index, children, preload } = props
  const isActive = value === index

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: "100%", display: isActive ? undefined : preload ? "none" : undefined }}
    >
      {(isActive || preload) && children}
    </div>
  )
}

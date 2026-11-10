import React from "react"

/**
 * Tab props. No aria-controls: most tab bars here switch routes and render
 * no tab panel, so it pointed at an id that didn't exist (invalid ARIA).
 * TabPanel names itself after its tab instead.
 */
export function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{
        width: "100%",
        display: isActive ? undefined : preload ? "none" : undefined,
      }}
    >
      {(isActive || preload) && children}
    </div>
  )
}

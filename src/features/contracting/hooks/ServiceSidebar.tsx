import React from "react"

export const serviceDrawerWidth = 360

export const ServiceSidebarContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useServiceSidebar = () => {
  const val = React.useContext(ServiceSidebarContext)
  if (val == null) {
    throw new Error(
      "Cannot use useServiceSidebar outside of ServiceSidebarContext",
    )
  }
  return val
}

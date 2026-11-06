import React from "react"

export const MessagingSidebarContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useMessagingSidebar = () => {
  const val = React.useContext(MessagingSidebarContext)
  if (val == null) {
    // throw new Error("Cannot use useMessagingSidebar outside MessagingSidebarContext")
    const ignore: React.Dispatch<React.SetStateAction<boolean>> = () => {}
    return [undefined, ignore] as const
  }

  return val
}

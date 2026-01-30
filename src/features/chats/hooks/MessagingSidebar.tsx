import React from "react"

export const MessagingSidebarContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useMessagingSidebar = () => {
  const val = React.useContext(MessagingSidebarContext)
  if (val == null) {
    // throw new Error("Cannot use useMessagingSidebar outside MessagingSidebarContext")
    return [
      undefined,
      (arg: boolean | ((t: boolean) => boolean)) => null,
    ] as const
  }

  return val
}

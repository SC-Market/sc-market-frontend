import React from "react"

export const CurrentChatIDContext = React.createContext<
  | [
      string | null | undefined,
      React.Dispatch<React.SetStateAction<string | null | undefined>>,
    ]
  | null
>(null)

export const useCurrentChatID = () => {
  const val = React.useContext(CurrentChatIDContext)
  if (val == null) {
    throw new Error("Cannot use useCurrentChat outside of CurrentChatContext")
  }
  return val
}

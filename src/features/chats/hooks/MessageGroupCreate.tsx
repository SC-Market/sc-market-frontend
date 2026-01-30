import React from "react"

export const MessageGroupCreateContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useMessageGroupCreate = () => {
  const val = React.useContext(MessageGroupCreateContext)
  if (val == null) {
    throw new Error(
      "Cannot use useMessageGroupCreate outside of MessageGroupCreateContext",
    )
  }
  return val
}

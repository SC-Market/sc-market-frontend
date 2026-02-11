import React from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';

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

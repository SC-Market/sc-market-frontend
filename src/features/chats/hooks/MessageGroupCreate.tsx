import React from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/styles';

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

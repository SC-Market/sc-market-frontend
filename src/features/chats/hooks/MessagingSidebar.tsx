import React from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';

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

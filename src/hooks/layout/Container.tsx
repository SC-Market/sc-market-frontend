import React from "react"
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';

export const ContainerSizeContext = React.createContext<
  [Breakpoint, React.Dispatch<React.SetStateAction<Breakpoint>>] | null
>(null)

export const useContainerSize = () => {
  const val = React.useContext(ContainerSizeContext)
  if (val == null) {
    throw new Error(
      "Cannot use useContainerSize outside of ContainerSizeContext",
    )
  }
  return val
}

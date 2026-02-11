import React from "react"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const RecruitingDrawerWidth = 360

export const RecruitingSidebarContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | null
>(null)

export const useRecruitingSidebar = () => {
  const val = React.useContext(RecruitingSidebarContext)
  if (val == null) {
    throw new Error(
      "Cannot use useRecruitingSidebar outside of RecruitingSidebarContext",
    )
  }
  return val
}

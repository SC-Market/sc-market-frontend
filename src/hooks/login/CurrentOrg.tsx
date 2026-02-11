import React, { useEffect, useState } from "react"
import { Contractor } from "../../datatypes/Contractor"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const CurrentOrgContext = React.createContext<
  | [Contractor | null, React.Dispatch<React.SetStateAction<Contractor | null>>]
  | null
>(null)

export const useCurrentOrg = () => {
  const val = React.useContext(CurrentOrgContext)
  if (val == null) {
    throw new Error("Cannot use useCurrentOrg outside of CurrentOrgContext")
  }
  return val
}

export function CurrentOrgProvider(props: { children: React.ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Contractor | null>(null)

  return (
    <CurrentOrgContext.Provider value={[currentOrg, setCurrentOrg]}>
      {props.children}
    </CurrentOrgContext.Provider>
  )
}

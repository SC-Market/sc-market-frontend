import React from "react"
import { ContractorKindIconKey } from "../../views/contractor/ContractorList"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export interface RecruitingSearchState {
  fields: ContractorKindIconKey[]
  rating: number
  query: string
  sorting:
    | "rating"
    | "name"
    | "activity"
    | "all-time"
    | "members"
    | "rating-reverse"
    | "name-reverse"
    | "activity-reverse"
    | "all-time-reverse"
    | "members-reverse"
  language_codes?: string[]
}

export const RecruitingSearchContext = React.createContext<
  | [
      RecruitingSearchState,
      React.Dispatch<React.SetStateAction<RecruitingSearchState>>,
    ]
  | null
>(null)

export const useRecruitingSearch = () => {
  const val = React.useContext(RecruitingSearchContext)
  if (val == null) {
    throw new Error(
      "Cannot use useRecruitingSearch outside of RecruitingSearchContext",
    )
  }
  return val
}

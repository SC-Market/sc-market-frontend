import React from "react"
import { ContractorKindIconKey } from "../../views/contractor/ContractorList"

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

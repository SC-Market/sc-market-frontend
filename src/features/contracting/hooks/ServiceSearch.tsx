import React from "react"

interface ServiceSearchState {
  kind?: string | undefined
  // type?: string | undefined,
  minOffer?: number
  maxOffer?: number | null
  // quantityAvailable?: number
  query: string
  paymentType?: string
  language_codes?: string[]
}

export const ServiceSearchContext = React.createContext<
  | [
      ServiceSearchState,
      React.Dispatch<React.SetStateAction<ServiceSearchState>>,
    ]
  | null
>(null)

export const useServiceSearch = () => {
  const val = React.useContext(ServiceSearchContext)
  if (val == null) {
    throw new Error(
      "Cannot use useServiceSearch outside of ServiceSearchContext",
    )
  }
  return val
}

import React from "react"
import { CounterOfferBody } from "../../features/offers/api/offerApi"

export const CounterOfferDetailsContext = React.createContext<
  | [CounterOfferBody, React.Dispatch<React.SetStateAction<CounterOfferBody>>]
  | null
>(null)

export const useCounterOffer = () => {
  const val = React.useContext(CounterOfferDetailsContext)
  if (val == null) {
    throw new Error(
      "Cannot use useCounterOffer outside of CounterOfferDetailsContext",
    )
  }
  return val
}

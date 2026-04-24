import { createContext, useContext } from "react"
import type { useCreateOrderForm } from "../../hooks/useCreateOrderForm"

export type OrderFormContextType = ReturnType<typeof useCreateOrderForm>

export const OrderFormContext = createContext<OrderFormContextType | null>(null)

export function useOrderFormContext() {
  const ctx = useContext(OrderFormContext)
  if (!ctx) throw new Error("useOrderFormContext must be used within OrderForm")
  return ctx
}

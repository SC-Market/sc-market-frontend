import { createContext, useContext } from "react"
import type { useCreateServiceForm } from "../../hooks/useCreateServiceForm"

export type ServiceFormContextType = ReturnType<typeof useCreateServiceForm>

export const ServiceFormContext = createContext<ServiceFormContextType | null>(null)

export function useServiceFormContext() {
  const ctx = useContext(ServiceFormContext)
  if (!ctx) throw new Error("useServiceFormContext must be used within ServiceForm")
  return ctx
}

import React from "react"
import { GridProps } from "@mui/material"
import type { Service } from "../../domain/types"
import { useCreateServiceForm } from "../../hooks/useCreateServiceForm"
import { ServiceFormContext } from "./ServiceFormContext"
import { ServiceDetailsSection } from "./ServiceDetailsSection"
import { OrderDetailsSection } from "./OrderDetailsSection"
import { CostsSection } from "./CostsSection"

export function ServiceForm(props: GridProps & { service?: Service }) {
  const formState = useCreateServiceForm(props.service)

  return (
    <ServiceFormContext.Provider value={formState}>
      <ServiceDetailsSection isEditing={!!props.service} />
      <OrderDetailsSection />
      <CostsSection isEditing={!!props.service} />
    </ServiceFormContext.Provider>
  )
}

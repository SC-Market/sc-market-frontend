import React from "react"
import { GridProps } from "@mui/material"
import type { Service } from "../../domain/types"
import { useCreateServiceForm } from "../../hooks/useCreateServiceForm"
import { ServiceFormContext } from "./ServiceFormContext"
import { ServiceDetailsSection } from "./ServiceDetailsSection"
import { OrderDetailsSection } from "./OrderDetailsSection"
import { CostsSection } from "./CostsSection"
import { OfferingAsSection } from "./OfferingAsSection"
import { useOptionalShopRouteContext } from "../../../../components/router/ShopContextFromRoute"

export function ServiceForm(props: GridProps & { service?: Service }) {
  const formState = useCreateServiceForm(props.service)
  // New services are created in /shop/:slug/services/create, for that shop's
  // owner; editing (/order/service/:id/edit) keeps the service's owner.
  const shopCtx = useOptionalShopRouteContext()

  return (
    <ServiceFormContext.Provider value={formState}>
      {!props.service && shopCtx && <OfferingAsSection shop={shopCtx.shop} />}
      <ServiceDetailsSection isEditing={!!props.service} />
      <OrderDetailsSection />
      <CostsSection isEditing={!!props.service} />
    </ServiceFormContext.Provider>
  )
}

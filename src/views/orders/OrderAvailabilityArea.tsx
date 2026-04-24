import { Order } from "../../features/orders/domain/types"
import { AvailabilityDisplay } from "../../components/time/AvailabilitySelector"
import { convertAvailability } from "../../pages/availability/Availability.lazy"
import React from "react"
import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { OfferSession } from "../../features/offers/api/offerApi"
import type { GetOfferSessionV2Response } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"

type SessionLike = Order | OfferSession | GetOfferSessionV2Response

function getUsername(user: unknown): string {
  if (!user) return "Unknown"
  if (typeof user === "string") return user
  if (typeof user === "object" && user !== null && "username" in user) return (user as { username: string }).username
  return "Unknown"
}

export function OrderAvailabilityArea(props: { order?: SessionLike; session?: GetOfferSessionV2Response }) {
  const source = props.session || props.order
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  if (!source || !source.availability) return null

  const customerName = getUsername(source.customer)
  const assignedName = getUsername(source.assigned_to)

  return (
    <Grid container spacing={theme.layoutSpacing?.layout ?? 2}>
      <Grid item xs={12} lg={source.assigned_to && source.availability?.assigned ? 6 : 12}>
        {source.availability.customer && (
          <AvailabilityDisplay
            name={t("orderAvailabilityArea.customer_name", { name: customerName })}
            value={convertAvailability(source.availability.customer)}
          />
        )}
      </Grid>
      {assignedName && source.availability?.assigned && (
        <Grid item xs={12} lg={6}>
          <AvailabilityDisplay
            name={t("orderAvailabilityArea.assigned_name", { name: assignedName })}
            value={convertAvailability(source.availability.assigned)}
          />
        </Grid>
      )}
    </Grid>
  )
}

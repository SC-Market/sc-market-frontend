import { Order } from "../../datatypes/Order"
import { AvailabilityDisplay } from "../../components/time/AvailabilitySelector"
import { convertAvailability } from "../../pages/availability/Availability.lazy"
import React from "react"
import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { OfferSession } from "../../store/offer"
import { MinimalUser } from "../../datatypes/User"
import { useTranslation } from "react-i18next"

export function OrderAvailabilityArea(props: { order: Order | OfferSession }) {
  const { order } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const customerName =
    typeof order.customer === "string"
      ? order.customer
      : (order.customer as MinimalUser).username

  const assignedName =
    typeof order.assigned_to === "string"
      ? order.assigned_to
      : (order.assigned_to as MinimalUser)?.username

  return (
    <Grid container spacing={theme.layoutSpacing?.layout ?? 2}>
      <Grid item xs={12} lg={order.assigned_to && order.availability?.assigned ? 6 : 12}>
        <AvailabilityDisplay
          name={t("orderAvailabilityArea.customer_name", { name: customerName })}
          value={convertAvailability(order.availability!.customer)}
        />
      </Grid>
      {assignedName && order.availability?.assigned && (
        <Grid item xs={12} lg={6}>
          <AvailabilityDisplay
            name={t("orderAvailabilityArea.assigned_name", {
              name: assignedName,
            })}
            value={convertAvailability(order.availability!.assigned!)}
          />
        </Grid>
      )}
    </Grid>
  )
}

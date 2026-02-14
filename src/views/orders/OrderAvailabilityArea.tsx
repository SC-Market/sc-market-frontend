import { Order } from "../../datatypes/Order"
import { AvailabilityDisplay } from "../../components/time/AvailabilitySelector"
import { convertAvailability } from "../../pages/availability/Availability.lazy"
import React from "react"
import { OfferSession } from "../../store/offer"
import { MinimalUser } from "../../datatypes/User"
import { useTranslation } from "react-i18next"

export function OrderAvailabilityArea(props: { order: Order | OfferSession }) {
  const { order } = props
  const { t } = useTranslation()

  const customerName =
    typeof order.customer === "string"
      ? order.customer
      : (order.customer as MinimalUser).username

  const assignedName =
    typeof order.assigned_to === "string"
      ? order.assigned_to
      : (order.assigned_to as MinimalUser)?.username

  return (
    <>
      <AvailabilityDisplay
        name={t("orderAvailabilityArea.customer_name", { name: customerName })}
        value={convertAvailability(order.availability!.customer)}
        lg={order.assigned_to && order.availability?.assigned ? 4 : 8}
      />
      {assignedName && order.availability?.assigned && (
        <AvailabilityDisplay
          name={t("orderAvailabilityArea.assigned_name", {
            name: assignedName,
          })}
          value={convertAvailability(order.availability!.assigned!)}
        />
      )}
    </>
  )
}

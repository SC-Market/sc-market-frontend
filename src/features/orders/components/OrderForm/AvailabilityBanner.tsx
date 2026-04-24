import React from "react"
import { Alert, AlertTitle, Box, Button, Grid } from "@mui/material"
import { CheckCircle, Warning } from "@mui/icons-material"
import { OrderLimitsDisplay } from "../../../../components/orders/OrderLimitsDisplay"
import { useTranslation } from "react-i18next"
import { useOrderFormContext } from "./OrderFormContext"

export function AvailabilityBanner() {
  const { t } = useTranslation()
  const {
    availabilityRequirement, hasAvailabilitySet, formDisabled,
    isAvailabilityModalOpen, setIsAvailabilityModalOpen,
    orderLimits, sellerName, state,
  } = useOrderFormContext()

  if (!availabilityRequirement && !orderLimits) return null

  return (
    <>
      {availabilityRequirement && (
        <Grid item xs={12}>
          <Alert
            severity={hasAvailabilitySet ? "success" : "warning"}
            icon={hasAvailabilitySet ? <CheckCircle /> : <Warning />}
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {hasAvailabilitySet ? t("AvailabilityRequirement.set") : t("AvailabilityRequirement.required")}
            </AlertTitle>
            <Box>
              {hasAvailabilitySet ? (
                <>
                  {t("AvailabilityRequirement.setMessage", { sellerName })}
                  <Button size="small" onClick={() => setIsAvailabilityModalOpen(true)} sx={{ mt: 1, ml: 1 }}>
                    {t("availability.edit", "Edit")}
                  </Button>
                </>
              ) : (
                <>
                  {t("AvailabilityRequirement.requiredMessage", { sellerName })}
                  <Box mt={1}>
                    <Button variant="contained" size="small" onClick={() => setIsAvailabilityModalOpen(true)}>
                      {t("AvailabilityRequirement.setAvailability")}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Alert>
        </Grid>
      )}
      {orderLimits && (
        <Grid item xs={12}>
          <OrderLimitsDisplay limits={orderLimits} currentSize={0} currentValue={state.offer} showValidation={true} />
        </Grid>
      )}
    </>
  )
}

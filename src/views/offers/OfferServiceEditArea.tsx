import { OfferSession } from "../../store/offer"
import React, { useMemo } from "react"
import { Grid, MenuItem, Paper, TextField, Typography } from "@mui/material"
import { ServiceListingBase } from "../contracts/ServiceListings"
import { Stack } from "@mui/system"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"
import {
  useGetServicesContractorQuery,
  useGetServicesQuery,
} from "../../store/services"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function OfferServiceEditArea(props: { offer: OfferSession }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { offer: session } = props
  const [body, setBody] = useCounterOffer()

  const { data: userServices } = useGetServicesQuery(
    session.assigned_to?.username!,
    {
      skip: !session.assigned_to?.username,
    },
  )
  const { data: contractorServices } = useGetServicesContractorQuery(
    session.contractor?.spectrum_id!,
    { skip: !session.contractor?.spectrum_id },
  )
  const services = useMemo(
    () => (session.assigned_to ? userServices : contractorServices) || [],
    [session.assigned_to, contractorServices, userServices],
  )

  const service = useMemo(() => {
    return services.find((t) => t.service_id === body.service_id) || null
  }, [body, services])

  return (
    <Grid item xs={12} lg={4} md={12}>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={theme.layoutSpacing.compact}>
          <Typography
            variant={"h5"}
            sx={{ fontWeight: "bold" }}
            color={"text.secondary"}
          >
            {t("OfferServiceEditArea.associatedServices")}
          </Typography>
          <TextField
            fullWidth
            select
            label={t("OfferServiceEditArea.selectServiceOptional")}
            id="order-service"
            value={service?.service_name || ""}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              if (event.target.value === "") {
                setBody({ ...body, service_id: null })
              } else {
                setBody({
                  ...body,
                  service_id: (services || []).find(
                    (t) => t.service_name === event.target.value,
                  )!.service_id,
                })
              }
            }}
            color={"secondary"}
            SelectProps={{
              IconComponent: KeyboardArrowDownRoundedIcon,
            }}
          >
            <MenuItem value={""}>
              {t("OfferServiceEditArea.noService")}
            </MenuItem>
            {(services || []).map((t) => (
              <MenuItem value={t.service_name} key={t.service_name}>
                {t.service_name}
              </MenuItem>
            ))}
          </TextField>

          {service && <ServiceListingBase service={service} index={0} />}
        </Stack>
      </Paper>
    </Grid>
  )
}

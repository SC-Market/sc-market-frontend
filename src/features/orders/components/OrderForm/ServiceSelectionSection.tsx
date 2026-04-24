import React from "react"
import { Grid, MenuItem, TextField, Typography } from "@mui/material"
import { Section } from "../../../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useOrderFormContext } from "./OrderFormContext"

export function ServiceSelectionSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { services, service, setService } = useOrderFormContext()

  if (!services || services.length === 0) return null

  return (
    <Section xs={12}>
      <Grid item xs={12} lg={4}>
        <Typography variant="h6" align="left" color="text.secondary" sx={{ fontWeight: "bold" }}>
          {t("CreateOrderForm.services")}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.compact}>
        <Grid item xs={12}>
          <TextField
            fullWidth select label={t("CreateOrderForm.selectServiceOptional")} id="order-service"
            value={service?.service_name || ""}
            onChange={(e: React.ChangeEvent<{ value: string }>) => {
              if (e.target.value === "") setService(null)
              else setService((services || []).find((s) => s.service_name === e.target.value)!)
            }}
            color="secondary"
            SelectProps={{ IconComponent: KeyboardArrowDownRoundedIcon }}
          >
            <MenuItem value="">{t("CreateOrderForm.noService")}</MenuItem>
            {(services || []).map((s) => <MenuItem value={s.service_name} key={s.service_name}>{s.service_name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
    </Section>
  )
}

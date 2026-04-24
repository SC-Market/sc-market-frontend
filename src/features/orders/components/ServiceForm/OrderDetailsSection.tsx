import React from "react"
import { Checkbox, FormControlLabel, Grid, MenuItem, TextField, Typography } from "@mui/material"
import { Section } from "../../../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { orderIcons } from "../orderIcons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useServiceFormContext } from "./ServiceFormContext"

export function OrderDetailsSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { state, setState } = useServiceFormContext()

  return (
    <Section xs={12}>
      <Grid item xs={12} lg={4}>
        <Typography variant="h6" align="left" color="text.secondary" sx={{ fontWeight: "bold" }}>
          {t("CreateServiceForm.orderServiceDetails")}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <TextField
            fullWidth label={t("CreateServiceForm.title") + "*"} id="order-title"
            value={state.title}
            onChange={(e: React.ChangeEvent<{ value: string }>) => setState({ ...state, title: e.target.value })}
            color="secondary" aria-required="true"
            inputProps={{ maxLength: 100 }}
          />
        </Grid>
        <Grid item xs={12} lg={10}>
          <TextField
            fullWidth select label={t("CreateServiceForm.typeOptional")} id="order-type"
            value={state.type}
            onChange={(e: React.ChangeEvent<{ value: string }>) => setState({ ...state, type: e.target.value })}
            color="secondary"
            SelectProps={{ IconComponent: KeyboardArrowDownRoundedIcon }}
          >
            {Object.keys(orderIcons).map((k) => <MenuItem value={k} key={k}>{k}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={2} container alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                onChange={(e: React.ChangeEvent<{ checked: boolean }>) => setState({ ...state, rush: e.target.checked })}
                color="secondary" name="Rush"
              />
            }
            label={t("CreateServiceForm.rush")}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            multiline fullWidth label={t("CreateServiceForm.description")} id="description"
            helperText={t("CreateServiceForm.descriptionHelper")}
            onChange={(e: React.ChangeEvent<{ value: string }>) => setState({ ...state, description: e.target.value })}
            value={state.description} minRows={4} maxRows={4} color="secondary"
            inputProps={{ maxLength: 1000 }}
          />
        </Grid>
      </Grid>
    </Section>
  )
}

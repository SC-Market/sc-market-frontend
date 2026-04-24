import React from "react"
import { Checkbox, FormControlLabel, Grid, MenuItem, TextField, Typography } from "@mui/material"
import { Section } from "../../../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { orderIcons } from "../orderIcons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useOrderFormContext } from "./OrderFormContext"

export function OrderAboutSection({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { state, setState, formDisabled } = useOrderFormContext()

  return (
    <Section xs={12} ref={ref}>
      <Grid item xs={12} lg={4}>
        <Typography variant="h6" align="left" color="text.secondary" sx={{ fontWeight: "bold" }}>
          {t("CreateOrderForm.about")}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <TextField
            fullWidth label={t("CreateOrderForm.title") + "*"} id="order-title"
            value={state.title} disabled={!!formDisabled}
            onChange={(e: React.ChangeEvent<{ value: string }>) => setState({ ...state, title: e.target.value })}
            color="secondary" aria-required="true" inputProps={{ maxLength: 100 }}
          />
        </Grid>
        <Grid item xs={12} lg={10}>
          <TextField
            fullWidth select label={t("CreateOrderForm.type") + "*"} id="order-type"
            value={state.type} disabled={!!formDisabled}
            onChange={(e: React.ChangeEvent<{ value: string }>) => setState({ ...state, type: e.target.value })}
            color="secondary" aria-required="true"
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
                color="secondary" name="Rush" disabled={!!formDisabled}
              />
            }
            label={t("CreateOrderForm.rush")}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            multiline fullWidth label={t("CreateOrderForm.description") + "*"} id="description"
            helperText={t("CreateOrderForm.descriptionHelper")}
            onChange={(e: React.ChangeEvent<{ value: string }>) => setState({ ...state, description: e.target.value })}
            value={state.description} minRows={4} maxRows={4} color="secondary"
            aria-required="true" disabled={!!formDisabled} inputProps={{ maxLength: 1000 }}
          />
        </Grid>
      </Grid>
    </Section>
  )
}

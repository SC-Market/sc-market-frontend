import { useTranslation } from "react-i18next"
import {
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
} from "@mui/material"
import { HelpLink } from "../../help/components/HelpLink"
import { HelpTip } from "../../help/components/HelpTip"
import { FormPaper } from "../../../components/paper/FormPaper"

export type StockTiming = "on_accepted" | "on_received" | "dont_subtract"
export type AllocationMode = "auto" | "manual" | "none"

/** When stock is subtracted for an order, and how orders get allocated. */
export function ShopStockSettingsFields({
  stockTiming,
  setStockTiming,
  allocationMode,
  setAllocationMode,
  saving,
}: {
  stockTiming: StockTiming
  setStockTiming: (value: StockTiming) => void
  allocationMode: AllocationMode
  setAllocationMode: (value: AllocationMode) => void
  saving: boolean
}) {
  const { t } = useTranslation()
  return (
    <FormPaper
      title={t("shopsUi.orderSettings.stockTitle")}
      subtitle={t("shopsUi.orderSettings.stockSubtitle")}
    >
      <Grid item xs={12}>
        <HelpLink guide="stockModes" />
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset" disabled={saving}>
          <FormLabel
            component="legend"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {t("shopsUi.orderSettings.stockTiming")}
            <HelpTip
              label={t("shopsUi.orderSettings.stockTiming")}
              title={t("help.tips.stockTiming")}
            />
          </FormLabel>
          <RadioGroup
            value={stockTiming}
            onChange={(e) => setStockTiming(e.target.value as StockTiming)}
          >
            <FormControlLabel
              value="on_accepted"
              control={<Radio />}
              label={t("shopsUi.orderSettings.onAccepted")}
            />
            <FormControlLabel
              value="on_received"
              control={<Radio />}
              label={t("shopsUi.orderSettings.onReceived")}
            />
            <FormControlLabel
              value="dont_subtract"
              control={<Radio />}
              label={t("shopsUi.orderSettings.dontSubtract")}
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <FormControl component="fieldset" disabled={saving}>
          <FormLabel
            component="legend"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {t("shopsUi.orderSettings.allocationMode")}
            <HelpTip
              label={t("shopsUi.orderSettings.allocationMode")}
              title={t("help.tips.allocationMode")}
            />
          </FormLabel>
          <RadioGroup
            value={allocationMode}
            onChange={(e) =>
              setAllocationMode(e.target.value as AllocationMode)
            }
          >
            <FormControlLabel
              value="auto"
              control={<Radio />}
              label={t("shopsUi.orderSettings.allocationAuto")}
            />
            <FormControlLabel
              value="manual"
              control={<Radio />}
              label={t("shopsUi.orderSettings.allocationManual")}
            />
            <FormControlLabel
              value="none"
              control={<Radio />}
              label={t("shopsUi.orderSettings.allocationNone")}
            />
          </RadioGroup>
        </FormControl>
      </Grid>
    </FormPaper>
  )
}

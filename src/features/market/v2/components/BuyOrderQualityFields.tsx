import { Grid, TextField } from "@mui/material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"

import { QualityBandSelect } from "../../../../components/game-data/QualityBandSelect"
import type { QualityBand } from "../../../../store/api/v2/market"
import type { QualityMode } from "../../../../util/qualityMode"

/**
 * Quality range inputs for a buy order: tier selects for tiered items, or a
 * 0-1000 value range (named bands when the resource has them).
 */
export function BuyOrderQualityFields({
  qualityMode,
  qualityBands,
  qualityTierMin,
  setQualityTierMin,
  qualityTierMax,
  setQualityTierMax,
  qualityValueMin,
  setQualityValueMin,
  qualityValueMax,
  setQualityValueMax,
}: {
  qualityMode: QualityMode
  qualityBands: QualityBand[] | undefined
  qualityTierMin: number | null
  setQualityTierMin: (tier: number | null) => void
  qualityTierMax: number | null
  setQualityTierMax: (tier: number | null) => void
  qualityValueMin: number | null
  setQualityValueMin: (value: number | null) => void
  qualityValueMax: number | null
  setQualityValueMax: (value: number | null) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {qualityMode === "tier" && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("market.qualityTierMin", "Min Quality Tier")}
              value={qualityTierMin ?? ""}
              onChange={(e) =>
                setQualityTierMin(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              SelectProps={{ native: true }}
            >
              <option value="">{t("marketV2.any")}</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {t("marketV2.tierN", { tier: n })}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("market.qualityTierMax", "Max Quality Tier")}
              value={qualityTierMax ?? ""}
              onChange={(e) =>
                setQualityTierMax(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              SelectProps={{ native: true }}
            >
              <option value="">{t("marketV2.any")}</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {t("marketV2.tierN", { tier: n })}
                </option>
              ))}
            </TextField>
          </Grid>
        </>
      )}

      {qualityMode === "value" && (
        <>
          <Grid item xs={12} sm={6}>
            {qualityBands && qualityBands.length > 0 ? (
              <QualityBandSelect
                bands={qualityBands}
                value={qualityValueMin}
                onChange={setQualityValueMin}
                label={t("marketV2.minQuality")}
              />
            ) : (
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                size="small"
                fullWidth
                isAllowed={({ floatValue }) =>
                  !floatValue || floatValue <= 1000
                }
                label={t("marketV2.minQualityRange")}
                value={qualityValueMin ?? ""}
                onValueChange={(v) => setQualityValueMin(v.floatValue ?? null)}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {qualityBands && qualityBands.length > 0 ? (
              <QualityBandSelect
                bands={qualityBands}
                value={qualityValueMax}
                onChange={setQualityValueMax}
                label={t("marketV2.maxQuality")}
              />
            ) : (
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                size="small"
                fullWidth
                isAllowed={({ floatValue }) =>
                  !floatValue || floatValue <= 1000
                }
                label={t("marketV2.maxQualityRange")}
                value={qualityValueMax ?? ""}
                onValueChange={(v) => setQualityValueMax(v.floatValue ?? null)}
              />
            )}
          </Grid>
        </>
      )}
    </>
  )
}

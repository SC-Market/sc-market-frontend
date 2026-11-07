import { DeleteOutlineRounded } from "@mui/icons-material"
import AddRounded from "@mui/icons-material/AddRounded"
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { QualityBandSelect } from "../../../components/game-data/QualityBandSelect"
import { FormPaper } from "../../../components/paper/FormPaper"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import type { QualityBand } from "../../../store/api/v2/market"
import { getQualityMode } from "../../../util/qualityMode"
import { LocationSelector } from "../components/stock/LocationSelector"
import { type CraftedSource } from "../domain/listingDraft"

/**
 * Stock lot form data with variant attributes
 */
export interface StockLotFormData {
  id: string
  quantity: number
  quality_tier?: number
  quality_value?: number
  crafted_source?: CraftedSource
  location_id?: string
  price?: number
  notes?: string
  listed?: boolean
}

/** The Stock Lots form section: one row per lot plus Add Stock Lot. */
export function StockLotsSection({
  stockLots,
  gameItemType,
  qualityBands,
  pricingMode,
  handleAddStockLot,
  handleRemoveStockLot,
  handleUpdateStockLot,
}: {
  stockLots: StockLotFormData[]
  gameItemType: string | null
  qualityBands: QualityBand[] | undefined
  pricingMode: "unified" | "per_variant"
  handleAddStockLot: () => void
  handleRemoveStockLot: (id: string) => void
  handleUpdateStockLot: (
    id: string,
    field: keyof StockLotFormData,
    value: StockLotFormData[keyof StockLotFormData],
  ) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <>
      {/* Stock Lots Section */}
      <FormPaper
        title={t("CreateListingV2.stockLots", "Stock Lots")}
        subtitle={t(
          "CreateListingV2.stockLotsSubtitle",
          "Add inventory with variant attributes (quality, source, location)",
        )}
      >
        {stockLots.map((lot, index) => (
          <Grid item xs={12} key={lot.id}>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: theme.spacing(
                  theme.borderRadius?.topLevel ?? 0.375,
                ),
                position: "relative",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {t("CreateListingV2.lot", "Lot")} {index + 1}
                </Typography>
                {stockLots.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveStockLot(lot.id)}
                    aria-label={t("CreateListingV2.removeLot", "Remove lot")}
                  >
                    <DeleteOutlineRounded />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                {/* Quantity */}
                <Grid item xs={12} sm={6} md={4}>
                  <NumericFormat
                    decimalScale={0}
                    allowNegative={false}
                    customInput={TextField}
                    thousandSeparator
                    size="small"
                    fullWidth
                    onValueChange={(values) => {
                      handleUpdateStockLot(
                        lot.id,
                        "quantity",
                        values.floatValue || 0,
                      )
                    }}
                    label={t("CreateListingV2.quantity", "Quantity")}
                    value={lot.quantity}
                    required
                    inputProps={{
                      inputMode: "numeric",
                      "aria-label": t(
                        "CreateListingV2.quantityAriaLabel",
                        "Enter quantity",
                      ),
                    }}
                  />
                </Grid>

                {/* Quality — conditional based on item type */}
                {(() => {
                  const qm = getQualityMode(gameItemType)
                  if (qm === "none") return null
                  return qm === "value" ? (
                    <Grid item xs={12} sm={6} md={4}>
                      {qualityBands && qualityBands.length > 0 ? (
                        <QualityBandSelect
                          bands={qualityBands}
                          value={lot.quality_value}
                          onChange={(val) =>
                            handleUpdateStockLot(
                              lot.id,
                              "quality_value",
                              val ?? undefined,
                            )
                          }
                          label={t(
                            "CreateListingV2.qualityValue",
                            "Quality Value",
                          )}
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
                          onValueChange={(values) => {
                            handleUpdateStockLot(
                              lot.id,
                              "quality_value",
                              values.floatValue,
                            )
                          }}
                          label={t(
                            "CreateListingV2.qualityValue",
                            "Quality Value",
                          )}
                          value={lot.quality_value ?? ""}
                          helperText={t(
                            "CreateListingV2.qualityValueHelp",
                            "Optional: 0-1000",
                          )}
                          inputProps={{
                            inputMode: "decimal",
                            "aria-label": t(
                              "CreateListingV2.qualityValueAriaLabel",
                              "Enter quality value",
                            ),
                          }}
                        />
                      )}
                    </Grid>
                  ) : (
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("CreateListingV2.qualityTier", "Quality Tier")}
                        value={lot.quality_tier ?? ""}
                        onChange={(e) =>
                          handleUpdateStockLot(
                            lot.id,
                            "quality_tier",
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                        helperText={t(
                          "CreateListingV2.qualityTierHelp",
                          "Optional: 1-5",
                        )}
                      >
                        <MenuItem value="">
                          {t("CreateListingV2.notSpecified", "Not specified")}
                        </MenuItem>
                        {[1, 2, 3, 4, 5].map((tier) => (
                          <MenuItem key={tier} value={tier}>
                            {t("CreateListingV2.tier", "Tier")} {tier}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  )
                })()}

                {/* Crafted Source */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={t("CreateListingV2.craftedSource", "Source")}
                    value={lot.crafted_source ?? ""}
                    onChange={(e) =>
                      handleUpdateStockLot(
                        lot.id,
                        "crafted_source",
                        e.target.value || undefined,
                      )
                    }
                    helperText={t(
                      "CreateListingV2.craftedSourceHelp",
                      "Optional: How item was obtained",
                    )}
                  >
                    <MenuItem value="">
                      {t("CreateListingV2.notSpecified", "Not specified")}
                    </MenuItem>
                    <MenuItem value="crafted">
                      {t("CreateListingV2.crafted", "Crafted")}
                    </MenuItem>
                    <MenuItem value="store">
                      {t("CreateListingV2.store", "Store")}
                    </MenuItem>
                    <MenuItem value="looted">
                      {t("CreateListingV2.looted", "Looted")}
                    </MenuItem>
                    <MenuItem value="unknown">
                      {t("CreateListingV2.unknown", "Unknown")}
                    </MenuItem>
                    <MenuItem value="duped">
                      {t("CreateListingV2.duped", "Duped")}
                    </MenuItem>
                  </TextField>
                </Grid>

                {/* Location */}
                <Grid item xs={12} sm={6} md={4}>
                  <LocationSelector
                    value={lot.location_id ?? null}
                    onChange={(locationId) =>
                      handleUpdateStockLot(
                        lot.id,
                        "location_id",
                        locationId ?? undefined,
                      )
                    }
                    size="small"
                    fullWidth
                    label={t("CreateListingV2.location", "Location")}
                  />
                </Grid>

                {/* Per-Variant Price */}
                {pricingMode === "per_variant" && (
                  <Grid item xs={12} sm={6} md={4}>
                    <NumericFormat
                      decimalScale={0}
                      allowNegative={false}
                      customInput={TextField}
                      thousandSeparator
                      size="small"
                      fullWidth
                      onValueChange={(values) => {
                        handleUpdateStockLot(
                          lot.id,
                          "price",
                          values.floatValue || 0,
                        )
                      }}
                      label={t("CreateListingV2.price", "Price")}
                      value={lot.price ?? ""}
                      required
                      InputProps={{
                        endAdornment: <Typography>aUEC</Typography>,
                        inputMode: "numeric",
                      }}
                      inputProps={{
                        "aria-label": t(
                          "CreateListingV2.priceAriaLabel",
                          "Enter price for this variant",
                        ),
                      }}
                    />
                  </Grid>
                )}

                {/* Notes */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label={t("CreateListingV2.notes", "Notes")}
                    value={lot.notes ?? ""}
                    onChange={(e) =>
                      handleUpdateStockLot(
                        lot.id,
                        "notes",
                        e.target.value || undefined,
                      )
                    }
                    helperText={t(
                      "CreateListingV2.notesHelp",
                      "Optional: Internal notes for this lot",
                    )}
                  />
                </Grid>

                {/* Listed */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={lot.listed !== false}
                        onChange={(e) =>
                          handleUpdateStockLot(
                            lot.id,
                            "listed",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label={t("CreateListingV2.listed", "Listed for sale")}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button
            variant="outlined"
            color="neutral"
            startIcon={<AddRounded />}
            onClick={handleAddStockLot}
          >
            {t("CreateListingV2.addStockLot", "Add Stock Lot")}
          </Button>
        </Grid>
      </FormPaper>
    </>
  )
}

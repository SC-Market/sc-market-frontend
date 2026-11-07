import { ExpandMoreRounded } from "@mui/icons-material"
import { Button, Grid, MenuItem, TextField, Typography } from "@mui/material"
import React from "react"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { FormPaper } from "../../../components/paper/FormPaper"

/** More options: how the buyer receives the item. */
export function PickupMethodSection({
  pickupMethod,
  setPickupMethod,
}: {
  pickupMethod: "delivery" | "pickup" | "any" | ""
  setPickupMethod: (value: "delivery" | "pickup" | "any" | "") => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Pickup Method */}
      <FormPaper title={t("CreateListingV2.pickupMethod", "Pickup Method")}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("CreateListingV2.pickupMethod", "Pickup Method")}
            value={pickupMethod}
            onChange={(e) =>
              setPickupMethod(
                e.target.value as "delivery" | "pickup" | "any" | "",
              )
            }
            helperText={t(
              "CreateListingV2.pickupMethodHelper",
              "How will the buyer receive the item?",
            )}
          >
            <MenuItem value="">
              {t("CreateListingV2.notSpecified", "Not specified")}
            </MenuItem>
            <MenuItem value="delivery">
              {t("CreateListingV2.delivery", "Delivery (seller delivers)")}
            </MenuItem>
            <MenuItem value="pickup">
              {t("CreateListingV2.pickup", "Pickup (buyer picks up)")}
            </MenuItem>
            <MenuItem value="any">
              {t("CreateListingV2.either", "Either (delivery or pickup)")}
            </MenuItem>
          </TextField>
        </Grid>
      </FormPaper>
    </>
  )
}

/** More options: status, visibility (org shops) and quantity unit. */
export function ListingOptionsSection({
  listingStatus,
  setListingStatus,
  visibility,
  setVisibility,
  quantityUnit,
  setQuantityUnit,
  gameItemId,
  isOrgOwned,
}: {
  listingStatus: "active" | "inactive"
  setListingStatus: (value: "active" | "inactive") => void
  visibility: "public" | "private"
  setVisibility: (value: "public" | "private") => void
  quantityUnit: "unit" | "scu"
  setQuantityUnit: (value: "unit" | "scu") => void
  gameItemId: string | null
  isOrgOwned: boolean
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Listing Options */}
      <FormPaper title={t("CreateListingV2.listingOptions", "Listing Options")}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("CreateListingV2.listingStatus", "Listing Status")}
            value={listingStatus}
            onChange={(e) =>
              setListingStatus(e.target.value as "active" | "inactive")
            }
            helperText={
              listingStatus === "inactive"
                ? t(
                    "CreateListingV2.inactiveHelp",
                    "Listing will be saved as a draft and won't be visible to buyers",
                  )
                : t(
                    "CreateListingV2.activeHelp",
                    "Listing will be immediately visible to buyers",
                  )
            }
          >
            <MenuItem value="active">
              {t("CreateListingV2.active", "Active")}
            </MenuItem>
            <MenuItem value="inactive">
              {t("CreateListingV2.inactive", "Inactive (Draft)")}
            </MenuItem>
          </TextField>
        </Grid>
        {isOrgOwned && (
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("market.visibility", "Visibility")}
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "public" | "private")
              }
              helperText={
                visibility === "private"
                  ? t(
                      "market.visibilityPrivateHelp",
                      "Only visible to organization members",
                    )
                  : t("market.visibilityPublicHelp", "Visible to all buyers")
              }
            >
              <MenuItem value="public">
                {t("market.visibilityPublic", "Public")}
              </MenuItem>
              <MenuItem value="private">
                {t("market.visibilityPrivate", "Private (org members only)")}
              </MenuItem>
            </TextField>
          </Grid>
        )}
        {!gameItemId && (
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("CreateListingV2.quantityUnit", "Quantity Unit")}
              value={quantityUnit}
              onChange={(e) =>
                setQuantityUnit(e.target.value as "unit" | "scu")
              }
              helperText={
                quantityUnit === "scu"
                  ? t(
                      "CreateListingV2.scuHelp",
                      "Quantities measured in cSCU (100 cSCU = 1 SCU)",
                    )
                  : t(
                      "CreateListingV2.unitHelp",
                      "Discrete items (weapons, armor, components)",
                    )
              }
            >
              <MenuItem value="unit">
                {t("CreateListingV2.unitDiscrete", "Units (discrete items)")}
              </MenuItem>
              <MenuItem value="scu">
                {t("CreateListingV2.unitSCU", "SCU (cargo / commodities)")}
              </MenuItem>
            </TextField>
          </Grid>
        )}
      </FormPaper>
    </>
  )
}

/** More options: minimum and maximum order quantity and value. */
export function OrderLimitsSection({
  minOrderQuantity,
  setMinOrderQuantity,
  maxOrderQuantity,
  setMaxOrderQuantity,
  minOrderValue,
  setMinOrderValue,
  maxOrderValue,
  setMaxOrderValue,
}: {
  minOrderQuantity: number | null
  setMinOrderQuantity: (value: number | null) => void
  maxOrderQuantity: number | null
  setMaxOrderQuantity: (value: number | null) => void
  minOrderValue: number | null
  setMinOrderValue: (value: number | null) => void
  maxOrderValue: number | null
  setMaxOrderValue: (value: number | null) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Order Limits */}
      <FormPaper title={t("CreateListingV2.orderLimits", "Order Limits")}>
        <Grid item xs={12} sm={6} md={3}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            size="small"
            fullWidth
            label={t("CreateListingV2.minQuantity", "Min Quantity")}
            value={minOrderQuantity ?? ""}
            onValueChange={(v) => setMinOrderQuantity(v.floatValue ?? null)}
            helperText={t("CreateListingV2.minQuantityHelp", "Optional")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            size="small"
            fullWidth
            label={t("CreateListingV2.maxQuantity", "Max Quantity")}
            value={maxOrderQuantity ?? ""}
            onValueChange={(v) => setMaxOrderQuantity(v.floatValue ?? null)}
            helperText={t("CreateListingV2.maxQuantityHelp", "Optional")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            size="small"
            fullWidth
            label={t("CreateListingV2.minValue", "Min Value (aUEC)")}
            value={minOrderValue ?? ""}
            onValueChange={(v) => setMinOrderValue(v.floatValue ?? null)}
            InputProps={{
              endAdornment: <Typography variant="caption">aUEC</Typography>,
            }}
            helperText={t("CreateListingV2.minValueHelp", "Optional")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            size="small"
            fullWidth
            label={t("CreateListingV2.maxValue", "Max Value (aUEC)")}
            value={maxOrderValue ?? ""}
            onValueChange={(v) => setMaxOrderValue(v.floatValue ?? null)}
            InputProps={{
              endAdornment: <Typography variant="caption">aUEC</Typography>,
            }}
            helperText={t("CreateListingV2.maxValueHelp", "Optional")}
          />
        </Grid>
      </FormPaper>
    </>
  )
}

/** The More options / Hide options button above the collapsed sections. */
export function MoreOptionsToggle({
  showAdvanced,
  setShowAdvanced,
}: {
  showAdvanced: boolean
  setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { t } = useTranslation()
  return (
    <>
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => setShowAdvanced((prev) => !prev)}
          endIcon={
            <ExpandMoreRounded
              sx={{
                transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          }
          sx={{ textTransform: "none", fontWeight: "bold" }}
        >
          {showAdvanced
            ? t("CreateListingV2.hideMoreOptions", "Hide options")
            : t("CreateListingV2.showMoreOptions", "More options")}
        </Button>
      </Grid>
    </>
  )
}

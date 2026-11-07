import {
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { FormPaper } from "../../../components/paper/FormPaper"
import { HelpLink } from "../../help/components/HelpLink"
import {
  LISTING_FIELD_IDS,
  type ListingFormField,
} from "../domain/listingFormErrors"

/** More options: fixed price, auction (with its settings) or negotiable. */
export function SaleTypeSection({
  saleType,
  setSaleType,
  auctionEndTime,
  setAuctionEndTime,
  minBidIncrement,
  setMinBidIncrement,
  reservePrice,
  setReservePrice,
  fieldError,
  clearError,
}: {
  saleType: "fixed" | "auction" | "negotiable"
  setSaleType: (value: "fixed" | "auction" | "negotiable") => void
  auctionEndTime: string
  setAuctionEndTime: (value: string) => void
  minBidIncrement: number
  setMinBidIncrement: (value: number) => void
  reservePrice: number | null
  setReservePrice: (value: number | null) => void
  fieldError: (field: ListingFormField) => string | undefined
  clearError: (field: ListingFormField) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Sale Type */}
      <FormPaper title={t("CreateListingV2.saleType", "Sale Type")}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={saleType}
              onChange={(e) =>
                setSaleType(
                  e.target.value as "fixed" | "auction" | "negotiable",
                )
              }
            >
              <FormControlLabel
                value="fixed"
                control={<Radio />}
                label={t("CreateListingV2.fixed", "Fixed Price")}
              />
              <FormControlLabel
                value="auction"
                control={<Radio />}
                label={t("CreateListingV2.auction", "Auction")}
              />
              <FormControlLabel
                value="negotiable"
                control={<Radio />}
                label={t("CreateListingV2.negotiable", "Negotiable")}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        {saleType === "auction" && (
          <>
            <Grid item xs={12}>
              <HelpLink guide="auctions">
                {t("CreateListingV2.auctionHelp", "How auctions work")}
              </HelpLink>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id={LISTING_FIELD_IDS.auction_end_time}
                label={t("CreateListingV2.auctionEndTime", "Auction End Time")}
                type="datetime-local"
                value={auctionEndTime}
                onChange={(e) => {
                  clearError("auction_end_time")
                  setAuctionEndTime(e.target.value)
                }}
                InputLabelProps={{ shrink: true }}
                required
                error={!!fieldError("auction_end_time")}
                helperText={fieldError("auction_end_time")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t(
                  "CreateListingV2.minBidIncrement",
                  "Min Bid Increment (aUEC)",
                )}
                type="number"
                value={minBidIncrement}
                onChange={(e) =>
                  setMinBidIncrement(parseInt(e.target.value) || 0)
                }
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t(
                  "CreateListingV2.reservePrice",
                  "Reserve Price (optional)",
                )}
                type="number"
                value={reservePrice ?? ""}
                onChange={(e) =>
                  setReservePrice(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                helperText={t(
                  "CreateListingV2.reservePriceHelp",
                  "Auction won't sell below this price",
                )}
              />
            </Grid>
          </>
        )}
      </FormPaper>
    </>
  )
}

/** More options: one price for every lot, or a price per variant. */
export function PricingModeSection({
  pricingMode,
  setPricingMode,
}: {
  pricingMode: "unified" | "per_variant"
  setPricingMode: (value: "unified" | "per_variant") => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Pricing Mode */}
      <FormPaper title={t("CreateListingV2.pricingMode", "Pricing Mode")}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={pricingMode}
              onChange={(e) =>
                setPricingMode(e.target.value as "unified" | "per_variant")
              }
            >
              <FormControlLabel
                value="unified"
                control={<Radio />}
                label={t("CreateListingV2.unifiedPricing", "Unified Price")}
              />
              <FormControlLabel
                value="per_variant"
                control={<Radio />}
                label={t(
                  "CreateListingV2.perVariantPricing",
                  "Per-Variant Pricing",
                )}
              />
            </RadioGroup>
            <Typography variant="caption" color="text.secondary">
              {pricingMode === "unified"
                ? t(
                    "CreateListingV2.unifiedPricingHelp",
                    "All variants will have the same price",
                  )
                : t(
                    "CreateListingV2.perVariantPricingHelp",
                    "Set different prices for each variant",
                  )}
            </Typography>
          </FormControl>
        </Grid>
      </FormPaper>
    </>
  )
}

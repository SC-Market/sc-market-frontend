import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { ExpandMoreRounded } from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { SelectPhotosArea } from "../../../components/modal/SelectPhotosArea"
import { BulkDiscountTierEditor } from "../../../components/market/BulkDiscountTierEditor"
import { HelpLink } from "../../help/components/HelpLink"
import { useListingPhotoUploads } from "../hooks/useListingPhotoUploads"
import { useSellingAsShop } from "./useSellingAsShop"
import { type QuickListForm } from "../domain/quickList"
import type { QuickListField } from "./quickListFields"

/** More options: description, photos, sale type, pickup, limits, discounts. */
export function QuickListMoreOptions({
  form,
  update,
  moreOpen,
  setMoreOpen,
  photos,
  shop,
  fieldError,
  clearError,
  fullFormUrl,
  onClose,
}: {
  form: QuickListForm
  update: (patch: Partial<QuickListForm>) => void
  moreOpen: boolean
  setMoreOpen: (open: boolean) => void
  photos: ReturnType<typeof useListingPhotoUploads>
  shop: ReturnType<typeof useSellingAsShop>["shops"][number] | null
  fieldError: (field: QuickListField) => string | undefined
  clearError: (field: QuickListField) => void
  fullFormUrl: string | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  return (
    <Accordion
      disableGutters
      expanded={moreOpen}
      onChange={(_, expanded) => setMoreOpen(expanded)}
      sx={{ bgcolor: "transparent", "&:before": { display: "none" } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRounded />}>
        <Box>
          <Typography color="text.secondary" fontWeight={600}>
            {t("quickList.moreOptions", "More options")}
          </Typography>
          {!moreOpen && (
            <Typography variant="body2" color="text.primary">
              {t(
                "quickList.moreOptionsSummary",
                "Description, photos, sale type, pickup, order limits, discounts",
              )}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <TextField
            label={t("quickList.description", "Description (optional)")}
            multiline
            minRows={2}
            value={form.description}
            inputProps={{ maxLength: 2000 }}
            onChange={(e) => update({ description: e.target.value })}
            helperText={t(
              "quickList.descriptionHelp",
              "Markdown works here. Leave it empty if the item speaks for itself.",
            )}
          />
          <SelectPhotosArea
            setPhotos={photos.setPhotos}
            photos={photos.photos}
            onFileUpload={photos.handleFileUpload}
            onAlert={(severity, message) => issueAlert({ severity, message })}
            uploadedImages={photos.uploadedImages}
            onRemoveUploadedImage={photos.handleRemoveUploadedImage}
          />
          <TextField
            select
            size="small"
            label={t("CreateListingV2.saleType", "Sale Type")}
            value={form.saleType}
            onChange={(e) =>
              update({
                saleType: e.target.value as QuickListForm["saleType"],
              })
            }
          >
            <MenuItem value="fixed">
              {t("CreateListingV2.fixed", "Fixed Price")}
            </MenuItem>
            <MenuItem value="negotiable">
              {t("CreateListingV2.negotiable", "Negotiable")}
            </MenuItem>
            <MenuItem value="auction">
              {t("CreateListingV2.auction", "Auction")}
            </MenuItem>
          </TextField>
          {form.saleType === "auction" && (
            <TextField
              id="quick-list-auction-end"
              type="datetime-local"
              label={t("CreateListingV2.auctionEndTime", "Auction End Time")}
              value={form.auctionEndTime}
              required
              InputLabelProps={{ shrink: true }}
              error={!!fieldError("auction_end_time")}
              helperText={fieldError("auction_end_time")}
              onChange={(e) => {
                clearError("auction_end_time")
                update({ auctionEndTime: e.target.value })
              }}
            />
          )}
          <TextField
            select
            size="small"
            label={t("CreateListingV2.pickupMethod", "Pickup Method")}
            value={form.pickupMethod}
            onChange={(e) =>
              update({
                pickupMethod: e.target.value as QuickListForm["pickupMethod"],
              })
            }
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
          {shop?.is_org_owned && (
            <TextField
              select
              size="small"
              label={t("market.visibility", "Visibility")}
              value={form.visibility}
              onChange={(e) =>
                update({
                  visibility: e.target.value as QuickListForm["visibility"],
                })
              }
            >
              <MenuItem value="public">
                {t("market.visibilityPublic", "Public")}
              </MenuItem>
              <MenuItem value="private">
                {t("market.visibilityPrivate", "Private (org members only)")}
              </MenuItem>
            </TextField>
          )}
          <Stack direction="row" gap={2}>
            <NumericFormat
              customInput={TextField}
              size="small"
              fullWidth
              decimalScale={0}
              allowNegative={false}
              thousandSeparator
              label={t("CreateListingV2.minQuantity", "Min Quantity")}
              value={form.minOrderQuantity ?? ""}
              onValueChange={(v) =>
                update({ minOrderQuantity: v.floatValue ?? null })
              }
            />
            <NumericFormat
              customInput={TextField}
              size="small"
              fullWidth
              decimalScale={0}
              allowNegative={false}
              thousandSeparator
              label={t("CreateListingV2.maxQuantity", "Max Quantity")}
              value={form.maxOrderQuantity ?? ""}
              onValueChange={(v) =>
                update({ maxOrderQuantity: v.floatValue ?? null })
              }
            />
          </Stack>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              {t("market.bulkDiscountTiers", "Bulk Discounts")}
            </Typography>
            <BulkDiscountTierEditor
              tiers={form.bulkDiscountTiers}
              onChange={(tiers) => update({ bulkDiscountTiers: tiers })}
            />
          </Box>
          {fullFormUrl && (
            <Typography variant="body2" color="text.primary">
              {t(
                "quickList.fullFormLead",
                "Need order value limits or a draft?",
              )}{" "}
              <Link component={RouterLink} to={fullFormUrl} onClick={onClose}>
                {t("quickList.fullForm", "Open the full form")}
              </Link>
            </Typography>
          )}
          <HelpLink guide="quickList">
            {t("quickList.learnMore", "How Quick List works")}
          </HelpLink>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

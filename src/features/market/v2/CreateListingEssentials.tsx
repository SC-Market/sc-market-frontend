import { Grid, InputAdornment, TextField, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy"
import { SelectPhotosArea } from "../../../components/modal/SelectPhotosArea"
import { FormPaper } from "../../../components/paper/FormPaper"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { HelpTip } from "../../help/components/HelpTip"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { PriceComparisonAlert } from "../components/PriceComparisonAlert"
import { quantityUnitFor } from "../domain/listingDraft"
import {
  LISTING_FIELD_IDS,
  type ListingFormField,
} from "../domain/listingFormErrors"
import { useListingPhotoUploads } from "../hooks/useListingPhotoUploads"
import { type StockLotFormData } from "./CreateListingStockLots"

/** Essential fields: game item, title, description and photos. */
export function AboutSection({
  gameItemName,
  setGameItemName,
  setGameItemId,
  setGameItemType,
  setQuantityUnit,
  title,
  setTitle,
  description,
  setDescription,
  photos,
  setPhotos,
  handleFileUpload,
  uploadedImages,
  handleRemoveUploadedImage,
  fieldError,
  clearError,
}: {
  gameItemName: string | null
  setGameItemName: (value: string | null) => void
  setGameItemId: (value: string | null) => void
  setGameItemType: (value: string | null) => void
  setQuantityUnit: (value: "unit" | "scu") => void
  title: string
  setTitle: (value: string) => void
  description: string
  setDescription: (value: string) => void
  photos: ReturnType<typeof useListingPhotoUploads>["photos"]
  setPhotos: ReturnType<typeof useListingPhotoUploads>["setPhotos"]
  handleFileUpload: ReturnType<
    typeof useListingPhotoUploads
  >["handleFileUpload"]
  uploadedImages: ReturnType<typeof useListingPhotoUploads>["uploadedImages"]
  handleRemoveUploadedImage: ReturnType<
    typeof useListingPhotoUploads
  >["handleRemoveUploadedImage"]
  fieldError: (field: ListingFormField) => string | undefined
  clearError: (field: ListingFormField) => void
}) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  return (
    <>
      {/* About Section */}
      <FormPaper title={t("CreateListingV2.about", "About")}>
        <Grid item xs={12}>
          <GameItemSearchAutocomplete
            required
            errorText={fieldError("game_item_id")}
            value={gameItemName}
            onChange={(itemName, itemType, itemId) => {
              clearError("game_item_id")
              setGameItemName(itemName)
              setGameItemId(itemId)
              setGameItemType(itemType)
              setQuantityUnit(quantityUnitFor(itemType))
              if (!title && itemName) {
                setTitle(itemName)
              }
            }}
            label={t("CreateListingV2.selectGameItem", "Select Game Item")}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            id={LISTING_FIELD_IDS.title}
            label={t("CreateListingV2.title", "Title")}
            value={title}
            onChange={(e) => {
              clearError("title")
              setTitle(e.target.value)
            }}
            required
            error={!!fieldError("title")}
            inputProps={{
              maxLength: 500,
              "aria-label": t(
                "CreateListingV2.titleAriaLabel",
                "Enter listing title",
              ),
            }}
            helperText={
              fieldError("title") ??
              (title.length > 450 ? `${title.length}/500` : undefined)
            }
          />
        </Grid>

        <Grid item xs={12}>
          <MarkdownEditor
            onChange={(value: string) => {
              clearError("description")
              setDescription(value)
            }}
            value={description}
            TextFieldProps={{
              id: LISTING_FIELD_IDS.description,
              label: t(
                "CreateListingV2.descriptionOptional",
                "Description (optional)",
              ),
              error: !!fieldError("description"),
              helperText:
                fieldError("description") ??
                (description.length > 1900
                  ? `${description.length}/2000`
                  : t(
                      "CreateListingV2.descriptionHelp",
                      "Provide a detailed description (markdown supported)",
                    )),
              inputProps: { maxLength: 2000 },
            }}
            variant="vertical"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
            {t("CreateListingV2.imageHint", "Add photos to your listing")}{" "}
            {t(
              "CreateListingV2.imageSizeLimit",
              "(Large images are optimized automatically)",
            )}
          </Typography>
          <SelectPhotosArea
            setPhotos={setPhotos}
            photos={photos}
            onFileUpload={handleFileUpload}
            onAlert={(severity, message) => issueAlert({ severity, message })}
            uploadedImages={uploadedImages}
            onRemoveUploadedImage={handleRemoveUploadedImage}
          />
        </Grid>
      </FormPaper>
    </>
  )
}

/** Essential fields: price and the first lot's quantity. */
export function PricingQuantitySection({
  basePrice,
  setBasePrice,
  gameItemId,
  stockLots,
  handleUpdateStockLot,
  fieldError,
  clearError,
}: {
  basePrice: number
  setBasePrice: (value: number) => void
  gameItemId: string | null
  stockLots: StockLotFormData[]
  handleUpdateStockLot: (
    id: string,
    field: keyof StockLotFormData,
    value: StockLotFormData[keyof StockLotFormData],
  ) => void
  fieldError: (field: ListingFormField) => string | undefined
  clearError: (field: ListingFormField) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Pricing & Quantity — simplified view */}
      <FormPaper title={t("CreateListingV2.pricing", "Pricing & Quantity")}>
        <Grid item xs={12} sm={6}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            size="small"
            fullWidth
            onValueChange={(values) => {
              clearError("base_price")
              setBasePrice(values.floatValue || 0)
            }}
            id={LISTING_FIELD_IDS.base_price}
            label={t("CreateListingV2.basePrice", "Price")}
            value={basePrice}
            InputProps={{
              endAdornment: <Typography>aUEC</Typography>,
              inputMode: "numeric",
            }}
            required
            error={!!fieldError("base_price")}
            helperText={fieldError("base_price")}
            inputProps={{
              "aria-label": t(
                "CreateListingV2.basePriceAriaLabel",
                "Enter price",
              ),
            }}
          />
          {gameItemId && basePrice > 0 && (
            <PriceComparisonAlert
              gameItemId={gameItemId}
              currentPrice={basePrice}
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            size="small"
            fullWidth
            onValueChange={(values) => {
              clearError("quantity")
              handleUpdateStockLot(
                stockLots[0]?.id,
                "quantity",
                values.floatValue || 0,
              )
            }}
            id={LISTING_FIELD_IDS.quantity}
            label={t("CreateListingV2.quantity", "Quantity")}
            value={stockLots[0]?.quantity ?? 1}
            required
            error={!!fieldError("quantity")}
            helperText={fieldError("quantity")}
            inputProps={{
              inputMode: "numeric",
              "aria-label": t(
                "CreateListingV2.quantityAriaLabel",
                "Enter quantity",
              ),
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <HelpTip
                    label={t("CreateListingV2.quantity", "Quantity")}
                    title={t("help.tips.listingQuantity")}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </FormPaper>
    </>
  )
}

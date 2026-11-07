import type { GetListingDetailResponse } from "../../../store/api/v2/market"
import {
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy"
import { SelectPhotosArea } from "../../../components/modal/SelectPhotosArea"
import { FormPaper } from "../../../components/paper/FormPaper"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import {
  LISTING_FIELD_IDS,
  type ListingFormField,
} from "../domain/listingFormErrors"
import { usePhotoUploads } from "../hooks/usePhotoUploads"

/** Visibility: public, or org members only. */
export function EditVisibilitySection({
  visibility,
  setVisibility,
  canEdit,
}: {
  visibility: "public" | "private"
  setVisibility: (value: "public" | "private") => void
  canEdit: boolean
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Visibility */}
      <FormPaper title={t("market.visibility", "Visibility")}>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("market.visibility", "Visibility")}
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "public" | "private")
            }
            disabled={!canEdit}
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
      </FormPaper>
    </>
  )
}

/** Pickup method: how the buyer receives the item. */
export function EditPickupMethodSection({
  pickupMethod,
  setPickupMethod,
  canEdit,
}: {
  pickupMethod: "delivery" | "pickup" | "any" | ""
  setPickupMethod: (value: "delivery" | "pickup" | "any" | "") => void
  canEdit: boolean
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Pickup Method */}
      <FormPaper title={t("EditListingV2.pickupMethod", "Pickup Method")}>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("EditListingV2.pickupMethod", "Pickup Method")}
            value={pickupMethod}
            onChange={(e) =>
              setPickupMethod(e.target.value as typeof pickupMethod)
            }
            disabled={!canEdit}
            helperText={t(
              "EditListingV2.pickupMethodHelper",
              "How will the buyer receive the item?",
            )}
          >
            <MenuItem value="">
              {t("EditListingV2.notSpecified", "Not specified")}
            </MenuItem>
            <MenuItem value="delivery">
              {t("EditListingV2.delivery", "Delivery (seller delivers)")}
            </MenuItem>
            <MenuItem value="pickup">
              {t("EditListingV2.pickup", "Pickup (buyer picks up)")}
            </MenuItem>
            <MenuItem value="any">
              {t("EditListingV2.either", "Either (delivery or pickup)")}
            </MenuItem>
          </TextField>
        </Grid>
      </FormPaper>
    </>
  )
}

/** Photos: existing photos, pasted URLs and uploads. */
export function EditPhotosSection({
  photos,
  setPhotos,
  handleFileUpload,
  uploadedImages,
  handleRemoveUploadedImage,
}: {
  photos: string[]
  setPhotos: (photos: string[]) => void
  handleFileUpload: ReturnType<typeof usePhotoUploads>["upload"]
  uploadedImages: ReturnType<typeof usePhotoUploads>["uploadedImages"]
  handleRemoveUploadedImage: ReturnType<typeof usePhotoUploads>["remove"]
}) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  return (
    <>
      {/* Photos */}
      <FormPaper title={t("EditListingV2.photos", "Photos")}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t(
              "EditListingV2.imageSizeLimit",
              "(Large images are optimized automatically)",
            )}
          </Typography>
          <SelectPhotosArea
            setPhotos={setPhotos}
            photos={photos}
            onFileUpload={handleFileUpload}
            onAlert={(severity: "warning" | "error", message: string) =>
              issueAlert({ severity, message })
            }
            uploadedImages={uploadedImages}
            onRemoveUploadedImage={handleRemoveUploadedImage}
          />
        </Grid>
      </FormPaper>
    </>
  )
}

/** About: the (read-only) game item, title and description. */
export function EditAboutSection({
  listingData,
  title,
  setTitle,
  description,
  setDescription,
  canEdit,
  fieldError,
  clearError,
}: {
  listingData: GetListingDetailResponse
  title: string
  setTitle: (value: string) => void
  description: string
  setDescription: (value: string) => void
  canEdit: boolean
  fieldError: (field: ListingFormField) => string | undefined
  clearError: (field: ListingFormField) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* About Section */}
      <FormPaper title={t("EditListingV2.about", "About")}>
        {/* Game Item (Read-only) */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={t("EditListingV2.gameItem", "Game Item")}
            value={listingData.items[0]?.game_item.name || ""}
            disabled
            helperText={t(
              "EditListingV2.gameItemHelp",
              "Game item cannot be changed",
            )}
          />
        </Grid>

        {/* Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            id={LISTING_FIELD_IDS.title}
            label={t("EditListingV2.title", "Title")}
            value={title}
            onChange={(e) => {
              clearError("title")
              setTitle(e.target.value)
            }}
            required
            error={!!fieldError("title")}
            disabled={!canEdit}
            inputProps={{
              maxLength: 500,
              "aria-label": t(
                "EditListingV2.titleAriaLabel",
                "Enter listing title",
              ),
            }}
            helperText={
              fieldError("title") ??
              (title.length > 450 ? `${title.length}/500` : undefined)
            }
          />
        </Grid>

        {/* Description */}
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
                      "EditListingV2.descriptionHelp",
                      "Provide a detailed description (markdown supported)",
                    )),
              inputProps: { maxLength: 2000 },
              disabled: !canEdit,
            }}
            variant="vertical"
          />
        </Grid>
      </FormPaper>
    </>
  )
}

/** Placeholder for the edit form while the listing loads. */
export function EditListingSkeleton() {
  return (
    <>
      <Grid item xs={12}>
        <Stack spacing={2}>
          <Skeleton
            variant="rectangular"
            height={40}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={40}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={40}
            sx={{ borderRadius: 1, width: "50%" }}
          />
          <Skeleton
            variant="rectangular"
            height={40}
            sx={{ borderRadius: 1, width: "50%" }}
          />
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={44}
            sx={{ borderRadius: 1, width: 120, ml: "auto" }}
          />
        </Stack>
      </Grid>
    </>
  )
}

/**
 * QuickEditListingSheet — bottom sheet for fast status + price edits
 * without navigating away from the listings page.
 *
 * Covers the two most common manage actions:
 *   - Toggle Active / Inactive
 *   - Adjust base price
 *
 * For anything else (photos, description, variants, per-variant pricing)
 * the user taps "Open Full Editor" which navigates to EditListingV2.
 */

import React, { useCallback, useEffect, useState } from "react"
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import { NumericFormat } from "react-number-format"
import { EditRounded } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { BottomSheet } from "../../../../components/mobile/BottomSheet"
import {
  useUpdateListingMutation,
  type MyListingItem,
  type UpdateListingRequest,
} from "../../../../store/api/v2/market"
import { useUploadImageMutation } from "../../../../store/api/v2/market-overrides"
import {
  SelectPhotosArea,
  type UploadedImageStatus,
} from "../../../../components/modal/SelectPhotosArea"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { MARKET_PATHS } from "../../../../routes/paths"

interface QuickEditListingSheetProps {
  listing: MyListingItem | null
  open: boolean
  onClose: () => void
}

export function QuickEditListingSheet({
  listing,
  open,
  onClose,
}: QuickEditListingSheetProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const issueAlert = useAlertHook()
  const [updateListing, { isLoading }] = useUpdateListingMutation()
  const [uploadImage] = useUploadImageMutation()

  const [isActive, setIsActive] = useState(true)
  const [price, setPrice] = useState(0)
  // Newly added photos (append-only in quick edit): external URLs pasted via the
  // "Add URL" flow, plus files uploaded through the two-phase image upload.
  // Removing/reordering existing photos still lives in the full editor.
  const [externalUrls, setExternalUrls] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImageStatus[]>([])
  const [photoResourceIds, setPhotoResourceIds] = useState<string[]>([])
  const isUploading = uploadedImages.some((img) => img.status === "uploading")

  // Sync local state whenever the target listing changes
  useEffect(() => {
    if (listing) {
      setIsActive(listing.status === "active")
      setPrice(listing.price_min)
      setExternalUrls([])
      setUploadedImages([])
      setPhotoResourceIds([])
    }
  }, [listing])

  // Two-phase upload: upload each file immediately and track its status so a
  // failure shows on the thumbnail (with a reason on hover/tap) rather than
  // silently dropping the photo.
  const handleFileUpload = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const tempId = `temp-${crypto.randomUUID()}`
        setUploadedImages((prev) => [
          ...prev,
          { resource_id: tempId, url: "", status: "uploading", file },
        ])

        uploadImage(file)
          .unwrap()
          .then((result) => {
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.resource_id === tempId
                  ? {
                      ...img,
                      resource_id: result.resource_id,
                      url: result.url,
                      status: "success" as const,
                    }
                  : img,
              ),
            )
            setPhotoResourceIds((prev) => [...prev, result.resource_id])
          })
          .catch((err) => {
            const e = err as {
              data?: {
                error?: { message?: string; validationErrors?: { message: string }[] }
                message?: string
                validationErrors?: { message: string }[]
              }
            }
            const errBody = e?.data?.error || e?.data || {}
            const detail =
              errBody?.message ||
              errBody?.validationErrors?.[0]?.message ||
              t("quickEdit.uploadFailed", "Upload failed")
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.resource_id === tempId
                  ? { ...img, status: "error" as const, error: detail }
                  : img,
              ),
            )
          })
      }
    },
    [uploadImage, t],
  )

  const handleRemoveUploadedImage = useCallback((resourceId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.resource_id !== resourceId))
    setPhotoResourceIds((prev) => prev.filter((id) => id !== resourceId))
  }, [])

  const handleSave = useCallback(async () => {
    if (!listing) return
    const req: UpdateListingRequest = {}
    const newStatus: "active" | "inactive" = isActive ? "active" : "inactive"
    if (newStatus !== listing.status) req.status = newStatus
    if (price !== listing.price_min) req.base_price = price
    // Append newly uploaded photos and pasted external URLs (append-only here).
    if (photoResourceIds.length > 0) req.photo_resource_ids = photoResourceIds
    if (externalUrls.length > 0) req.external_photo_urls = externalUrls
    if (Object.keys(req).length === 0) {
      onClose()
      return
    }
    try {
      await updateListing({
        id: listing.listing_id,
        updateListingRequest: req,
      }).unwrap()
      issueAlert({
        message: t("quickEdit.saved", "Changes saved"),
        severity: "success",
      })
      onClose()
    } catch (error) {
      const err = error as { data?: { error?: { message?: string }; message?: string } }
      issueAlert({
        message:
          err?.data?.error?.message ||
          err?.data?.message ||
          t("quickEdit.error", "Failed to save changes"),
        severity: "error",
      })
    }
  }, [
    listing,
    isActive,
    price,
    photoResourceIds,
    externalUrls,
    updateListing,
    issueAlert,
    t,
    onClose,
  ])

  const handleOpenFullEditor = useCallback(() => {
    if (!listing) return
    onClose()
    navigate(MARKET_PATHS.edit(listing.listing_id))
  }, [listing, navigate, onClose])

  if (!listing) return null

  const statusColor =
    listing.status === "active"
      ? "success"
      : listing.status === "inactive" || listing.status === "expired"
        ? "warning"
        : "default"

  const qualityLabel =
    listing.quality_tier_min != null && listing.quality_tier_max != null
      ? listing.quality_tier_min === listing.quality_tier_max
        ? `Tier ${listing.quality_tier_min}`
        : `Tier ${listing.quality_tier_min}–${listing.quality_tier_max}`
      : null

  const priceHelp =
    listing.price_min === listing.price_max
      ? `${listing.price_min.toLocaleString()} aUEC`
      : `${listing.price_min.toLocaleString()}–${listing.price_max.toLocaleString()} aUEC`

  const tileSx = {
    flex: 1,
    p: 1.5,
    borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 1),
    border: 1,
    borderColor: "divider",
    bgcolor: "background.default",
  } as const

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      maxHeight="85vh"
      showCloseButton={false}
      snapPoints={["half", "75"]}
      defaultSnap="half"
    >
      {/* Listing identity header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 2,
          mb: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Avatar
          src={listing.photo || FALLBACK_IMAGE_URL}
          variant="rounded"
          sx={{ width: 44, height: 44, flexShrink: 0 }}
          imgProps={{ loading: "lazy" }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {listing.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("quickEdit.subtitle", "Quick Edit")}
          </Typography>
        </Box>
        <Chip
          label={listing.status.toUpperCase()}
          color={statusColor as "success" | "warning" | "default"}
          size="small"
        />
      </Box>

      <Stack spacing={2.5}>
        {/* Status toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 1),
            border: 1,
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {t("quickEdit.status", "Listing Status")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isActive
                ? t("quickEdit.activeDesc", "Visible to buyers")
                : t("quickEdit.inactiveDesc", "Hidden from buyers")}
            </Typography>
          </Box>
          <Switch
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            color="success"
            inputProps={{ "aria-label": t("quickEdit.active", "Active") }}
          />
        </Box>

        {/* Base price */}
        <NumericFormat
          decimalScale={0}
          allowNegative={false}
          customInput={TextField}
          thousandSeparator
          size="small"
          fullWidth
          label={t("quickEdit.price", "Base Price")}
          value={price}
          onValueChange={(v) => setPrice(v.floatValue ?? 0)}
          color="secondary"
          InputProps={{
            endAdornment: (
              <Typography variant="caption" color="text.secondary">
                aUEC
              </Typography>
            ),
            inputMode: "numeric",
          }}
          helperText={`${t("quickEdit.priceHelp", "Current")}: ${priceHelp}`}
        />

        {/* Add photos (append-only) */}
        <Box>
          <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
            {t("quickEdit.photos", "Add Photos")}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            {t(
              "quickEdit.photosHelp",
              "New photos are added to this listing. Use the full editor to remove or reorder existing photos.",
            )}
          </Typography>
          <SelectPhotosArea
            photos={externalUrls}
            setPhotos={setExternalUrls}
            onFileUpload={handleFileUpload}
            onAlert={(severity, message) => issueAlert({ severity, message })}
            uploadedImages={uploadedImages}
            onRemoveUploadedImage={handleRemoveUploadedImage}
          />
        </Box>

        {/* Read-only info tiles */}
        <Stack direction="row" spacing={1}>
          <Box sx={tileSx}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t("quickEdit.quantity", "Quantity")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {listing.quantity_available.toLocaleString()}
            </Typography>
          </Box>
          {qualityLabel && (
            <Box sx={tileSx}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("quickEdit.quality", "Quality")}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {qualityLabel}
              </Typography>
            </Box>
          )}
          <Box sx={tileSx}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t("quickEdit.variants", "Variants")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {listing.variant_count}
            </Typography>
          </Box>
        </Stack>

        <LoadingButton
          variant="contained"
          color="secondary"
          fullWidth
          loading={isLoading}
          disabled={isUploading}
          onClick={handleSave}
          size="large"
        >
          {isUploading
            ? t("quickEdit.uploading", "Uploading photos…")
            : t("quickEdit.save", "Save Changes")}
        </LoadingButton>

        <Button
          variant="outlined"
          color="inherit"
          fullWidth
          startIcon={<EditRounded />}
          onClick={handleOpenFullEditor}
        >
          {t("quickEdit.fullEditor", "Open Full Editor")}
        </Button>
      </Stack>
    </BottomSheet>
  )
}

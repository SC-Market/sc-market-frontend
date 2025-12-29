import React, { useCallback, useMemo, useState, useEffect } from "react"
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  AddAPhotoRounded,
  ArchiveRounded,
  EditRounded,
  RadioButtonCheckedRounded,
  RadioButtonUncheckedRounded,
} from "@mui/icons-material"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { useCurrentMarketListing } from "../../hooks/market/CurrentMarketItem"
import {
  useMarketUpdateListingMutation,
  useMarketUploadListingPhotosMutation,
  useUpdateMarketListingMutation,
  validatePhotoUploadParams,
} from "../../store/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { Navigate } from "react-router-dom"
import { ImageSearch } from "./ImageSearch"
import { MISSING_IMAGE_URL } from "../../hooks/styles/Theme"
import {
  MarketListingUpdateBody,
  UniqueListing,
} from "../../datatypes/MarketListing"
import { has_permission } from "../contractor/OrgRoles"
import { NumericFormat } from "react-number-format"
import { SelectGameItemStack } from "../../components/select/SelectGameItem"
import { SelectPhotosArea } from "../../components/modal/SelectPhotosArea"
import { useTranslation } from "react-i18next" // Localization
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function MarketListingEditView() {
  const { t } = useTranslation() // Localization hook
  const theme = useTheme<ExtendedTheme>()
  const [listing] = useCurrentMarketListing<UniqueListing>()
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  const amContractor = useMemo(
    () =>
      currentOrg?.spectrum_id ===
      listing?.listing.contractor_seller?.spectrum_id,
    [currentOrg?.spectrum_id, listing?.listing?.contractor_seller],
  )

  const amContractorManager = useMemo(
    () =>
      amContractor &&
      has_permission(
        currentOrg,
        profile,
        "manage_market",
        profile?.contractors,
      ),
    [currentOrg, profile, amContractor],
  )

  const issueAlert = useAlertHook()

  const [
    updateListing, // This is the mutation trigger
    { isLoading }, // This is the destructured mutation result
  ] = useUpdateMarketListingMutation()

  const [uploadPhotos, { isLoading: isUploading }] =
    useMarketUploadListingPhotosMutation()

  const [quantity, setQuantity] = useState(listing.listing.quantity_available)
  const [price, setPrice] = useState(listing.listing.price)
  const [increment, setIncrement] = useState(
    listing.auction_details?.minimum_bid_increment,
  )
  const [description, setDescription] = useState(listing.details.description)
  const [title, setTitle] = useState(listing.details.title)
  const [type, setType] = useState(listing.details.item_type)
  const [item, setItem] = useState(listing.details.item_name)
  const [photos, setPhotos] = useState(listing.photos)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [internal, setInternal] = useState(listing.listing.internal)

  // Watch for photo updates and sync local state
  useEffect(() => {
    setPhotos(listing.photos)
  }, [listing.photos])

  const updateListingCallback = useCallback(
    (body: MarketListingUpdateBody) => {
      return updateListing({
        listing_id: listing.listing.listing_id,
        body,
      })
        .unwrap()
        .then(() => {
          // Clear pending files whenever the listing is updated
          // This ensures the UI shows the current server state instead of pending uploads
          if (pendingFiles.length > 0) {
            console.log(
              `[Photo Upload] Clearing pending files after listing update for ${listing.listing.listing_id}:`,
              {
                listing_id: listing.listing.listing_id,
                cleared_files: pendingFiles.map((f) => ({
                  name: f.name,
                  size: f.size,
                  type: f.type,
                })),
                update_body: body,
              },
            )
            setPendingFiles([])
          }

          issueAlert({
            message: t("MarketListingEditView.updated"),
            severity: "success",
          })
        })
        .catch((error) => {
          issueAlert(error)
        })
    },
    [listing, issueAlert, updateListing, t, pendingFiles],
  )

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      console.log(
        `[Photo Upload] Files selected for listing ${listing.listing.listing_id}:`,
        {
          listing_id: listing.listing.listing_id,
          count: files.length,
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        },
      )
      // Store files locally instead of uploading immediately
      setPendingFiles((prev) => [...prev, ...files])
    },
    [listing.listing.listing_id],
  )

  const handlePhotosUpdate = useCallback(async () => {
    // First, update the listing with the current photos (hotlinked images)
    console.log(
      `[Photo Upload] Updating listing with hotlinked images for ${listing.listing.listing_id}:`,
      {
        listing_id: listing.listing.listing_id,
        hotlinked_photos: photos,
        hotlinked_count: photos.length,
      },
    )

    // Update the listing with hotlinked photos first, then proceed with photo uploads
    updateListingCallback({ photos })
      .then(() => {
        if (pendingFiles.length > 0) {
          console.log(
            `[Photo Upload] Starting upload for listing ${listing.listing.listing_id}:`,
            {
              listing_id: listing.listing.listing_id,
              file_count: pendingFiles.length,
              files: pendingFiles.map((f) => ({
                name: f.name,
                size: f.size,
                type: f.type,
              })),
            },
          )

          const uploadParams = validatePhotoUploadParams(
            listing.listing.listing_id,
            pendingFiles,
          )
          if (uploadParams.status === "invalid") {
            issueAlert({
              message: uploadParams.error,
              severity: "error",
            })
            return
          }

          uploadPhotos({
            listingId: uploadParams.listingId,
            photos: uploadParams.photos,
          })
            .unwrap()
            .then((uploadResult) => {
              console.log(`[Photo Upload] Upload successful:`, {
                listing_id: listing.listing.listing_id,
                result: uploadResult,
                photo_urls: uploadResult.photo_urls,
              })

              issueAlert({
                message: t("MarketListingForm.photosUploaded"),
                severity: "success",
              })

              // Clear pending files after successful upload
              setPendingFiles([])
            })
            .catch((uploadError) => {
              console.error(
                `[Photo Upload] Upload failed for listing ${listing.listing.listing_id}:`,
                {
                  listing_id: listing.listing.listing_id,
                  error: uploadError,
                  error_message: uploadError?.message || "Unknown error",
                  error_status: uploadError?.status || "No status",
                },
              )

              issueAlert(uploadError)
            })
        } else {
          console.log(
            `[Photo Upload] No pending files to upload for listing ${listing.listing.listing_id}`,
          )
        }
      })
      .catch((updateError) => {
        console.error(
          `[Photo Upload] Listing update failed for ${listing.listing.listing_id}:`,
          updateError,
        )
        // Don't proceed with photo uploads if listing update fails
      })
  }, [
    pendingFiles,
    uploadPhotos,
    listing.listing.listing_id,
    photos,
    updateListingCallback,
    issueAlert,
    t,
  ])

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12}>
            <Fade in={true}>
              <Card
                sx={{
                  minHeight: 400,
                }}
              >
                <CardContent
                  sx={{
                    width: "100%",
                    minHeight: 192,
                    padding: 3,
                  }}
                >
                  <Box
                    sx={{
                      marginBottom: 2,
                      // minWidth: 200
                    }}
                  >
                    {listing.listing.status !== "archived" && (
                      <>
                        {listing.listing.status === "active" ? (
                          <Button
                            variant={"outlined"}
                            color={"warning"}
                            onClick={() =>
                              updateListingCallback({
                                status:
                                  listing.listing.status === "active"
                                    ? "inactive"
                                    : "active",
                              })
                            }
                            startIcon={<RadioButtonUncheckedRounded />}
                          >
                            {t("MarketListingEditView.deactivate")}
                          </Button>
                        ) : (
                          <Button
                            variant={"outlined"}
                            color={"success"}
                            onClick={() =>
                              updateListingCallback({
                                status:
                                  listing.listing.status === "active"
                                    ? "inactive"
                                    : "active",
                              })
                            }
                            startIcon={<RadioButtonCheckedRounded />}
                          >
                            {t("MarketListingEditView.activate")}
                          </Button>
                        )}
                        <Button
                          variant={"outlined"}
                          color={"error"}
                          onClick={() =>
                            updateListingCallback({ status: "archived" })
                          }
                          startIcon={<ArchiveRounded />}
                          sx={{ marginLeft: 1 }}
                        >
                          {t("MarketListingEditView.archive")}
                        </Button>
                      </>
                    )}
                  </Box>
                  {listing.type === "unique" && (
                    <Box
                      sx={{
                        paddingBottom: 2,
                        display: "flex",
                        "& > *": { marginRight: 2 },
                      }}
                    >
                      <TextField
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                        sx={{
                          marginRight: 2,
                          width: "75%",
                        }}
                        size="small"
                        label={t("MarketListingEditView.title")}
                        value={title}
                        onChange={(
                          event: React.ChangeEvent<{ value: string }>,
                        ) => {
                          setTitle(event.target.value)
                        }}
                        color={"secondary"}
                      />
                      <Button
                        onClick={() => updateListingCallback({ title })}
                        variant={"contained"}
                      >
                        {t("MarketListingEditView.updateBtn")}
                      </Button>
                    </Box>
                  )}
                  {listing.type === "unique" && (
                    <Box
                      sx={{
                        paddingBottom: 2,
                        display: "flex",
                        "& > *": { marginRight: 2 },
                      }}
                    >
                      <SelectGameItemStack
                        onItemChange={(value) => setItem(value)}
                        onTypeChange={(value) => {
                          setType(value)
                          setItem(null)
                        }}
                        item_type={type}
                        item_name={item}
                      />
                      <Button
                        onClick={() =>
                          updateListingCallback({
                            item_type: type,
                            item_name: item,
                          })
                        }
                        variant={"contained"}
                      >
                        {t("MarketListingEditView.updateBtn")}
                      </Button>
                    </Box>
                  )}
                  <Box
                    sx={{
                      paddingBottom: 2,
                    }}
                  >
                    <Divider light />
                  </Box>
                  <Box
                    sx={{
                      paddingBottom: 2,
                      display: "flex",
                      "& > *": { marginRight: 2 },
                    }}
                  >
                    <NumericFormat
                      decimalScale={0}
                      allowNegative={false}
                      customInput={TextField}
                      thousandSeparator
                      onValueChange={async (values, sourceInfo) => {
                        setQuantity(values.floatValue || 0)
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                      }}
                      sx={{
                        marginRight: 2,
                        width: "75%",
                      }}
                      size="small"
                      label={t("MarketListingEditView.quantityAvailable")}
                      value={quantity}
                      color={"secondary"}
                    />
                    <Button
                      onClick={() =>
                        updateListingCallback({
                          quantity_available: quantity,
                        })
                      }
                      variant={"contained"}
                    >
                      {t("MarketListingEditView.updateBtn")}
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      paddingBottom: 2,
                      display: "flex",
                      "& > *": { marginRight: 2 },
                    }}
                  >
                    <NumericFormat
                      decimalScale={0}
                      allowNegative={false}
                      customInput={TextField}
                      thousandSeparator
                      onValueChange={async (values, sourceInfo) => {
                        setPrice(values.floatValue || 0)
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                      }}
                      sx={{
                        marginRight: 2,
                        width: "75%",
                      }}
                      size="small"
                      label={t("MarketListingEditView.price")}
                      value={price}
                      InputProps={{
                        readOnly: listing.listing.sale_type === "auction",
                        endAdornment: (
                          <InputAdornment position="end">aUEC</InputAdornment>
                        ),
                      }}
                      color={"secondary"}
                    />
                    <Button
                      onClick={() => updateListingCallback({ price })}
                      variant={"contained"}
                      disabled={listing.listing.sale_type === "auction"}
                    >
                      {t("MarketListingEditView.updateBtn")}
                    </Button>
                  </Box>
                  {listing.listing.sale_type === "auction" ? (
                    <Box
                      sx={{
                        paddingBottom: 2,
                        display: "flex",
                        "& > *": { marginRight: 2 },
                      }}
                    >
                      <NumericFormat
                        decimalScale={0}
                        allowNegative={false}
                        customInput={TextField}
                        thousandSeparator
                        onValueChange={async (values, sourceInfo) => {
                          setIncrement(values.floatValue || 0)
                        }}
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                        sx={{
                          marginRight: 2,
                          width: "75%",
                        }}
                        size="small"
                        label={t("MarketListingEditView.minBidIncrement")}
                        value={increment || 0}
                        InputProps={{
                          readOnly: listing.listing.sale_type === "auction",
                          endAdornment: (
                            <InputAdornment position="end">aUEC</InputAdornment>
                          ),
                        }}
                        color={"secondary"}
                      />
                      <Button
                        onClick={() =>
                          updateListingCallback({
                            minimum_bid_increment: increment,
                          })
                        }
                        variant={"contained"}
                        disabled={listing.listing.sale_type !== "auction"}
                      >
                        {t("MarketListingEditView.updateBtn")}
                      </Button>
                    </Box>
                  ) : null}
                  {listing.type === "unique" && (
                    <>
                      <Divider light />
                      <Box sx={{ marginTop: 2 }}>
                        <MarkdownEditor
                          sx={{ marginRight: 2, marginBottom: 1 }}
                          onChange={(value: string) => {
                            setDescription(value)
                          }}
                          value={description}
                          TextFieldProps={{
                            label: t("MarketListingEditView.description"),
                          }}
                          BarItems={
                            <Button
                              onClick={() =>
                                updateListingCallback({ description })
                              }
                              variant={"contained"}
                            >
                              {t("MarketListingEditView.updateBtn")}
                            </Button>
                          }
                          variant={"vertical"}
                        />
                      </Box>
                    </>
                  )}
                  {amContractorManager && (
                    <>
                      <Divider light />
                      <Box
                        sx={{
                          paddingBottom: 2,
                          display: "flex",
                          alignItems: "center",
                          "& > *": { marginRight: 2 },
                        }}
                      >
                        <TextField
                          select
                          size="small"
                          label={t("MarketListingEditView.internalListing")}
                          value={internal ? "true" : "false"}
                          onChange={(event) => {
                            setInternal(event.target.value === "true")
                          }}
                          sx={{
                            marginRight: 2,
                            minWidth: 200,
                          }}
                          color={"secondary"}
                        >
                          <MenuItem value="false">
                            {t("MarketListingEditView.publicListing")}
                          </MenuItem>
                          <MenuItem value="true">
                            {t("MarketListingEditView.internalListing")}
                          </MenuItem>
                        </TextField>
                        <Button
                          onClick={() => updateListingCallback({ internal })}
                          variant={"contained"}
                        >
                          {t("MarketListingEditView.updateBtn")}
                        </Button>
                      </Box>
                    </>
                  )}
                  <Grid item xs={12}>
                    <SelectPhotosArea
                      setPhotos={setPhotos}
                      photos={photos}
                      onFileUpload={handleFileUpload}
                      showUploadButton={true}
                      pendingFiles={pendingFiles}
                      onRemovePendingFile={(file) => {
                        setPendingFiles((prev) =>
                          prev.filter((f) => f !== file),
                        )
                      }}
                      onAlert={(severity, message) =>
                        issueAlert({ severity, message })
                      }
                    />
                    <Button
                      onClick={handlePhotosUpdate}
                      variant={"contained"}
                      disabled={isLoading || isUploading}
                    >
                      {isLoading || isUploading
                        ? t("MarketListingEditView.updating", "Updating...")
                        : t("MarketListingEditView.updateBtn")}
                    </Button>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

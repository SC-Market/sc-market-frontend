import React, { useCallback, useMemo, useState, useEffect } from "react"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { useCurrentMarketListing } from "../../features/market/index"
import {
  useMarketUpdateListingMutation,
  useMarketUploadListingPhotosMutation,
  useUpdateMarketListingMutation,
  validatePhotoUploadParams,
} from "../../features/market/index"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { Navigate } from "react-router-dom"
import { ImageSearch } from "../../features/market/components/ImageSearch"
import { MISSING_IMAGE_URL } from "../../hooks/styles/Theme"
import { MarketListingUpdateBody, UniqueListing } from "../../features/market/index"
import { has_permission } from "../contractor/OrgRoles"
import { NumericFormat } from "react-number-format"
import { SelectGameItemStack } from "../../components/select/SelectGameItem"
import { SelectPhotosArea } from "../../components/modal/SelectPhotosArea"
import { useTranslation } from "react-i18next" // Localization
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/Menu';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Fab from '@mui/material/Fab';
import DialogContentText from '@mui/material/DialogContentText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import ButtonBase from '@mui/material/ButtonBase';
import useTheme1 from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ElectricBoltRounded from '@mui/icons-material/ElectricBoltRounded';
import ArchiveRounded from '@mui/icons-material/ArchiveRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';

export function MarketListingEditView() {
  const { t } = useTranslation() // Localization hook
  const theme = useTheme<ExtendedTheme>()
  const [listing, refetch] = useCurrentMarketListing<UniqueListing>()
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

  // Watch for listing updates and sync local state
  useEffect(() => {
    setQuantity(listing.listing.quantity_available)
    setPrice(listing.listing.price)
    setIncrement(listing.auction_details?.minimum_bid_increment)
    setDescription(listing.details.description)
    setTitle(listing.details.title)
    setType(listing.details.item_type)
    setItem(listing.details.item_name)
    setPhotos(listing.photos)
    setInternal(listing.listing.internal)
  }, [listing])

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

          // Refetch to ensure UI shows latest data
          refetch()

          issueAlert({
            message: t("MarketListingEditView.updated"),
            severity: "success",
          })
        })
        .catch((error) => {
          issueAlert(error)
        })
    },
    [listing, issueAlert, updateListing, t, pendingFiles, refetch],
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
            .then((uploadResult: { photo_urls?: string[] }) => {
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
                  {amContractorManager && listing.listing.contractor_seller && (
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

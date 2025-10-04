import {
  Autocomplete,
  Button,
  Collapse,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import {
  useMarketCreateAggregateListingMutation,
  useMarketCreateMultipleListingMutation,
  useGetAggregateByIdQuery,
  useSearchMarketQuery,
  useMarketUploadListingPhotosMutation,
  validatePhotoUploadParams,
  useCreateMarketListingMutation,
} from "../../store/market"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  AggregateMarketListingBody,
  MarketListingBody,
  MarketMultipleBody,
  UniqueListing,
} from "../../datatypes/MarketListing"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  AddCircleOutlineRounded,
  KeyboardArrowUpRounded,
} from "@mui/icons-material"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { DateTimePicker } from "@mui/x-date-pickers"
import { useNavigate } from "react-router-dom"
import { PageSearch } from "./PageSearch"
import { DisplayListingsHorizontal } from "./ItemListings"
import { NumericFormat } from "react-number-format"
import { FormPaper } from "../../components/paper/FormPaper"
import {
  SelectGameCategory,
  SelectGameItemStack,
} from "../../components/select/SelectGameItem"
import LoadingButton from "@mui/lab/LoadingButton"
import { SelectPhotosArea } from "../../components/modal/SelectPhotosArea"
import { useTranslation } from "react-i18next" // Localization

export function MarketListingForm(props: { sale_type: "sale" | "auction" }) {
  const { t } = useTranslation()

  const [state, setState] = React.useState<MarketListingBody>({
    title: "",
    description: "",
    sale_type: props.sale_type,
    item_type: "Other",
    price: 0,
    quantity_available: 1,
    photos: [
      "https://media.starcitizen.tools/thumb/9/93/Placeholderv2.png/399px-Placeholderv2.png.webp",
    ],
    minimum_bid_increment: 1000,
    internal: false,
    status: "active",
    end_time: null,
    item_name: null,
  })

  const { data: searchResults, isLoading: isSearchLoading } =
    useSearchMarketQuery(
      {
        index: 0,
        page_size: 10,
        quantityAvailable: 1,
        query: state.item_name || state.title,
        seller_rating: 0,
        minCost: 0,
        sort: "activity",
      },
      { skip: (state.item_name || state.title).length < 3 },
    )

  const [imageOpen, setImageOpen] = useState(false)

  const [
    createListing, // This is the mutation trigger
    { isLoading }, // This is the destructured mutation result
  ] = useCreateMarketListingMutation()

  const [uploadPhotos, { isLoading: isUploading }] =
    useMarketUploadListingPhotosMutation()

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const issueAlert = useAlertHook()

  const [currentOrg] = useCurrentOrg()

  const navigate = useNavigate()

  const submitMarketListing = useCallback(
    async (event: any) => {
      createListing({
        ...state,
        spectrum_id: currentOrg?.spectrum_id,
      })
        .unwrap()
        .then(async (res) => {
          // Upload photos if any files were selected
          if (uploadedFiles.length > 0) {
            const uploadParams = validatePhotoUploadParams(
              res.listing.listing_id,
              uploadedFiles,
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
                issueAlert({
                  message: t("MarketListingForm.photosUploaded"),
                  severity: "success",
                })

                // Clear uploaded files after successful photo upload
                setUploadedFiles([])
              })
              .catch((uploadError) => {
                issueAlert(uploadError)
              })
          } else {
            console.log(
              `[Photo Upload] No photos to upload for listing ${res.listing.listing_id}`,
            )
          }

          setState({
            title: "",
            description: "",
            sale_type: props.sale_type,
            item_type: "Other",
            price: 0,
            quantity_available: 1,
            photos: [
              "https://media.starcitizen.tools/thumb/9/93/Placeholderv2.png/399px-Placeholderv2.png.webp",
            ],
            minimum_bid_increment: 1000,
            internal: false,
            status: "active",
            end_time: null,
            item_name: null,
          })

          issueAlert({
            message: t("MarketListingForm.submitted"),
            severity: "success",
          })

          navigate(`/market/${res.listing.listing_id}`)
        })
        .catch((err) => {
          issueAlert(err)
        })

      return false
    },
    [
      createListing,
      currentOrg?.spectrum_id,
      navigate,
      props.sale_type,
      issueAlert,
      state,
      t,
      uploadPhotos,
      uploadedFiles,
    ],
  )

  const filledResults = searchResults?.listings || []

  const [relatedOpen, setRelatedOpen] = useState(false)

  const handleFileUpload = useCallback((files: File[]) => {
    console.log(`[Photo Upload] Files selected:`, {
      count: files.length,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    })
    setUploadedFiles((prev) => [...prev, ...files])
  }, [])

  return (
    // <FormControl component={Grid} item xs={12} container spacing={2}>
    <>
      <FormPaper title={t("MarketListingForm.about")}>
        <Grid item xs={12} lg={12}>
          <TextField
            fullWidth
            label={t("MarketListingForm.title")}
            id="order-title"
            value={state.title}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              setState((state) => ({ ...state, title: event.target.value }))
            }}
            color={"secondary"}
            aria-required="true"
            aria-describedby="listing-title-help"
            inputProps={{
              "aria-label": t(
                "accessibility.listingTitleInput",
                "Enter listing title",
              ),
              maxLength: 100,
            }}
          />
          <div id="listing-title-help" className="sr-only">
            {t(
              "accessibility.listingTitleHelp",
              "Enter a descriptive title for your market listing (required)",
            )}
          </div>
        </Grid>

        <SelectGameItemStack
          onItemChange={(value) =>
            setState((state) => ({ ...state, item_name: value }))
          }
          onTypeChange={(value) =>
            setState((state) => ({
              ...state,
              item_type: value,
              item_name: null,
            }))
          }
          item_type={state.item_type}
          item_name={state.item_name}
        />

        <Grid item xs={12} lg={12}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values, sourceInfo) => {
              setState((state) => ({
                ...state,
                quantity_available: values.floatValue || 0,
              }))
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              "aria-label": t(
                "accessibility.quantityAvailableInput",
                "Enter quantity available",
              ),
              "aria-describedby": "quantity-available-help",
            }}
            label={t("MarketListingForm.quantityAvailable")}
            id="quantity-available"
            value={state.quantity_available}
            defaultValue={1}
            color={"secondary"}
            aria-required="true"
          />
          <div id="quantity-available-help" className="sr-only">
            {t(
              "accessibility.quantityAvailableHelp",
              "Enter the number of items available for sale",
            )}
          </div>
        </Grid>

        <Grid item xs={12}>
          <MarkdownEditor
            onChange={(value: string) => {
              setState((state) => ({ ...state, description: value }))
            }}
            value={state.description}
            TextFieldProps={{
              label: t("MarketListingForm.description"),
              helperText: t("MarketListingForm.descriptionHelp"),
              "aria-label": t(
                "accessibility.listingDescriptionInput",
                "Enter listing description",
              ),
              "aria-describedby": "listing-description-help",
            }}
            variant={"vertical"}
          />
          <div id="listing-description-help" className="sr-only">
            {t(
              "accessibility.listingDescriptionHelp",
              "Provide a detailed description of your market listing",
            )}
          </div>
        </Grid>

        <Grid item xs={12}>
          <Typography color={"text.secondary"} variant={"body2"}>
            {t("MarketListingForm.imageHint")}
          </Typography>
          <SelectPhotosArea
            setPhotos={(photos) => setState((state) => ({ ...state, photos }))}
            photos={state.photos}
            onFileUpload={handleFileUpload}
            pendingFiles={uploadedFiles}
            onRemovePendingFile={(file) => {
              setUploadedFiles((prev) => prev.filter((f) => f !== file))
            }}
            onAlert={(severity, message) => issueAlert({ severity, message })}
          />
        </Grid>
      </FormPaper>

      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("MarketListingForm.relatedListings")}{" "}
          <IconButton onClick={() => setRelatedOpen((o) => !o)}>
            {relatedOpen ? (
              <KeyboardArrowUpRounded />
            ) : (
              <KeyboardArrowDownRoundedIcon />
            )}
          </IconButton>
        </Typography>
        <Collapse in={relatedOpen}>
          {!!filledResults.length && (
            <Grid container>
              <DisplayListingsHorizontal listings={filledResults} />
            </Grid>
          )}
        </Collapse>
      </Grid>

      <FormPaper title={t("MarketListingForm.availability")}>
        <Grid item xs={12} lg={12} display={"flex"} justifyContent={"right"}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={state.status === "active"}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setState((state) => ({
                      ...state,
                      status: event.target.checked ? "active" : "inactive",
                    }))
                  }
                  aria-label={t(
                    "accessibility.listingStatusToggle",
                    "Toggle listing status",
                  )}
                  aria-describedby="listing-status-help"
                />
              }
              label={t("MarketListingForm.active")}
            />
            <div id="listing-status-help" className="sr-only">
              {t(
                "accessibility.listingStatusHelp",
                "Toggle to activate or deactivate this market listing",
              )}
            </div>
            {currentOrg && (
              <FormControlLabel
                control={
                  <Switch
                    checked={state.internal}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setState({
                        ...state,
                        internal: event.target.checked,
                      })
                    }
                    aria-label={t(
                      "accessibility.internalListingToggle",
                      "Toggle internal listing",
                    )}
                    aria-describedby="internal-listing-help"
                  />
                }
                label={t("MarketListingForm.orgInternal")}
              />
            )}
            <div id="internal-listing-help" className="sr-only">
              {t(
                "accessibility.internalListingHelp",
                "Toggle to make this listing visible only to your organization",
              )}
            </div>
          </FormGroup>
        </Grid>
      </FormPaper>

      <FormPaper title={t("MarketListingForm.costs")}>
        <Grid item xs={12}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values, sourceInfo) => {
              setState((state) => ({
                ...state,
                price: values.floatValue || 0,
              }))
            }}
            fullWidth={true}
            label={
              state.sale_type === "sale"
                ? t("MarketListingForm.price")
                : t("MarketListingForm.startingBid")
            }
            id="collateral"
            color={"secondary"}
            value={state.price}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{`aUEC`}</InputAdornment>
              ),
              inputMode: "numeric",
            }}
            type={"tel"}
            aria-required="true"
            aria-describedby="price-help"
            inputProps={{
              "aria-label": t(
                "accessibility.priceInput",
                "Enter price per unit",
              ),
              pattern: "[0-9]*",
            }}
          />
          <div id="price-help" className="sr-only">
            {t("accessibility.priceHelp", "Enter the price per unit in aUEC")}
          </div>
        </Grid>
        {state.sale_type === "auction" ? (
          <>
            <Grid item xs={12}>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={async (values, sourceInfo) => {
                  setState((state) => ({
                    ...state,
                    minimum_bid_increment: values.floatValue || 0,
                  }))
                }}
                fullWidth={true}
                label={t("MarketListingForm.minBidIncrement")}
                id="collateral"
                color={"secondary"}
                value={state.minimum_bid_increment}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">{`aUEC`}</InputAdornment>
                  ),
                  inputMode: "numeric",
                }}
                type={"tel"}
                aria-required="true"
                aria-describedby="min-bid-increment-help"
                inputProps={{
                  "aria-label": t(
                    "accessibility.minBidIncrementInput",
                    "Enter minimum bid increment",
                  ),
                  pattern: "[0-9]*",
                }}
              />
              <div id="min-bid-increment-help" className="sr-only">
                {t(
                  "accessibility.minBidIncrementHelp",
                  "Enter the minimum amount by which bids must increase",
                )}
              </div>
            </Grid>
            <Grid item>
              <DateTimePicker
                label={t("MarketListingForm.endTime", {
                  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })}
                value={state.end_time}
                onChange={(newValue) =>
                  setState((state) => ({ ...state, end_time: newValue }))
                }
                slotProps={{
                  textField: {
                    "aria-label": t(
                      "accessibility.endTimeInput",
                      "Select auction end time",
                    ),
                    "aria-describedby": "end-time-help",
                  },
                }}
              />
              <div id="end-time-help" className="sr-only">
                {t(
                  "accessibility.endTimeHelp",
                  "Select when this auction should end",
                )}
              </div>
            </Grid>
          </>
        ) : null}
      </FormPaper>
      <Grid item xs={12} container justifyContent={"right"}>
        <LoadingButton
          size={"large"}
          variant="contained"
          color={"secondary"}
          type="submit"
          // component={Link}
          // to={'/p/myoffers'}
          onClick={submitMarketListing}
          loading={isLoading || isUploading}
          aria-label={t(
            "accessibility.submitMarketListing",
            "Submit market listing",
          )}
          aria-describedby="submit-listing-help"
        >
          {t("MarketListingForm.submit")}
          <span id="submit-listing-help" className="sr-only">
            {t(
              "accessibility.submitMarketListingHelp",
              "Submit your market listing with the specified details and pricing",
            )}
          </span>
        </LoadingButton>
      </Grid>
    </>
    // </FormControl>
  )
}

export function AggregateMarketListingForm() {
  const { t } = useTranslation()

  const [state, setState] = React.useState<AggregateMarketListingBody>({
    price: 0,
    quantity_available: 1,
    wiki_id: "",
    status: "active",
    internal: false,
  })

  const [imageOpen, setImageOpen] = useState(false)

  const [
    createAggregateListing, // This is the mutation trigger
    { isLoading }, // This is the destructured mutation result
  ] = useMarketCreateAggregateListingMutation()

  const [aggregateChoice, setAggregateChoice] = useState<
    | string
    | {
        label: string
        id: string | number
      }
    | null
  >(null)

  useEffect(() => {
    if (typeof aggregateChoice !== "string" && aggregateChoice) {
      setState((state) => ({ ...state, wiki_id: aggregateChoice.id }))
    }
  }, [aggregateChoice])

  const { data: aggregate } = useGetAggregateByIdQuery(state.wiki_id, {
    skip: !state.wiki_id,
  })

  const issueAlert = useAlertHook()

  const [currentOrg] = useCurrentOrg()
  const navigate = useNavigate()

  const submitMarketListing = useCallback(
    async (event: any) => {
      const res: { data?: any; error?: any } = await createAggregateListing({
        body: state,
        spectrum_id: currentOrg?.spectrum_id,
      })

      if (res?.data && !res?.error) {
        setState({
          price: 0,
          quantity_available: 1,
          wiki_id: "",
          status: "active",
          internal: false,
        })

        issueAlert({
          message: t("AggregateMarketListingForm.submitted"),
          severity: "success",
        })

        navigate(`/market/aggregate/${res.data.aggregate_id}`)
      } else {
        issueAlert({
          message:
            t("AggregateMarketListingForm.failedSubmit") +
            ` ${res.error?.error || res.error?.data?.error || res.error}`,
          severity: "error",
        })
      }

      return false
    },
    [
      createAggregateListing,
      currentOrg?.spectrum_id,
      issueAlert,
      state,
      t,
      navigate,
    ],
  )

  return (
    // <FormControl component={Grid} item xs={12} container spacing={2}>
    <>
      <FormPaper title={t("AggregateMarketListingForm.about")}>
        {aggregate && (
          <>
            <Grid item xs={12} lg={12}>
              <Typography variant={"h5"}>{aggregate?.details.title}</Typography>
            </Grid>

            <Grid item xs={12} lg={12}>
              <Typography
                variant={"subtitle1"}
                sx={{
                  textTransform: "capitalize",
                }}
              >
                {aggregate?.details.item_type}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant={"body1"}>
                {aggregate?.details.description}
              </Typography>
            </Grid>
          </>
        )}

        <Grid item xs={12} lg={12}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values, sourceInfo) => {
              setState({
                ...state,
                quantity_available: values.floatValue || 0,
              })
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              "aria-label": t(
                "accessibility.quantityAvailableInput",
                "Enter quantity available",
              ),
              "aria-describedby": "quantity-available-help",
            }}
            label={t("AggregateMarketListingForm.quantityAvailable")}
            id="quantity-available"
            value={state.quantity_available}
            defaultValue={1}
            fullWidth
            color={"secondary"}
            aria-required="true"
          />
          <div id="quantity-available-help" className="sr-only">
            {t(
              "accessibility.quantityAvailableHelp",
              "Enter the number of items available for sale",
            )}
          </div>
        </Grid>

        <Grid item xs={12}>
          <Grid container alignItems={"center"}>
            <Grid item xs={12} md={8}>
              <Typography
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  // whiteSpace: "pre-line",
                }}
              >
                {(aggregate?.photos || [])[0]}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant={"contained"}
                startIcon={<AddCircleOutlineRounded />}
                onClick={() => setImageOpen(true)}
              >
                {t("AggregateMarketListingForm.chooseNewItem")}
              </Button>
            </Grid>
          </Grid>

          <PageSearch
            open={imageOpen}
            setOpen={setImageOpen}
            callback={(arg) => {
              if (arg) {
                setState({
                  ...state,
                  wiki_id: arg.pageid,
                })
                setAggregateChoice({ id: arg.pageid, label: arg.title })
              }
            }}
          />
        </Grid>
      </FormPaper>

      <FormPaper title={t("AggregateMarketListingForm.availability")}>
        <Grid item xs={12} lg={12} display={"flex"} justifyContent={"right"}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={state.status === "active"}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setState({
                      ...state,
                      status: event.target.checked ? "active" : "inactive",
                    })
                  }}
                  aria-label={t(
                    "accessibility.listingStatusToggle",
                    "Toggle listing status",
                  )}
                  aria-describedby="listing-status-help"
                />
              }
              label={t("AggregateMarketListingForm.active")}
            />
            <div id="listing-status-help" className="sr-only">
              {t(
                "accessibility.listingStatusHelp",
                "Toggle to activate or deactivate this market listing",
              )}
            </div>
            {currentOrg && (
              <FormControlLabel
                control={
                  <Switch
                    checked={state.internal}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setState({
                        ...state,
                        internal: event.target.checked,
                      })
                    }
                    aria-label={t(
                      "accessibility.internalListingToggle",
                      "Toggle internal listing",
                    )}
                    aria-describedby="internal-listing-help"
                  />
                }
                label={t("AggregateMarketListingForm.orgInternal")}
              />
            )}
            <div id="internal-listing-help" className="sr-only">
              {t(
                "accessibility.internalListingHelp",
                "Toggle to make this listing visible only to your organization",
              )}
            </div>
          </FormGroup>
        </Grid>
      </FormPaper>

      <FormPaper title={t("AggregateMarketListingForm.costs")}>
        <Grid item xs={12}>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values, sourceInfo) => {
              setState({
                ...state,
                price: +(values.floatValue || 0),
              })
            }}
            value={state.price}
            fullWidth={true}
            label={t("AggregateMarketListingForm.price")}
            id="price"
            color={"secondary"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{`aUEC`}</InputAdornment>
              ),
            }}
            aria-required="true"
            aria-describedby="price-help"
            inputProps={{
              "aria-label": t(
                "accessibility.priceInput",
                "Enter price per unit",
              ),
              pattern: "[0-9]*",
            }}
          />
          <div id="price-help" className="sr-only">
            {t("accessibility.priceHelp", "Enter the price per unit in aUEC")}
          </div>
        </Grid>
      </FormPaper>
      <Grid item xs={12} container justifyContent={"right"}>
        <LoadingButton
          size={"large"}
          variant="contained"
          color={"secondary"}
          type="submit"
          // component={Link}
          // to={'/p/myoffers'}
          onClick={submitMarketListing}
          loading={isLoading}
          aria-label={t(
            "accessibility.submitMarketListing",
            "Submit market listing",
          )}
          aria-describedby="submit-listing-help"
        >
          {t("AggregateMarketListingForm.submit")}
          <span id="submit-listing-help" className="sr-only">
            {t(
              "accessibility.submitMarketListingHelp",
              "Submit your market listing with the specified details and pricing",
            )}
          </span>
        </LoadingButton>
      </Grid>
    </>
    // </FormControl>
  )
}

export function MarketMultipleForm() {
  const { t } = useTranslation()

  const [state, setState] = React.useState<MarketMultipleBody>({
    title: "",
    description: "",
    item_type: "armor",
    default_listing_id: "",
    listings: [],
  })

  const [imageOpen, setImageOpen] = useState(false)

  const [createListing, { isLoading }] =
    useMarketCreateMultipleListingMutation()

  const issueAlert = useAlertHook()

  const [currentOrg] = useCurrentOrg()

  const navigate = useNavigate()

  const submitMarketListing = useCallback(
    async (event: any) => {
      const res: { data?: any; error?: any } = await createListing({
        body: state,
        spectrum_id: currentOrg?.spectrum_id,
      })

      if (res?.data && !res?.error) {
        setState({
          title: "",
          description: "",
          item_type: "armor",
          default_listing_id: "",
          listings: [],
        })

        issueAlert({
          message: t("MarketMultipleForm.submitted"),
          severity: "success",
        })

        navigate(`/market/multiple/${res.data.multiple_id}`)
      } else {
        issueAlert({
          message:
            t("MarketMultipleForm.failedSubmit") +
            ` ${res.error?.error || res.error?.data?.error || res.error}`,
          severity: "error",
        })
      }

      return false
    },
    [createListing, currentOrg?.spectrum_id, issueAlert, state, t, navigate],
  )

  const { data: uniqueListingResults } = useSearchMarketQuery({
    contractor_seller: currentOrg?.spectrum_id,
    listing_type: "unique",
  })

  const uniqueListings = uniqueListingResults?.listings || []

  return (
    // <FormControl component={Grid} item xs={12} container spacing={2}>
    <>
      <FormPaper title={t("MarketMultipleForm.about")}>
        <Grid item xs={12} lg={12}>
          <TextField
            fullWidth
            label={t("MarketMultipleForm.title")}
            id="order-title"
            value={state.title}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              setState({ ...state, title: event.target.value })
            }}
            color={"secondary"}
            aria-required="true"
            aria-describedby="multiple-title-help"
            inputProps={{
              "aria-label": t(
                "accessibility.multipleTitleInput",
                "Enter multiple listing title",
              ),
              maxLength: 100,
            }}
          />
          <div id="multiple-title-help" className="sr-only">
            {t(
              "accessibility.multipleTitleHelp",
              "Enter a descriptive title for your multiple market listing (required)",
            )}
          </div>
        </Grid>

        <Grid item xs={12} lg={12}>
          <SelectGameCategory
            onTypeChange={(value) =>
              setState({
                ...state,
                item_type: value,
              })
            }
            item_type={state.item_type}
          />
        </Grid>

        <Grid item xs={12}>
          <MarkdownEditor
            onChange={(value: string) => {
              setState({ ...state, description: value })
            }}
            value={state.description}
            TextFieldProps={{
              label: t("MarketMultipleForm.description"),
              helperText: t("MarketMultipleForm.helperText"),
              "aria-label": t(
                "accessibility.multipleDescriptionInput",
                "Enter multiple listing description",
              ),
              "aria-describedby": "multiple-description-help",
            }}
            variant={"vertical"}
          />
          <div id="multiple-description-help" className="sr-only">
            {t(
              "accessibility.multipleDescriptionHelp",
              "Provide a detailed description of your multiple market listing",
            )}
          </div>
        </Grid>
      </FormPaper>

      <FormPaper title={t("MarketMultipleForm.listings")}>
        <Grid item xs={12}>
          <Autocomplete
            // multiple
            disablePortal
            options={uniqueListings}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("MarketMultipleForm.defaultListing")}
                aria-label={t(
                  "accessibility.defaultListingInput",
                  "Select default listing",
                )}
                aria-describedby="default-listing-help"
              />
            )}
            onChange={(event, value) =>
              setState((s) => {
                if (value) {
                  if (s.listings.includes(value.listing_id)) {
                    return {
                      ...s,
                      default_listing_id: value.listing_id,
                    }
                  } else {
                    s.listings.push(value.listing_id)
                    return {
                      ...s,
                      default_listing_id: value.listing_id,
                      listings: s.listings,
                    }
                  }
                } else {
                  return s
                }
              })
            }
            value={
              uniqueListings.find(
                (l) => l.listing_id === state.default_listing_id,
              ) || null
            }
            color={"secondary"}
            aria-label={t(
              "accessibility.defaultListingSelector",
              "Default listing selector",
            )}
            aria-describedby="default-listing-help"
          />
          <div id="default-listing-help" className="sr-only">
            {t(
              "accessibility.defaultListingHelp",
              "Select the default listing to display for this multiple listing",
            )}
          </div>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            disablePortal
            options={uniqueListings}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("MarketMultipleForm.listingsToInclude")}
                aria-label={t(
                  "accessibility.listingsToIncludeInput",
                  "Select listings to include",
                )}
                aria-describedby="listings-include-help"
              />
            )}
            onChange={(event, value) =>
              setState((s) => ({
                ...s,
                listings: value.map((l) => l.listing_id),
              }))
            }
            value={state.listings
              .map((r) => uniqueListings.find((l) => l.listing_id === r)!)
              .filter((l) => l)}
            color={"secondary"}
            aria-label={t(
              "accessibility.listingsToIncludeSelector",
              "Listings to include selector",
            )}
            aria-describedby="listings-include-help"
          />
          <div id="listings-include-help" className="sr-only">
            {t(
              "accessibility.listingsIncludeHelp",
              "Select which individual listings to include in this multiple listing",
            )}
          </div>
        </Grid>
      </FormPaper>
      <Grid item xs={12} container justifyContent={"right"}>
        <LoadingButton
          size={"large"}
          variant="contained"
          color={"secondary"}
          type="submit"
          onClick={submitMarketListing}
          loading={isLoading}
          aria-label={t(
            "accessibility.submitMultipleListing",
            "Submit multiple listing",
          )}
          aria-describedby="submit-multiple-help"
        >
          {t("MarketMultipleForm.submit")}
          <span id="submit-multiple-help" className="sr-only">
            {t(
              "accessibility.submitMultipleHelp",
              "Submit your multiple market listing with the specified details",
            )}
          </span>
        </LoadingButton>
      </Grid>
    </>
    // </FormControl>
  )
}

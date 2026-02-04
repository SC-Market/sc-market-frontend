import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  GridProps,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { Section } from "../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { BACKEND_URL, PAYMENT_TYPES } from "../../util/constants"
import throttle from "lodash/throttle"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { orderIcons, Service, PaymentType } from "../../datatypes/Order"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { NumericFormat } from "react-number-format"
import { SelectPhotosArea } from "../../components/modal/SelectPhotosArea"
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useUploadServicePhotosMutation,
} from "../../store/services"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

function romanize(num: number) {
  if (isNaN(num)) return NaN
  const digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ]
  let roman = "",
    i = 3
  while (i--) {
    const digit = digits.pop()
    if (digit == null) break
    roman = (key[+digit + i * 10] || "") + roman
  }
  return Array(+digits.join("") + 1).join("M") + roman
}

interface StarmapObject {
  id: string
  code: string
  designation: string
  name: null | string
  star_system_id: string
  status: string
  type: string
  star_system: {
    id: string
    code: string
    name: null | string
    type: string
  }
}

export interface ServiceState {
  service_name: string
  service_description: string
  title: string
  rush: boolean
  description: string
  type: string
  collateral: number
  estimate: number
  offer: number
  payment_type: PaymentType
  departure: StarmapObject | null
  departureInput: string
  departChangeTimer: number
  destination: StarmapObject | null
  destinationInput: string
  destChangeTimer: number
  status: string
  photos: string[]
}

export function CreateServiceForm(props: GridProps & { service?: Service }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const [state, setState] = React.useState<ServiceState>({
    service_name: "",
    service_description: "",
    title: "",
    rush: false,
    description: "",
    type: "",
    collateral: 0,
    estimate: 0,
    offer: 0,
    payment_type: "one-time",
    departure: null,
    departureInput: "",
    departChangeTimer: Date.now(),
    destination: null,
    destinationInput: "",
    destChangeTimer: Date.now(),
    status: "active",
    photos: [],
  })

  useEffect(() => {
    if (props.service) {
      setState({
        ...props.service,
        estimate: 0,
        departure: null,
        departureInput: "",
        departChangeTimer: Date.now(),
        destination: null,
        destinationInput: "",
        destChangeTimer: Date.now(),
        type: props.service.kind,
        offer: props.service.cost || 0,
        payment_type: props.service.payment_type || "one-time",
      })
    }
  }, [props.service])

  // Watch for photo updates and sync local state
  useEffect(() => {
    if (props.service?.photos) {
      setState((prev) => ({
        ...prev,
        photos: props.service!.photos,
      }))
    }
  }, [props.service?.photos])

  const issueAlert = useAlertHook()

  const [departSuggest, setDepartSuggest] = useState<StarmapObject[]>([])
  const [destSuggest, setDestSuggest] = useState<StarmapObject[]>([])
  const [departTarget, setDepartTarget] = useState("")
  const [destTarget, setDestTarget] = useState("")
  const [departTargetObject, setDepartTargetObject] =
    useState<StarmapObject | null>(null)
  const [destTargetObject, setDestTargetObject] =
    useState<StarmapObject | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const navigate = useNavigate()

  const getSuggestions = React.useCallback(async (query: string) => {
    if (query.length < 3) {
      return []
    }

    const resp = await fetch(
      `${BACKEND_URL}/api/starmap/search/${encodeURIComponent(query)}`,
      {
        method: "GET",
        credentials: "include",
      },
    )
    const data = await resp.json()

    const extended: StarmapObject[] = []

    await Promise.all(
      data.objects.resultset.map(async (obj: StarmapObject) => {
        if (obj.type === "SATELLITE") {
          const planetNum = obj.designation.replace(/\D/g, "")
          const planetDes = `${obj.star_system.name} ${romanize(
            parseInt(planetNum),
          )}`

          extended.push(...(await getSuggestions(planetDes)))
        }
      }),
    )
    extended.push(...data.objects.resultset)

    return extended
  }, [])

  const retrieveDepart = React.useMemo(
    () =>
      throttle(async (query: string) => {
        const suggestions = await getSuggestions(query)
        setDepartSuggest(suggestions)
      }, 400),
    [getSuggestions],
  )
  const retrieveDest = React.useMemo(
    () =>
      throttle(async (query: string) => {
        const suggestions = await getSuggestions(query)
        setDestSuggest(suggestions)
      }, 400),
    [getSuggestions],
  )

  const handleFileUpload = useCallback((files: File[]) => {
    console.log(`[Service Photo Upload] Files selected:`, {
      count: files.length,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    })
    setUploadedFiles((prev) => [...prev, ...files])
  }, [])

  useEffect(() => {
    retrieveDepart(departTarget)
  }, [departTarget, retrieveDepart])
  useEffect(() => {
    retrieveDest(destTarget)
  }, [destTarget, retrieveDest])

  const [
    createService, // This is the mutation trigger
  ] = useCreateServiceMutation()

  const [
    updateService, // This is the mutation trigger
  ] = useUpdateServiceMutation()

  const [uploadServicePhotos, { isLoading: isUploadingPhotos }] =
    useUploadServicePhotosMutation()

  const submitService = useCallback(
    async (event: any) => {
      // event.preventDefault();

      // Combine existing photos with uploaded files
      const allPhotos = [...state.photos]

      console.log(`[Service Photo Upload] Submitting service:`, {
        existing_photos: state.photos,
        uploaded_files: uploadedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        photos_to_send: allPhotos, // Only normal photo URLs, not uploaded file names
        service_name: state.service_name,
        service_type: props.service ? "update" : "create",
      })

      if (props.service) {
        console.log(
          `[Service Photo Upload] Updating service ${props.service.service_id}`,
        )

        const serviceId = props.service.service_id // Store service ID for use in async callbacks

        updateService({
          service_id: serviceId,
          body: {
            service_name: state.service_name,
            service_description: state.service_description,
            title: state.title,
            rush: state.rush,
            description: state.description,
            kind: state.type, // ? state.type : null,
            collateral: state.collateral,
            departure: departTargetObject ? departTargetObject.code : null,
            destination: destTargetObject ? destTargetObject.code : null,
            cost: state.offer,
            payment_type: state.payment_type,
            contractor: currentOrg?.spectrum_id,
            status: state.status,
            photos: allPhotos,
          },
        })
          .unwrap()
          .then(async () => {
            console.log(
              `[Service Photo Upload] Service update successful for ${serviceId}`,
            )

            // Upload any pending files if they exist
            if (uploadedFiles.length > 0) {
              console.log(
                `[Service Photo Upload] Uploading photos for updated service ${serviceId}`,
              )

              uploadServicePhotos({
                service_id: serviceId,
                photos: uploadedFiles,
              })
                .unwrap()
                .then((uploadResult) => {
                  console.log(
                    `[Service Photo Upload] Photos uploaded successfully:`,
                    {
                      service_id: serviceId,
                      result: uploadResult,
                      photo_urls: uploadResult.photos,
                    },
                  )
                  // Clear uploaded files after successful photo upload
                  setUploadedFiles([])
                })
                .catch((uploadError) => {
                  console.error(
                    `[Service Photo Upload] Photo upload failed:`,
                    uploadError,
                  )
                  // Issue alert for failed photo upload
                  issueAlert(uploadError)
                  // Continue with redirect even if photo upload fails
                })
            }

            setState({
              service_name: "",
              service_description: "",
              title: "",
              rush: false,
              description: "",
              type: "",
              collateral: 0,
              estimate: 0,
              offer: 0,
              payment_type: "one-time",
              departure: null,
              departureInput: "",
              departChangeTimer: Date.now(),
              destination: null,
              destinationInput: "",
              destChangeTimer: Date.now(),
              status: "active",
              photos: [],
            })

            issueAlert({
              message: t("CreateServiceForm.alert.submitted"),
              severity: "success",
            })

            navigate("/order/services")
          })
          .catch((err) => {
            console.error(
              `[Service Photo Upload] Service update failed for ${serviceId}:`,
              {
                service_id: serviceId,
                error: err,
                error_message: (err as any)?.message || "Unknown error",
                error_status: (err as any)?.status || "No status",
              },
            )
            issueAlert(err)
          })
      } else {
        console.log(`[Service Photo Upload] Creating new service`)
        createService({
          service_name: state.service_name,
          service_description: state.service_description,
          title: state.title,
          rush: state.rush,
          description: state.description,
          kind: state.type, // ? state.type : null,
          collateral: state.collateral,
          departure: departTargetObject ? departTargetObject.code : null,
          destination: destTargetObject ? destTargetObject.code : null,
          cost: state.offer,
          payment_type: state.payment_type,
          contractor: currentOrg?.spectrum_id,
          status: state.status,
          photos: allPhotos,
        })
          .unwrap()
          .then(async (result) => {
            const serviceId = result.service_id
            console.log(
              `[Service Photo Upload] Service creation successful: ${serviceId}`,
            )

            // Upload any pending files if they exist
            if (uploadedFiles.length > 0) {
              console.log(
                `[Service Photo Upload] Uploading photos for new service ${serviceId}`,
              )

              uploadServicePhotos({
                service_id: serviceId,
                photos: uploadedFiles,
              })
                .unwrap()
                .then((uploadResult) => {
                  console.log(
                    `[Service Photo Upload] Photos uploaded successfully:`,
                    {
                      service_id: serviceId,
                      result: uploadResult,
                      photo_urls: uploadResult.photos,
                    },
                  )
                })
                .catch((uploadErr) => {
                  issueAlert(uploadErr)
                })
            }

            setState({
              service_name: "",
              service_description: "",
              title: "",
              rush: false,
              description: "",
              type: "",
              collateral: 0,
              estimate: 0,
              offer: 0,
              payment_type: "one-time",
              departure: null,
              departureInput: "",
              departChangeTimer: Date.now(),
              destination: null,
              destinationInput: "",
              destChangeTimer: Date.now(),
              status: "active",
              photos: [],
            })

            // Clear uploaded files after successful submission
            setUploadedFiles([])

            issueAlert({
              message: t("CreateServiceForm.alert.submitted"),
              severity: "success",
            })

            // Redirect to the service edit page
            navigate(`/order/service/${serviceId}/edit`)
          })
          .catch((err) => {
            issueAlert(err)
          })
      }

      return false
    },
    [
      createService,
      currentOrg?.spectrum_id,
      departTargetObject,
      destTargetObject,
      props.service,
      issueAlert,
      state.collateral,
      state.description,
      state.offer,
      state.payment_type,
      state.rush,
      state.status,
      state.service_description,
      state.service_name,
      state.title,
      state.type,
      state.photos,
      uploadedFiles,
      updateService,
      uploadServicePhotos,
      t, // add t to dependencies
    ],
  )

  return (
    // <FormControl component={Grid} item xs={12} container spacing={2}>
    <>
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("CreateServiceForm.serviceDetails")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid item xs={12} lg={12}>
            <TextField
              fullWidth
              label={t("CreateServiceForm.serviceName") + "*"}
              id="service-name"
              value={state.service_name}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setState({ ...state, service_name: event.target.value })
              }}
              color={"secondary"}
              aria-required="true"
              aria-describedby="service-name-help"
              inputProps={{
                "aria-label": t(
                  "accessibility.serviceNameInput",
                  "Enter service name",
                ),
                maxLength: 100,
              }}
            />
            <div id="service-name-help" className="sr-only">
              {t(
                "accessibility.serviceNameHelp",
                "Enter a descriptive name for your service (required)",
              )}
            </div>
          </Grid>

          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setState({
                        ...state,
                        status: event.target.checked ? "active" : "inactive",
                      })
                    }}
                    checked={state.status === "active"}
                    aria-label={t(
                      "accessibility.serviceStatusToggle",
                      "Toggle service status",
                    )}
                    aria-describedby="service-status-help"
                  />
                }
                label={
                  state.status === "active"
                    ? t("CreateServiceForm.serviceActive")
                    : t("CreateServiceForm.serviceInactive")
                }
              />
              <div id="service-status-help" className="sr-only">
                {t(
                  "accessibility.serviceStatusHelp",
                  "Toggle to activate or deactivate your service",
                )}
              </div>
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <MarkdownEditor
              value={state.service_description}
              variant={"vertical"}
              TextFieldProps={{
                label: t("CreateServiceForm.serviceDescription"),
                helperText: t("CreateServiceForm.serviceDescriptionHelper"),
                "aria-describedby": "service-description-help",
                inputProps: {
                  "aria-label": t(
                    "accessibility.serviceDescriptionInput",
                    "Enter service description",
                  ),
                },
              }}
              onChange={(value) =>
                setState({ ...state, service_description: value })
              }
            />
            <div id="service-description-help" className="sr-only">
              {t(
                "accessibility.serviceDescriptionHelp",
                "Provide a detailed description of your service",
              )}
            </div>
          </Grid>

          <Grid item xs={12}>
            <SelectPhotosArea
              photos={state.photos}
              setPhotos={(photos) =>
                setState((state) => ({ ...state, photos }))
              }
              onFileUpload={handleFileUpload}
              showUploadButton={true}
              pendingFiles={uploadedFiles}
              onRemovePendingFile={(file) => {
                setUploadedFiles((prev) => prev.filter((f) => f !== file))
              }}
              onAlert={(severity, message) => issueAlert({ severity, message })}
            />
            {!props.service && uploadedFiles.length > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontStyle: "italic" }}
              >
                {t("CreateServiceForm.photoUploadNote")}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Section>
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("CreateServiceForm.orderServiceDetails")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid item xs={12} lg={12}>
            <TextField
              fullWidth
              label={t("CreateServiceForm.title") + "*"}
              id="order-title"
              value={state.title}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setState({ ...state, title: event.target.value })
              }}
              color={"secondary"}
              aria-required="true"
              aria-describedby="order-title-help"
              inputProps={{
                "aria-label": t(
                  "accessibility.orderTitleInput",
                  "Enter order title",
                ),
                maxLength: 100,
              }}
            />
            <div id="order-title-help" className="sr-only">
              {t(
                "accessibility.orderTitleHelp",
                "Enter a descriptive title for your order (required)",
              )}
            </div>
          </Grid>

          <Grid item xs={12} lg={10}>
            <TextField
              fullWidth
              select
              label={t("CreateServiceForm.typeOptional")}
              id="order-type"
              value={state.type}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setState({ ...state, type: event.target.value })
              }}
              color={"secondary"}
              aria-describedby="order-type-help"
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
                "aria-label": t(
                  "accessibility.selectOrderType",
                  "Select order type",
                ),
              }}
            >
              {Object.keys(orderIcons).map((k) => (
                <MenuItem value={k} key={k}>
                  {k}
                </MenuItem>
              ))}
            </TextField>
            <div id="order-type-help" className="sr-only">
              {t(
                "accessibility.orderTypeOptionalHelp",
                "Select the type of order (optional)",
              )}
            </div>
          </Grid>

          <Grid item xs={2} container alignItems={"center"}>
            <FormControlLabel
              control={
                <Checkbox
                  // checked={state.checkedB}
                  onChange={(
                    event: React.ChangeEvent<{ checked: boolean }>,
                  ) => {
                    setState({ ...state, rush: event.target.checked })
                  }}
                  color={"secondary"}
                  name="Rush"
                  aria-label={t(
                    "accessibility.rushOrderToggle",
                    "Toggle rush order",
                  )}
                  aria-describedby="rush-order-help"
                />
              }
              label={t("CreateServiceForm.rush")}
            />
            <div id="rush-order-help" className="sr-only">
              {t(
                "accessibility.rushOrderHelp",
                "Check this box if you need this order completed urgently",
              )}
            </div>
          </Grid>

          <Grid item xs={12}>
            <TextField
              multiline
              fullWidth={true}
              label={t("CreateServiceForm.description")}
              id="description"
              helperText={t("CreateServiceForm.descriptionHelper")}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setState({ ...state, description: event.target.value })
              }}
              value={state.description}
              minRows={4}
              maxRows={4}
              color={"secondary"}
              aria-describedby="description-help"
              inputProps={{
                "aria-label": t(
                  "accessibility.orderDescriptionInput",
                  "Enter order description",
                ),
                maxLength: 1000,
              }}
            />
            <div id="description-help" className="sr-only">
              {t(
                "accessibility.service.orderDescriptionHelp",
                "Provide a detailed description of what you need",
              )}
            </div>
          </Grid>
        </Grid>
      </Section>
      {/*<Section xs={12}>*/}
      {/*    <Grid item xs={12} lg={4}>*/}
      {/*        <Typography variant={'h6'} align={'left'} color={'text.secondary'}*/}
      {/*                    sx={{fontWeight: 'bold'}}>*/}
      {/*            Location*/}
      {/*        </Typography>*/}
      {/*    </Grid>*/}
      {/*    <Grid item xs={12} lg={8} container spacing={2}>*/}
      {/*        <Grid item xs={12} lg={12}>*/}
      {/*            <Autocomplete*/}
      {/*                id="departure-select"*/}
      {/*                options={departSuggest}*/}
      {/*                getOptionLabel={(option: StarmapObject) => {*/}
      {/*                    console.log(option)*/}
      {/*                    if (option.type === "SATELLITE") {*/}
      {/*                        const planetNum = option.designation.replace(/\D/g, '');*/}
      {/*                        const planetDes = `${option.star_system.name} ${romanize(parseInt(planetNum))}`*/}
      {/*                        const planet = departSuggest.find((obj) => obj.designation === planetDes)*/}

      {/*                        return `${option.name || option.designation} - ${planet ? planet.name : ''} - ${option.star_system.name} (${option.designation})`*/}
      {/*                    } else if (option.type === "STAR") {*/}
      {/*                        return `${option.name || option.designation} (${option.designation})`*/}
      {/*                    }*/}

      {/*                    return `${option.name || option.designation} - ${option.star_system.name} (${option.designation})`*/}
      {/*                }}*/}

      {/*                value={departTargetObject}*/}
      {/*                onChange={(event: any, newValue: StarmapObject | null) => {*/}
      {/*                    setDepartTargetObject(newValue);*/}
      {/*                }}*/}
      {/*                inputValue={departTarget}*/}
      {/*                onInputChange={(event, newInputValue) => {*/}
      {/*                    setDepartTarget(newInputValue);*/}
      {/*                }}*/}

      {/*                renderInput={(params) => {*/}
      {/*                    return <TextField*/}
      {/*                        {...params}*/}
      {/*                        label="Source (Optional)"*/}
      {/*                        color={'secondary'}*/}
      {/*                        SelectProps={{*/}
      {/*                            IconComponent: KeyboardArrowDownRoundedIcon*/}
      {/*                        }}*/}
      {/*                        sx={{*/}
      {/*                            '& .MuiSelect-icon': {*/}
      {/*                                fill: 'white',*/}
      {/*                            },*/}
      {/*                        }}*/}

      {/*                        helperText={"For Escort and Transport, for example, " +*/}
      {/*                            "from where to where will the order occur? " +*/}
      {/*                            "For Support, where should the contractor find you?"}*/}
      {/*                    />*/}
      {/*                }}*/}
      {/*            />*/}
      {/*        </Grid>*/}

      {/*        <Grid item xs={12} lg={12}>*/}
      {/*            <Autocomplete*/}
      {/*                id="destination-select"*/}
      {/*                options={destSuggest}*/}
      {/*                getOptionLabel={(option: StarmapObject) => {*/}
      {/*                    if (option.type === "SATELLITE") {*/}
      {/*                        const planetNum = option.designation.replace(/\D/g, '');*/}
      {/*                        const planetDes = `${option.star_system.name} ${romanize(parseInt(planetNum))}`*/}
      {/*                        const planet = destSuggest.find((obj) => obj.designation === planetDes)*/}

      {/*                        return `${option.name || option.designation} - ${planet ? planet.name : ''} - ${option.star_system.name} (${option.designation})`*/}
      {/*                    } else if (option.type === "STAR") {*/}
      {/*                        return `${option.name || option.designation} (${option.designation})`*/}
      {/*                    }*/}

      {/*                    return `${option.name || option.designation} - ${option.star_system.name} (${option.designation})`*/}
      {/*                }}*/}

      {/*                value={destTargetObject}*/}
      {/*                onChange={(event: any, newValue: StarmapObject | null) => {*/}
      {/*                    setDestTargetObject(newValue);*/}
      {/*                }}*/}
      {/*                inputValue={destTarget}*/}
      {/*                onInputChange={(event, newInputValue) => {*/}
      {/*                    setDestTarget(newInputValue);*/}
      {/*                }}*/}

      {/*                renderInput={(params) => {*/}
      {/*                    return <TextField*/}
      {/*                        {...params}*/}
      {/*                        label="Destination (Optional)"*/}
      {/*                        color={'secondary'}*/}
      {/*                        SelectProps={{*/}
      {/*                            IconComponent: KeyboardArrowDownRoundedIcon*/}
      {/*                        }}*/}
      {/*                        sx={{*/}
      {/*                            '& .MuiSelect-icon': {*/}
      {/*                                fill: 'white',*/}
      {/*                            },*/}
      {/*                        }}*/}
      {/*                    />*/}
      {/*                }}*/}
      {/*            />*/}
      {/*        </Grid>*/}

      {/*    </Grid>*/}
      {/*</Section>*/}
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("CreateServiceForm.costs")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid item xs={12}>
            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={async (values, sourceInfo) => {
                setState({
                  ...state,
                  collateral: values.floatValue || 0,
                })
              }}
              fullWidth={true}
              label={t("CreateServiceForm.collateralOptional")}
              id="collateral"
              color={"secondary"}
              value={state.collateral}
              type={"tel"}
              helperText={t("CreateServiceForm.collateralHelper")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">{`aUEC`}</InputAdornment>
                ),
                inputMode: "numeric",
              }}
              aria-describedby="collateral-help"
              inputProps={{
                "aria-label": t(
                  "accessibility.collateralInput",
                  "Enter collateral amount",
                ),
                pattern: "[0-9]*",
              }}
            />
            <div id="collateral-help" className="sr-only">
              {t(
                "accessibility.collateralHelp",
                "Enter the collateral amount in aUEC (optional)",
              )}
            </div>
          </Grid>

          {/*<Grid item xs={12}>*/}
          {/*    <TextField multiline disabled fullWidth={true} label={"Estimated Cost"}*/}
          {/*               id="estimated-cost"*/}
          {/*               value={*/}
          {/*                   `${((state.estimate + state.collateral * 0.05) * (state.rush ? 1.3 : 1)).toLocaleString(*/}
          {/*                       undefined*/}
          {/*                   )} aUEC`*/}
          {/*               }*/}
          {/*               variant={'filled'}*/}
          {/*    />*/}
          {/*</Grid>*/}

          <Grid item xs={12}>
            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={async (values, sourceInfo) => {
                setState({
                  ...state,
                  offer: values.floatValue || 0,
                })
              }}
              fullWidth={true}
              label={t("CreateServiceForm.cost")}
              id="offer"
              color={"secondary"}
              value={state.offer}
              type={"tel"}
              helperText={t("CreateServiceForm.costHelper")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">{`aUEC`}</InputAdornment>
                ),
                inputMode: "numeric",
              }}
              aria-required="true"
              aria-describedby="offer-help"
              inputProps={{
                "aria-label": t(
                  "accessibility.offerInput",
                  "Enter offer amount",
                ),
                pattern: "[0-9]*",
              }}
            />
            <div id="offer-help" className="sr-only">
              {t(
                "accessibility.offerHelp",
                "Enter your offer amount in aUEC (required)",
              )}
            </div>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label={t("CreateServiceForm.paymentType")}
              value={state.payment_type}
              onChange={(event: any) => {
                setState({ ...state, payment_type: event.target.value })
              }}
              fullWidth
              aria-required="true"
              aria-describedby="payment-type-help"
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
                "aria-label": t(
                  "accessibility.selectPaymentType",
                  "Select payment type",
                ),
              }}
            >
              {PAYMENT_TYPES.map((paymentType) => (
                <MenuItem key={paymentType.value} value={paymentType.value}>
                  {t(paymentType.translationKey)}
                </MenuItem>
              ))}
            </TextField>
            <div id="payment-type-help" className="sr-only">
              {t(
                "accessibility.service.paymentTypeHelp",
                "Select how you want to handle payment for this service (required)",
              )}
            </div>
          </Grid>
        </Grid>
      </Section>
      <Grid item xs={12} container justifyContent={"right"}>
        <Button
          size={"large"}
          variant="contained"
          color={"secondary"}
          type="submit"
          disabled={isUploadingPhotos}
          onClick={submitService}
          aria-label={t("accessibility.submitService", "Submit service")}
          aria-describedby="submit-service-help"
        >
          {isUploadingPhotos
            ? t("CreateServiceForm.uploadingPhotos")
            : props.service
              ? t("CreateServiceForm.update")
              : t("CreateServiceForm.submit")}
          <span id="submit-service-help" className="sr-only">
            {t(
              "accessibility.submitServiceHelp",
              "Submit your service with the specified details and pricing",
            )}
          </span>
        </Button>
      </Grid>
    </>
    // </FormControl>
  )
}

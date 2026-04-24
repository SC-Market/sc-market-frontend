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
import React from "react"
import { Section } from "../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { PAYMENT_TYPES } from "../../util/constants"
import { orderIcons } from "../../features/orders/components/orderIcons"
import type { Service } from "../../features/orders/domain/types"
import { MarkdownEditor } from "../../components/markdown/Markdown.lazy"
import { NumericFormat } from "react-number-format"
import { SelectPhotosArea } from "../../components/modal/SelectPhotosArea"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  useCreateServiceForm,
  type ServiceFormState,
} from "../../features/orders/hooks/useCreateServiceForm"

export type { ServiceFormState as ServiceState }

export function CreateServiceForm(props: GridProps & { service?: Service }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const {
    state, setState,
    departSuggest, destSuggest,
    departTarget, setDepartTarget,
    destTarget, setDestTarget,
    departTargetObject, setDepartTargetObject,
    destTargetObject, setDestTargetObject,
    uploadedFiles, handleFileUpload, removePendingFile,
    isUploadingPhotos,
    submitService,
    issueAlert,
  } = useCreateServiceForm(props.service)

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
                removePendingFile(file)
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

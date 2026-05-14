import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Grid,
  GridProps,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import React from "react"
import { Section } from "../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { BACKEND_URL, PAYMENT_TYPES } from "../../util/constants"
import { orderIcons } from "../../features/orders/components/orderIcons"
import type { Service } from "../../features/orders/domain/types"
import LoadingButton from "@mui/lab/LoadingButton"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { CheckCircle, Warning } from "@mui/icons-material"
import { AvailabilitySelector } from "../../components/time/AvailabilitySelector"
import { OrderLimitsDisplay } from "../../components/orders/OrderLimitsDisplay"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import { useCreateOrderForm } from "../../features/orders/hooks/useCreateOrderForm"

// Helper component for Availability Modal that uses BottomSheet on mobile
function AvailabilityModalWrapper(props: {
  open: boolean
  onClose: () => void
  title: string
  onSave: (selections: boolean[]) => void
  initialSelections: boolean[]
}) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()

  if (isMobile) {
    return (
      <BottomSheet
        open={props.open}
        onClose={props.onClose}
        title={props.title}
        maxHeight="90vh"
      >
        <Box sx={{ mt: 1 }}>
          <AvailabilitySelector
            onSave={props.onSave}
            initialSelections={props.initialSelections}
          />
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={props.onClose}>
            {t("accessibility.cancel", "Cancel")}
          </Button>
        </Box>
      </BottomSheet>
    )
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="availability-modal-title"
    >
      <DialogTitle id="availability-modal-title">{props.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <AvailabilitySelector
            onSave={props.onSave}
            initialSelections={props.initialSelections}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>
          {t("accessibility.cancel", "Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const CreateOrderFormComponent = React.forwardRef<
  HTMLDivElement,
  GridProps & {
    contractor_id?: string | null
    assigned_to?: string | null
    service?: Service
  }
>((props, ref) => {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const {
    state, setState,
    isLoading,
    services, service, setService,
    availabilityRequirement, hasAvailabilitySet, formDisabled,
    isAvailabilityModalOpen, setIsAvailabilityModalOpen,
    availabilitySelections, handleSaveAvailability,
    orderLimits, sellerName,
    submitOrder, issueAlert,
  } = useCreateOrderForm({
    contractor_id: props.contractor_id,
    assigned_to: props.assigned_to,
    service: props.service,
  })

  return (
    // <FormControl component={Grid} item xs={12} container spacing={2}>
    <>
      {/* Availability Requirement Banner */}
      {availabilityRequirement && (
        <Grid item xs={12}>
          <Alert
            severity={hasAvailabilitySet ? "success" : "warning"}
            icon={hasAvailabilitySet ? <CheckCircle /> : <Warning />}
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {hasAvailabilitySet
                ? t("AvailabilityRequirement.set")
                : t("AvailabilityRequirement.required")}
            </AlertTitle>
            <Box>
              {hasAvailabilitySet ? (
                <>
                  {t("AvailabilityRequirement.setMessage", {
                    sellerName,
                  })}
                  <Button
                    size="small"
                    onClick={() => setIsAvailabilityModalOpen(true)}
                    sx={{ mt: 1, ml: 1 }}
                  >
                    {t("availability.edit", "Edit")}
                  </Button>
                </>
              ) : (
                <>
                  {t("AvailabilityRequirement.requiredMessage", {
                    sellerName,
                  })}
                  <Box mt={1}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setIsAvailabilityModalOpen(true)}
                    >
                      {t("AvailabilityRequirement.setAvailability")}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Alert>
        </Grid>
      )}

      {/* Order Limits Display */}
      {orderLimits && (
        <Grid item xs={12}>
          <OrderLimitsDisplay
            limits={orderLimits}
            currentSize={0} // Service orders have no market listings
            currentValue={state.offer}
            showValidation={true}
          />
        </Grid>
      )}

      {/* Availability Modal */}
      <AvailabilityModalWrapper
        open={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title={`${t("availability.select_availability")} - ${sellerName}`}
        onSave={handleSaveAvailability}
        initialSelections={availabilitySelections}
      />

      {services && !!services.length && !props.service && (
        <Section xs={12}>
          <Grid item xs={12} lg={4}>
            <Typography
              variant={"h6"}
              align={"left"}
              color={"text.secondary"}
              sx={{ fontWeight: "bold" }}
            >
              {t("CreateOrderForm.services")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            lg={8}
            container
            spacing={theme.layoutSpacing.compact}
          >
            <Grid item xs={12} lg={12}>
              <TextField
                fullWidth
                select
                label={t("CreateOrderForm.selectServiceOptional")}
                id="order-service"
                value={service?.service_name}
                onChange={(event: React.ChangeEvent<{ value: string }>) => {
                  if (event.target.value === "") {
                    setService(null)
                  } else {
                    setService(
                      (services || []).find(
                        (t) => t.service_name === event.target.value,
                      )!,
                    )
                  }
                }}
                color={"secondary"}
                SelectProps={{
                  IconComponent: KeyboardArrowDownRoundedIcon,
                  "aria-label": t(
                    "accessibility.selectService",
                    "Select service",
                  ),
                  MenuProps: {
                    disablePortal: false,
                    slotProps: {
                      paper: { sx: { zIndex: 1300 } },
                    },
                  },
                }}
                aria-describedby="order-service-help"
              >
                <MenuItem value={""}>{t("CreateOrderForm.noService")}</MenuItem>
                {(services || []).map((t) => (
                  <MenuItem value={t.service_name} key={t.service_name}>
                    {t.service_name}
                  </MenuItem>
                ))}
              </TextField>
              <div id="order-service-help" className="sr-only">
                {t(
                  "accessibility.selectServiceHelp",
                  "Choose a service to base this order on, or select no service",
                )}
              </div>
            </Grid>
          </Grid>
        </Section>
      )}
      <Section xs={12} ref={ref}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("CreateOrderForm.about")}
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
              label={t("CreateOrderForm.title") + "*"}
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
              label={t("CreateOrderForm.type") + "*"}
              id="order-type"
              value={state.type}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setState({ ...state, type: event.target.value })
              }}
              color={"secondary"}
              aria-required="true"
              aria-describedby="order-type-help"
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
                "aria-label": t(
                  "accessibility.selectOrderType",
                  "Select order type",
                ),
                MenuProps: {
                  disablePortal: false,
                  slotProps: {
                    paper: { sx: { zIndex: 1300 } },
                  },
                },
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
                "accessibility.orderTypeHelp",
                "Select the type of order you want to create (required)",
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
              label={t("CreateOrderForm.rush")}
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
              label={t("CreateOrderForm.description") + "*"}
              id="description"
              helperText={t("CreateOrderForm.descriptionHelper")}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setState({ ...state, description: event.target.value })
              }}
              value={state.description}
              minRows={4}
              maxRows={4}
              color={"secondary"}
              aria-required="true"
              aria-describedby="description-help"
              inputProps={{
                "aria-label": t(
                  "accessibility.orderDescriptionInput",
                  "Enter order description",
                ),
                maxLength: 1000,
              }}
              // InputProps={{sx: {color: 'inherit'}}}
            />
            <div id="description-help" className="sr-only">
              {t(
                "accessibility.order.orderDescriptionHelp",
                "Provide a detailed description of what you need (required)",
              )}
            </div>
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
            {t("CreateOrderForm.costs")}
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
                  collateral: +(values.floatValue || 0),
                })
              }}
              fullWidth={true}
              label={t("CreateOrderForm.collateralOptional")}
              id="collateral"
              color={"secondary"}
              value={state.collateral}
              type={"tel"}
              helperText={t("CreateOrderForm.collateralHelper")}
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
                console.log(values)
                setState({
                  ...state,
                  offer: values.floatValue || 0,
                })
              }}
              fullWidth={true}
              label={t("CreateOrderForm.aUECOffer")}
              id="offer"
              color={"secondary"}
              value={state.offer}
              type={"tel"}
              helperText={t("CreateOrderForm.aUECOfferHelper")}
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
              label={t("CreateOrderForm.paymentType")}
              value={state.payment_type}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
                MenuProps: {
                  disablePortal: false,
                  slotProps: {
                    paper: { sx: { zIndex: 1300 } },
                  },
                },
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
                "accessibility.order.paymentTypeHelp",
                "Select how you want to handle payment for this order (required)",
              )}
            </div>
          </Grid>
        </Grid>
      </Section>
      <Grid item xs={12} container justifyContent={"right"}>
        <LoadingButton
          loading={isLoading}
          size={"large"}
          variant="contained"
          color={"secondary"}
          type="submit"
          onClick={submitOrder}
          disabled={formDisabled}
          aria-label={t("accessibility.submitOrder", "Submit order")}
          aria-describedby="submit-order-help"
        >
          {formDisabled
            ? t("AvailabilityRequirement.submitDisabled")
            : t("CreateOrderForm.submit")}
          <span id="submit-order-help" className="sr-only">
            {t(
              "accessibility.submitOrderHelp",
              "Submit your order with the specified details and pricing",
            )}
          </span>
        </LoadingButton>
      </Grid>
    </>
    // </FormControl>
  )
})

CreateOrderFormComponent.displayName = "CreateOrderForm"

export { CreateOrderFormComponent as CreateOrderForm }

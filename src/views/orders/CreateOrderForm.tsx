import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  GridProps,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import React from "react"
import { Section } from "../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { orderIcons } from "../../features/orders/components/orderIcons"
import type { Service } from "../../features/orders/domain/types"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { CheckCircleRounded, WarningRounded } from "@mui/icons-material"
import { OrderLimitsDisplay } from "../../components/orders/OrderLimitsDisplay"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useCreateOrderForm } from "../../features/orders/hooks/useCreateOrderForm"
import { CreateOrderCostsSection } from "./CreateOrderCostsSection"
import { AvailabilityModalWrapper } from "./AvailabilityModalWrapper"

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
    state,
    setState,
    isLoading,
    services,
    service,
    setService,
    availabilityRequirement,
    hasAvailabilitySet,
    formDisabled,
    isAvailabilityModalOpen,
    setIsAvailabilityModalOpen,
    availabilitySelections,
    handleSaveAvailability,
    orderLimits,
    sellerName,
    submitOrder,
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
            icon={
              hasAvailabilitySet ? <CheckCircleRounded /> : <WarningRounded />
            }
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
      <CreateOrderCostsSection state={state} setState={setState} />
      <Grid item xs={12} container justifyContent={"right"}>
        <LoadingButton
          loading={isLoading}
          size={"large"}
          variant="contained"
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

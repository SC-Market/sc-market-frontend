import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Section } from "../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { BACKEND_URL, PAYMENT_TYPES } from "../../util/constants"
import throttle from "lodash/throttle"
import { useCreateOrderMutation } from "../../store/orders"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { orderIcons, Service, PaymentType } from "../../datatypes/Order"
import { useNavigate } from "react-router-dom"
import LoadingButton from "@mui/lab/LoadingButton"
import { NumericFormat } from "react-number-format"
import {
  useGetServicesContractorQuery,
  useGetServicesQuery,
} from "../../store/services"
import { PublicContract } from "../../store/public_contracts"
import { useTranslation } from "react-i18next"
import {
  useCheckContractorAvailabilityRequirementQuery,
  useCheckUserAvailabilityRequirementQuery,
  useCheckContractorOrderLimitsQuery,
  useCheckUserOrderLimitsQuery,
} from "../../store/orderSettings"
import {
  useProfileGetAvailabilityQuery,
  useProfileUpdateAvailabilityMutation,
} from "../../store/profile"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { AvailabilitySelector } from "../../components/time/AvailabilitySelector"
import { convertAvailability } from "../../pages/availability/Availability"
import { OrderLimitsDisplay } from "../../components/orders/OrderLimitsDisplay"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../../components/mobile/BottomSheet"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import { GridProps } from '@mui/material/Grid';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Announcement from '@mui/icons-material/Announcement';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HourglassTop from '@mui/icons-material/HourglassTop';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import Warning from '@mui/icons-material/Warning';

// Helper component for Availability Modal that uses BottomSheet on mobile
function AvailabilityModalWrapper(props: {
  open: boolean
  onClose: () => void
  title: string
  onSave: (selections: any) => void
  initialSelections: any
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

interface WorkRequestState {
  title: string
  rush: boolean
  description: string
  type: string
  collateral: number
  estimate: number
  offer: number
  service_id?: string | null
  payment_type: PaymentType
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
  const [state, setState] = React.useState<WorkRequestState>({
    title: "",
    rush: false,
    description: "",
    type: "Escort",
    collateral: 0,
    estimate: 0,
    offer: 0,
    service_id: null,
    payment_type: "one-time",
  })

  const issueAlert = useAlertHook()

  const [
    createOrder, // This is the mutation trigger
    { isLoading },
  ] = useCreateOrderMutation()

  const { data: userServices } = useGetServicesQuery(props.assigned_to!, {
    skip: !props.assigned_to,
  })
  const { data: contractorServices } = useGetServicesContractorQuery(
    props.contractor_id!,
    { skip: !props.contractor_id },
  )
  const services = useMemo(
    () => userServices || contractorServices,
    [contractorServices, userServices],
  )

  const [service, setService] = useState<Service | null>(props.service || null)

  // Check availability requirement - check both contractor and assigned user
  const { data: contractorRequirement, refetch: refetchContractorRequirement } =
    useCheckContractorAvailabilityRequirementQuery(props.contractor_id!, {
      skip: !props.contractor_id,
    })

  const { data: userRequirement, refetch: refetchUserRequirement } =
    useCheckUserAvailabilityRequirementQuery(props.assigned_to!, {
      skip: !props.assigned_to,
    })

  // If either requires availability, enforce it
  const availabilityRequirement = useMemo(() => {
    if (contractorRequirement?.required) {
      return contractorRequirement
    }
    if (userRequirement?.required) {
      return userRequirement
    }
    // If neither requires, return undefined
    return undefined
  }, [contractorRequirement, userRequirement])

  // Get user's current availability - check contractor-specific if contractor, global if user seller
  const [currentOrg] = useCurrentOrg()
  const { data: userAvailability } = useProfileGetAvailabilityQuery(
    props.contractor_id ? currentOrg?.spectrum_id || null : null,
  )

  // Check order limits
  const { data: contractorLimits } = useCheckContractorOrderLimitsQuery(
    props.contractor_id!,
    { skip: !props.contractor_id },
  )
  const { data: userLimits } = useCheckUserOrderLimitsQuery(
    props.assigned_to!,
    {
      skip: !props.assigned_to,
    },
  )

  // Use contractor limits if available, otherwise user limits
  const orderLimits = contractorLimits || userLimits

  // Check if availability is set
  const hasAvailabilitySet = useMemo(() => {
    if (!availabilityRequirement?.required) return true
    // The backend already checked this, so we can use the hasAvailability from the requirement check
    return availabilityRequirement.hasAvailability
  }, [availabilityRequirement])

  const formDisabled = availabilityRequirement?.required && !hasAvailabilitySet

  // Availability modal state
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [availabilitySelections, setAvailabilitySelections] = useState<
    boolean[]
  >(convertAvailability(userAvailability?.selections || []))
  const [updateAvailability] = useProfileUpdateAvailabilityMutation()

  // Update availability selections when userAvailability changes
  useEffect(() => {
    if (userAvailability) {
      setAvailabilitySelections(
        convertAvailability(userAvailability.selections || []),
      )
    }
  }, [userAvailability])

  const handleSaveAvailability = useCallback(
    async (selections: boolean[]) => {
      // Convert to spans format (same as Availability page)
      const spans: Array<{ start: number; finish: number }> = []
      let current: { start: number; finish: number } | null = null

      for (let i = 0; i < selections.length; i++) {
        if (selections[i]) {
          if (current) {
            current.finish = i
          } else {
            current = { start: i, finish: i }
          }
        } else {
          if (current) {
            spans.push(current)
            current = null
          }
        }
      }

      if (current) {
        spans.push(current)
      }

      try {
        await updateAvailability({
          contractor: props.contractor_id || null,
          selections: spans,
        }).unwrap()

        // Refetch availability requirement checks to update form state
        if (props.contractor_id) {
          refetchContractorRequirement()
        }
        if (props.assigned_to) {
          refetchUserRequirement()
        }

        setIsAvailabilityModalOpen(false)
        issueAlert({
          message: t("availability.updated"),
          severity: "success",
        })
      } catch (error) {
        const errorMessage =
          (error as any)?.error ||
          (error as any)?.data?.error ||
          (error instanceof Error ? error.message : String(error))
        issueAlert({
          message: `${t("availability.failed")} ${errorMessage}`,
          severity: "error",
        })
      }
    },
    [
      props.contractor_id,
      props.assigned_to,
      updateAvailability,
      refetchContractorRequirement,
      refetchUserRequirement,
      issueAlert,
      t,
    ],
  )

  // Get seller name for display
  const sellerName = useMemo(() => {
    if (props.contractor_id) {
      return props.contractor_id // Could enhance to get contractor name
    }
    if (props.assigned_to) {
      return props.assigned_to
    }
    return "this seller"
  }, [props.contractor_id, props.assigned_to])

  // Sync props.service to local service state when it changes
  useEffect(() => {
    setService(props.service || null)
  }, [props.service])

  useEffect(() => {
    if (service) {
      setState((state) => ({
        ...state,
        title: service.title,
        rush: service.rush,
        description: service.description,
        collateral: service.collateral,
        offer: service.cost,
        type: service.kind,
        service_id: service.service_id,
        // collateral: service.collateral,
        payment_type: service.payment_type,
      }))
    } else {
      setState((state) => ({
        title: "",
        rush: false,
        description: "",
        type: "Escort",
        collateral: 0,
        estimate: 0,
        offer: 0,
        departure: null,
        departureInput: "",
        departChangeTimer: Date.now(),
        destination: null,
        destinationInput: "",
        destChangeTimer: Date.now(),
        service_id: null,
        payment_type: "one-time",
      }))
    }
  }, [service])

  const navigate = useNavigate()
  const submitOrder = useCallback(
    async (event: any) => {
      // event.preventDefault();
      createOrder({
        title: state.title,
        rush: state.rush,
        description: state.description,
        kind: state.type,
        collateral: state.collateral,
        cost: state.offer,
        contractor: props.contractor_id,
        assigned_to: props.assigned_to,
        payment_type: state.payment_type,
        service_id: service?.service_id,
        departure: null,
        destination: null,
      })
        .unwrap()
        .then((data) => {
          setState({
            title: "",
            rush: false,
            description: "",
            type: "Escort",
            collateral: 0,
            estimate: 0,
            offer: 0,
            payment_type: "one-time",
          })

          issueAlert({
            message: t("CreateOrderForm.alert.submitted"),
            severity: "success",
          })

          if (data.discord_invite) {
            const newWindow = window.open(
              `https://discord.gg/${data.discord_invite}`,
              "_blank",
            )
            if (newWindow) {
              newWindow.focus()
            }
          }

          navigate(`/offer/${data.session_id}`)
        })
        .catch((error) => {
          if (error?.data?.error?.code === "AVAILABILITY_REQUIRED") {
            issueAlert({
              message:
                error.data.error.message ||
                t("AvailabilityRequirement.apiError"),
              severity: "error",
            })
          } else if (error?.data?.error?.code === "ORDER_LIMIT_VIOLATION") {
            issueAlert({
              message:
                error.data.error.message ||
                "Order does not meet size or value requirements",
              severity: "error",
            })
          } else {
            issueAlert(error)
          }
        })
      return false
    },
    [
      service?.service_id,
      createOrder,
      state.title,
      state.rush,
      state.description,
      state.type,
      state.collateral,
      state.offer,
      state.payment_type,
      props.contractor_id,
      props.assigned_to,
      issueAlert,
      navigate,
      t, // add t
    ],
  )

  return (
    // <FormControl component={Grid} item xs={12} container spacing={2}>
    // </FormControl>
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
  );
})

CreateOrderFormComponent.displayName = "CreateOrderForm"

export { CreateOrderFormComponent as CreateOrderForm }

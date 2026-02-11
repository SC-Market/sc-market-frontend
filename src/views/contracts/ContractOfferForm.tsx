import { orderIcons, OrderKind, PaymentType } from "../../datatypes/Order"
import React, { useCallback, useState } from "react"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { Section } from "../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { NumericFormat } from "react-number-format"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  PublicContract,
  useCreateContractOfferMutation,
  useCreatePublicContractMutation,
} from "../../store/public_contracts"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { OrgDetails, UserDetails } from "../../components/list/UserDetails"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import { MinimalUser } from "../../datatypes/User"
import { PAYMENT_TYPES } from "../../util/constants"
import { useTranslation } from "react-i18next"
import {
  useCheckContractorOrderLimitsQuery,
  useCheckUserOrderLimitsQuery,
} from "../../store/orderSettings"
import { OrderLimitsDisplay } from "../../components/orders/OrderLimitsDisplay"
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
import { MenuProps } from '@mui/material/MenuProps';
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
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';

export function ContractOfferForm(props: { contract: PublicContract }) {
  const { contract } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [currentOrg] = useCurrentOrg()
  const [title, setTitle] = useState(contract.title)
  const [description, setDescription] = useState(contract.description)
  const [kind, setKind] = useState<OrderKind>(contract.kind)
  const [cost, setCost] = useState(contract.cost)
  const [collateral, setCollateral] = useState(contract.collateral)
  const [paymentType, setPaymentType] = useState<PaymentType>(
    contract.payment_type,
  )

  const issueAlert = useAlertHook()

  const [
    createContractOffer, // This is the mutation trigger
    { isLoading },
  ] = useCreateContractOfferMutation()

  const navigate = useNavigate()
  const submitContractOffer = useCallback(
    async (event: any) => {
      // event.preventDefault();
      createContractOffer({
        contract_id: contract.id,
        contractor: currentOrg?.spectrum_id || null,
        title,
        description,
        kind,
        collateral,
        cost,
        payment_type: paymentType,
      })
        .unwrap()
        .then((data) => {
          issueAlert({
            message: t("createPublicContract.submitted"),
            severity: "success",
          })

          navigate(`/offer/${data.session_id}`)
        })
        .catch((error) => {
          if (error?.data?.error?.code === "ORDER_LIMIT_VIOLATION") {
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
      collateral,
      cost,
      createContractOffer,
      description,
      issueAlert,
      kind,
      navigate,
      paymentType,
      title,
      t,
      currentOrg,
      contract.id,
    ],
  )

  const { data: profile } = useGetUserProfileQuery()
  const { data: myUser } = useGetUserByUsernameQuery(profile?.username!, {
    skip: !profile,
  })

  // Check order limits for the seller (contractor or user making the offer)
  const { data: contractorLimits } = useCheckContractorOrderLimitsQuery(
    currentOrg?.spectrum_id || "",
    { skip: !currentOrg?.spectrum_id },
  )
  const { data: userLimits } = useCheckUserOrderLimitsQuery(
    profile?.username || "",
    { skip: !profile?.username || !!currentOrg },
  )

  // Use contractor limits if available, otherwise user limits
  const orderLimits = contractorLimits || userLimits

  return (
    <>
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("recruiting_post.contractor")}
          </Typography>
        </Grid>
        <Grid item xs={12} lg={8} justifyContent={"right"} display={"flex"}>
          {currentOrg ? (
            <OrgDetails org={currentOrg} />
          ) : (
            myUser && <UserDetails user={myUser} />
          )}
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
            {t("createPublicContract.about")}
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
              label={t("createPublicContract.title_required")}
              id="order-title"
              value={title}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setTitle(event.target.value)
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
              label={t("createPublicContract.type_required")}
              id="order-type"
              value={kind}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setKind(event.target.value as OrderKind)
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
              }}
            >
              {Object.keys(orderIcons).map((k) => (
                <MenuItem value={k} key={k}>
                  {t(`orderKinds.${k}`, k)}
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

          <Grid item xs={12}>
            <TextField
              multiline
              fullWidth={true}
              label={t("createPublicContract.description_required")}
              id="description"
              helperText={t("createPublicContract.description_helper")}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setDescription(event.target.value)
              }}
              value={description}
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
            />
            <div id="description-help" className="sr-only">
              {t(
                "accessibility.contract.orderDescriptionHelp",
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
            {t("createPublicContract.costs")}
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
                setCollateral(+(values.floatValue || 0))
              }}
              fullWidth={true}
              label={t("createPublicContract.collateral_optional")}
              id="collateral"
              color={"secondary"}
              value={collateral}
              type={"tel"}
              helperText={t("createPublicContract.collateral_helper")}
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

          <Grid item xs={12}>
            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={async (values, sourceInfo) => {
                console.log(values)
                setCost(values.floatValue || 0)
              }}
              fullWidth={true}
              label={t("createPublicContract.offer")}
              id="offer"
              color={"secondary"}
              value={cost}
              type={"tel"}
              helperText={t("createPublicContract.offer_helper")}
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

          {/* Order Limits Display */}
          {orderLimits && (
            <Grid item xs={12}>
              <OrderLimitsDisplay
                limits={orderLimits}
                currentSize={0} // Contract offers have no market listings
                currentValue={cost}
                showValidation={true}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              select
              label={t("createPublicContract.payment_type")}
              value={paymentType}
              onChange={(event: any) => {
                setPaymentType(event.target.value)
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
                <MenuItem value={paymentType.value} key={paymentType.value}>
                  {t(paymentType.translationKey)}
                </MenuItem>
              ))}
            </TextField>
            <div id="payment-type-help" className="sr-only">
              {t(
                "accessibility.contract.paymentTypeHelp",
                "Select how you want to handle payment for this contract (required)",
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
          onClick={submitContractOffer}
          aria-label={t(
            "accessibility.submitContractOffer",
            "Submit contract offer",
          )}
          aria-describedby="submit-contract-help"
        >
          {t("createPublicContract.submit")}
          <span id="submit-contract-help" className="sr-only">
            {t(
              "accessibility.submitContractHelp",
              "Submit your contract offer with the specified terms and conditions",
            )}
          </span>
        </LoadingButton>
      </Grid>
    </>
  )
}

import { orderIcons, OrderKind, PaymentType } from "../../datatypes/Order"
import { PAYMENT_TYPES } from "../../util/constants"
import React, { useCallback, useState } from "react"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { Section } from "../../components/paper/Section"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { NumericFormat } from "react-number-format"
import LoadingButton from "@mui/lab/LoadingButton"
import { useCreatePublicContractMutation } from "../../store/public_contracts"
import { useTranslation } from "react-i18next"
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

export function CreatePublicContract() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [kind, setKind] = useState<OrderKind>("Escort")
  const [cost, setCost] = useState(0)
  const [collateral, setCollateral] = useState(0)
  const [paymentType, setPaymentType] = useState<PaymentType>("one-time")

  const issueAlert = useAlertHook()

  const [
    createPublicContract, // This is the mutation trigger
    { isLoading },
  ] = useCreatePublicContractMutation()

  const navigate = useNavigate()
  const submitOrder = useCallback(
    async (event: any) => {
      // event.preventDefault();
      createPublicContract({
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

          navigate(`/contracts/public/${data.contract_id}`)
        })
        .catch((error) => {
          issueAlert(error)
        })
      return false
    },
    [
      collateral,
      cost,
      createPublicContract,
      description,
      issueAlert,
      kind,
      navigate,
      paymentType,
      title,
      t,
    ],
  )

  return (
    <Grid item xs={12}>
      <FormControl
        component={Grid}
        item
        xs={12}
        container
        spacing={theme.layoutSpacing.layout}
      >
        <Grid container spacing={theme.layoutSpacing.layout * 4}>
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
                />
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
                  SelectProps={{
                    IconComponent: KeyboardArrowDownRoundedIcon,
                  }}
                >
                  {Object.keys(orderIcons).map((k) => (
                    <MenuItem value={k} key={k}>
                      {t(`orderKinds.${k}`, k)}
                    </MenuItem>
                  ))}
                </TextField>
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
                />
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
                  onValueChange={async (values) => {
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
                />
              </Grid>

              <Grid item xs={12}>
                <NumericFormat
                  decimalScale={0}
                  allowNegative={false}
                  customInput={TextField}
                  thousandSeparator
                  onValueChange={async (values) => {
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
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label={t("createPublicContract.payment_type")}
                  value={paymentType}
                  onChange={(event: any) => {
                    setPaymentType(event.target.value)
                  }}
                  fullWidth
                  SelectProps={{
                    IconComponent: KeyboardArrowDownRoundedIcon,
                  }}
                >
                  {PAYMENT_TYPES.map((paymentType) => (
                    <MenuItem key={paymentType.value} value={paymentType.value}>
                      {t(paymentType.translationKey)}
                    </MenuItem>
                  ))}
                </TextField>
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
            >
              {t("createPublicContract.submit")}
            </LoadingButton>
          </Grid>
        </Grid>
      </FormControl>
    </Grid>
  )
}

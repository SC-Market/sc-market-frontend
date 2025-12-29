import {
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
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
      <FormControl component={Grid} item xs={12} container spacing={theme.layoutSpacing.layout}>
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
            <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
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
            <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
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

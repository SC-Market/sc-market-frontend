import {
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
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

export function ContractOfferForm(props: { contract: PublicContract }) {
  const { contract } = props
  const { t } = useTranslation()
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
          issueAlert(error)
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
        <Grid item xs={12} lg={8} container spacing={2}>
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
        <Grid item xs={12} lg={8} container spacing={2}>
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
            />
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
          onClick={submitContractOffer}
        >
          {t("createPublicContract.submit")}
        </LoadingButton>
      </Grid>
    </>
  )
}

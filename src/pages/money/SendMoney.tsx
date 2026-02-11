import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React, { useEffect, useState } from "react"
import { Section } from "../../components/paper/Section"
import { BACKEND_URL } from "../../util/constants"
import { MinimalUser, User } from "../../datatypes/User"
import { Contractor, MinimalContractor } from "../../datatypes/Contractor"
import { Navigate } from "react-router-dom"
import throttle from "lodash/throttle"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useCreateTransaction } from "../../store/transactions"
import { useTranslation } from "react-i18next"

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import Block from '@mui/icons-material/Block';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidRounded from '@mui/icons-material/PhoneAndroidRounded';
import NoteAddRounded from '@mui/icons-material/NoteAddRounded';

export function SendMoney(props: { org?: boolean }) {
  const { t } = useTranslation()
  const containerRef = React.useRef(null)
  const [error, setError] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [next, setNext] = useState(false)

  const [recipientType, setRecipientType] = useState("user")
  const [options, setOptions] = useState<(User | Contractor)[]>([])
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<User | Contractor | null>(
    null,
  )
  // const [success, setSuccess] = useState(false)

  const [currentOrg] = useCurrentOrg()

  const getOptions = React.useCallback(
    (query: string) => {
      if (query.length < 3) {
        return
      }

      fetch(
        `${BACKEND_URL}/api/${
          recipientType === "user" ? "profile" : "contractor"
        }/search/${encodeURIComponent(query)}`,
        {
          method: "GET",
          credentials: "include",
        },
      )
        .then(async (resp) => {
          const data = await resp.json()
          if (data.error) {
            // setError(`Invalid ${recipientType}!`)
            setOptions([])
          } else {
            // setError("")
            // setTargetObject(data)
            setOptions(data as (User | Contractor)[])
          }
        })
        .catch(() => {
          // setError(`Invalid ${recipientType}!`)
          // setTargetObject(null)
          setOptions([])
        })
    },
    [recipientType],
  )

  const retrieve = React.useMemo(
    () =>
      throttle((query: string) => {
        getOptions(query)
      }, 400),
    [getOptions],
  )

  useEffect(() => {
    retrieve(target)
  }, [target, retrieve])

  const [
    createTransaction, // This is the mutation trigger
    { isSuccess }, // This is the destructured mutation result
  ] = useCreateTransaction()

  const initiateSend = async () => {
    if (target === "") {
      setError(t("sendMoney.errors.enterUser"))
      return
    }
    if (targetObject === null) {
      setError(t("sendMoney.errors.invalidUser"))
      return
    }

    if (isNaN(Number.parseInt(amount))) {
      return
    }

    await createTransaction({
      spectrum_id: props.org ? currentOrg?.spectrum_id : null,
      body: {
        amount: Number.parseInt(amount),
        note: note,
        contractor_recipient_id: (targetObject as Contractor).spectrum_id
          ? (targetObject as Contractor).spectrum_id
          : null,
        user_recipient_id: (targetObject as User).username
          ? (targetObject as User).username
          : null,
      },
    })
  }

  return (
    <ContainerGrid maxWidth={"sm"} sidebarOpen={true} ref={containerRef}>
      {isSuccess && <Navigate to={props.org ? "/org/money" : "/dashboard"} />}
      <HeaderTitle>{t("sendMoney.title")}</HeaderTitle>

      {/*TODO: Add slide animation*/}
      {!next ? (
        <Section xs={12} title={t("sendMoney.recipient")}>
          <Grid item lg={9} xs={12}>
            <Autocomplete
              filterOptions={(x) => x}
              fullWidth
              options={options}
              getOptionLabel={(option) =>
                (option as User).display_name
                  ? (option as User).display_name
                  : (option as Contractor).name
              }
              disablePortal
              color={targetObject ? "success" : "primary"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    recipientType === "user"
                      ? t("sendMoney.username")
                      : t("sendMoney.contractor")
                  }
                  SelectProps={{
                    IconComponent: KeyboardArrowDownRoundedIcon,
                  }}
                  aria-describedby="recipient-help"
                  inputProps={{
                    ...params.inputProps,
                    "aria-label": t(
                      "accessibility.selectRecipient",
                      "Select recipient to send money to",
                    ),
                  }}
                />
              )}
              value={targetObject}
              onChange={(event: any, newValue: User | Contractor | null) => {
                setTargetObject(newValue)
              }}
              inputValue={target}
              onInputChange={(event, newInputValue) => {
                setTarget(newInputValue)
              }}
              aria-label={t(
                "accessibility.recipientSelector",
                "Recipient selector",
              )}
              aria-describedby="recipient-help"
            />
            <div id="recipient-help" className="sr-only">
              {t(
                "accessibility.recipientHelp",
                "Search and select a user or contractor to send money to",
              )}
            </div>
          </Grid>
          <Grid item lg={3} xs={12}>
            <Select
              label={t("sendMoney.targetKind")}
              value={recipientType}
              onChange={(event: any) => {
                setRecipientType(event.target.value)
              }}
              fullWidth
              aria-label={t(
                "accessibility.selectRecipientType",
                "Select recipient type",
              )}
              aria-describedby="recipient-type-help"
            >
              <MenuItem value={"user"}>{t("sendMoney.user")}</MenuItem>
              <MenuItem value={"contractor"}>
                {t("sendMoney.contractor")}
              </MenuItem>
            </Select>
            <div id="recipient-type-help" className="sr-only">
              {t(
                "accessibility.recipientTypeHelp",
                "Choose whether to send money to a user or contractor",
              )}
            </div>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant={"contained"}
              color={"secondary"}
              disabled={!(target && !error && targetObject)}
              onClick={() => setNext(true)}
              aria-label={t("accessibility.nextStep", "Continue to next step")}
              aria-describedby="next-step-help"
            >
              {t("sendMoney.next")}
              <span id="next-step-help" className="sr-only">
                {t(
                  "accessibility.nextStepHelp",
                  "Continue to enter amount and note",
                )}
              </span>
            </Button>
          </Grid>
        </Section>
      ) : (
        <Section
          xs={12}
          title={t("sendMoney.recipient")}
          justifyContent={"space-between"}
        >
          <Grid item xs={12} container>
            <Grid item>
              <Avatar
                src={targetObject?.avatar}
                sx={{ marginRight: 3, height: 64, width: 64 }}
                alt={`Avatar of ${
                  (targetObject as MinimalUser).username ||
                  (targetObject as MinimalContractor).spectrum_id
                }`}
                variant={"rounded"}
              />
            </Grid>
            <Grid item>
              <Typography variant={"h6"} display={"inline"}>
                {targetObject &&
                  ((targetObject as User)?.display_name ||
                    (targetObject as Contractor)?.spectrum_id)}
              </Typography>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <TextField
              type={"number"}
              fullWidth
              label={t("sendMoney.amount")}
              value={amount}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setAmount(event.target.value)
              }}
              error={isNaN(Number.parseInt(amount))}
              helperText={
                amount === "" ? t("sendMoney.errors.enterAmount") : ""
              }
              color={!isNaN(Number.parseInt(amount)) ? "success" : "primary"}
              aria-required="true"
              aria-describedby="amount-help"
              inputProps={{
                "aria-label": t(
                  "accessibility.enterAmount",
                  "Enter amount to send",
                ),
                pattern: "[0-9]*",
                min: "1",
              }}
            />
            <div id="amount-help" className="sr-only">
              {t(
                "accessibility.amountHelp",
                "Enter the amount of money you want to send (required)",
              )}
            </div>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("sendMoney.note")}
              value={note}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setNote(event.target.value)
              }}
              aria-describedby="note-help"
              inputProps={{
                "aria-label": t(
                  "accessibility.enterNote",
                  "Enter note for the transaction",
                ),
                maxLength: 200,
              }}
            />
            <div id="note-help" className="sr-only">
              {t(
                "accessibility.noteHelp",
                "Add an optional note to describe this transaction",
              )}
            </div>
          </Grid>

          <Grid item xs={6}>
            <Button
              variant={"contained"}
              color={"secondary"}
              onClick={() => setNext(false)}
              aria-label={t(
                "accessibility.goBack",
                "Go back to recipient selection",
              )}
              aria-describedby="go-back-help"
            >
              {t("sendMoney.back")}
              <span id="go-back-help" className="sr-only">
                {t(
                  "accessibility.goBackHelp",
                  "Return to recipient selection step",
                )}
              </span>
            </Button>
          </Grid>
          <Grid item xs={6} justifyContent={"right"} container>
            <Grid item>
              <Button
                variant={"contained"}
                color={"primary"}
                onClick={initiateSend}
                aria-label={t("accessibility.sendMoney", "Send money")}
                aria-describedby="send-money-help"
              >
                {t("sendMoney.send")}
                <span id="send-money-help" className="sr-only">
                  {t(
                    "accessibility.sendMoneyHelp",
                    "Complete the money transfer to the selected recipient",
                  )}
                </span>
              </Button>
            </Grid>
          </Grid>
        </Section>
      )}
    </ContainerGrid>
  )
}

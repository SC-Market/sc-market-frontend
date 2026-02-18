import React from "react"
import {
  Avatar,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material"
import { User, MinimalUser } from "../../../datatypes/User"
import { Contractor, MinimalContractor } from "../../../datatypes/Contractor"
import { useTranslation } from "react-i18next"

interface SendMoneyDetailsSectionProps {
  targetObject: User | Contractor | null
  amount: string
  setAmount: (amount: string) => void
  note: string
  setNote: (note: string) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function SendMoneyDetailsSection(props: SendMoneyDetailsSectionProps) {
  const { t } = useTranslation()

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} container>
        <Grid item>
          <Avatar
            src={props.targetObject?.avatar}
            sx={{ marginRight: 3, height: 64, width: 64 }}
            alt={`Avatar of ${
              (props.targetObject as MinimalUser)?.username ||
              (props.targetObject as MinimalContractor)?.spectrum_id
            }`}
            variant={"rounded"}
          />
        </Grid>
        <Grid item>
          <Typography variant={"h6"} display={"inline"}>
            {props.targetObject &&
              ((props.targetObject as User)?.display_name ||
                (props.targetObject as Contractor)?.spectrum_id)}
          </Typography>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <TextField
          type={"number"}
          fullWidth
          label={t("sendMoney.amount")}
          value={props.amount}
          onChange={(event: React.ChangeEvent<{ value: string }>) => {
            props.setAmount(event.target.value)
          }}
          error={isNaN(Number.parseInt(props.amount))}
          helperText={
            props.amount === "" ? t("sendMoney.errors.enterAmount") : ""
          }
          color={!isNaN(Number.parseInt(props.amount)) ? "success" : "primary"}
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
          value={props.note}
          onChange={(event: React.ChangeEvent<{ value: string }>) => {
            props.setNote(event.target.value)
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
          onClick={props.onBack}
          disabled={props.isSubmitting}
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
            onClick={props.onSubmit}
            disabled={props.isSubmitting}
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
    </Grid>
  )
}

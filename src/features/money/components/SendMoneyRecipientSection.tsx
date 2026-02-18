import React from "react"
import {
  Autocomplete,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@mui/material"
import { User } from "../../../datatypes/User"
import { Contractor } from "../../../datatypes/Contractor"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useTranslation } from "react-i18next"
import { RecipientType } from "../hooks/usePageSendMoney"

interface SendMoneyRecipientSectionProps {
  recipientType: RecipientType
  setRecipientType: (type: RecipientType) => void
  options: (User | Contractor)[]
  target: string
  setTarget: (target: string) => void
  targetObject: User | Contractor | null
  setTargetObject: (target: User | Contractor | null) => void
  error: string
  onNext: () => void
}

export function SendMoneyRecipientSection(props: SendMoneyRecipientSectionProps) {
  const { t } = useTranslation()

  return (
    <Grid container spacing={2}>
      <Grid item lg={9} xs={12}>
        <Autocomplete
          filterOptions={(x) => x}
          fullWidth
          options={props.options}
          getOptionLabel={(option) =>
            (option as User).display_name
              ? (option as User).display_name
              : (option as Contractor).name
          }
          disablePortal
          color={props.targetObject ? "success" : "primary"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                props.recipientType === "user"
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
          value={props.targetObject}
          onChange={(event: any, newValue: User | Contractor | null) => {
            props.setTargetObject(newValue)
          }}
          inputValue={props.target}
          onInputChange={(event, newInputValue) => {
            props.setTarget(newInputValue)
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
          value={props.recipientType}
          onChange={(event: any) => {
            props.setRecipientType(event.target.value)
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
          disabled={!(props.target && !props.error && props.targetObject)}
          onClick={props.onNext}
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
    </Grid>
  )
}

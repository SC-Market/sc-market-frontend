import LoadingButton from "@mui/lab/LoadingButton"
import { Stack } from "@mui/system"
import React, { useCallback } from "react"
import { OfferSession, useCounterOfferMutation } from "../../store/offer"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"
import Grid from "@mui/material/Grid"
import { useTranslation } from "react-i18next"

export function CounterOfferSubmitArea(props: { session: OfferSession }) {
  const { session } = props
  const [counterOffer, { isLoading: counterOfferLoading }] =
    useCounterOfferMutation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const [body, setBody] = useCounterOffer()
  const { t } = useTranslation()

  const counterOfferCallback = useCallback(() => {
    counterOffer(body)
      .unwrap()
      .then((result) => navigate(`/offer/${session.id}`))
      .catch((err) =>
        issueAlert({
          message: err.message,
          severity: "error",
        }),
      )
  }, [counterOffer, body, navigate, session.id, issueAlert])

  return (
    <Grid item xs={12}>
      <Stack direction="row" justifyContent={"right"} spacing={1}>
        <LoadingButton
          color={"secondary"}
          variant={"contained"}
          loading={counterOfferLoading}
          onClick={counterOfferCallback}
        >
          {t("CounterOfferSubmitArea.submitCounterOffer")}
        </LoadingButton>
      </Stack>
    </Grid>
  )
}

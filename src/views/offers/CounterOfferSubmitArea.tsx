import LoadingButton from "@mui/lab/LoadingButton"
import { Stack } from "@mui/system"
import React, { useCallback } from "react"
import { useCounterOfferSubmit } from "../../features/offers/hooks/useOfferActions"
import type { GetOfferSessionV2Response } from "../../store/api/v2/market"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"
import Grid from "@mui/material/Grid"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function CounterOfferSubmitArea(props: {
  session: GetOfferSessionV2Response
}) {
  const { session } = props
  const { submit, isLoading: counterOfferLoading } = useCounterOfferSubmit(
    session.session_id,
  )
  const [body] = useCounterOffer()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const counterOfferCallback = useCallback(() => {
    void submit(body)
  }, [submit, body])

  return (
    <Grid item xs={12}>
      <Stack
        direction="row"
        justifyContent={"right"}
        spacing={theme.layoutSpacing.compact}
      >
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

import { Grid, TextField } from "@mui/material"
import React, { useCallback, useState } from "react"
import { useAdminExpressVerifyContractorMutation } from "../../store/contractor"
import { FlatSection } from "../../components/paper/Section"
import LoadingButton from "@mui/lab/LoadingButton"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

export function AdminExpressVerify() {
  const { t } = useTranslation()

  const [state, setState] = useState({
    owner_discord_id: "",
    owner_username: "",
    spectrum_id: "",
  })
  const [expressVerify, { isLoading }] =
    useAdminExpressVerifyContractorMutation()
  const issueAlert = useAlertHook()

  const callback = useCallback(async () => {
    const res: { data?: any; error?: any } = await expressVerify(state)

    if (res?.data && !res?.error) {
      setState({ owner_discord_id: "", owner_username: "", spectrum_id: "" })

      issueAlert({
        message: t("adminExpressVerify.success", "Submitted!"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: t("adminExpressVerify.failure", {
          defaultValue: "Failed to submit! {{reason}}",
          reason:
            res.error?.error || res.error?.data?.error || String(res.error),
        }),
        severity: "error",
      })
    }
  }, [state, t])

  return (
    <FlatSection title={t("adminExpressVerify.title", "Express Verify User")}>
      <Grid item>
        <TextField
          label={t("adminExpressVerify.ownerDiscordId", "Owner Discord ID")}
          value={state.owner_discord_id}
          onChange={(event) =>
            setState({ ...state, owner_discord_id: event.target.value })
          }
        />
      </Grid>
      <Grid item>
        <TextField
          label={t("adminExpressVerify.ownerUsername", "Owner Username*")}
          value={state.owner_username}
          onChange={(event) =>
            setState({ ...state, owner_username: event.target.value })
          }
        />
      </Grid>
      <Grid item>
        <TextField
          label={t("adminExpressVerify.spectrumId", "Org Spectrum ID*")}
          value={state.spectrum_id}
          onChange={(event) =>
            setState({ ...state, spectrum_id: event.target.value })
          }
        />
      </Grid>
      <Grid item>
        <LoadingButton loading={isLoading} onClick={callback}>
          {t("adminExpressVerify.submit", "Submit")}
        </LoadingButton>
      </Grid>
    </FlatSection>
  )
}

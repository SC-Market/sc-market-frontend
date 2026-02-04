import { Button, Divider, Grid, TextField, Typography } from "@mui/material"
import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import { useCreateContractorInviteMutation } from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"

export function CreateOrgInviteCode() {
  const [currentOrg] = useCurrentOrg()
  const [maxUses, setMaxUses] = useState(0)
  const { t } = useTranslation()

  const [
    createContractorInvite, // This is the mutation trigger
  ] = useCreateContractorInviteMutation()

  const issueAlert = useAlertHook()

  const submitCreateForm = useCallback(
    async (event: any) => {
      // event.preventDefault();
      const res: { data?: any; error?: any } = await createContractorInvite({
        contractor: currentOrg!.spectrum_id,
        body: {
          max_uses: maxUses,
        },
      })

      if (res?.data && !res?.error) {
        setMaxUses(0)

        issueAlert({
          message: t("inviteCodes.submitted"),
          severity: "success",
        })
      } else {
        issueAlert({
          message: t("inviteCodes.failed_submit", {
            reason:
              res.error?.error || res.error?.data?.error || res.error || "",
          }),
          severity: "error",
        })
      }
      return false
    },
    [createContractorInvite, currentOrg, maxUses, issueAlert, t],
  )

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("inviteCodes.create_new")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="max-uses"
          color={"secondary"}
          label={t("inviteCodes.max_uses")}
          helperText={t("inviteCodes.max_uses_helper")}
          value={maxUses}
          onChange={(event: any) => {
            setMaxUses(+event.target.value || 0)
          }}
        />
      </Grid>

      <Grid item container justifyContent={"center"}>
        <Button
          variant={"outlined"}
          color={"primary"}
          onClick={submitCreateForm}
        >
          {t("inviteCodes.submit")}
        </Button>
      </Grid>
    </Section>
  )
}

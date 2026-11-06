import { Button, Divider, Grid, TextField, Typography } from "@mui/material"
import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import { useCreateOrgInviteCode } from "../../features/contractor/hooks/useOrgInviteActions"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"

export function CreateOrgInviteCode() {
  const [currentOrg] = useCurrentOrg()
  const [maxUses, setMaxUses] = useState(0)
  const { t } = useTranslation()

  const createInviteCode = useCreateOrgInviteCode(currentOrg?.spectrum_id)

  const submitCreateForm = useCallback(async () => {
    if (await createInviteCode(maxUses)) setMaxUses(0)
    return false
  }, [createInviteCode, maxUses])

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
          label={t("inviteCodes.max_uses")}
          helperText={t("inviteCodes.max_uses_helper")}
          value={maxUses}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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

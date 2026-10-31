import React from "react"
import { Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { FlatSection } from "../../components/paper/Section"
import { OrgLinkBackLine } from "../../components/authentication/OrgLinkBackLine"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"

/**
 * "Link back to us": the optional SC Market line for orgs verified against an
 * RSI org page (spectrum IDs without the "~" prefix of SC Market-only orgs).
 */
export function OrgLinkBackSettings() {
  const { t } = useTranslation()
  const [contractor] = useCurrentOrg()
  const spectrumId = contractor?.spectrum_id

  if (!spectrumId || spectrumId.startsWith("~")) return null

  return (
    <FlatSection title={t("orgLinkBack.manageTitle")}>
      <Grid item xs={12}>
        <OrgLinkBackLine spectrumId={spectrumId} context="manage" />
      </Grid>
    </FlatSection>
  )
}

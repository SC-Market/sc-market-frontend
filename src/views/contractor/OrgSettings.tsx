import React from "react"
import { Grid } from "@mui/material"
import { OrgLanguageSettings } from "./OrgLanguageSettings"
import { OrgLinkBackSettings } from "./OrgLinkBackSettings"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

/**
 * Org Settings: the languages the org's members speak (shown to players
 * filtering orgs and recruiting posts). There used to be a single "Language"
 * (locale) field here too; it was saved but nothing on the site used it.
 * Also the optional "link back to us" line for the RSI org page.
 */
export function OrgSettings() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <OrgLanguageSettings />
      <OrgLinkBackSettings />
    </Grid>
  )
}

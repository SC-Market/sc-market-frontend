import React from "react"
import { Box, Button, Paper, Typography } from "@mui/material"
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded"
import { useTranslation } from "react-i18next"
import { useGetContractorSisterLinksQuery } from "../../store/api/v2/market"

/** SC Orgs, our sister site for running orgs (directory, applications, events, members). */
export const SC_ORGS_ORIGIN = "https://sc-orgs.space"

/**
 * A card pointing to SC Orgs: a title, one sentence and one button. A normal
 * (followed) cross-site link, opened in a new tab.
 */
export function ScOrgsCard(props: {
  title: string
  body: string
  href: string
  action: string
}) {
  return (
    <Paper
      data-testid="sc-orgs-card"
      variant="outlined"
      sx={{
        p: 2,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 1.5,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {props.title}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {props.body}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        size="small"
        href={props.href}
        target="_blank"
        rel="noopener"
        endIcon={<OpenInNewRounded />}
        sx={{ flexShrink: 0 }}
      >
        {props.action}
      </Button>
    </Paper>
  )
}

/**
 * The org's SC Orgs community page, when SC Orgs has the same org (by RSI
 * spectrum ID; the backend's cached lookup). Nothing while loading, on an
 * error or when SC Orgs doesn't have it.
 */
export function OrgScOrgsCard(props: { spectrumId: string; name: string }) {
  const { t } = useTranslation()
  const { data } = useGetContractorSisterLinksQuery({
    spectrumId: props.spectrumId,
  })
  if (!data?.sc_orgs_url?.startsWith(`${SC_ORGS_ORIGIN}/`)) return null
  return (
    <ScOrgsCard
      title={t("scOrgs.orgCardTitle", "Also on SC Orgs")}
      body={t("scOrgs.orgCardBody", {
        name: props.name,
        defaultValue:
          "{{name}} has a community page on SC Orgs, our sister site: members, events and recruiting applications.",
      })}
      href={data.sc_orgs_url}
      action={t("scOrgs.orgCardAction", "Open on SC Orgs")}
    />
  )
}

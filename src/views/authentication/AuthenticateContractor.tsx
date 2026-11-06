import { Section } from "../../components/paper/Section"
import {
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material"
import React, { useCallback, useState } from "react"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { useGetAuthenticatorIdentifier } from "../../features/profile/api/profileApi"
import { useNavigate } from "react-router-dom"
import { useLinkRsiOrg } from "../../features/contractor/hooks/useOrgRegistration"
import { Trans, useTranslation } from "react-i18next"
import {
  extractOrgIdFromUrl,
  sanitizeAlphanumeric,
  isRsiUrl,
} from "../../util/rsiUrlUtils.ts"
import { SentinelCode } from "../../components/authentication/SentinelCode"
import { OrgLinkBackLine } from "../../components/authentication/OrgLinkBackLine"
import { AuthenticateContractorSkeleton } from "./AuthenticateContractor.skeleton"
import { ErrorPageBody } from "../../pages/errors/ErrorPage"
import { PATHS } from "../../routes/paths"
import {
  SC_ORGS_ORIGIN,
  ScOrgsCard,
} from "../../components/sisterSites/ScOrgsCard"

export function AuthenticateContractor() {
  const identifier = useGetAuthenticatorIdentifier()
  const [orgName, setOrgName] = useState("")
  const [error, setError] = useState(false)
  // Spectrum ID of the org just verified; shows the success step
  const [verifiedOrg, setVerifiedOrg] = useState<string | null>(null)
  const { t } = useTranslation()

  const linkRsiOrg = useLinkRsiOrg()

  const navigate = useNavigate()

  const submit = useCallback(async () => {
    if (!orgName) {
      setError(true)
      return
    }

    if (await linkRsiOrg(orgName)) setVerifiedOrg(orgName)

    return false
  }, [linkRsiOrg, orgName])

  // A failed identifier request is an error, not a skeleton forever. The
  // error body stays inside this tab so "New Contractor" still works.
  if (identifier.isError) {
    return (
      <Section xs={12} lg={12}>
        <ErrorPageBody />
      </Section>
    )
  }
  if (!identifier.data) {
    return <AuthenticateContractorSkeleton />
  }

  const identifierCode = identifier.data.identifier

  if (verifiedOrg) {
    return (
      <Section xs={12} lg={12}>
        <Grid item xs={12}>
          <OrgLinkBackLine spectrumId={verifiedOrg} context="verified" />
        </Grid>
        <Grid item xs={12}>
          <ScOrgsCard
            title={t("scOrgs.verifiedTitle", "Also list your org on SC Orgs")}
            body={t("scOrgs.verifiedBody", {
              org: verifiedOrg,
              defaultValue:
                "SC Orgs, our sister site for running orgs, gives {{org}} recruiting applications, events and member tools.",
            })}
            href={`${SC_ORGS_ORIGIN}/communities/create`}
            action={t("scOrgs.verifiedAction", "Register on SC Orgs")}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Button
              variant={"contained"}
              onClick={() => {
                navigate(PATHS.home)
                window.location.reload()
              }}
            >
              {t("orgLinkBack.continue")}
            </Button>
          </Box>
        </Grid>
      </Section>
    )
  }

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <TextField
          label={t("authenticateContractor.org_spectrum_id")}
          fullWidth
          value={orgName}
          onChange={(event) => {
            const input = event.target.value

            // If it looks like a URL, try to extract the org ID
            if (isRsiUrl(input)) {
              const extractedId = extractOrgIdFromUrl(input)
              if (extractedId) {
                setOrgName(sanitizeAlphanumeric(extractedId).toUpperCase())
                return
              }
            }

            // Otherwise, sanitize the input and convert to uppercase (remove spaces and non-alphanumeric except _ and -)
            setOrgName(sanitizeAlphanumeric(input).toUpperCase())
          }}
          onPaste={(event) => {
            const pastedText = event.clipboardData.getData("text")

            // If pasted text is a URL, extract the ID
            if (isRsiUrl(pastedText)) {
              const extractedId = extractOrgIdFromUrl(pastedText)
              if (extractedId) {
                event.preventDefault()
                setOrgName(sanitizeAlphanumeric(extractedId).toUpperCase())
                return
              }
            }

            // If pasted text contains non-alphanumeric (except _ and -), sanitize it
            if (!/^[a-zA-Z0-9_-]*$/.test(pastedText)) {
              event.preventDefault()
              const sanitized = sanitizeAlphanumeric(pastedText)
              setOrgName(sanitized.toUpperCase())
            } else {
              // Just convert to uppercase if valid
              event.preventDefault()
              setOrgName(pastedText.toUpperCase())
            }
          }}
          error={error ? !orgName : false}
          helperText={
            error && !orgName
              ? t("authenticateContractor.error_org_name")
              : undefined
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Typography display={"inline"}>
          <Trans
            i18nKey="authenticateContractor.instructions"
            components={{
              sentinelCode: <SentinelCode code={identifierCode} />,
            }}
          />
        </Typography>
      </Grid>
      {orgName && (
        <Grid item xs={12}>
          <OrgLinkBackLine spectrumId={orgName} context="verify" />
        </Grid>
      )}
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Button
            variant={"outlined"}
            color={"secondary"}
            endIcon={<OpenInNewIcon />}
            onClick={async () => {
              await navigator.clipboard.writeText(identifierCode)
              window.open(
                `https://robertsspaceindustries.com/orgs/${orgName}/admin/content`,
                "_blank",
              )
            }}
          >
            {t("authenticateContractor.copy_and_open")}
          </Button>
          <Button variant={"outlined"} onClick={submit}>
            {t("authenticateContractor.submit")}
          </Button>
        </Box>
      </Grid>
    </Section>
  )
}

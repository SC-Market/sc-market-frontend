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
import { useGetAuthenticatorIdentifier } from "../../store/profile"
import { useNavigate } from "react-router-dom"
import { useContractorLinkMutation } from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { Trans, useTranslation } from "react-i18next"
import {
  extractOrgIdFromUrl,
  sanitizeAlphanumeric,
  isRsiUrl,
} from "../../utils/rsiUrlUtils"
import { SentinelCode } from "../../components/authentication/SentinelCode"

export function AuthenticateContractor() {
  const identifier = useGetAuthenticatorIdentifier()
  const [orgName, setOrgName] = useState("")
  const [error, setError] = useState(false)
  const { t } = useTranslation()

  const [
    activateContractorLink, // This is the mutation trigger
    // {isLoading}, // This is the destructured mutation result
  ] = useContractorLinkMutation()

  const navigate = useNavigate()

  const issueAlert = useAlertHook()

  const submit = useCallback(
    async (event: any) => {
      if (!orgName) {
        setError(true)
        return
      }

      activateContractorLink({
        contractor: orgName,
      })
        .unwrap()
        .then((result) => {
          navigate("/")
          window.location.reload()
        })
        .catch((error) => {
          issueAlert(error)
        })

      return false
    },
    [activateContractorLink, orgName, issueAlert, t, navigate],
  )

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
              sentinelCode: (
                <SentinelCode
                  code={identifier.data?.identifier || "PLACEHOLDER"}
                />
              ),
            }}
          />
        </Typography>
      </Grid>
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
              await navigator.clipboard.writeText(
                identifier.data?.identifier || "PLACEHOLDER",
              )
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

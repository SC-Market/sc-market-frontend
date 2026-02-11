import { Section } from "../../components/paper/Section"
import React, { useCallback, useMemo, useState } from "react"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import {
  useActivateAccountLink,
  useGetAuthenticatorIdentifier,
  useGetUserProfileQuery,
} from "../../store/profile"
import { useNavigate } from "react-router-dom"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Trans, useTranslation } from "react-i18next"
import {
  extractProfileIdFromUrl,
  sanitizeAlphanumeric,
  isRsiUrl,
} from "../../util/rsiUrlUtils.ts"
import { SentinelCode } from "../../components/authentication/SentinelCode"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/MenuProps';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';

export function isAlphaNumeric(str: string) {
  let code, i, len

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i)
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123) &&
      code !== 95 &&
      code !== 45
    ) {
      // lower alpha (a-z)
      return false
    }
  }
  return true
}

export function AuthenticateRSI() {
  const { t } = useTranslation()
  const identifier = useGetAuthenticatorIdentifier()
  const [username, setUsername] = useState("")
  const [error, setError] = useState(false)

  const [
    activateAccountLink, // This is the mutation trigger
    // {isLoading}, // This is the destructured mutation result
  ] = useActivateAccountLink()

  const navigate = useNavigate()

  const issueAlert = useAlertHook()
  const [tosAccepted, setTosAccepted] = useState(false)

  const submit = useCallback(
    async (event: any) => {
      if (!username || !tosAccepted) {
        setError(true)
        return
      }
      // event.preventDefault();
      activateAccountLink({
        username: username,
      })
        .unwrap()
        .then((result) => {
          issueAlert({
            message: t("authenticateRSI.authenticated"),
            severity: "success",
          })
          setUsername("")
          navigate("/")
        })
        .catch((error) => {
          issueAlert(error)
        })

      return false
    },
    [activateAccountLink, navigate, issueAlert, username, tosAccepted, t],
  )

  const [isError, errorMessage] = useMemo(() => {
    if (!isAlphaNumeric(username) || username.length < 3) {
      return [error, t("authenticateRSI.invalid_handle")]
    }

    if (!username) {
      return [error, t("authenticateRSI.enter_username")]
    }

    return [false, ""]
  }, [username, error, t])

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <TextField
          label={t("authenticateRSI.handle")}
          fullWidth
          value={username}
          onChange={(event) => {
            const input = event.target.value

            // If it looks like a URL, try to extract the profile ID
            if (isRsiUrl(input)) {
              const extractedId = extractProfileIdFromUrl(input)
              if (extractedId) {
                setUsername(sanitizeAlphanumeric(extractedId))
                return
              }
            }

            // Otherwise, sanitize the input (remove spaces and non-alphanumeric except _ and -)
            setUsername(sanitizeAlphanumeric(input))
          }}
          onPaste={(event) => {
            const pastedText = event.clipboardData.getData("text")

            // If pasted text is a URL, extract the ID
            if (isRsiUrl(pastedText)) {
              const extractedId = extractProfileIdFromUrl(pastedText)
              if (extractedId) {
                event.preventDefault()
                setUsername(sanitizeAlphanumeric(extractedId))
                return
              }
            }

            // If pasted text contains non-alphanumeric (except _ and -), sanitize it
            if (!/^[a-zA-Z0-9_-]*$/.test(pastedText)) {
              event.preventDefault()
              const sanitized = sanitizeAlphanumeric(pastedText)
              setUsername(sanitized)
            }
          }}
          error={isError}
          helperText={errorMessage}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography display={"inline"}>
          <Trans
            i18nKey="authenticateRSI.instructions"
            components={{
              sentinelCode: (
                <SentinelCode
                  code={identifier.data?.identifier || "PLACEHOLDER"}
                />
              ),
              guideLink: (
                <UnderlineLink
                  component={"a"}
                  color={"primary"}
                  href={
                    "https://github.com/henry232323/sc-market/wiki/How-to-Verify-Your-Account"
                  }
                  target={"blank"}
                  style={{ textDecoration: "none" }}
                >
                  {t("authenticateRSI.here")}
                </UnderlineLink>
              ),
            }}
          />
        </Typography>
      </Grid>
      <Grid item xs={12} display={"flex"} alignItems={"center"}>
        <Typography variant={"body2"}>
          <Trans
            i18nKey="authenticateRSI.tos"
            components={{
              tosLink: (
                <UnderlineLink
                  color={"primary"}
                  component={"a"}
                  href={"/terms-of-service.html"}
                  target={"_blank"}
                  rel="noreferrer"
                >
                  {t("authenticateRSI.tos")}
                </UnderlineLink>
              ),
            }}
          />
        </Typography>
        <Checkbox
          value={tosAccepted}
          onChange={(event, checked) => setTosAccepted(checked)}
          color={error && !tosAccepted ? "error" : undefined}
        />
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
                "https://robertsspaceindustries.com/account/profile",
                "_blank",
              )
            }}
          >
            {t("authenticateRSI.copy_and_open")}
          </Button>
          <Button
            variant={"outlined"}
            onClick={submit}
            disabled={isError || !username.length || !tosAccepted}
          >
            {t("authenticateRSI.submit")}
          </Button>
        </Box>
      </Grid>
    </Section>
  );
}

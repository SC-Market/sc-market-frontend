import React, { useCallback, useState } from "react"
import { useAdminExpressVerifyContractorMutation } from "../../store/contractor"
import { FlatSection } from "../../components/paper/Section"
import LoadingButton from "@mui/lab/LoadingButton"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import {
  extractOrgIdFromUrl,
  sanitizeAlphanumeric,
  isRsiUrl,
} from "../../util/rsiUrlUtils.ts"

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
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

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
        message: t("adminExpressVerify.success"),
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
    <FlatSection title={t("adminExpressVerify.title")}>
      <Grid item>
        <TextField
          label={t("adminExpressVerify.ownerDiscordId")}
          value={state.owner_discord_id}
          onChange={(event) =>
            setState({ ...state, owner_discord_id: event.target.value })
          }
        />
      </Grid>
      <Grid item>
        <TextField
          label={t("adminExpressVerify.ownerUsername")}
          value={state.owner_username}
          onChange={(event) =>
            setState({ ...state, owner_username: event.target.value })
          }
        />
      </Grid>
      <Grid item>
        <TextField
          label={t("adminExpressVerify.spectrumId")}
          value={state.spectrum_id}
          onChange={(event) => {
            const input = event.target.value

            // If it looks like a URL, try to extract the org ID
            if (isRsiUrl(input)) {
              const extractedId = extractOrgIdFromUrl(input)
              if (extractedId) {
                setState({
                  ...state,
                  spectrum_id: sanitizeAlphanumeric(extractedId).toUpperCase(),
                })
                return
              }
            }

            // Otherwise, sanitize the input and convert to uppercase (remove spaces and non-alphanumeric except _ and -)
            setState({
              ...state,
              spectrum_id: sanitizeAlphanumeric(input).toUpperCase(),
            })
          }}
          onPaste={(event) => {
            const pastedText = event.clipboardData.getData("text")

            // If pasted text is a URL, extract the ID
            if (isRsiUrl(pastedText)) {
              const extractedId = extractOrgIdFromUrl(pastedText)
              if (extractedId) {
                event.preventDefault()
                setState({
                  ...state,
                  spectrum_id: sanitizeAlphanumeric(extractedId).toUpperCase(),
                })
                return
              }
            }

            // If pasted text contains non-alphanumeric (except _ and -), sanitize it
            if (!/^[a-zA-Z0-9_-]*$/.test(pastedText)) {
              event.preventDefault()
              const sanitized = sanitizeAlphanumeric(pastedText)
              setState({
                ...state,
                spectrum_id: sanitized.toUpperCase(),
              })
            } else {
              // Just convert to uppercase if valid
              event.preventDefault()
              setState({
                ...state,
                spectrum_id: pastedText.toUpperCase(),
              })
            }
          }}
        />
      </Grid>
      <Grid item>
        <LoadingButton loading={isLoading} onClick={callback}>
          {t("adminExpressVerify.submit")}
        </LoadingButton>
      </Grid>
    </FlatSection>
  );
}

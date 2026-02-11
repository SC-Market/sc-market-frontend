import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useRegisterContractorMutation } from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { isAlphaNumeric } from "./AuthenticateRSI"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { useTranslation } from "react-i18next"
import { LanguageSelector } from "../../components/settings/LanguageSelector"

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
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';

export const fallback_image =
  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
export const fallback_banner =
  "https://media.discordapp.net/attachments/690989503397101678/1157162282468524092/default_profile_banner.jpg?ex=65179adb&is=6516495b&hm=ce331ef90d2acf941e008199b7df2fd8127df642fdade0deb70d3fb79b136eae&=&width=2430&height=1366"

export function CreateNewContractor() {
  const [contractorName, setContractorName] = useState("")
  const [contractorIdentifier, setContractorIdentifier] = useState("")
  const [avatar, setAvatar] = useState(fallback_image)
  const [banner, setBanner] = useState(fallback_banner)
  const [description, setDescription] = useState("")
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"])
  const [error, setError] = useState(false)
  const { t } = useTranslation()

  const [
    registerNewContractor, // This is the mutation trigger
    // {isLoading}, // This is the destructured mutation result
  ] = useRegisterContractorMutation()

  const navigate = useNavigate()

  const issueAlert = useAlertHook()

  const submit = useCallback(
    async (event: any) => {
      if (!contractorName) {
        setError(true)
        return
      }
      // event.preventDefault();
      const res: { data?: any; error?: any } = await registerNewContractor({
        description,
        name: contractorName,
        identifier: contractorIdentifier,
        logo: avatar,
        banner,
        language_codes: selectedLanguages,
      })

      if (res?.data && !res?.error) {
        issueAlert({
          message: t("contractorCreate.success", {
            defaultValue: "Contractor created successfully",
          }),
          severity: "success",
        })
        navigate(`/contractor/~${contractorIdentifier}`)
      } else {
        issueAlert({
          message: t("contractorCreate.failed_auth", {
            reason:
              res.error?.error || res.error?.data?.error || res.error || "",
          }),
          severity: "error",
        })
      }
      return false
    },
    [
      contractorName,
      registerNewContractor,
      description,
      contractorIdentifier,
      avatar,
      banner,
      selectedLanguages,
      navigate,
      issueAlert,
      t,
    ],
  )

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <TextField
          label={t("contractorCreate.name")}
          fullWidth
          value={contractorName}
          onChange={(event) => {
            let ident = ""
            for (let i = 0; i < event.target.value.length; i++) {
              const c = event.target.value.charAt(i)
              if ((isAlphaNumeric(c) || c === " ") && i < 50) {
                ident += c.toUpperCase()
              }
            }
            setContractorName(event.target.value)
          }}
          error={error ? !contractorName : false}
          helperText={
            error && !contractorName
              ? t("contractorCreate.error_name")
              : undefined
          }
          id="contractor-name-input"
          aria-describedby={
            error && !contractorName
              ? "contractor-name-error"
              : "contractor-name-help"
          }
          aria-invalid={error ? !contractorName : false}
          aria-required="true"
          inputProps={{
            "aria-label": t(
              "accessibility.contractorNameInput",
              "Enter contractor name",
            ),
            maxLength: 50,
          }}
        />
        {error && !contractorName && (
          <div
            id="contractor-name-error"
            className="sr-only"
            aria-live="polite"
          >
            {t("contractorCreate.error_name")}
          </div>
        )}
        <div id="contractor-name-help" className="sr-only">
          {t(
            "accessibility.contractorNameHelp",
            "Enter the name for your contractor organization (maximum 50 characters)",
          )}
        </div>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t("contractorCreate.identifier")}
          fullWidth
          value={contractorIdentifier}
          onChange={(event) => {
            let ident = ""
            for (let i = 0; i < event.target.value.length; i++) {
              const c = event.target.value.charAt(i)
              if (isAlphaNumeric(c) && i < 30) {
                ident += c.toUpperCase()
              }
            }
            setContractorIdentifier(ident)
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start">~</InputAdornment>,
          }}
          error={error ? !contractorName : false}
          helperText={
            error && !contractorName
              ? t("contractorCreate.error_identifier")
              : undefined
          }
          id="contractor-identifier-input"
          aria-describedby={
            error && !contractorName
              ? "contractor-identifier-error"
              : "contractor-identifier-help"
          }
          aria-invalid={error ? !contractorName : false}
          aria-required="true"
          inputProps={{
            "aria-label": t(
              "accessibility.contractorIdentifierInput",
              "Enter contractor identifier",
            ),
            maxLength: 30,
            pattern: "[A-Za-z0-9]*",
          }}
        />
        {error && !contractorName && (
          <div
            id="contractor-identifier-error"
            className="sr-only"
            aria-live="polite"
          >
            {t("contractorCreate.error_identifier")}
          </div>
        )}
        <div id="contractor-identifier-help" className="sr-only">
          {t(
            "accessibility.contractorIdentifierHelp",
            "Enter a unique identifier for your contractor organization (alphanumeric characters only, maximum 30 characters)",
          )}
        </div>
      </Grid>

      <Grid item xs={12}>
        <MarkdownEditor
          value={description}
          onChange={(value: string) => {
            setDescription(value)
          }}
          TextFieldProps={{
            label: t("contractorCreate.description"),
          }}
        />
      </Grid>

      <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
        <Avatar
          src={avatar}
          variant={"rounded"}
          sx={{ marginRight: 2, height: 96, width: 96 }}
        />
        <TextField
          label={t("contractorCreate.logo")}
          fullWidth
          value={avatar}
          onChange={(event) => setAvatar(event.target.value)}
          error={error ? !avatar : false}
          helperText={
            error && !contractorName
              ? t("contractorCreate.error_logo")
              : undefined
          }
        />
      </Grid>

      <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
        <Avatar
          src={banner}
          variant={"rounded"}
          sx={{ marginRight: 2, height: 96, width: 96 }}
        />
        <TextField
          label={t("contractorCreate.banner")}
          fullWidth
          value={banner}
          onChange={(event) => setBanner(event.target.value)}
          error={error ? !banner : false}
          helperText={
            error && !contractorName
              ? t("contractorCreate.error_banner")
              : undefined
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onChange={setSelectedLanguages}
          label={t(
            "contractorCreate.languages",
            "Supported Languages (Optional)",
          )}
          helperText={t(
            "contractorCreate.languagesHelper",
            "Select languages your organization can communicate in. You can change this later in settings.",
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <Box display={"flex"} justifyContent={"right"}>
          <Button variant={"outlined"} onClick={submit}>
            {t("contractorCreate.submit")}
          </Button>
        </Box>
      </Grid>
    </Section>
  )
}

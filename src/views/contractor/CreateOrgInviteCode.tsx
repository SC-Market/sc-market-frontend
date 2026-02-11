import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import { useCreateContractorInviteMutation } from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useTranslation } from "react-i18next"

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
import { MenuProps } from '@mui/material/Menu';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';

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
